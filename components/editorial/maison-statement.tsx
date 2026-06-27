import { getLocale, t } from "@/lib/i18n"
import { Reveal } from "@/components/editorial/reveal"

export async function MaisonStatement() {
  const lo = await getLocale()
  return (
    <section className="bg-ground px-6 pb-16 pt-24 text-center md:pb-24 md:pt-36">
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
    </section>
  )
}
