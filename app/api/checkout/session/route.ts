import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createOrder } from "@/lib/checkout/revolut";
import { HIDDEN_SKUS } from "@/lib/hidden-skus";
import { getRates, convertUSDCents } from "@/lib/checkout/fx";
import {
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
  isCurrency,
  type Currency,
} from "@/lib/checkout/currency";

// Creates a Revolut Acquiring order and returns the public token for the
// embedded payment widget. Webhook fires ORDER_COMPLETED on success →
// app/api/webhooks/revolut handles persistence + emails + Meta CAPI.
//
// Added by the API port (server-only). Prices are stored USD-canonical (cents)
// and converted to the charge currency (mt-currency cookie, default USD).

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

    // [2026-06-16] USD-everywhere. Revolut confirmed USD is accepted by
    // default (settles into a USD merchant pocket), so we charge in the same
    // currency the house prices and the storefront displays. Prices are
    // stored USD-canonical, so this is a 1:1 pass-through.
    const currency = "USD" as Awaited<ReturnType<typeof getRequestCurrency>>;
    void getRequestCurrency;
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

    // Customer details collected on our branded form. We pass email to
    // Revolut (pre-fills Hosted Checkout + guarantees order.customer.email
    // for the receipt) and stash name + shipping in metadata so the admin
    // notification + CAPI always have an address, even if the shopper pays
    // with a wallet that doesn't surface a separate shipping step.
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

    const order = await createOrder({
      amount: totalMinor,
      currency,
      capture_mode: "automatic",
      redirect_url: `${siteUrl}/checkout/success`,
      description: `Maison Tanneurs · ${converted.length} item${converted.length > 1 ? "s" : ""}`,
      ...(custEmail ? { customer: { email: custEmail } } : {}),
      metadata,
      line_items: converted.map((i) => ({
        name: i.title,
        type: "physical",
        quantity: { value: i.quantity, unit: "piece" },
        unit_price_amount: i.unitMinor,
        total_amount: i.totalMinor,
        external_id: i.product_id,
        image_urls: i.image
          ? [i.image.startsWith("http") ? i.image : `${siteUrl}${i.image}`]
          : undefined,
      })),
    });

    return NextResponse.json({
      orderId: order.id,
      token: order.token,
      checkoutUrl: order.checkout_url,
      publicKey: process.env.NEXT_PUBLIC_REVOLUT_PUBLIC_KEY,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (err instanceof CartValidationError) {
      return NextResponse.json(
        { error: "Cart needs review", detail: message },
        { status: 400 },
      );
    }
    console.error("Revolut createOrder failed:", message);
    return NextResponse.json(
      { error: "Failed to create checkout order", detail: message },
      { status: 500 },
    );
  }
}
