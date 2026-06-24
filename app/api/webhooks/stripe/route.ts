import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/checkout/stripe";
import { confirmAndPersistStripeSession } from "@/lib/checkout/confirm-stripe";

// Stripe webhook — belt-and-suspenders alongside the success page's
// server-side confirmation (lib/checkout/confirm-stripe.ts). Both share
// confirmAndPersistStripeSession, which is idempotent on the session id, so
// emails/CAPI fire exactly once regardless of which path runs first.
//
// Needs the RAW request body for signature verification — App Router gives
// it via request.text(). Set STRIPE_WEBHOOK_SECRET (whsec_…) from the
// dashboard webhook endpoint. Until it's set, this route 400s on every
// event; the redirect-based success path still records orders, so checkout
// works before the webhook is wired.

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";

  let event;
  try {
    event = constructWebhookEvent(raw, signature, secret);
  } catch (err) {
    console.error(
      "Stripe webhook signature invalid:",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as { id: string };
    try {
      await confirmAndPersistStripeSession(session.id);
    } catch (err) {
      console.error("Stripe webhook confirmation failed:", err);
      return NextResponse.json(
        { error: "Could not process session" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
