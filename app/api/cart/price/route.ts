import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { HIDDEN_SKUS } from "@/lib/hidden-skus";

// Authoritative price + availability for a set of cart slugs. The client cart
// calls this on load to OVERWRITE any stored prices, so the displayed total and
// the Stripe Elements / wallet amount can never drift from what the server will
// actually charge (a stale localStorage cart once showed $4 while the server
// charged $370 — see lib/cart.tsx reprice). Prices are USD-canonical cents,
// exactly as the checkout/session route reads them. Read-only, no PII.

export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

type PricedItem = {
  slug: string;
  price: number; // cents
  available_quantity: number | null;
  available: boolean;
};

export async function POST(request: NextRequest) {
  let body: { slugs?: unknown };
  try {
    body = (await request.json()) as { slugs?: unknown };
  } catch {
    return NextResponse.json({ items: [] }, { status: 400 });
  }

  const slugs = Array.isArray(body.slugs)
    ? Array.from(
        new Set(
          body.slugs
            .map((s) => (typeof s === "string" ? s.trim() : ""))
            .filter(Boolean),
        ),
      ).slice(0, 50)
    : [];
  if (slugs.length === 0) return NextResponse.json({ items: [] });

  const supabase = getSupabase();
  // Non-2xx on failure is deliberate: the cart re-pricer treats a non-ok
  // response as "keep the existing cart" (fail-open). A 200 + empty list would
  // make it drop every line and wipe the shopper's bag on a transient DB error.
  if (!supabase) return NextResponse.json({ items: [] }, { status: 503 });

  const { data, error } = await supabase
    .from("products")
    .select("slug,price,status,available_quantity")
    .in("slug", slugs);
  if (error || !data) return NextResponse.json({ items: [] }, { status: 503 });

  const items: PricedItem[] = data.map((p) => {
    const qty =
      typeof p.available_quantity === "number" ? p.available_quantity : null;
    const available =
      p.status === "available" &&
      !HIDDEN_SKUS.has(p.slug) &&
      (qty === null || qty > 0);
    return {
      slug: p.slug,
      price: Number(p.price) || 0,
      available_quantity: qty,
      available,
    };
  });

  return NextResponse.json({ items });
}
