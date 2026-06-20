import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Returns the stored cart for a recovery token so /cart/recover can rehydrate
// the shopper's bag. Maps the stored item shape (title/price-minor) onto the
// client cart shape (name/price-cents). No PII is returned.

export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ items: [] });

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ items: [] });

  const { data } = await supabase
    .from("abandoned_checkouts")
    .select("items")
    .eq("recovery_token", token)
    .maybeSingle();

  const items = ((data?.items as Record<string, unknown>[]) || []).map((i) => ({
    slug: String(i.slug || ""),
    name: String(i.title || ""),
    price: Number(i.price || 0),
    image: String(i.image || ""),
    quantity: Number(i.quantity || 1),
  }));

  return NextResponse.json({ items });
}
