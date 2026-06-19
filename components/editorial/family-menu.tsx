import Link from "next/link"
import { getLocale, t, withLocale } from "@/lib/i18n"
import { Reveal, RevealGroup } from "@/components/editorial/reveal"

// Polène's screen-2 device: the category menu as oversized typography.
const FAMILIES = [
  { key: "family.weekenders", c: "Weekender" },
  { key: "family.briefcases", c: "Briefcase" },
  { key: "family.backpacks", c: "Backpack" },
  { key: "family.crossbodies", c: "Crossbody" },
  { key: "family.totes", c: "Tote" },
]

export async function FamilyMenu() {
  const lo = await getLocale()
  return (
    <nav
      aria-label="Shop by family"
      className="bg-ground px-6 py-20 text-center md:py-28"
    >
      <RevealGroup className="mx-auto flex max-w-4xl flex-col items-center gap-3 md:gap-5">
        {FAMILIES.map((f) => (
          <Link
            key={f.c}
            href={withLocale(`/shop?c=${f.c}`, lo)}
            className="font-serif text-5xl leading-[1.05] text-ink transition-opacity hover:opacity-50 md:text-7xl"
          >
            {t(lo, f.key)}
          </Link>
        ))}
      </RevealGroup>
      <Reveal delay={120}>
        <Link
          href={withLocale("/shop", lo)}
          className="link-caps mt-10 inline-block text-ink-soft"
        >
          {t(lo, "family.viewAll")}
        </Link>
      </Reveal>
    </nav>
  )
}
