// Meta Catalog product feed (RSS 2.0 with g: namespace). Used by Meta
// Advantage+ shopping, Dynamic Ads, and Google Merchant Center.
//
// URL: /feed/products.xml — pulls live data from the Supabase products table,
// filtered to status=available and excluding hidden SKUs. Edge-cached 1h.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { HIDDEN_SKUS, HIDDEN_SKUS_ARRAY } from "@/lib/hidden-skus";
import { isCurated } from "@/lib/products";
import { getRates, convertUSDCents } from "@/lib/checkout/fx";
import type { RateMap } from "@/lib/checkout/fx";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.maisontanneurs.com";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function absoluteUrl(u: string): string {
  if (!u) return "";
  if (u.startsWith("http")) return u;
  return `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`;
}

interface ProductRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  images: string[] | null;
  category: string | null;
  available_quantity: number | null;
  status: string;
}

export async function GET() {
  const supabase = getSupabase();
  const rates = await getRates();
  let products: ProductRow[] = [];

  if (supabase) {
    const hiddenList = `(${HIDDEN_SKUS_ARRAY.join(",")})`;
    const { data, error } = await supabase
      .from("products")
      .select("id, title, slug, description, price, images, category, available_quantity, status")
      .eq("status", "available")
      .not("slug", "in", hiddenList)
      .order("created_at", { ascending: false });

    if (error) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- supabase error: ${xmlEscape(error.message)} -->
${renderFeed([], rates)}`;
      return renderResponse(xml);
    }
    // Mirror the storefront's visibility exactly: a feed entry must have a
    // live, buyable PDP. Curation gates the PDP route, quantity gates the
    // Add to Bag — anything else would hand Meta a dead link.
    products = (data || []).filter(
      (p) =>
        !HIDDEN_SKUS.has(p.slug) &&
        isCurated(p.slug) &&
        (p.available_quantity ?? 0) > 0,
    );
  }

  return renderResponse(renderFeed(products, rates));
}

function renderResponse(xml: string): NextResponse {
  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

function renderFeed(products: ProductRow[], rates: RateMap): string {
  const items = products
    .map((p) => {
      const imgs = (p.images || []).filter(Boolean);
      const heroImg = imgs[0] || "";
      if (!heroImg || !p.title || !p.price) return null;

      const link = `${SITE_URL}/product/${p.slug}`;
      // GBP-everywhere: feed advertises the same currency we charge.
      const priceStr = (convertUSDCents(p.price, "GBP", rates) / 100).toFixed(2);
      const availability = (p.available_quantity ?? 0) > 0 ? "in stock" : "out of stock";
      const description = (p.description || p.title).slice(0, 4990);
      const additionalImages = imgs
        .slice(1, 11)
        .map((u) => `      <g:additional_image_link>${xmlEscape(absoluteUrl(u))}</g:additional_image_link>`)
        .join("\n");

      return `    <item>
      <g:id>${xmlEscape(p.slug)}</g:id>
      <title>${xmlEscape(p.title)}</title>
      <description>${xmlEscape(description)}</description>
      <link>${xmlEscape(link)}</link>
      <g:image_link>${xmlEscape(absoluteUrl(heroImg))}</g:image_link>
${additionalImages}
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:price>${priceStr} GBP</g:price>
      <g:brand>Maison Tanneurs</g:brand>
      <g:product_type>${xmlEscape(p.category || "Leather Goods")}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`;
    })
    .filter(Boolean)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Maison Tanneurs — Product Catalog</title>
    <link>${SITE_URL}</link>
    <description>Hand-stitched full-grain leather goods, made in Marrakech.</description>
${items}
  </channel>
</rss>`;
}
