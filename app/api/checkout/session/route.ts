import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createCheckoutSession } from "@/lib/checkout/stripe";
import { HIDDEN_SKUS } from "@/lib/hidden-skus";
import { getRates, convertUSDCents } from "@/lib/checkout/fx";
import { applyPromoMinor, normalizePromo } from "@/lib/checkout/promo";
import {
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
  isCurrency,
  type Currency,
} from "@/lib/checkout/currency";

// Creates a Stripe Checkout Session and returns the redirect URL for the
// browser to hand off to checkout.stripe.com. checkout.session.completed
// fires on success → app/api/webhooks/stripe handles persistence + emails
// + Meta CAPI (idempotent on the session id; success page also calls
// confirm-order on return for the webhook-less path).
//
// Migrated from Revolut Acquiring 2026-06-23 after repeated customer
// checkout failures on Revolut ahead of launch. Hosted Checkout pattern
// preserved; the columns named revolut_order_id in Supabase are now
// generic processor session ids (Stripe cs_* values).
//
// Prices stored USD-canonical (cents) and converted to the charge currency
// (mt-currency cookie, default USD).

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

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.maisontanneurs.com";

  try {
    const validated = await validateCart(items);

    // Charge in the visitor's resolved currency (mt-currency cookie, set by
    // the proxy from geo on first visit) — the SAME currency the storefront
    // showed, so the Stripe page matches the page they shopped. Prices are
    // stored USD-canonical and converted with the same ECB rates the display
    // side uses. Stripe settles into the Maison Tanneurs GBP balance,
    // converting non-GBP charges at settlement (FX margin ~1–2%).
    const currency = await getRequestCurrency();
    const rates = await getRates();
    // Charge the SAME whole-unit price the storefront displays
    // (formatDisplayPrice rounds to whole units). Without this, a £242 page
    // price would charge £241.50 — a penny-level display!=charge mismatch.
    const toMinor = (usdCents: number) =>
      Math.round(convertUSDCents(usdCents, currency, rates) / 100) * 100;

    const converted = validated.map((i) => ({
      ...i,
      unitMinor: toMinor(i.price),
      totalMinor: toMinor(i.price * i.quantity),
    }));
    const totalMinor = converted.reduce((acc, i) => acc + i.totalMinor, 0);

    // Code-gated promo — the server is authoritative for what is actually
    // charged (the client only previews it). Invalid/empty code = no change.
    const promoResult = applyPromoMinor(totalMinor, body.promoCode);
    const chargeMinor = promoResult.totalMinor;

    // Customer details collected on our branded form. We pass email to
    // Stripe (pre-fills Hosted Checkout + drives the receipt) and stash
    // name + shipping in metadata so the admin notification + CAPI always
    // have an address, even if the shopper pays with a wallet that doesn't
    // surface a separate shipping step.
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
    if (c.country) metadata.ship_country = String(c.country).slice(0, 80);
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

    // When a promo applies we collapse the cart into one line so the
    // discounted total maps cleanly without per-line phantom amounts.
    // Stripe Hosted Checkout shows the description + final total, which
    // is what shopper saw on the storefront summary.
    const lineItems = promoResult.promo
      ? [
          {
            name: `Maison Tanneurs · ${converted.length} item${converted.length > 1 ? "s" : ""}`,
            description: `Promo ${normalizePromo(body.promoCode)}`,
            unitAmountMinor: chargeMinor,
            quantity: 1,
          },
        ]
      : converted.map((i) => ({
          name: i.title,
          unitAmountMinor: i.unitMinor,
          quantity: i.quantity,
          imageUrl: i.image
            ? i.image.startsWith("http")
              ? i.image
              : `${siteUrl}${i.image}`
            : undefined,
        }));

    // Description shows on the PaymentIntent only (not the customer's
    // Hosted Checkout page). Promo gets surfaced via the collapsed line
    // item's description, so it's never double-displayed to the customer.
    const session = await createCheckoutSession({
      amount: chargeMinor,
      currency: currency.toLowerCase(),
      description: `Maison Tanneurs · ${converted.length} item${converted.length > 1 ? "s" : ""}`,
      customerEmail: custEmail || undefined,
      // Stripe substitutes {CHECKOUT_SESSION_ID} server-side on redirect so
      // /checkout/success can confirm the exact session. Belt-and-suspenders
      // with the mt_pending_order cookie the client also sets.
      redirectUrlSuccess: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      redirectUrlCancel: `${siteUrl}/checkout`,
      metadata,
      lineItems,
      locale: "auto",
    });

    // Log the checkout intent for abandoned-cart recovery. The Stripe
    // webhook flips this row to 'converted' on payment; an hourly cron emails
    // the ones still 'pending' after a few hours. Best-effort and only when we
    // have an email to recover to — a failure must never block checkout.
    //
    // Column name `revolut_order_id` retained for backwards compatibility
    // with the existing Supabase schema; now stores Stripe session ids
    // (cs_live_...).
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
          revolut_order_id: session.id,
          status: "pending",
        });
      } catch (e) {
        console.error("[abandoned] intent log failed:", e);
      }
    }

    // Response shape unchanged from the Revolut era — client uses
    // checkoutUrl + parks orderId in the mt_pending_order cookie before
    // redirecting. orderId is now a Stripe Checkout Session id (cs_*).
    return NextResponse.json({
      orderId: session.id,
      checkoutUrl: session.url,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (err instanceof CartValidationError) {
      return NextResponse.json(
        { error: "Cart needs review", detail: message },
        { status: 400 },
      );
    }
    console.error("Stripe createCheckoutSession failed:", message);
    return NextResponse.json(
      { error: "Failed to create checkout session", detail: message },
      { status: 500 },
    );
  }
}
