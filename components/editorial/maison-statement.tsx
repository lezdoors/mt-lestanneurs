import { getLocale, t } from "@/lib/i18n"
import { Reveal } from "@/components/editorial/reveal"

export async function MaisonStatement() {
  const lo = await getLocale()
  return (
    <section className="bg-ground px-6 py-24 text-center md:py-36">
      <Reveal>
        <p className="text-micro mb-8 text-ink-muted md:mb-10">
          {t(lo, "statement.eyebrow")}
        </p>
        <h2 className="mx-auto max-w-5xl font-display text-[44px] font-medium leading-[1.04] tracking-[0.02em] text-ink md:text-7xl">
          L&rsquo;Équilibre
          <br />
          <span className="font-serif text-[0.82em] font-normal lowercase italic tracking-normal text-ink-soft">
            de la
          </span>
          <br />
          Forme.
        </h2>
        <p className="mx-auto mt-8 max-w-md font-serif text-lg leading-relaxed text-ink-soft md:mt-10 md:text-xl">
          {t(lo, "statement.body")}
        </p>
      </Reveal>

      {/* The proof image — the statement made visible */}
      <Reveal className="-mx-6 mt-14 md:mt-20">
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet="/tanneurs/editorial/statement-train-terracotta-m.webp"
          />
          <img
            src="/tanneurs/editorial/statement-train-terracotta.webp"
            alt="A traveller in a burnt-terracotta silk shirt seated in a train compartment, a cognac leather duffle on the seat opposite, Tuscan hills in the window"
            loading="lazy"
            className="aspect-[4/5] w-full object-cover md:aspect-auto md:h-[80vh] md:min-h-[420px]"
          />
        </picture>
      </Reveal>
    </section>
  )
}
