// Structured data for search + AI engines (GEO). JSON-LD only — never
// microdata. Every claim restates published site facts; nothing invented.
//
// Security note: the JSON injected below is built exclusively from literals in
// this file plus Supabase catalogue fields we author ourselves (no user
// input). serialize() additionally escapes "<" (<) so the payload can
// never close the script tag — the standard Next.js JSON-LD hardening.

const SITE_URL = "https://www.maisontanneurs.com"

function serialize(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  )
}

// Sitewide: rendered once in the root layout.
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
            name: "Maison Tanneurs",
            url: SITE_URL,
            logo: `${SITE_URL}/apple-icon.png`,
            description:
              "Full-grain leather bags, cut and saddle-stitched by hand in a Marrakech atelier. Numbered editions, lifetime repair.",
            email: "hello@maisontanneurs.com",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Marrakech",
              addressCountry: "MA",
            },
            sameAs: ["https://instagram.com/maisontanneurs"],
          },
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            url: SITE_URL,
            name: "Maison Tanneurs",
            publisher: { "@id": `${SITE_URL}/#organization` },
            inLanguage: "en",
          },
        ],
      }}
    />
  )
}

export interface ProductJsonLdInput {
  slug: string
  name: string
  description: string
  image: string[]
  priceUsdCents: number
  // Geo display price — when provided, the schema mirrors what the visitor
  // sees instead of the stored USD base.
  displayPriceCents?: number
  displayCurrency?: string
  inStock: boolean
  category?: string
}

// Per-PDP: Product + Offer + BreadcrumbList.
export function ProductJsonLd({ product }: { product: ProductJsonLdInput }) {
  const url = `${SITE_URL}/product/${product.slug}`
  const absolute = (u: string) => (u.startsWith("http") ? u : `${SITE_URL}${u}`)

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Product",
            "@id": `${url}#product`,
            name: product.name,
            url,
            image: product.image.filter(Boolean).map(absolute),
            description: product.description,
            category: product.category || "Leather Goods",
            brand: { "@id": `${SITE_URL}/#organization` },
            offers: {
              "@type": "Offer",
              url,
              price: (
                (product.displayPriceCents ?? product.priceUsdCents) / 100
              ).toFixed(2),
              priceCurrency: product.displayCurrency ?? "GBP",
              availability: product.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              itemCondition: "https://schema.org/NewCondition",
              seller: { "@id": `${SITE_URL}/#organization` },
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "La Collection",
                item: `${SITE_URL}/shop`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: product.name,
                item: url,
              },
            ],
          },
        ],
      }}
    />
  )
}
