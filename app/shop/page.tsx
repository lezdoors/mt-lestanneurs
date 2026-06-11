import type { Metadata } from "next"
import { SiteHeader } from "@/components/editorial/site-header"
import { SiteFooter } from "@/components/editorial/site-footer"
import { fetchAllProducts } from "@/lib/supabase"
import { adaptProduct, curate, getCategories } from "@/lib/products"
import { ShopClient } from "./shop-client"

export const revalidate = 300

export const metadata: Metadata = {
  title: "La Collection — Maison Tanneurs",
  description:
    "Full-grain leather bags in small editions — weekenders, briefcases, rucksacks and crossbodies, cut and saddle-stitched by hand in Marrakech.",
}

export default async function ShopPage() {
  const products = curate((await fetchAllProducts()).map(adaptProduct))
  const categories = getCategories(products)

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="bg-ground pb-32 pt-[72px] md:pt-[96px]">
        <header className="px-6 py-20 text-center md:py-28">
          <p className="text-micro mb-8 text-ink-muted">Maison Tanneurs</p>
          <h1 className="font-serif text-5xl text-ink md:text-6xl">
            La Collection
          </h1>
          <p className="mx-auto mt-8 max-w-md font-serif text-lg italic leading-relaxed text-ink-soft">
            Full-grain leather, cut and saddle-stitched by hand. Each piece
            leaves the bench ready to outlast its first decade.
          </p>
        </header>

        <ShopClient products={products} categories={categories} />
      </main>
      <SiteFooter />
    </>
  )
}
