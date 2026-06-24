// Stripe Checkout client — server-side only.
//
// Maison Tanneurs migrated off Revolut Acquiring to a dedicated Stripe
// account 2026-06-23 (acct_1Tliw1EFLt1K0hH1, GBP settlement) after multiple
// customer checkouts failed on Revolut.
//
// Env vars:
//   STRIPE_SECRET_KEY              sk_live_...  — Bearer auth for all calls
//   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  pk_live_...  — client SDK (unused by Hosted Checkout, kept for future Elements)
//   STRIPE_WEBHOOK_SECRET          whsec_...    — populated post-registration
//
// Pattern matches the Revolut module it replaces: Hosted Checkout, server
// creates the Session, browser redirects to session.url, success page +
// webhook both flow through confirmAndPersistOrder() for idempotent persist.

import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  // Omit apiVersion — SDK falls back to its bundled pinned version
  // (2026-05-27.dahlia at install time). Account dashboard can override.
  _stripe = new Stripe(key, {
    typescript: true,
    appInfo: {
      name: "Maison Tanneurs storefront",
      url: "https://www.maisontanneurs.com",
    },
  });
  return _stripe;
}

// Order state normalized to match the legacy Revolut shape consumed by
// confirm-order.ts and success page. Stripe Checkout Sessions expose two
// separate fields — `status` (checkout flow state) and `payment_status`
// (charge state) — and we collapse them into the same union the rest of
// the codebase already speaks.
export type OrderState =
  | "PENDING"
  | "PROCESSING"
  | "AUTHORISED"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";

export function normalizeSessionState(session: Stripe.Checkout.Session): OrderState {
  if (session.status === "expired") return "CANCELLED";
  if (session.status === "open") return "PENDING";
  // status === "complete"
  switch (session.payment_status) {
    case "paid":
      return "COMPLETED";
    case "no_payment_required":
      return "COMPLETED";
    case "unpaid":
      return "PROCESSING";
    default:
      return "PROCESSING";
  }
}

export interface CreateCheckoutSessionInput {
  amount: number; // minor units — used for promo-collapsed flow only
  currency: string; // ISO 4217 lower-case
  description: string;
  customerEmail?: string;
  // Embedded Checkout posts back to this URL with ?session_id={CHECKOUT_SESSION_ID}
  // when the payment confirms. The visitor never leaves maisontanneurs.com to
  // get here — Stripe navigates from inside the embedded iframe.
  returnUrl: string;
  metadata: Record<string, string>;
  // One line per cart item. Images are deliberately omitted: Stripe's order
  // summary on the embedded panel would otherwise render the white product
  // plate inside our dark editorial chrome (square-in-square). The customer
  // has already seen the product on the storefront — name + price is enough.
  lineItems: Array<{
    name: string;
    description?: string;
    unitAmountMinor: number;
    quantity: number;
  }>;
  locale?: Stripe.Checkout.SessionCreateParams.Locale;
}

export interface CreatedCheckoutSession {
  id: string; // cs_live_... / cs_test_...
  clientSecret: string; // passed to <EmbeddedCheckoutProvider options={{ clientSecret }} />
}

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<CreatedCheckoutSession> {
  const stripe = getStripe();

  // ui_mode: 'embedded' renders Stripe Checkout INSIDE maisontanneurs.com
  // via @stripe/react-stripe-js's <EmbeddedCheckout/>. The browser never
  // navigates to checkout.stripe.com — Stripe returns a client_secret which
  // /checkout binds to the embed. After success, Stripe navigates the parent
  // window to return_url with {CHECKOUT_SESSION_ID} substituted.
  //
  // Deliberately NOT setting shipping_address_collection — full shipping
  // address was already captured on /checkout and stashed in metadata.
  // billing_address_collection: 'auto' keeps Stripe's minimum (ZIP+country
  // for AVS) only where the card brand requires it.
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    ui_mode: "embedded_page",
    return_url: input.returnUrl,
    currency: input.currency,
    customer_email: input.customerEmail || undefined,
    customer_creation: "if_required",
    locale: input.locale,
    line_items: input.lineItems.map((item) => ({
      price_data: {
        currency: input.currency,
        unit_amount: item.unitAmountMinor,
        product_data: {
          name: item.name,
          ...(item.description ? { description: item.description } : {}),
        },
      },
      quantity: item.quantity,
    })),
    billing_address_collection: "auto",
    phone_number_collection: { enabled: false },
    metadata: input.metadata,
    payment_intent_data: {
      description: input.description,
      // Mirror metadata onto the PaymentIntent so Disputes/Sigma see it from
      // either surface.
      metadata: input.metadata,
    },
  });

  if (!session.client_secret) {
    throw new Error("Stripe embedded Checkout Session missing client_secret");
  }
  return { id: session.id, clientSecret: session.client_secret };
}

// Used by confirm-order to settle on the final state. We expand line_items
// only so we can re-derive items if metadata is somehow missing — the
// authoritative items list lives in session.metadata, populated at creation.
export async function getCheckoutSession(
  sessionId: string,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "payment_intent", "customer_details"],
  });
}

// Signature verification — Stripe-Signature header is HMAC-SHA256 with
// timestamp + body. The SDK does this for us, including replay-tolerance.
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
