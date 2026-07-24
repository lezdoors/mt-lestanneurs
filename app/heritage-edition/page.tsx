import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/editorial/site-header"
import { SiteFooter } from "@/components/editorial/site-footer"
import { Newsletter } from "@/components/editorial/newsletter"
import { Reveal } from "@/components/editorial/reveal"
import { AmbientLoop } from "@/components/editorial/ambient-loop"
import { HeritageScrubHero } from "@/components/editorial/heritage-scrub-hero"
import { HeritageObjectCard } from "@/components/editorial/heritage-objects"
import { fetchProductBySlug } from "@/lib/supabase"
import { getLocale, withLocale } from "@/lib/i18n"
import {
  formatDisplayPrice,
  getDisplayCurrency,
  getRates,
} from "@/lib/currency-display"

export const revalidate = 300

export const metadata: Metadata = {
  title: "Heritage Edition — Maison Tanneurs",
  description:
    "Three enduring objects cut, stitched, and finished at the bench. A scroll-through film of the Heritage Edition — Atlas Weekender, Oasis Duffle, Marrakech Tote.",
}

// The three edition objects — spins live in /tanneurs/heritage; names and
// prices come from the live catalogue so the page can never drift from PDP.
const EDITION = [
  {
    number: "N° 01",
    slug: "atlas-weekender-cognac",
    material: "Cognac full-grain leather",
    file: "atlas-weekender",
  },
  {
    number: "N° 02",
    slug: "oasis-weekender-oxblood",
    material: "Oxblood full-grain leather",
    file: "oasis-duffle",
  },
  {
    number: "N° 03",
    slug: "marrakech-tote-cognac",
    material: "Cognac full-grain leather",
    file: "marrakech-tote",
  },
]

export default async function HeritageEditionPage() {
  const lo = await getLocale()
  const currency = await getDisplayCurrency()
  const rates = await getRates()

  const objects = (
    await Promise.all(
      EDITION.map(async (o) => {
        const p = await fetchProductBySlug(o.slug)
        if (!p) return null
        return {
          number: o.number,
          name: p.title,
          material: o.material,
          priceText: formatDisplayPrice(p.price, currency, rates),
          href: withLocale(`/product/${o.slug}`, lo),
          poster: `/tanneurs/heritage/${o.file}-poster.jpg`,
          video: `/tanneurs/heritage/${o.file}-spin.mp4`,
        }
      }),
    )
  ).filter((o): o is NonNullable<typeof o> => o !== null)

  return (
    <>
      <SiteHeader />
      <main className="bg-dark-close">
        <HeritageScrubHero />

        {/* Prologue */}
        <section className="px-6 py-24 text-center md:py-36">
          <Reveal>
            <p className="text-micro mb-10 text-white/50">
              Edition 001 — Marrakech / Paris
            </p>
            <h2 className="mx-auto max-w-3xl font-serif text-4xl leading-tight text-white md:text-6xl">
              Three objects. <em className="italic">One inheritance.</em>
            </h2>
            <p className="mx-auto mt-10 max-w-md font-serif text-lg leading-relaxed text-white/70">
              Built slowly by hand, each form is reduced to what travel asks
              of it: balance, endurance, and a surface that records a life.
            </p>
          </Reveal>
        </section>

        {/* The objects */}
        <section
          id="heritage-objects"
          className="px-6 pb-28 md:px-12 md:pb-36"
          aria-labelledby="heritage-objects-title"
        >
          <Reveal>
            <header className="mb-14 md:mb-20">
              <p className="text-micro mb-6 text-white/50">
                The Heritage Edition — Three objects
              </p>
              <h2
                id="heritage-objects-title"
                className="font-serif text-3xl text-white md:text-5xl"
              >
                Objects for the long way home.
              </h2>
            </header>
          </Reveal>
          <div className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-3">
            {objects.map((o) => (
              <HeritageObjectCard key={o.href} {...o} />
            ))}
          </div>
          <aside className="mt-16 max-w-md border-t border-white/15 pt-8">
            <p className="text-micro mb-4 text-white/50">Numbered at the bench</p>
            <p className="font-serif text-lg leading-relaxed text-white/70">
              Each object is numbered and stamped by the hands that made it
              before it leaves the atelier.
            </p>
          </aside>
        </section>

        {/* Material study */}
        <section
          className="relative w-full overflow-hidden"
          aria-labelledby="heritage-material-title"
        >
          <AmbientLoop
            src="/tanneurs/heritage/leather-macro.mp4"
            poster="/tanneurs/heritage/leather-macro-poster.webp"
            alt="Macro glide across full-grain leather, saddle stitching and brass hardware"
            className="h-[70vh] min-h-[440px] w-full object-cover md:h-[92vh]"
          />
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent">
            <div className="max-w-lg px-6 pb-14 md:px-12 md:pb-20">
              <p className="text-micro mb-6 text-white/60">
                Material study — Full-grain leather
              </p>
              <h2
                id="heritage-material-title"
                className="font-serif text-3xl leading-tight text-white md:text-5xl"
              >
                French in form. <em className="italic">Moroccan in hand.</em>
              </h2>
              <p className="mt-6 font-serif text-base leading-relaxed text-white/75 md:text-lg">
                No two hides receive light in the same way. Full-grain leather
                keeps its natural surface intact, then deepens through touch,
                travel, and time.
              </p>
              <dl className="text-micro mt-8 flex gap-10 text-white/60">
                <div>
                  <dt className="mb-2 text-white/40">Thread</dt>
                  <dd>Waxed linen</dd>
                </div>
                <div>
                  <dt className="mb-2 text-white/40">Hardware</dt>
                  <dd>Antique brass</dd>
                </div>
                <div>
                  <dt className="mb-2 text-white/40">Construction</dt>
                  <dd>Saddle stitched</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Coda */}
        <section className="px-6 py-28 text-center md:py-36">
          <Reveal>
            <p className="mx-auto max-w-lg font-serif text-2xl leading-relaxed text-white md:text-3xl">
              Made in a working Marrakech atelier.
              <br />
              Carried from Paris to anywhere.
            </p>
            <Link
              href={withLocale("/shop", lo)}
              className="link-caps mt-12 inline-block text-white"
            >
              Enter the full collection
            </Link>
          </Reveal>
        </section>

        {/* Back on ground for the shared capture + footer */}
        <div className="bg-ground">
          <Newsletter />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
