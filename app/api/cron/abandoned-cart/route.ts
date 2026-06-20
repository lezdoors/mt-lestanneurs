import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendAbandonedCartEmail } from "@/lib/checkout/email";

// Hourly abandoned-cart recovery. Two touches:
//   first  — pending + un-emailed, aged >= 5h
//   second — pending + first-sent, aged >= 24h
// Never older than 72h (a stale cart isn't worth recovering). Rows are
// flipped to 'converted' by the Revolut webhook the moment a customer pays,
// so a buyer is never emailed. Triggered by Vercel Cron (vercel.json), which
// carries Authorization: Bearer <CRON_SECRET>.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FIRST_TOUCH_HOURS = 5;
const SECOND_TOUCH_HOURS = 24;
const MAX_AGE_HOURS = 72;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

type Row = {
  id: string;
  email: string;
  customer_name: string | null;
  items: { title: string; price: number; quantity: number; image?: string }[];
  amount_minor: number;
  currency: string;
  recovery_token: string;
};

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "No DB" }, { status: 500 });

  const now = Date.now();
  const iso = (h: number) => new Date(now - h * 3_600_000).toISOString();
  const stamp = () => new Date().toISOString();
  const handled = new Set<string>();
  let firstSent = 0;
  let secondSent = 0;

  const send = async (row: Row, secondTouch: boolean) => {
    await sendAbandonedCartEmail({
      to: row.email,
      customerName: row.customer_name || undefined,
      items: row.items || [],
      total: row.amount_minor,
      currency: row.currency,
      recoveryToken: row.recovery_token,
      secondTouch,
    });
  };

  // --- First touch ---
  const { data: firstBatch } = await supabase
    .from("abandoned_checkouts")
    .select("*")
    .eq("status", "pending")
    .eq("unsubscribed", false)
    .is("first_email_sent_at", null)
    .lte("created_at", iso(FIRST_TOUCH_HOURS))
    .gte("created_at", iso(MAX_AGE_HOURS))
    .order("created_at", { ascending: false })
    .limit(100);

  for (const row of (firstBatch as Row[]) || []) {
    const dupe = handled.has(row.email);
    try {
      if (!dupe) {
        await send(row, false);
        handled.add(row.email);
        firstSent++;
      }
      await supabase
        .from("abandoned_checkouts")
        .update({ first_email_sent_at: stamp(), updated_at: stamp() })
        .eq("id", row.id);
    } catch (e) {
      console.error("[abandoned] first-touch failed:", e);
    }
  }

  // --- Second touch ---
  const { data: secondBatch } = await supabase
    .from("abandoned_checkouts")
    .select("*")
    .eq("status", "pending")
    .eq("unsubscribed", false)
    .not("first_email_sent_at", "is", null)
    .is("second_email_sent_at", null)
    .lte("created_at", iso(SECOND_TOUCH_HOURS))
    .gte("created_at", iso(MAX_AGE_HOURS))
    .order("created_at", { ascending: false })
    .limit(100);

  for (const row of (secondBatch as Row[]) || []) {
    const dupe = handled.has(row.email);
    try {
      if (!dupe) {
        await send(row, true);
        handled.add(row.email);
        secondSent++;
      }
      await supabase
        .from("abandoned_checkouts")
        .update({ second_email_sent_at: stamp(), updated_at: stamp() })
        .eq("id", row.id);
    } catch (e) {
      console.error("[abandoned] second-touch failed:", e);
    }
  }

  return NextResponse.json({ ok: true, firstSent, secondSent });
}
