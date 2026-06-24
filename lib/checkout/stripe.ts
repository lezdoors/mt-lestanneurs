// Stripe client — server-side only.
//
// Maison Tanneurs runs Stripe Elements directly on maisontanneurs.com — no
// Hosted Checkout, no Embedded Checkout iframe. The /checkout page renders
// the entire payment surface in our editorial chrome and confirms the
// PaymentIntent through @stripe/stripe-js. This module is what creates,
// retrieves, and normalizes PaymentIntents server-side.
//
// Env vars:
//   STRIPE_SECRET_KEY                   sk_live_...   — Bearer auth
//   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  pk_live_...   — client Elements SDK
//   STRIPE_WEBHOOK_SECRET               whsec_...     — payment_intent.* events

import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  // Omit apiVersion — SDK falls back to its bundled pinned version. Account
  // dashboard can override.
  _stripe = new Stripe(key, {
    typescript: true,
    appInfo: {
      name: "Maison Tanneurs storefront",
      url: "https://www.maisontanneurs.com",
    },
  });
  return _stripe;
}

// Order state surface — kept identical to the legacy Checkout Session
// normalizer so confirm-order.ts and the success page consume one type.
export type OrderState =
  | "PENDING"
  | "PROCESSING"
  | "AUTHORISED"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";

export function normalizeIntentStatus(intent: Stripe.PaymentIntent): OrderState {
  switch (intent.status) {
    case "succeeded":
      return "COMPLETED";
    case "processing":
      return "PROCESSING";
    case "requires_capture":
      return "AUTHORISED";
    case "canceled":
      return "CANCELLED";
    case "requires_payment_method":
    case "requires_action":
    case "requires_confirmation":
      return "PENDING";
    default:
      return "PENDING";
  }
}

export interface CreatePaymentIntentInput {
  amount: number; // minor units, final charge
  currency: string; // ISO 4217 lower-case
  description: string;
  customerEmail?: string;
  metadata: Record<string, string>;
}

export interface CreatedPaymentIntent {
  id: string; // pi_live_...
  clientSecret: string;
}

export async function createPaymentIntent(
  input: CreatePaymentIntentInput,
): Promise<CreatedPaymentIntent> {
  const stripe = getStripe();
  // automatic_payment_methods lets Stripe present cards, Apple Pay, Google
  // Pay, Link, Klarna, etc. to the PaymentElement based on currency, country,
  // and account capabilities. allow_redirects: 'always' is required for
  // redirect-based methods (Klarna, Bancontact, iDEAL).
  const intent = await stripe.paymentIntents.create({
    amount: input.amount,
    currency: input.currency,
    automatic_payment_methods: { enabled: true, allow_redirects: "always" },
    description: input.description,
    receipt_email: input.customerEmail || undefined,
    metadata: input.metadata,
  });
  if (!intent.client_secret) {
    throw new Error("Stripe PaymentIntent created without a client_secret");
  }
  return { id: intent.id, clientSecret: intent.client_secret };
}

// confirm-order pulls the canonical PaymentIntent here. expand customer
// + payment_method so shipping/billing collected at confirm time is visible
// in one round trip.
export async function getPaymentIntent(
  intentId: string,
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();
  return stripe.paymentIntents.retrieve(intentId, {
    expand: ["customer", "payment_method", "latest_charge"],
  });
}

// Webhook signature verification — Stripe-Signature is HMAC-SHA256 over
// timestamp + body. The SDK handles replay tolerance.
export function constructWebhookEvent(
  rawBody: string | Buffer,
  signatureHeader: string | null,
): Stripe.Event {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  if (!signatureHeader) throw new Error("missing Stripe-Signature header");
  return stripe.webhooks.constructEvent(rawBody, signatureHeader, secret);
}
