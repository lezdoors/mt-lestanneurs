import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Newsletter signup — atelier editions list. Adds the address to the Resend
// Audience (the ESP the repo already uses for transactional mail) and, best
// effort, mirrors it into Supabase so no signup is ever lost even before the
// audience id is configured. Both legs degrade gracefully when their env is
// unset (logged, never throws) so the form always returns a clean result.
//
// To connect: set RESEND_API_KEY (already set for order mail) and
// RESEND_AUDIENCE_ID (the Tanneurs audience) in Vercel. Optional Supabase
// table `newsletter_subscribers (email text primary key, locale text,
// created_at timestamptz default now())`.

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
    console.log("[newsletter] Resend skipped — RESEND_API_KEY/RESEND_AUDIENCE_ID unset");
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
    // 422 = already a contact; treat as success.
    if (!res.ok && res.status !== 422) {
      console.error(`[newsletter] Resend failed (${res.status}): ${await res.text()}`);
    }
  } catch (err) {
    console.error("[newsletter] Resend fetch error:", err);
  }
}

async function mirrorToSupabase(email: string, locale: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase
      .from("newsletter_subscribers")
      .upsert({ email, locale }, { onConflict: "email" });
  } catch (err) {
    console.error("[newsletter] Supabase mirror failed:", err);
  }
}

export async function POST(request: NextRequest) {
  let body: { email?: string; locale?: string };
  try {
    body = (await request.json()) as { email?: string; locale?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const locale = String(body.locale || "en").slice(0, 5);

  await Promise.all([addToResendAudience(email), mirrorToSupabase(email, locale)]);

  return NextResponse.json({ ok: true });
}
