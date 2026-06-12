import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import imageManifest from "./product-images.json"
import { HIDDEN_SKUS } from "@/lib/hidden-skus"

// Read-only data layer against the same Supabase project production uses.
// Server-side only — never import from a "use client" file.
let _client: SupabaseClient | null = null

function getClient(): SupabaseClient | null {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    if (typeof window === "undefined") {
      console.warn("[supabase] missing NEXT_PUBLIC_SUPABASE_URL or key — product reads will return empty")
    }
    return null
  }
  _client = createClient(url, key, { auth: { persistSession: false } })
  return _client
}

export type SupabaseProduct = {
  id: string
  title: string
  slug: string
  description: string | null
  price: number
  images: string[]
  category: string
  dimensions: Record<string, string> | null
  materials: string[] | null
  available_quantity: number
  status: "available" | "sold" | "reserved" | "draft"
  featured: boolean
  created_at: string
  updated_at: string
}

type ImageManifest = Record<string, { hero: string; gallery: string[] }>
const MANIFEST = imageManifest as ImageManifest


const PUBLISHED_STATUSES = new Set(["available", "reserved"])

const FULL_COLS =
  "id,title,slug,description,price,images,category,status,featured,available_quantity,created_at,updated_at,dimensions,materials"

// Drive `usable product pics/MT-XX-NNN__<slug>/` is the only sanctioned
// commerce-image source. A published SKU with no encoded Drive Hero is
// hidden rather than falling back to Supabase images[].
export function hasDriveImages(slug: string): boolean {
  return slug in MANIFEST
}

function visible(p: SupabaseProduct): boolean {
  return PUBLISHED_STATUSES.has(p.status) && !HIDDEN_SKUS.has(p.slug) && hasDriveImages(p.slug)
}

export async function fetchAllProducts(): Promise<SupabaseProduct[]> {
  const sb = getClient()
  if (!sb) return []
  const { data } = await sb
    .from("products")
    .select(FULL_COLS)
    .in("status", ["available", "reserved"])
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100)
  if (!data) return []
  return (data as SupabaseProduct[]).filter(visible)
}

export async function fetchProductBySlug(slug: string): Promise<SupabaseProduct | null> {
  const sb = getClient()
  if (!sb) return null
  const { data } = await sb.from("products").select("*").eq("slug", slug).maybeSingle()
  if (!data) return null
  const p = data as SupabaseProduct
  return visible(p) ? p : null
}

export async function fetchFeaturedProducts(limit = 6): Promise<SupabaseProduct[]> {
  const all = await fetchAllProducts()
  const featured = all.filter((p) => p.featured)
  const pool = featured.length >= limit ? featured : [...featured, ...all.filter((p) => !p.featured)]
  return pool.slice(0, limit)
}

export function productHero(slug: string): string {
  return MANIFEST[slug]?.hero || "/placeholder.svg"
}

export function productGallery(slug: string): string[] {
  const entry = MANIFEST[slug]
  if (!entry) return ["/placeholder.svg"]
  return [entry.hero, ...entry.gallery]
}

// Supabase stores prices in cents. Display in EUR (matches production —
// Polène / Bleu de Chauffe register).
export function formatPrice(cents: number): string {
  const eur = cents / 100
  return `€${eur.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// Stable slug → MT reference (Airtable canonical IDs).
const PRODUCT_NUMBERS: Record<string, string> = {
  "atlas-briefcase-vintage": "MT-BAG-001",
  "atlas-field-briefcase": "MT-BAG-002",
  "atlas-kilim-duffle": "MT-BAG-003",
  "atlas-kilim-rucksack": "MT-BAG-004",
  "atlas-messenger-laptop": "MT-BAG-005",
  "atlas-weekender-cognac": "MT-BAG-006",
  "classic-cognac-satchel": "MT-BAG-007",
  "cognac-brogue-backpack": "MT-BAG-008",
  "expedition-rolltop-cognac": "MT-BAG-009",
  "expedition-rolltop-noir": "MT-BAG-010",
  "explorer-rolltop-cognac": "MT-BAG-011",
  "heritage-rucksack": "MT-BAG-012",
  "marrakech-tote-cognac": "MT-BAG-013",
  "medina-crossbody-cognac": "MT-BAG-014",
  "medina-crossbody-envelope": "MT-BAG-015",
  "medina-crossbody-tooled-walnut": "MT-BAG-016",
  "medina-duffle": "MT-BAG-017",
  "medina-rucksack-drawstring": "MT-BAG-018",
  "medina-rucksack-flap-chocolate": "MT-BAG-019",
  "medina-saddlebag-tooled-cognac": "MT-BAG-020",
  "oasis-weekender-oxblood": "MT-BAG-021",
  "vintage-buckle-backpack": "MT-BAG-022",
  "vintage-satchel-light-brown": "MT-BAG-023",
  "woven-leather-backpack": "MT-BAG-024",
  "medina-cargo-rucksack-cognac": "MT-BAG-025",
  "medina-crossbody-clasp-teal": "MT-BAG-026",
  "medina-market-tote-cognac": "MT-BAG-027",
  "medina-zigzag-tote-chocolate": "MT-BAG-028",
  "medina-zigzag-tote-noir": "MT-BAG-029",
}

export function productNumber(slug: string): string {
  return PRODUCT_NUMBERS[slug] || ""
}
