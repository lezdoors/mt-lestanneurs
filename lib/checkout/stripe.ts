// Stripe checkout client — server-side only.
//
// Maison Tanneurs runs on its OWN dedicated Stripe account (a Stripe
// "separate account" under the Akal login, fully walled off from the
// Raccordement account). This replaces the Revolut hosted checkout, which
// hard-failed 3D Secure on US consumer cards and declined every real order.
// Stripe Checkout handles 3DS with risk-based / frictionless authentication,
// which US issuers complete.
//
// Selected per-request via CHECKOUT_PROVIDER=stripe in
// app/api/checkout/session/route.ts; the Revolut path stays in place behind
// the same flag so we can flip back instantly.
//
// Env vars:
//   STRIPE_SECRET_KEY      sk_live_… / sk_test_…  — server auth for all calls
//   STRIPE_WEBHOOK_SECRET  whsec_…               — webhook signature secret

import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  client = new Stripe(key);
  return client;
}

export interface StripeLineItem {
  name: string;
  unitMinor: number; // charge-currency minor units (already converted)
  quantity: number;
  image?: string; // absolute URL
}

export interface CreateStripeSessionInput {
  currency: string; // ISO 4217 — lowercased for Stripe
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  description?: string;
  metadata?: Record<string, string>;
  lineItems: StripeLineItem[];
}

export async function createCheckoutSession(
  input: CreateStripeSessionInput,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const currency = input.currency.toLowerCase();
  return stripe.checkout.sessions.create({
    mode: "payment",
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    customer_email: input.customerEmail || undefined,
    // Stash the same metadata the Revolut path used so confirm-stripe can
    // rebuild items + shipping + Meta attribution from the session alone.
    metadata: input.metadata,
    payment_intent_data: input.description
      ? { description: input.description }
      : undefined,
    line_items: input.lineItems.map((li) => ({
      quantity: li.quantity,
      price_data: {
        currency,
        unit_amount: li.unitMinor,
        product_data: {
          name: li.name,
          ...(li.image ? { images: [li.image] } : {}),
        },
      },
    })),
  });
}

export async function retrieveCheckoutSession(
  sessionId: string,
): Promise<Stripe.Checkout.Session> {
  // customer_details + metadata + amount_total + payment_status are all
  // returned by default — no expand needed (we read items from metadata,
  // never from line_items).
  return getStripe().checkout.sessions.retrieve(sessionId);
}

export function constructWebhookEvent(
  rawBody: string,
  signature: string | null,
  secret: string,
): Stripe.Event {
  if (!signature) throw new Error("Missing stripe-signature header");
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  return getStripe().webhooks.constructEvent(rawBody, signature, secret);
}
