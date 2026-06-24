import type Stripe from "stripe";
import { retrieveCheckoutSession } from "@/lib/checkout/stripe";
import {
  persistConfirmedOrder,
  parseItemsFromMetadata,
  type ConfirmedOrder,
  type NormalizedOrder,
  type ShippingAddress,
} from "@/lib/checkout/confirm-order";

// Stripe confirmation path — mirror of the Revolut confirmAndPersistOrder.
// Pulls the Checkout Session, normalizes it to the shared shape, and reuses
// the idempotent persistConfirmedOrder (orders row keyed on the session id in
// the revolut_order_id column). Both the success page and the Stripe webhook
// call this; persistence is idempotent so whichever fires first wins.

function stateFromSession(s: Stripe.Checkout.Session): NormalizedOrder["state"] {
  // 'paid' is the only state that fulfils. Card payments are synchronous, so
  // the success redirect already carries payment_status === 'paid'. Anything
  // else (unpaid, async pending) renders the pending screen and waits for the
  // webhook's async_payment_succeeded.
  return s.payment_status === "paid" ? "COMPLETED" : "PENDING";
}

export async function confirmAndPersistStripeSession(
  sessionId: string,
): Promise<ConfirmedOrder> {
  const session = await retrieveCheckoutSession(sessionId);
  const meta = session.metadata || {};
  const details = session.customer_details;
  const addr = details?.address;

  // Prefer the address the shopper typed on our branded form (stashed in
  // metadata at session creation); fall back to whatever Stripe collected.
  const shipping: ShippingAddress = {
    line1: meta.ship_line1 || addr?.line1 || undefined,
    line2: addr?.line2 || undefined,
    city: meta.ship_city || addr?.city || undefined,
    state: addr?.state || undefined,
    postal_code: meta.ship_postcode || addr?.postal_code || undefined,
    country: meta.ship_country || addr?.country || undefined,
  };

  return persistConfirmedOrder({
    processorId: session.id,
    state: stateFromSession(session),
    customerEmail: details?.email || session.customer_email || "",
    customerName: details?.name || meta.customer_name || "",
    items: parseItemsFromMetadata(meta),
    total: session.amount_total ?? 0,
    currency: (session.currency || "usd").toUpperCase(),
    shipping,
    metaAttribution: {
      fbp: meta.meta_fbp || undefined,
      fbc: meta.meta_fbc || undefined,
    },
  });
}
