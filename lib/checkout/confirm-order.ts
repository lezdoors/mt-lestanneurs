import { createClient } from "@supabase/supabase-js";
import { getOrder, type RevolutOrder } from "@/lib/checkout/revolut";
import { generateOrderNumber } from "@/lib/checkout/format";
import {
  sendOrderConfirmation,
  sendAdminNotification,
} from "@/lib/checkout/email";
import { sendPurchaseToCAPI } from "@/lib/checkout/meta-capi";

// Server-side order confirmation — the webhook-less path. The success page
// calls this on load: it pulls the order straight from Revolut, verifies
// state === COMPLETED, persists it once (idempotent on revolut_order_id),
// and fires emails + Meta CAPI ONLY on first persistence so webhook
// retries / page refreshes can never double-send. The Revolut webhook
// route reuses this same function, so registering a webhook later is
// safe — whichever path runs first wins, the other becomes a no-op.

export type OrderItem = {
  product_id: string;
  slug?: string;
  title: string;
  price: number; // charge-currency minor units
  usd_price?: number;
  quantity: number;
};

export interface ConfirmedOrder {
  state: RevolutOrder["state"];
  revolutOrderId: string;
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
const TRANSITIONAL_STATES = new Set(["PENDING", "PROCESSING", "AUTHORISED"]);
const RETRY_DELAYS_MS = [1200, 2000, 3000];

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
      if (!TRANSITIONAL_STATES.has(order.state)) return order;
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

export async function confirmAndPersistOrder(
  revolutOrderId: string,
): Promise<ConfirmedOrder> {
  const order = await getOrderSettled(revolutOrderId);

  const items = parseItemsFromMetadata(order.metadata);
  const customerEmail = order.customer?.email || "";
  const customerName = order.customer?.full_name || "";
  const total = order.amount;
  const currency = order.currency.toUpperCase();

  const result: ConfirmedOrder = {
    state: order.state,
    revolutOrderId,
    customerName,
    customerEmail,
    items,
    total,
    currency,
  };

  if (order.state !== "COMPLETED") return result;

  const shippingAddress = order.shipping_address
    ? {
        line1: order.shipping_address.street_line_1,
        line2: order.shipping_address.street_line_2,
        city: order.shipping_address.city,
        state: order.shipping_address.region,
        postal_code: order.shipping_address.postcode,
        country: order.shipping_address.country_code,
      }
    : {};

  const supabase = getSupabase();

  // Race-proof persistence: ON CONFLICT (revolut_order_id) DO NOTHING.
  // Exactly one concurrent caller (success page load, refresh, future
  // webhook) gets a row back and owns the side effects; everyone else
  // reads the canonical row and returns silently.
  const { data: won, error } = await supabase
    .from("orders")
    .upsert(
      {
        order_number: generateOrderNumber(),
        sales_channel: "direct",
        revolut_order_id: revolutOrderId,
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
    // A COMPLETED payment we cannot record must never render as success —
    // throw so the page shows the problem state and the error is loud in
    // the logs. The customer's money is safe in Revolut either way.
    console.error(
      `[confirm-order] PERSIST FAILED for paid order ${revolutOrderId}:`,
      error,
    );
    throw new Error(`Order persistence failed for ${revolutOrderId}`);
  }

  if (!won) {
    // Another caller won the insert — read its order number, send nothing.
    // One short retry covers the sliver where the winner hasn't committed.
    for (let attempt = 0; attempt < 2; attempt++) {
      const { data: existing } = await supabase
        .from("orders")
        .select("order_number")
        .eq("revolut_order_id", revolutOrderId)
        .maybeSingle();
      if (existing?.order_number) {
        result.orderNumber = existing.order_number as string;
        return result;
      }
      await new Promise((r) => setTimeout(r, 800));
    }
    console.error(
      `[confirm-order] conflict row unreadable for ${revolutOrderId}`,
    );
    throw new Error(`Order record unreadable for ${revolutOrderId}`);
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

  try {
    await sendOrderConfirmation({
      to: customerEmail,
      orderNumber,
      customerName,
      items,
      total,
      currency,
    });
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
    console.error("Failed to send emails:", emailErr);
  }

  try {
    const metaAttribution = getMetaAttributionFromMetadata(order.metadata);
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
      eventSourceUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.maisontanneurs.com"}/checkout/success?revolut_order_id=${revolutOrderId}`,
    });
  } catch (capiErr) {
    console.error("Failed to send CAPI Purchase event:", capiErr);
  }

  return result;
}
