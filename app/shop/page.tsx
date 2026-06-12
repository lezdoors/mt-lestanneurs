import type { Metadata } from "next"
import { Suspense } from "react"
import { SiteHeader } from "@/components/editorial/site-header"
import { SiteFooter } from "@/components/editorial/site-footer"
import { fetchAllProducts } from "@/lib/supabase"
import { getLocale, t } from "@/lib/i18n"
import { adaptProduct, curate, getCategories } from "@/lib/products"
import { ShopClient } from "./shop-client"
import { AmbientLoop } from "@/components/editorial/ambient-loop"

export const revalidate = 300

export const metadata: Metadata = {
  title: "La Collection — Maison Tanneurs",
  description:
    "Full-grain leather bags in small editions — weekenders, briefcases, rucksacks and crossbodies, cut and saddle-stitched by hand in Marrakech.",
}

export default async function ShopPage() {
  const lo = await getLocale()
  const products = curate((await fetchAllProducts()).map(adaptProduct))
  const categories = getCategories(products)

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="bg-ground pb-32 pt-[72px] md:pt-[96px]">
        <header className="px-6 py-20 text-center md:py-28">
          <p className="text-micro mb-8 text-ink-muted">Maison Tanneurs</p>
          <h1 className="font-serif text-5xl text-ink md:text-6xl">
            {t(lo, "shop.title")}
          </h1>
          <p className="mx-auto mt-8 max-w-md font-serif text-lg italic leading-relaxed text-ink-soft">
            {t(lo, "shop.lede")}
          </p>
        </header>

        {/* Opener — the maison reel, bench to departure */}
        <div className="mx-auto mb-16 max-w-[1400px] px-6 md:mb-20 md:px-10">
          <AmbientLoop
            src="/tanneurs/films/shop-opening-weekender.mp4"
            poster="/tanneurs/films/shop-opening-weekender-poster.jpg"
            alt="The maison reel — from the Marrakech bench to the ferry deck, the weekender carried into departure"
            className="aspect-video w-full object-cover"
          />
        </div>

        <Suspense>
          <ShopClient products={products} categories={categories} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  )
}
