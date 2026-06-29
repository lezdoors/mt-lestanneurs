import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createPaymentIntent } from "@/lib/checkout/stripe";
import { HIDDEN_SKUS } from "@/lib/hidden-skus";
import { getRates, convertUSDCents } from "@/lib/checkout/fx";
import { applyPromoMinor, normalizePromo } from "@/lib/checkout/promo";
import {
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
  isCurrency,
  type Currency,
} from "@/lib/checkout/currency";

// Creates a Stripe PaymentIntent for the cart. Returns the client_secret
// that @stripe/react-stripe-js binds to <PaymentElement> / <ExpressCheckout
// Element>. The visitor stays on maisontanneurs.com — Stripe only renders
// its PCI-safe card inputs inside hidden iframes; the surrounding form,
// typography, and chrome are ours.
//
// payment_intent.succeeded fires on confirmation → /api/webhooks/stripe
// calls confirmAndPersistOrder(pi_*). /checkout/success reads the same
// pi_* from the return_url and calls confirmAndPersistOrder too — both
// paths are idempotent on the PaymentIntent id, stored in the legacy
// stripe_payment_intent_id column (no schema migration needed).

export const dynamic = "force-dynamic";

type CartItem = {
  product_id: string;
  slug?: string;
  title?: string;
  price?: number;
  quantity: number;
  image?: string;
};

type MetaTrackingParams = { fbp?: string; fbc?: string };

type CustomerParams = {
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  state?: string;
};

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  price: number;
  images: string[] | null;
  status: string;
  featured: boolean | null;
  available_quantity: number | null;
};

type ValidatedItem = {
  product_id: string;
  slug: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
};

class CartValidationError extends Error {}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.min(9, Math.floor(quantity)));
}

async function loadProducts(items: CartItem[]): Promise<ProductRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const ids = items
    .map((i) => i.product_id)
    .filter((id): id is string => Boolean(id) && UUID_RE.test(id));
  const slugs = items.map((i) => i.slug).filter(Boolean) as string[];
  if (ids.length === 0 && slugs.length === 0) return [];

  const filters = [
    ids.length > 0 ? `id.in.(${ids.join(",")})` : null,
    slugs.length > 0 ? `slug.in.(${slugs.join(",")})` : null,
  ].filter(Boolean);

  const { data, error } = await supabase
    .from("products")
    .select("id,title,slug,price,images,status,featured,available_quantity")
    .or(filters.join(","));
  if (error || !data) return [];
  return data as ProductRow[];
}

function aggregateItems(items: CartItem[]): CartItem[] {
  // Collapse duplicate lines onto one key so per-product stock validation
  // sees the SUM — a crafted payload repeating one slug must not multiply
  // a one-of-one piece.
  const byKey = new Map<string, CartItem>();
  for (const item of items) {
    const key = item.product_id || item.slug || "";
    const prev = byKey.get(key);
    if (prev) {
      prev.quantity = (prev.quantity || 1) + (item.quantity || 1);
    } else {
      byKey.set(key, { ...item });
    }
  }
  return Array.from(byKey.values());
}

async function validateCart(rawItems: CartItem[]): Promise<ValidatedItem[]> {
  const items = aggregateItems(rawItems);
  const products = await loadProducts(items);
  const byId = new Map(products.map((p) => [p.id, p]));
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  return items.map((item) => {
    const product =
      byId.get(item.product_id) || (item.slug ? bySlug.get(item.slug) : undefined);
    if (!product) {
      throw new CartValidationError(`Product not found: ${item.slug || item.product_id}`);
    }
    if (product.status !== "available" || HIDDEN_SKUS.has(product.slug)) {
      throw new CartValidationError(`Product unavailable: ${product.slug}`);
    }
    const quantity = normalizeQuantity(item.quantity);
    const available =
      typeof product.available_quantity === "number"
        ? product.available_quantity
        : quantity;
    if (available <= 0 || quantity > available) {
      throw new CartValidationError(`Insufficient stock: ${product.slug}`);
    }
    const image = (product.images || []).find(Boolean);
    return {
      product_id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity,
      image,
    };
  });
}

async function getRequestCurrency(): Promise<Currency> {
  try {
    const store = await cookies();
    const value = store.get(CURRENCY_COOKIE)?.value;
    return isCurrency(value) ? value : DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

export async function POST(request: NextRequest) {
  let body: {
    items?: CartItem[];
    tracking?: MetaTrackingParams;
    customer?: CustomerParams;
    promoCode?: string;
  };
  try {
    body = (await request.json()) as {
      items?: CartItem[];
      tracking?: MetaTrackingParams;
      customer?: CustomerParams;
    };
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const items = body.items;
  if (!items || items.length === 0) {
    return NextResponse.json({ error: "No items" }, { status: 400 });
  }

  try {
    const validated = await validateCart(items);

    // Charge in the visitor's resolved currency (mt-currency cookie, set by
    // the proxy from geo on first visit). Prices are stored USD-canonical
    // and converted with the same ECB rates the storefront uses. Stripe
    // settles into the GBP balance — non-GBP charges convert at settlement
    // (~1-2% FX margin).
    const currency = await getRequestCurrency();
    const rates = await getRates();
    const toMinor = (usdCents: number) =>
      Math.round(convertUSDCents(usdCents, currency, rates) / 100) * 100;

    const converted = validated.map((i) => ({
      ...i,
      unitMinor: toMinor(i.price),
      totalMinor: toMinor(i.price * i.quantity),
    }));
    const totalMinor = converted.reduce((acc, i) => acc + i.totalMinor, 0);

    const promoResult = applyPromoMinor(totalMinor, body.promoCode);
    const chargeMinor = promoResult.totalMinor;

    const c = body.customer || {};
    const custEmail = String(c.email || "").trim();
    const custName = `${String(c.firstName || "").trim()} ${String(
      c.lastName || "",
    ).trim()}`.trim();

    const metadata: Record<string, string> = {
      item_count: String(converted.length),
      display_currency: currency,
    };
    if (custName) metadata.customer_name = custName.slice(0, 120);
    if (c.address) metadata.ship_line1 = String(c.address).slice(0, 180);
    if (c.city) metadata.ship_city = String(c.city).slice(0, 80);
    if (c.zip) metadata.ship_postcode = String(c.zip).slice(0, 32);
    if (c.state) metadata.ship_state = String(c.state).slice(0, 80);
    const inferredCountry = request.headers.get("x-vercel-ip-country") || "";
    const shipCountry = String(c.country || inferredCountry || "").slice(0, 80);
    if (shipCountry) metadata.ship_country = shipCountry;
    if (body.tracking?.fbp) metadata.meta_fbp = body.tracking.fbp;
    if (body.tracking?.fbc) metadata.meta_fbc = body.tracking.fbc;
    if (promoResult.promo) {
      metadata.promo_code = normalizePromo(body.promoCode);
      metadata.discount_minor = String(promoResult.discountMinor);
    }
    converted.forEach((i, idx) => {
      metadata[`item_${idx}`] = JSON.stringify({
        product_id: i.product_id,
        slug: i.slug,
        title: i.title.slice(0, 80),
        price: i.unitMinor,
        usd_price: i.price,
        quantity: i.quantity,
      });
    });

    const intent = await createPaymentIntent({
      amount: chargeMinor,
      currency: currency.toLowerCase(),
      description: `Maison Tanneurs · ${converted.length} item${converted.length > 1 ? "s" : ""}`,
      customerEmail: custEmail || undefined,
      metadata,
    });

    // Abandoned-cart intent row, best-effort. The webhook flips this to
    // 'converted' on payment_intent.succeeded; an hourly cron emails the
    // ones still 'pending' a few hours later. Column kept as
    // `stripe_payment_intent_id`; now stores the Stripe PaymentIntent id (pi_*).
    if (custEmail) {
      try {
        const supabase = getSupabase();
        await supabase?.from("abandoned_checkouts").insert({
          email: custEmail,
          customer_name: custName || null,
          items: converted.map((i) => ({
            slug: i.slug,
            title: i.title,
            image: i.image,
            price: i.unitMinor,
            quantity: i.quantity,
          })),
          amount_minor: chargeMinor,
          currency,
          promo_code: promoResult.promo ? normalizePromo(body.promoCode) : null,
          stripe_payment_intent_id: intent.id,
          status: "pending",
        });
      } catch (e) {
        console.error("[abandoned] intent log failed:", e);
      }
    }

    return NextResponse.json({
      orderId: intent.id,
      clientSecret: intent.clientSecret,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (err instanceof CartValidationError) {
      return NextResponse.json(
        { error: "Cart needs review", detail: message },
        { status: 400 },
      );
    }
    console.error("Stripe createPaymentIntent failed:", message);
    return NextResponse.json(
      { error: "Failed to create payment intent", detail: message },
      { status: 500 },
    );
  }
}
