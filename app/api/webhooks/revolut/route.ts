import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/checkout/revolut";
import { confirmAndPersistOrder } from "@/lib/checkout/confirm-order";

// Revolut webhook handler — optional belt-and-suspenders alongside the
// success page's server-side confirmation (lib/checkout/confirm-order.ts).
// Both paths share confirmAndPersistOrder, which is idempotent on
// revolut_order_id, so emails/CAPI fire exactly once regardless of which
// path runs first or how often Revolut retries.

export const dynamic = "force-dynamic";
// confirmAndPersistOrder may sleep across a few settle-retries (~6s) waiting
// for a transitional order to reach COMPLETED — give the handler headroom so
// the serverless runtime never truncates it mid-retry.
export const maxDuration = 30;

interface WebhookPayload {
  event: string;
  timestamp: string;
  order_id: string;
}

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const signature = request.headers.get("revolut-signature");
  const timestamp = request.headers.get("revolut-request-timestamp");
  const secret = process.env.REVOLUT_WEBHOOK_SECRET || "";

  const verification = verifyWebhookSignature({
    rawBody: raw,
    signatureHeader: signature,
    timestampHeader: timestamp,
    secret,
  });
  if (!verification.valid) {
    console.error(`Revolut webhook signature invalid: ${verification.reason}`);
    return NextResponse.json(
      { error: "Invalid signature", reason: verification.reason },
      { status: 400 },
    );
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(raw) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Event names are matched case-insensitively (the 2024-09-01 API returns
  // order *states* lowercase; don't assume the event casing either).
  // ORDER_AUTHORISED is processed too — confirmAndPersistOrder gates on
  // COMPLETED internally and no-ops on a non-completed state, so handling it
  // is safe and covers the async/3DS path where AUTHORISED arrives first.
  const event = (payload.event || "").toUpperCase();
  if (event !== "ORDER_COMPLETED" && event !== "ORDER_AUTHORISED") {
    return NextResponse.json({ received: true, ignored: payload.event });
  }

  try {
    await confirmAndPersistOrder(payload.order_id);
  } catch (err) {
    console.error("Webhook order confirmation failed:", err);
    return NextResponse.json({ error: "Could not load order" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
