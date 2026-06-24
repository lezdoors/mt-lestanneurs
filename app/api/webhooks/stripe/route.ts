import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { constructWebhookEvent } from "@/lib/checkout/stripe";
import { confirmAndPersistOrder } from "@/lib/checkout/confirm-order";

// Stripe webhook handler — belt-and-suspenders alongside the success page's
// server-side confirmation. Both paths share confirmAndPersistOrder, which
// is idempotent on the PaymentIntent id, so emails/CAPI fire exactly once
// regardless of which path runs first or how often Stripe retries.

export const dynamic = "force-dynamic";
// confirmAndPersistOrder may sleep across a few settle-retries (~6s) waiting
// for a transitional intent to reach succeeded — give the handler headroom.
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(raw, signature);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`Stripe webhook signature invalid: ${reason}`);
    return NextResponse.json(
      { error: "Invalid signature", reason },
      { status: 400 },
    );
  }

  // payment_intent.succeeded fires when a charge captures. For async methods
  // (Klarna, iDEAL) the PaymentIntent goes through `processing` first;
  // Stripe sends `succeeded` only when settled. Card flows succeed inline.
  if (event.type !== "payment_intent.succeeded") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const intent = event.data.object as Stripe.PaymentIntent;
  if (!intent.id) {
    return NextResponse.json(
      { error: "PaymentIntent payload missing id" },
      { status: 400 },
    );
  }

  try {
    await confirmAndPersistOrder(intent.id);
  } catch (err) {
    console.error("Webhook order confirmation failed:", err);
    return NextResponse.json(
      { error: "Could not load intent" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
