import Link from "next/link"
import { getLocale, t, withLocale } from "@/lib/i18n"
import { Reveal, RevealGroup } from "@/components/editorial/reveal"

// L'Heure du Départ — DeMellier's actual device, not its surface: a broken,
// staggered editorial grid. Two diptych rows where image and text sit on
// opposite sides and the second frame drops below the baseline, so the eye
// zig-zags down instead of exiting straight through two centered slabs.
// Merges the old DepartureTiles (3-up row) + FamilyMenu (centered list).

const FAMILIES = [
  { key: "family.weekenders", c: "Weekender" },
  { key: "family.briefcases", c: "Briefcase" },
  { key: "family.backpacks", c: "Backpack" },
  { key: "family.crossbodies", c: "Crossbody" },
  { key: "family.totes", c: "Tote" },
]

export async function DepartureEditorial() {
  const lo = await getLocale()
  return (
    <section className="bg-ground px-6 py-24 md:px-10 md:py-36 lg:px-14">
      <div className="mx-auto max-w-[1560px]">
        {/* ROW 1 — image LEFT (7), category list RIGHT (5), vertically centered */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10 lg:gap-16">
          <Reveal className="md:col-span-7">
            <Link
              href={withLocale("/product/medina-zigzag-tote-noir", lo)}
              className="group block overflow-hidden"
            >
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet="/tanneurs/editorial/depart-monument-tote-m.webp"
                />
                <img
                  src="/tanneurs/editorial/depart-monument-tote.webp"
                  alt="A woman in a cream coat carries the noir whipstitch tote past a sunlit limestone monument"
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </picture>
              <p className="mt-5 font-sans text-[9px] uppercase tracking-[0.3em] text-ink-muted">
                N&deg; 01 &mdash; Voyage
              </p>
            </Link>
          </Reveal>

          <div className="flex flex-col justify-center md:col-span-5">
            <Reveal>
              <p className="text-micro mb-8 text-ink-muted md:mb-10">
                L&rsquo;Heure du Départ
              </p>
            </Reveal>
            <nav aria-label="Shop by family">
              <RevealGroup className="flex flex-col items-start gap-2 md:gap-3">
                {FAMILIES.map((f) => (
                  <Link
                    key={f.c}
                    href={withLocale(`/shop?c=${f.c}`, lo)}
                    className="font-serif text-4xl leading-[1.05] text-ink transition-opacity hover:opacity-50 md:text-5xl lg:text-6xl"
                  >
                    {t(lo, f.key)}
                  </Link>
                ))}
              </RevealGroup>
            </nav>
            <Reveal delay={120}>
              <Link
                href={withLocale("/shop", lo)}
                className="link-caps mt-8 inline-block text-ink-soft md:mt-10"
              >
                {t(lo, "family.viewAll")}
              </Link>
            </Reveal>
          </div>
        </div>

        {/* ROW 2 — image RIGHT (7) dropped below baseline, line + CTA LEFT (5).
            Image stays first in source so mobile reads image → text. */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:mt-8 md:grid-cols-12 md:gap-10 lg:gap-16">
          <Reveal className="md:order-2 md:col-span-7 md:mt-32 lg:mt-48">
            <Link
              href={withLocale("/product/atlas-kilim-rucksack", lo)}
              className="group block overflow-hidden"
            >
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet="/tanneurs/editorial/depart-medina-door-m.webp"
                />
                <img
                  src="/tanneurs/editorial/depart-medina-door.webp"
                  alt="The kilim rucksack carried past a deep-red carved door in a whitewashed medina wall"
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </picture>
              <p className="mt-5 font-sans text-[9px] uppercase tracking-[0.3em] text-ink-muted">
                N&deg; 02 &mdash; Voyage
              </p>
            </Link>
          </Reveal>

          <div className="flex flex-col justify-center md:order-1 md:col-span-5">
            <Reveal>
              <p className="max-w-sm font-serif text-2xl leading-[1.2] text-ink-soft md:text-3xl">
                {t(lo, "departure.line")}
              </p>
              <Link
                href={withLocale("/shop", lo)}
                className="link-caps mt-8 inline-block self-start text-ink md:mt-10"
              >
                {t(lo, "featured.cta")}
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
