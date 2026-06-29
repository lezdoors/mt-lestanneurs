import type Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import {
  getPaymentIntent,
  normalizeIntentStatus,
  type OrderState,
} from "@/lib/checkout/stripe";
import { generateOrderNumber } from "@/lib/checkout/format";
import {
  sendOrderConfirmation,
  sendAdminNotification,
} from "@/lib/checkout/email";
import { sendPurchaseToCAPI } from "@/lib/checkout/meta-capi";
import {
  abandonedCheckoutPatchForOrderResult,
  nextInventoryState,
} from "@/lib/checkout/order-state.mjs";

// Server-side order confirmation. The success page calls this on load:
// pulls the PaymentIntent straight from Stripe, verifies status === 'succeeded',
// persists once (idempotent on the PaymentIntent id, stored in the legacy
// revolut_order_id column), and fires emails + Meta CAPI ONLY on first
// persistence so webhook retries / page refreshes can never double-send.
// The Stripe webhook handler reuses this same function — whichever path
// runs first wins, the other becomes a no-op.

export type OrderItem = {
  product_id: string;
  slug?: string;
  title: string;
  price: number; // charge-currency minor units
  usd_price?: number;
  quantity: number;
};

export interface ConfirmedOrder {
  state: OrderState;
  intentId: string;
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
  metadata: Stripe.Metadata | null | undefined,
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
  metadata: Stripe.Metadata | null | undefined,
): { fbp?: string; fbc?: string } {
  if (!metadata) return {};
  return {
    fbp: metadata.meta_fbp || undefined,
    fbc: metadata.meta_fbc || undefined,
  };
}

// Bounded retry around Stripe: transient 5xx and transitional states settle
// within seconds. async payment methods (Klarna, Bancontact) flip from
// `processing` → `succeeded` on a later webhook event; for cards the success
// page's read should be `succeeded` immediately.
const TRANSITIONAL_STATES = new Set(["PENDING", "PROCESSING", "AUTHORISED"]);
const RETRY_DELAYS_MS = [1200, 2000, 3000];

async function getIntentSettled(intentId: string): Promise<Stripe.PaymentIntent> {
  let intent: Stripe.PaymentIntent | null = null;
  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt - 1]));
    }
    try {
      intent = await getPaymentIntent(intentId);
      lastErr = null;
      if (!TRANSITIONAL_STATES.has(normalizeIntentStatus(intent))) return intent;
    } catch (err) {
      lastErr = err;
    }
  }
  if (intent) {
    console.error(
      `[confirm-order] ${intentId} still ${intent.status} after retries — rendering pending`,
    );
    return intent;
  }
  console.error(
    `[confirm-order] ${intentId} unreachable at Stripe after retries:`,
    lastErr,
  );
  throw lastErr instanceof Error
    ? lastErr
    : new Error("Stripe intent lookup failed");
}

async function markAbandonedCheckoutConverted(
  supabase: ReturnType<typeof getSupabase>,
  intentId: string,
): Promise<void> {
  const patch = abandonedCheckoutPatchForOrderResult({ persistedOrder: true });
  if (!patch) return;
  try {
    await supabase
      .from("abandoned_checkouts")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("revolut_order_id", intentId)
      .neq("status", "converted");
  } catch (e) {
    console.error("[abandoned] convert flip failed after order persisted:", e);
  }
}

export async function confirmAndPersistOrder(
  intentId: string,
  client?: { ip?: string; userAgent?: string; eventSourceUrl?: string },
): Promise<ConfirmedOrder> {
  const intent = await getIntentSettled(intentId);
  const state = normalizeIntentStatus(intent);

  const items = parseItemsFromMetadata(intent.metadata);
  const meta: Stripe.Metadata = intent.metadata || {};
  // Customer email lands in receipt_email at PaymentIntent create-time. The
  // billing_details object from confirmPayment carries name (and address if
  // we asked Stripe to collect it).
  const charge =
    typeof intent.latest_charge === "object" ? intent.latest_charge : null;
  const billingDetails = charge?.billing_details || null;
  const customerEmail =
    intent.receipt_email || billingDetails?.email || meta.customer_email || "";
  const customerName =
    billingDetails?.name || meta.customer_name || "";
  const total = intent.amount;
  const currency = (intent.currency || "usd").toUpperCase();

  const result: ConfirmedOrder = {
    state,
    intentId,
    customerName,
    customerEmail,
    items,
    total,
    currency,
  };

  if (state !== "COMPLETED") return result;

  // Shipping address — prefer the PaymentIntent's shipping field (set by
  // confirmPayment), fall back to the billing address on the charge, then
  // to the values the shopper typed on our form (stashed in metadata at
  // intent creation) so fulfilment always has somewhere to send the piece.
  const stripeShipping = intent.shipping || null;
  const stripeAddress =
    stripeShipping?.address || billingDetails?.address || null;
  const shippingAddress = stripeAddress
    ? {
        line1: stripeAddress.line1 || undefined,
        line2: stripeAddress.line2 || undefined,
        city: stripeAddress.city || undefined,
        state: stripeAddress.state || undefined,
        postal_code: stripeAddress.postal_code || undefined,
        country: stripeAddress.country || undefined,
      }
    : {
        line1: meta.ship_line1 || undefined,
        city: meta.ship_city || undefined,
        state: meta.ship_state || undefined,
        postal_code: meta.ship_postcode || undefined,
        country: meta.ship_country || undefined,
      };

  const supabase = getSupabase();

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
        revolut_order_id: intentId,
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
    console.error(
      `[confirm-order] PERSIST FAILED for paid order ${intentId}:`,
      error,
    );
    try {
      await sendAdminNotification({
        orderNumber: `PERSIST FAILED — ${intentId}`,
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
    throw new Error(`Order persistence failed for ${intentId}`);
  }

  if (!won) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const { data: existing } = await supabase
        .from("orders")
        .select("order_number")
        .eq("revolut_order_id", intentId)
        .maybeSingle();
      if (existing?.order_number) {
        result.orderNumber = existing.order_number as string;
        await markAbandonedCheckoutConverted(supabase, intentId);
        return result;
      }
      await new Promise((r) => setTimeout(r, 800));
    }
    console.error(`[confirm-order] conflict row unreadable for ${intentId}`);
    throw new Error(`Order record unreadable for ${intentId}`);
  }

  const orderNumber = won.order_number as string;
  result.orderNumber = orderNumber;

  await markAbandonedCheckoutConverted(supabase, intentId);

  // Stock updates — decrement multi-quantity SKUs and mark sold only when the
  // purchase exhausts stock. Zero rows affected means a concurrent order took
  // the piece or stock changed underneath us; alert for manual review/refund.
  for (const item of items) {
    const { data: current } = await supabase
      .from("products")
      .select("id,status,available_quantity")
      .eq("id", item.product_id)
      .maybeSingle();

    const currentQuantity =
      typeof current?.available_quantity === "number"
        ? current.available_quantity
        : item.quantity;
    const next = nextInventoryState({
      availableQuantity: currentQuantity,
      orderedQuantity: item.quantity,
    });

    const { data: flipped } = await supabase
      .from("products")
      .update(next)
      .eq("id", item.product_id)
      .eq("status", "available")
      .eq("available_quantity", currentQuantity)
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
        /* logged above */
      }
    }
  }

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
    const metaAttribution = getMetaAttributionFromMetadata(intent.metadata);
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
      fbp: metaAttribution.fbp,
      fbc: metaAttribution.fbc,
      clientIp: client?.ip,
      clientUserAgent: client?.userAgent,
      eventSourceUrl:
        client?.eventSourceUrl ||
        `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.maisontanneurs.com"}/checkout/success`,
    });
  } catch (capiErr) {
    console.error("Failed to send CAPI Purchase event:", capiErr);
  }

  return result;
}
