import Link from "next/link"
import { getLocale, t, withLocale } from "@/lib/i18n"
import { Reveal } from "@/components/editorial/reveal"

// Savoir-faire — 50/50 split: statement against a single tactile frame.
export async function CraftEditorial() {
  const lo = await getLocale()
  return (
    <section className="grid grid-cols-1 bg-ground md:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-20 md:px-20 md:py-24 lg:px-28">
        <Reveal>
          <p className="text-micro mb-7 text-ink-muted">{t(lo, "craft.eyebrow")}</p>
          <h2 className="max-w-md font-display text-3xl font-medium leading-[1.12] tracking-[0.02em] text-ink md:text-[44px]">
            {t(lo, "craft.title")}
          </h2>
          <p className="mt-7 max-w-sm font-serif text-lg leading-relaxed text-ink-soft md:text-xl">
            {t(lo, "craft.body")}
          </p>
          <Link
            href={withLocale("/atelier", lo)}
            className="link-caps mt-9 inline-block self-start text-ink"
          >
            {t(lo, "craft.cta")}
          </Link>
        </Reveal>
      </div>
      <div className="relative min-h-[520px] md:min-h-[820px]">
        <picture>
          <source media="(max-width: 767px)" srcSet="/tanneurs/editorial/craft-artisan-window-m.webp" />
          <img
            src="/tanneurs/editorial/craft-artisan-window.webp"
            alt="An artisan bent over the work at an arched window, brass hardware laid out, a finished tote beside him"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
      </div>
    </section>
  )
}
