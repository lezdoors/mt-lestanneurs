import Link from "next/link"
import { MtMark } from "@/components/editorial/mt-mark"
import { getLocale, t, withLocale } from "@/lib/i18n"

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "footer.collection",
    links: [
      { href: "/shop?c=Weekender", label: "family.weekenders" },
      { href: "/shop?c=Briefcase", label: "family.briefcases" },
      { href: "/shop?c=Backpack", label: "family.backpacks" },
      { href: "/shop?c=Crossbody", label: "family.crossbodies" },
      { href: "/shop?c=Tote", label: "family.totes" },
      { href: "/shop", label: "footer.viewAll" },
    ],
  },
  {
    title: "footer.maison",
    links: [
      { href: "/heritage", label: "footer.savoirFaire" },
      { href: "/atelier", label: "footer.atelier" },
      { href: "/bespoke", label: "footer.bespoke" },
      { href: "/trade", label: "footer.trade" },
      { href: "/boutique", label: "footer.boutique" },
      { href: "/contact", label: "footer.contact" },
    ],
  },
  {
    title: "footer.service",
    links: [
      { href: "/repair", label: "footer.repair" },
      { href: "/legal/shipping", label: "footer.shipping" },
      { href: "/legal/returns", label: "footer.returns" },
      { href: "/legal/care", label: "footer.care" },
      { href: "/legal/faq", label: "footer.faq" },
    ],
  },
]

export async function SiteFooter() {
  const lo = await getLocale()
  return (
    <footer className="border-t border-hairline bg-ground px-6 pb-12 pt-16 md:pt-20">
      <div className="mx-auto max-w-[1560px]">
        <div className="flex flex-col gap-14 md:flex-row md:justify-between">
          <div>
            <p className="whitespace-nowrap font-wordmark text-xl font-normal uppercase leading-none tracking-[0.24em] text-ink">
              <span>Maison</span>
              <span aria-hidden className="inline-block w-[1.15ch]" />
              <span>Tanneurs</span>
            </p>
            <p className="text-micro mt-4 text-ink-muted">
              Marrakech&nbsp;·&nbsp;Atelier
            </p>
            <p className="text-micro mt-8 text-ink-muted">
              {t(lo, "footer.provenance")}
            </p>
            <a
              href="mailto:hello@maisontanneurs.com"
              className="text-micro mt-4 block text-ink-soft transition-opacity hover:opacity-50"
            >
              hello@maisontanneurs.com
            </a>
          </div>

          <div className="flex flex-col gap-10 md:flex-row md:gap-24">
            {COLUMNS.map((col) => (
              <nav key={col.title} className="flex flex-col gap-4">
                <p className="text-micro text-ink-muted">{t(lo, col.title)}</p>
                {col.links.map((l) => (
                  <Link
                    key={l.href}
                    href={withLocale(l.href, lo)}
                    className="text-micro text-ink-soft transition-opacity hover:opacity-50"
                  >
                    {t(lo, l.label)}
                  </Link>
                ))}
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex justify-center">
          <MtMark className="text-xl text-ink-muted" />
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 border-t border-hairline pt-8 md:flex-row md:justify-between">
          <p className="text-micro text-ink-muted">
            © Maison Tanneurs {new Date().getFullYear()} — Akal Digital
            Services Ltd
          </p>
          <nav className="flex gap-8">
            <Link
              href={withLocale("/legal/terms", lo)}
              className="text-micro text-ink-muted transition-opacity hover:opacity-50"
            >
              {t(lo, "footer.terms")}
            </Link>
            <Link
              href={withLocale("/legal/privacy", lo)}
              className="text-micro text-ink-muted transition-opacity hover:opacity-50"
            >
              {t(lo, "footer.privacy")}
            </Link>
            <Link
              href={withLocale("/legal/mentions", lo)}
              className="text-micro text-ink-muted transition-opacity hover:opacity-50"
            >
              Legal Notice
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
