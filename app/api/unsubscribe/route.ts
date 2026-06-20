import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// One-click unsubscribe from abandoned-cart reminders. Suppresses every row
// for the email behind the token, so the shopper is never reminded again.

export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function page(message: string): NextResponse {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Maison Tanneurs</title></head>
     <body style="margin:0;background:#f5efe3;color:#1f1b16;font-family:Georgia,serif;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;">
       <div style="max-width:420px;padding:40px;">
         <div style="font-size:24px;letter-spacing:0.04em;margin-bottom:20px;">MAISON TANNEURS</div>
         <p style="font-style:italic;font-size:17px;line-height:1.6;color:#3a332a;">${message}</p>
       </div>
     </body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return page("This link is no longer valid.");

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("abandoned_checkouts")
        .select("email")
        .eq("recovery_token", token)
        .maybeSingle();
      if (data?.email) {
        await supabase
          .from("abandoned_checkouts")
          .update({ unsubscribed: true })
          .eq("email", data.email);
      }
    } catch {
      // best-effort — still show the confirmation
    }
  }

  return page("You won't receive any further reminders. Thank you.");
}
