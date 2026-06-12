import {
  type SupabaseProduct,
  productGallery,
  productHero,
  productNumber,
} from "./supabase"

export { formatPrice } from "./supabase"

// UI-facing product shape, adapted from Supabase rows. Prices stay in
// cents — always render through formatPrice.
export interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string
  hoverImage: string
  description: string
  longDescription: string
  materials: string[]
  care: string[]
  details: string[]
  images: string[]
  madeIn: string
}

const LEATHER_CARE = [
  "Wipe with a soft, dry cloth",
  "Condition with a neutral leather balm twice a year",
  "Keep away from prolonged direct sunlight and heat",
  "Store in the provided dust bag when not in use",
]

function titleCase(s: string): string {
  return s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function adaptProduct(p: SupabaseProduct): Product {
  const gallery = productGallery(p.slug)
  const details: string[] = []
  if (p.dimensions) {
    for (const [key, value] of Object.entries(p.dimensions)) {
      // Some DB dimension values carry a trailing "· <category>" — display
      // the measurement only.
      const clean = String(value).split("·")[0]?.trim() ?? value
      details.push(`${titleCase(key)}: ${clean}`)
    }
  }
  const ref = productNumber(p.slug)
  if (ref) details.push(`Reference ${ref}`)
  details.push("Hand-finished in our Marrakech atelier")

  const description = p.description?.trim() ?? ""

  return {
    id: p.slug,
    name: p.title,
    price: p.price,
    category: p.category,
    image: productHero(p.slug),
    hoverImage: gallery[1] ?? gallery[0],
    description: description.split("\n")[0] ?? "",
    longDescription: description,
    materials: p.materials?.length ? p.materials : ["Full-grain leather"],
    care: LEATHER_CARE,
    details,
    images: gallery,
    madeIn: "Marrakech",
  }
}

export function getCategories(products: Product[]): string[] {
  return ["All", ...Array.from(new Set(products.map((p) => p.category)))]
}

// Launch curation — art-directed keep-list in merchandising order
// (contact-sheet review 2026-06-10: 19 keep / 8 hide; see
// docs/launch-curation-2026-06-10.md for per-SKU reasons).
// A product absent from this list is hidden from the collection grid and
// related modules even if its Supabase row is published and has imagery.
// Empty list = curation pending; show everything (manifest-gated upstream).
const CURATED_ORDER: string[] = [
  "atlas-weekender-cognac",
  "oasis-weekender-oxblood",
  "atlas-kilim-duffle",
  "medina-rucksack-drawstring",
  "atlas-field-briefcase",
  "atlas-messenger-laptop",
  "atlas-briefcase-vintage",
  "classic-cognac-satchel",
  "expedition-rolltop-noir",
  "expedition-rolltop-cognac",
  "explorer-rolltop-cognac",
  "woven-leather-backpack",
  "medina-crossbody-cognac",
  "medina-saddlebag-tooled-cognac",
  "medina-crossbody-tooled-walnut",
  "medina-crossbody-envelope",
  "marrakech-tote-cognac",
  "medina-market-tote-cognac",
  "medina-zigzag-tote-chocolate",
  "medina-zigzag-tote-noir",
]

export function curate(products: Product[]): Product[] {
  if (CURATED_ORDER.length === 0) return products
  const bySlug = new Map(products.map((p) => [p.id, p]))
  return CURATED_ORDER.map((slug) => bySlug.get(slug)).filter(
    (p): p is Product => p !== undefined,
  )
}

export function isCurated(slug: string): boolean {
  return CURATED_ORDER.length === 0 || CURATED_ORDER.includes(slug)
}

export function relatedTo(product: Product, all: Product[], limit = 4): Product[] {
  const others = all.filter((p) => p.id !== product.id)
  const sameCategory = others.filter((p) => p.category === product.category)
  const rest = others.filter((p) => p.category !== product.category)
  return [...sameCategory, ...rest].slice(0, limit)
}
