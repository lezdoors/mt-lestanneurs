import Link from "next/link"
import { getLocale, t, withLocale } from "@/lib/i18n"

// Atmosphere-first hero: no headline, no card. Model-led campaign frame
// (DeMellier device) — and, on desktop, motion at first paint: the benched
// Mediterranean-terrace film (hero-terrace.mp4) plays behind the thesis.
// Mobile and reduced-motion keep the proven 9:16 still — a 16:9 film
// centre-cropped into a phone loses the subject, and the still is the
// frame the Meta ads echo.
export async function EditorialHero() {
  const lo = await getLocale()
  return (
    <section className="relative h-[90svh] min-h-[560px] w-full overflow-hidden bg-dark-close">
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet="/tanneurs/editorial/hero-tote-9x16.webp"
        />
        <img
          src="/tanneurs/editorial/hero-tote-16x9.webp"
          alt="An oxblood leather tote with cream contrast stitching, carried against a black wool coat on a warm pale-stone street"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
      </picture>
      <video
        className="absolute inset-0 hidden h-full w-full object-cover md:motion-safe:block"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/tanneurs/films/hero-l-attente-poster.jpg"
        aria-hidden="true"
      >
        <source src="/tanneurs/films/hero-l-attente.mp4" type="video/mp4" />
      </video>
      {/* Top scrim keeps the white header legible over the bright sky */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-black/60 to-transparent" />

      {/* The thesis — the page's first words (and, at the closing, its
          last) — paired with a bordered CTA: cold paid traffic needs an
          obvious tap target, not an underline to hunt for. Visible within
          the first viewport on a 390px screen. */}
      <div className="thesis-rise pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-5 px-6 md:bottom-10">
        <p className="text-micro text-center text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.45)]">
          {t(lo, "hero.thesis")}
        </p>
        <Link
          href={withLocale("/shop", lo)}
          className="text-micro pointer-events-auto inline-block border border-white/70 px-7 py-3 text-white backdrop-blur-[2px] transition-colors hover:bg-white hover:text-[#1c1a17] [text-shadow:0_1px_12px_rgba(0,0,0,0.25)]"
        >
          {t(lo, "featured.cta")}
        </Link>
      </div>
    </section>
  )
}
