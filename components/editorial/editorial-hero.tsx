import { getLocale, t } from "@/lib/i18n"

// Atmosphere-first hero: no headline, no button, no card. Model-led
// campaign frame (DeMellier device): the duffle carried past a carved
// cedar door — Marrakech as architecture, not souk. The thesis line is
// the only text on the frame.
export async function EditorialHero() {
  const lo = await getLocale()
  return (
    <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-dark-close">
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet="/tanneurs/editorial/hero-stone-9x16.webp"
        />
        <img
          src="/tanneurs/editorial/hero-stone-16x9.webp"
          alt="A woman in an ivory tailored coat carrying a cognac leather weekender along a sunlit street of warm pale stone"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
      </picture>
      {/* Top scrim keeps the white header legible over the bright sky */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-black/60 to-transparent" />

      {/* The thesis — the page's first words (and, at the closing, its
          last). With the product card gone the line holds the bottom of
          the frame on every breakpoint. */}
      <p className="text-micro pointer-events-none absolute inset-x-0 bottom-8 text-center text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.45)] md:bottom-10">
        {t(lo, "hero.thesis")}
      </p>
    </section>
  )
}
