import Link from "next/link"
import { MtMark } from "@/components/editorial/mt-mark"

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "La Maison",
    links: [
      { href: "/shop", label: "La Collection" },
      { href: "/heritage", label: "Savoir-Faire" },
      { href: "/bespoke", label: "Bespoke" },
      { href: "/trade", label: "Trade" },
      { href: "/boutique", label: "Boutique" },
    ],
  },
  {
    title: "Service",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/legal/shipping", label: "Shipping" },
      { href: "/legal/returns", label: "Returns" },
      { href: "/legal/repair", label: "Lifetime Repair" },
      { href: "/legal/care", label: "Care" },
      { href: "/legal/faq", label: "FAQ" },
    ],
  },
]

export function SiteFooter() {
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
              Façonné à la main à Marrakech
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
                <p className="text-micro text-ink-muted">{col.title}</p>
                {col.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-micro text-ink-soft transition-opacity hover:opacity-50"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-20 flex justify-center">
          <MtMark className="text-xl text-ink-muted" />
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 border-t border-hairline pt-8 md:flex-row md:justify-between">
          <p className="text-micro text-ink-muted">
            © Maison Tanneurs {new Date().getFullYear()}
          </p>
          <nav className="flex gap-8">
            <Link
              href="/legal/terms"
              className="text-micro text-ink-muted transition-opacity hover:opacity-50"
            >
              Terms
            </Link>
            <Link
              href="/legal/privacy"
              className="text-micro text-ink-muted transition-opacity hover:opacity-50"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
