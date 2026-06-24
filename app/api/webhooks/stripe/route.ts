import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { constructWebhookEvent } from "@/lib/checkout/stripe";
import { confirmAndPersistOrder } from "@/lib/checkout/confirm-order";

// Stripe webhook handler — optional belt-and-suspenders alongside the
// success page's server-side confirmation (lib/checkout/confirm-order.ts).
// Both paths share confirmAndPersistOrder, which is idempotent on the
// Stripe Checkout Session id, so emails/CAPI fire exactly once regardless
// of which path runs first or how often Stripe retries.
//
// Migrated from Revolut Acquiring 2026-06-23. The Supabase column
// `revolut_order_id` now stores Stripe Checkout Session ids — no schema
// change needed.

export const dynamic = "force-dynamic";
// confirmAndPersistOrder may sleep across a few settle-retries (~6s) waiting
// for a transitional session to reach paid — give the handler headroom so
// the serverless runtime never truncates it mid-retry.
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

  // Handle the events that resolve to a paid Checkout Session. Refunds,
  // disputes, etc. are out of scope for the launch path — add later when
  // refund automation is wired.
  //
  // checkout.session.completed                 — fires the moment the
  //   session reaches `complete`. For sync methods (card) payment_status is
  //   already `paid`; for async methods (Klarna, Bancontact) it may still
  //   be `unpaid` — confirmAndPersistOrder no-ops on non-paid state, then
  //   the async_payment_succeeded event fires later and we persist then.
  // checkout.session.async_payment_succeeded   — fires when an async
  //   payment lands on a previously-completed session.
  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (!session.id) {
    return NextResponse.json(
      { error: "Session payload missing id" },
      { status: 400 },
    );
  }

  try {
    await confirmAndPersistOrder(session.id);
  } catch (err) {
    console.error("Webhook order confirmation failed:", err);
    return NextResponse.json(
      { error: "Could not load session" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
