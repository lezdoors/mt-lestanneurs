import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/editorial/site-header"
import { SiteFooter } from "@/components/editorial/site-footer"

export const metadata: Metadata = {
  title: "Savoir-Faire — Maison Tanneurs",
  description:
    "Full-grain hides, saddle stitch in waxed linen, edges burnished by hand. Inside the Marrakech atelier where every Maison Tanneurs piece is made.",
}

// Material proof, not luxury filler: the hide, the stitch, the stamp,
// the bench — each claim paired with macro evidence.
export default function HeritagePage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="bg-ground pt-[72px] md:pt-[96px]">
        {/* Opening statement */}
        <section className="px-6 py-24 text-center md:py-36">
          <p className="text-micro mb-10 text-ink-muted">Savoir-Faire</p>
          <h1 className="mx-auto max-w-4xl font-display text-4xl font-medium leading-[1.08] tracking-[0.02em] text-ink md:text-6xl">
            The material is the proof.
          </h1>
          <p className="mx-auto mt-10 max-w-md font-serif text-lg leading-relaxed text-ink-soft md:text-xl">
            No story can replace what the hand can verify. Every claim we
            make is visible in the material — so we show the material.
          </p>
        </section>

        {/* The bench — atelier scene */}
        <section className="relative w-full overflow-hidden bg-dark-close">
          <img
            src="/tanneurs/editorial/atelier-arches.webp"
            alt="An artisan working leather at a bench beneath an arched window"
            loading="lazy"
            className="h-[70vh] min-h-[440px] w-full object-cover md:h-[86vh]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-6 pb-14 [text-shadow:0_1px_14px_rgba(0,0,0,0.35)] md:px-14 md:pb-20">
            <p className="text-micro mb-5 text-white/70">Les Tanneurs</p>
            <h2 className="max-w-xl font-serif text-3xl leading-[1.15] text-white md:text-[40px]">
              One bench. One piece. One artisan.
            </h2>
            <p className="mt-4 max-w-md font-serif text-lg italic leading-relaxed text-white/85">
              Each bag is cut, stitched and finished by one pair of hands,
              start to end.
            </p>
          </div>
        </section>

        {/* The hide */}
        <section className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative min-h-[420px] md:min-h-[700px]">
            <img
              loading="lazy"
              src="/tanneurs/editorial/heritage-fullgrain-emboss.webp"
              alt="Full-grain cognac leather with the maker's words pressed blind into the hide: Full-grain leather improves with age — Maison Tanneurs"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-24 md:px-20 md:py-32 lg:px-28">
            <p className="text-micro mb-10 text-ink-muted">La Matière</p>
            <h2 className="max-w-md font-display text-3xl font-medium leading-[1.12] tracking-[0.02em] text-ink md:text-[40px]">
              Full-grain, nothing else.
            </h2>
            <p className="mt-10 max-w-sm font-serif text-lg leading-relaxed text-ink-soft">
              Full-grain hides keep the skin&rsquo;s original surface — the
              pores, the scars, the grain. It is the only leather that grows
              more beautiful as it ages, taking on the patina of the roads
              it travels. We press our stamp blind into it, without foil or
              ink: a mark that wears in, not off.
            </p>
          </div>
        </section>

        {/* The tannery — material proof at scale */}
        <section className="relative w-full overflow-hidden bg-dark-close">
          <img
            src="/tanneurs/editorial/heritage-atelier-wide.webp"
            alt="The atelier at work — benches, hides and tools in honest daylight"
            loading="lazy"
            className="h-[60vh] min-h-[400px] w-full object-cover md:h-[80vh]"
          />
        </section>

        {/* The stitch */}
        <section className="grid grid-cols-1 md:grid-cols-2">
          <div className="order-2 flex flex-col justify-center px-6 py-24 md:order-1 md:px-20 md:py-32 lg:px-28">
            <p className="text-micro mb-10 text-ink-muted">Le Point Sellier</p>
            <h2 className="max-w-md font-display text-3xl font-medium leading-[1.12] tracking-[0.02em] text-ink md:text-[40px]">
              Two needles, one waxed thread.
            </h2>
            <p className="mt-10 max-w-sm font-serif text-lg leading-relaxed text-ink-soft">
              The saddle stitch cannot be made by machine: two needles cross
              through every hole, locking each stitch independently. Cut one
              and the seam holds. Sewn in waxed linen thread, edges burnished
              by hand until they shine — never sealed with paint.
            </p>
          </div>
          <div className="relative order-1 min-h-[420px] md:order-2 md:min-h-[700px]">
            <img
              loading="lazy"
              src="/tanneurs/editorial/heritage-stitch-dusk.webp"
              alt="A saddle stitch mid-cross at dusk — two needles, one waxed linen thread, lamplight on the bench"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </section>

        {/* Small series close */}
        <section className="px-6 py-28 text-center md:py-44">
          <h2 className="mx-auto max-w-3xl font-display text-3xl font-medium leading-[1.1] tracking-[0.02em] text-ink md:text-5xl">
            Small on purpose.
          </h2>
          <p className="mx-auto mt-10 max-w-md font-serif text-lg leading-relaxed text-ink-soft">
            A bench can only make so many pieces well. When an edition is
            gone, it returns when it is ready — never faster.
          </p>
          <Link href="/shop" className="link-caps mt-12 inline-block text-ink">
            View the Collection
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
