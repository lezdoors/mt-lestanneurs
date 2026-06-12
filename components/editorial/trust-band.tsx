import Link from "next/link"
import { getLocale, t, withLocale } from "@/lib/i18n"

// DeMellier's trust-band device in the house register.
const CELLS = [
  { href: "/legal/repair", title: "trust.repair", line: "trust.repairLine" },
  { href: "/legal/shipping", title: "trust.shipping", line: "trust.shippingLine" },
  { href: "/legal/returns", title: "trust.returns", line: "trust.returnsLine" },
]

export async function TrustBand() {
  const lo = await getLocale()
  return (
    <section className="border-y border-hairline bg-ground">
      <div className="mx-auto grid max-w-[1560px] grid-cols-1 divide-y divide-hairline md:grid-cols-3 md:divide-x md:divide-y-0">
        {CELLS.map((c) => (
          <Link
            key={c.href}
            href={withLocale(c.href, lo)}
            className="group px-8 py-10 text-center transition-colors hover:bg-ground-deep/40 md:py-14"
          >
            <h3 className="text-micro text-ink">{t(lo, c.title)}</h3>
            <p className="mx-auto mt-3 max-w-[26ch] font-serif text-base leading-relaxed text-ink-muted">
              {t(lo, c.line)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
