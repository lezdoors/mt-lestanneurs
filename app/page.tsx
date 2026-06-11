import { SiteHeader } from "@/components/editorial/site-header"
import { EditorialHero } from "@/components/editorial/editorial-hero"
import { MaisonStatement } from "@/components/editorial/maison-statement"
import { FeaturedObjects } from "@/components/editorial/featured-objects"
import { DuoEditorial } from "@/components/editorial/duo-editorial"
import { TravelEditorial } from "@/components/editorial/travel-editorial"
import { CraftEditorial } from "@/components/editorial/craft-editorial"
import { CampaignFilm } from "@/components/editorial/campaign-film"
import { ClosingInvitation } from "@/components/editorial/closing-invitation"
import { SiteFooter } from "@/components/editorial/site-footer"
import { fetchAllProducts } from "@/lib/supabase"
import { adaptProduct } from "@/lib/products"

export const revalidate = 300

// Curated landing selection — pixel-verified consistent white plates.
// First slug is also the bag carried in the hero frame (floating card).
const FEATURED_SLUGS = [
  "atlas-weekender-cognac",
  "oasis-weekender-oxblood",
  "medina-saddlebag-tooled-cognac",
  "expedition-rolltop-noir",
]

export default async function Home() {
  const all = await fetchAllProducts()
  const bySlug = new Map(all.map((p) => [p.slug, p]))
  const featured = FEATURED_SLUGS.map((slug) => bySlug.get(slug))
    .filter((p) => p !== undefined)
    .map(adaptProduct)

  return (
    <>
      <SiteHeader />
      <main>
        <EditorialHero product={featured[0]} />
        <MaisonStatement />
        <FeaturedObjects products={featured} />
        <DuoEditorial />
        <TravelEditorial />
        <CraftEditorial />
        <CampaignFilm />
        <ClosingInvitation />
      </main>
      <SiteFooter />
    </>
  )
}
