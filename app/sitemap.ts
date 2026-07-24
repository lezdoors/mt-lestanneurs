import type { MetadataRoute } from "next"
import { fetchAllProducts } from "@/lib/supabase"
import { adaptProduct, curate } from "@/lib/products"

const SITE_URL = "https://www.maisontanneurs.com"

const STATIC_ROUTES: Array<{ path: string; priority: number }> = [
  { path: "/", priority: 1.0 },
  { path: "/shop", priority: 0.9 },
  { path: "/heritage", priority: 0.7 },
  { path: "/heritage-edition", priority: 0.7 },
  { path: "/atelier", priority: 0.7 },
  { path: "/repair", priority: 0.6 },
  { path: "/bespoke", priority: 0.6 },
  { path: "/trade", priority: 0.6 },
  { path: "/boutique", priority: 0.6 },
  { path: "/contact", priority: 0.5 },
]

const LEGAL_SLUGS = [
  "shipping",
  "returns",
  "repair",
  "care",
  "faq",
  "terms",
  "privacy",
  "mentions",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path === "/" ? "" : r.path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: r.priority,
  }))

  const legalEntries: MetadataRoute.Sitemap = LEGAL_SLUGS.map((slug) => ({
    url: `${SITE_URL}/legal/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.3,
  }))

  let productEntries: MetadataRoute.Sitemap = []
  try {
    const products = curate((await fetchAllProducts()).map(adaptProduct))
    productEntries = products.map((p) => ({
      url: `${SITE_URL}/product/${p.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }))
  } catch {
    // Supabase unreachable at build — ship the static portion rather than fail.
  }

  return [...staticEntries, ...productEntries, ...legalEntries]
}
