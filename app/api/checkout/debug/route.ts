import { NextResponse } from "next/server";
import { createOrder, getOrder } from "@/lib/checkout/revolut";

export const dynamic = "force-dynamic";

// TEMP DEBUG (2026-06-15) — shows exactly what Revolut creates so we can
// see the order currency + state. DELETE after diagnosing payment.
export async function GET(req: Request) {
  const u = new URL(req.url);
  const existing = u.searchParams.get("order_id");
  try {
    if (existing) {
      const o = await getOrder(existing);
      return NextResponse.json({ mode: "lookup", id: o.id, state: o.state, currency: o.currency, amount: o.amount, raw: o });
    }
    const cur = (u.searchParams.get("currency") || "GBP").toUpperCase();
    const order = await createOrder({
      amount: 200,
      currency: cur,
      capture_mode: "automatic",
      description: "DEBUG probe",
    });
    return NextResponse.json({
      mode: "create",
      requested_currency: cur,
      order_id: order.id,
      order_currency: order.currency,
      order_amount: order.amount,
      state: order.state,
      api_base: process.env.REVOLUT_API_BASE || "https://merchant.revolut.com/api (default)",
      has_secret: Boolean(process.env.REVOLUT_SECRET_KEY),
      has_public: Boolean(process.env.NEXT_PUBLIC_REVOLUT_PUBLIC_KEY),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e instanceof Error ? e.message : e) }, { status: 500 });
  }
}
