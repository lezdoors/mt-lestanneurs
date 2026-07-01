import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Piece registration — the "register your piece" capture behind the care-card
// QR (maisontanneurs.com/repair). Records the hand-written serial (N°) against
// an email so the maison holds an authenticity record and a lifetime-repair
// contact, and mirrors the address into the Resend Audience the site already
// uses. Both legs degrade gracefully when their env is unset (logged, never
// throws) so the form always returns a clean result.
//
// To connect: RESEND_API_KEY + RESEND_AUDIENCE_ID (already used by newsletter)
// and optional Supabase table:
//   piece_registrations (
//     id uuid primary key default gen_random_uuid(),
//     serial text, email text, name text, product text, locale text,
//     created_at timestamptz default now()
//   )

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function addToResendAudience(email: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!key || !audienceId) {
    console.log("[repair] Resend skipped — RESEND_API_KEY/RESEND_AUDIENCE_ID unset");
    return;
  }
  try {
    const res = await fetch(
      `https://api.resend.com/audiences/${audienceId}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, unsubscribed: false }),
      },
    );
    if (!res.ok && res.status !== 422) {
      console.error(`[repair] Resend failed (${res.status}): ${await res.text()}`);
    }
  } catch (err) {
    console.error("[repair] Resend fetch error:", err);
  }
}

async function mirrorToSupabase(
  serial: string,
  email: string,
  name: string,
  product: string,
  locale: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase
      .from("piece_registrations")
      .insert({ serial, email, name, product, locale });
  } catch (err) {
    console.error("[repair] Supabase mirror failed:", err);
  }
}

export async function POST(request: NextRequest) {
  let body: {
    email?: string;
    serial?: string;
    name?: string;
    product?: string;
    locale?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const serial = String(body.serial || "").trim().slice(0, 40);
  const name = String(body.name || "").trim().slice(0, 120);
  const product = String(body.product || "").trim().slice(0, 120);
  const locale = String(body.locale || "en").slice(0, 5);

  await Promise.all([
    addToResendAudience(email),
    mirrorToSupabase(serial, email, name, product, locale),
  ]);

  return NextResponse.json({ ok: true });
}
