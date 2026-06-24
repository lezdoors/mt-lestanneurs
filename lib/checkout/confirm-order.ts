import { createClient } from "@supabase/supabase-js";
import { getOrder, type RevolutOrder, type OrderState } from "@/lib/checkout/revolut";
import { generateOrderNumber } from "@/lib/checkout/format";
import {
  sendOrderConfirmation,
  sendAdminNotification,
} from "@/lib/checkout/email";
import { sendPurchaseToCAPI } from "@/lib/checkout/meta-capi";

// Server-side order confirmation — the webhook-less path. The success page
// calls this on load: it pulls the order straight from the processor, verifies
// it is paid (state === COMPLETED), persists it once (idempotent on the
// processor order id), and fires emails + Meta CAPI ONLY on first persistence
// so webhook retries / page refreshes can never double-send. The webhook
// routes reuse the same persist, so whichever path runs first wins, the other
// becomes a no-op.
//
// Provider-agnostic core: persistConfirmedOrder() takes a NormalizedOrder.
// confirmAndPersistOrder() adapts Revolut → NormalizedOrder; the Stripe path
// (lib/checkout/confirm-stripe.ts) adapts a Checkout Session the same way.
// The orders table keys idempotency on `revolut_order_id`, which now holds
// whichever processor's order id (Revolut order id or Stripe session id) —
// no schema migration.

export type OrderItem = {
  product_id: string;
  slug?: string;
  title: string;
  price: number; // charge-currency minor units
  usd_price?: number;
  quantity: number;
};

export interface ShippingAddress {
  // Index signature mirrors the loose shape the email helpers accept (they
  // were written against an inline object literal, not a named type).
  [key: string]: unknown;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

// The shared shape every processor adapter produces. `processorId` is the
// idempotency key (stored in orders.revolut_order_id).
export interface NormalizedOrder {
  processorId: string;
  state: OrderState;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  total: number; // charge-currency minor units
  currency: string; // upper-cased ISO 4217
  shipping: ShippingAddress;
  metaAttribution: { fbp?: string; fbc?: string };
}

export interface ConfirmedOrder {
  state: OrderState;
  revolutOrderId: string; // = processor order id (Revolut order id / Stripe session id)
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  currency: string;
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Service role ONLY — the anon key cannot write `orders` under RLS, so a
  // fallback would silently drop paid orders. Better to fail loud.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY missing — refusing to confirm an order that cannot be persisted",
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export function parseItemsFromMetadata(
  metadata: Record<string, string> | undefined,
): OrderItem[] {
  if (!metadata) return [];
  const count = parseInt(metadata.item_count || "0", 10);
  if (!count) return [];
  const items: OrderItem[] = [];
  for (let i = 0; i < count; i++) {
    const raw = metadata[`item_${i}`];
    if (!raw) continue;
    try {
      items.push(JSON.parse(raw));
    } catch {
      /* skip malformed */
    }
  }
  return items;
}

function getMetaAttributionFromMetadata(
  metadata: Record<string, string> | undefined,
): { fbp?: string; fbc?: string } {
  if (!metadata) return {};
  return {
    fbp: metadata.meta_fbp || undefined,
    fbc: metadata.meta_fbc || undefined,
  };
}

// Bounded retry around Revolut: transient 5xx/timeouts and transitional
// states (PROCESSING/AUTHORISED settle within seconds) get a few chances
// before we give up and render the pending page. Without a registered
// webhook this in-request retry is the only settlement window we have.
//
// IMPORTANT: the Merchant API version we pin (2024-09-01) returns order
// states in lowercase ("completed", "pending", "authorised"…). Always
// compare against an upper-cased copy — a raw `=== "COMPLETED"` silently
// treats every paid order as pending and drops it (no persist/email/CAPI).
const TRANSITIONAL_STATES = new Set(["PENDING", "PROCESSING", "AUTHORISED"]);
const RETRY_DELAYS_MS = [1200, 2000, 3000];

function normState(s: string | undefined): OrderState {
  return (s || "").toUpperCase() as OrderState;
}

async function getOrderSettled(revolutOrderId: string): Promise<RevolutOrder> {
  let order: RevolutOrder | null = null;
  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt - 1]));
    }
    try {
      order = await getOrder(revolutOrderId);
      lastErr = null;
      if (!TRANSITIONAL_STATES.has(normState(order.state))) return order;
    } catch (err) {
      lastErr = err;
    }
  }
  if (order) {
    console.error(
      `[confirm-order] ${revolutOrderId} still ${order.state} after retries — rendering pending`,
    );
    return order;
  }
  console.error(
    `[confirm-order] ${revolutOrderId} unreachable at Revolut after retries:`,
    lastErr,
  );
  throw lastErr instanceof Error
    ? lastErr
    : new Error("Revolut order lookup failed");
}

// === Provider-agnostic persistence ===
// Everything below the COMPLETED gate is identical regardless of processor.
// Idempotent: ON CONFLICT (revolut_order_id) DO NOTHING — exactly one caller
// owns the side effects (persist + sale-marking + emails + CAPI).
export async function persistConfirmedOrder(
  n: NormalizedOrder,
): Promise<ConfirmedOrder> {
  const result: ConfirmedOrder = {
    state: n.state,
    revolutOrderId: n.processorId,
    customerName: n.customerName,
    customerEmail: n.customerEmail,
    items: n.items,
    total: n.total,
    currency: n.currency,
  };

  if (n.state !== "COMPLETED") return result;

  const shippingAddress = n.shipping;
  const {
    processorId,
    items,
    total,
    currency,
    customerName,
    customerEmail,
  } = n;

  const supabase = getSupabase();

  // Mark any abandoned-cart intent row for this order as converted, so the
  // recovery cron never emails a customer who actually paid. Best-effort —
  // a failure here must never interfere with order persistence below.
  try {
    await supabase
      .from("abandoned_checkouts")
      .update({ status: "converted", updated_at: new Date().toISOString() })
      .eq("revolut_order_id", processorId)
      .neq("status", "converted");
  } catch (e) {
    console.error("[abandoned] convert flip failed:", e);
  }

  // Race-proof persistence: ON CONFLICT (revolut_order_id) DO NOTHING.
  // Exactly one concurrent caller (success page load, refresh, webhook)
  // gets a row back and owns the side effects; everyone else reads the
  // canonical row and returns silently.
  const { data: won, error } = await supabase
    .from("orders")
    .upsert(
      {
        order_number: generateOrderNumber(),
        sales_channel: "direct",
        revolut_order_id: processorId,
        customer_email: customerEmail,
        customer_name: customerName,
        shipping_address: shippingAddress,
        items,
        subtotal: total,
        shipping_cost: 0,
        total,
        currency,
        status: "paid",
      },
      { onConflict: "revolut_order_id", ignoreDuplicates: true },
    )
    .select("order_number")
    .maybeSingle();

  if (error) {
    // A paid order we cannot record must never render as success — throw so
    // the page shows the problem state and the error is loud in the logs.
    // The customer's money is safe with the processor either way.
    console.error(
      `[confirm-order] PERSIST FAILED for paid order ${processorId}:`,
      error,
    );
    // The card is already captured. A console.error in Vercel logs is not
    // monitored in real time — page a human so the paid-but-unrecorded
    // order can be reconciled by hand. Best-effort; never mask the throw.
    try {
      await sendAdminNotification({
        orderNumber: `PERSIST FAILED — ${processorId}`,
        customerName,
        customerEmail,
        items,
        total,
        currency,
        shippingAddress,
      });
    } catch {
      /* logged above — alert is best-effort */
    }
    throw new Error(`Order persistence failed for ${processorId}`);
  }

  if (!won) {
    // Another caller won the insert — read its order number, send nothing.
    // One short retry covers the sliver where the winner hasn't committed.
    for (let attempt = 0; attempt < 2; attempt++) {
      const { data: existing } = await supabase
        .from("orders")
        .select("order_number")
        .eq("revolut_order_id", processorId)
        .maybeSingle();
      if (existing?.order_number) {
        result.orderNumber = existing.order_number as string;
        return result;
      }
      await new Promise((r) => setTimeout(r, 800));
    }
    console.error(
      `[confirm-order] conflict row unreadable for ${processorId}`,
    );
    throw new Error(`Order record unreadable for ${processorId}`);
  }

  const orderNumber = won.order_number as string;
  result.orderNumber = orderNumber;

  // Conditional sale-marking: only flips rows that are still purchasable.
  // Zero rows affected means a concurrent order already took the piece —
  // these are one-of-one objects, so scream for a manual refund.
  for (const item of items) {
    const { data: flipped } = await supabase
      .from("products")
      .update({ status: "sold", available_quantity: 0 })
      .eq("id", item.product_id)
      .eq("status", "available")
      .select("id");
    if (!flipped || flipped.length === 0) {
      console.error(
        `[confirm-order] OVERSELL on order ${orderNumber}: ${item.slug || item.product_id} was already sold — refund ${customerEmail} manually`,
      );
      try {
        await sendAdminNotification({
          orderNumber: `OVERSELL — ${orderNumber}`,
          customerName,
          customerEmail,
          items: [item],
          total,
          currency,
          shippingAddress,
        });
      } catch {
        /* logged above — admin email is best-effort */
      }
    }
  }

  // Independent try/catch — a failure sending the customer confirmation must
  // not skip the admin notification (fulfilment depends on it), and vice versa.
  try {
    await sendOrderConfirmation({
      to: customerEmail,
      orderNumber,
      customerName,
      items,
      total,
      currency,
    });
  } catch (emailErr) {
    console.error("Failed to send customer confirmation:", emailErr);
  }
  try {
    await sendAdminNotification({
      orderNumber,
      customerName,
      customerEmail,
      items,
      total,
      currency,
      shippingAddress,
    });
  } catch (emailErr) {
    console.error("Failed to send admin notification:", emailErr);
  }

  try {
    const [firstName, ...rest] = (customerName || "").split(" ");
    await sendPurchaseToCAPI({
      email: customerEmail,
      firstName: firstName || undefined,
      lastName: rest.join(" ") || undefined,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zip: shippingAddress.postal_code,
      country: shippingAddress.country,
      value: total / 100,
      currency,
      orderNumber,
      items: items.map((i) => ({
        id: i.slug || i.product_id,
        quantity: i.quantity,
        price: i.price / 100,
      })),
      fbp: n.metaAttribution.fbp,
      fbc: n.metaAttribution.fbc,
      eventSourceUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.maisontanneurs.com"}/checkout/success`,
    });
  } catch (capiErr) {
    console.error("Failed to send CAPI Purchase event:", capiErr);
  }

  return result;
}

// === Revolut adapter ===
export async function confirmAndPersistOrder(
  revolutOrderId: string,
): Promise<ConfirmedOrder> {
  const order = await getOrderSettled(revolutOrderId);
  const meta = order.metadata || {};

  // Prefer Revolut's collected shipping; fall back to the address the shopper
  // entered on our branded form (stashed in metadata at order creation) so
  // fulfilment always has somewhere to send the piece.
  const shipping: ShippingAddress = order.shipping_address
    ? {
        line1: order.shipping_address.street_line_1,
        line2: order.shipping_address.street_line_2,
        city: order.shipping_address.city,
        state: order.shipping_address.region,
        postal_code: order.shipping_address.postcode,
        country: order.shipping_address.country_code,
      }
    : {
        line1: meta.ship_line1 || undefined,
        city: meta.ship_city || undefined,
        postal_code: meta.ship_postcode || undefined,
        country: meta.ship_country || undefined,
      };

  return persistConfirmedOrder({
    processorId: revolutOrderId,
    state: normState(order.state),
    customerEmail: order.customer?.email || "",
    customerName: order.customer?.full_name || meta.customer_name || "",
    items: parseItemsFromMetadata(order.metadata),
    total: order.amount,
    currency: order.currency.toUpperCase(),
    shipping,
    metaAttribution: getMetaAttributionFromMetadata(order.metadata),
  });
}
