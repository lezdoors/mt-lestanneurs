import Link from "next/link"
import { getLocale, t, withLocale } from "@/lib/i18n"
import { Reveal } from "@/components/editorial/reveal"

// Closing — the statement set in the dark negative space of the final
// frame: one duffle, one pool of light. The image is the sentence.
// (Ported from the storefront design experiment: the page used to end on
// TrustBand → Newsletter, a weak final frame for a maison.)
export async function ClosingInvitation() {
  const lo = await getLocale()
  return (
    <section className="relative w-full overflow-hidden bg-dark-close">
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet="/tanneurs/editorial/closing-plinth-m.webp"
        />
        <img
          src="/tanneurs/editorial/closing-plinth.webp"
          alt="A single cognac duffle on a travertine plinth in one pool of golden light against a dark wall"
          loading="lazy"
          className="h-[78vh] min-h-[520px] w-full object-cover md:h-[92vh]"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-transparent md:from-black/30 md:via-transparent" />
      <div className="absolute left-6 right-6 top-10 md:left-14 md:right-auto md:top-20 md:max-w-3xl [text-shadow:0_1px_14px_rgba(0,0,0,0.4)]">
        <Reveal>
          <h2 className="font-display text-[34px] font-medium leading-[1.08] tracking-[0.02em] text-white md:text-6xl">
            {t(lo, "closing.title")}
          </h2>
          <p className="mt-4 max-w-sm font-serif text-lg leading-relaxed text-white/90 md:mt-7 md:text-xl">
            {t(lo, "closing.body")}
          </p>
          <Link href={withLocale("/shop", lo)} className="link-caps mt-6 inline-block text-white md:mt-10">
            {t(lo, "closing.cta")}
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
