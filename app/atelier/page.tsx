import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/editorial/site-header"
import { SiteFooter } from "@/components/editorial/site-footer"
import { AtelierFilm } from "@/components/editorial/atelier-film"

export const metadata: Metadata = {
  title: "L'Atelier — Maison Tanneurs",
  description:
    "A small leather house working out of a Marrakech atelier — master artisans stitching full-grain leather for three generations, father to son.",
}

const PILLARS = [
  {
    label: "Design",
    text: "Silhouettes drawn for daily carry, not season-driven trend. Form, leather grain and brass hardware do the talking — the Moroccan reference lives in the saddle-stitch and the patina, never in literal motif.",
  },
  {
    label: "Atelier",
    text: "Each bag is cut, stitched and finished by hand in one Marrakech workshop. Full-grain Moroccan leather, solid brass hardware, vegetable-tanned linings. One artisan takes a piece from start to end.",
  },
  {
    label: "Departure",
    text: "Every piece ships direct from the atelier — tracked express courier, free worldwide, most orders within 5 to 10 business days. No middlemen, no warehouses, no inventory we didn't make.",
  },
]

export default function AtelierPage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="bg-ground pt-[72px] md:pt-[96px]">
        {/* Opening */}
        <header className="px-6 pb-12 pt-20 text-center md:pb-16 md:pt-28">
          <p className="text-micro mb-8 text-ink-muted">L&rsquo;Atelier</p>
          <h1 className="mx-auto max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
            One workshop, three generations.
          </h1>
          <p className="mx-auto mt-8 max-w-md font-serif text-lg italic leading-relaxed text-ink-soft">
            A leather house for people who want the maker&rsquo;s mark on the
            bag they carry.
          </p>
        </header>

        {/* The story */}
        <section className="mx-auto max-w-2xl px-6 pb-16 md:pb-20">
          <p className="font-serif text-lg leading-relaxed text-ink-soft md:text-xl">
            Maison Tanneurs works out of a Marrakech atelier whose master
            artisans have been stitching full-grain leather for three
            generations — father to son, in the same workshop in the
            medina. We design the silhouettes; they cut, stitch and finish
            each piece by hand, one at a time.
          </p>
          <p className="mt-6 font-serif text-lg leading-relaxed text-ink-soft md:text-xl">
            What you carry was finished by the person who signed it — then
            it leaves the bench and starts its real life, in departure.
          </p>
        </section>

        {/* Corridor image break */}
        <section className="px-6 pb-16 md:px-10 md:pb-24">
          <picture>
            <source
              media="(max-width: 767px)"
              srcSet="/tanneurs/editorial/atelier-hero-bench-m.webp"
            />
            <img
              src="/tanneurs/editorial/atelier-hero-bench.webp"
              alt="The workbench — cut hides, paper patterns, a brass square, zellige walls in window light"
              loading="lazy"
              className="mx-auto aspect-[21/9] w-full max-w-[1400px] object-cover"
            />
          </picture>
        </section>

        {/* The film — Ryan's pick: The Making */}
        <AtelierFilm />

        {/* Three pillars */}
        <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-6 py-16 md:grid-cols-3 md:gap-10 md:py-24">
          {PILLARS.map((p) => (
            <div key={p.label}>
              <h3 className="text-micro mb-4 text-ink">{p.label}</h3>
              <p className="font-serif text-base leading-relaxed text-ink-soft">
                {p.text}
              </p>
            </div>
          ))}
        </section>

        {/* Worktable split */}
        <section className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative min-h-[420px] md:min-h-[640px]">
            <img
              src="/tanneurs/editorial/atelier-table.webp"
              alt="The cutting table — cognac leather panels under arched light"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-20 md:px-20 md:py-24 lg:px-28">
            <p className="text-micro mb-7 text-ink-muted">Les Tanneurs</p>
            <h2 className="max-w-md font-display text-3xl font-medium leading-[1.12] tracking-[0.02em] text-ink md:text-[40px]">
              Seven hands, one standard.
            </h2>
            <p className="mt-7 max-w-sm font-serif text-lg leading-relaxed text-ink-soft">
              The atelier works in editions small enough that every stitch
              stays honest. When a piece is right, it is made again — never
              faster.
            </p>
            <Link
              href="/heritage"
              className="link-caps mt-9 inline-block self-start text-ink"
            >
              Savoir-Faire
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 text-center md:py-28">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl text-ink md:text-4xl">
            The current edition is on the bench now.
          </h2>
          <Link href="/shop" className="link-caps mt-10 inline-block text-ink">
            View the Collection
          </Link>
          <p className="mt-10 font-serif text-base text-ink-muted">
            For a single commissioned piece, see{" "}
            <Link href="/bespoke" className="underline decoration-hairline underline-offset-4">
              Bespoke
            </Link>
            . To stock the house, see{" "}
            <Link href="/trade" className="underline decoration-hairline underline-offset-4">
              Trade
            </Link>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
