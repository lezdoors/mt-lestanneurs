import type { Metadata } from "next"
import Link from "next/link"
import { PageShell } from "@/components/editorial/page-shell"

export const metadata: Metadata = {
  title: "Contact — Maison Tanneurs",
  description:
    "Write to the Maison Tanneurs atelier in Marrakech. We answer within one working day.",
}

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Write to the atelier."
      lede="One inbox, read at the bench. We answer within one working day."
    >
      <div className="mx-auto max-w-md px-6 text-center">
        <a
          href="mailto:hello@maisontanneurs.com"
          className="font-serif text-2xl text-ink underline decoration-hairline underline-offset-8 transition-opacity hover:opacity-60 md:text-3xl"
        >
          hello@maisontanneurs.com
        </a>

        <dl className="mt-20 border-t border-hairline text-left">
          <div className="border-b border-hairline py-6">
            <dt className="text-micro mb-3 text-ink-muted">Orders</dt>
            <dd className="font-serif text-base leading-relaxed text-ink-soft">
              Questions about an order, shipping or returns — include your
              order number.{" "}
              <Link href="/legal/shipping" className="underline decoration-hairline underline-offset-4">
                Shipping
              </Link>
              {" · "}
              <Link href="/legal/returns" className="underline decoration-hairline underline-offset-4">
                Returns
              </Link>
            </dd>
          </div>
          <div className="border-b border-hairline py-6">
            <dt className="text-micro mb-3 text-ink-muted">Bespoke &amp; Trade</dt>
            <dd className="font-serif text-base leading-relaxed text-ink-soft">
              Commissions, stockists and hospitality —{" "}
              <Link href="/bespoke" className="underline decoration-hairline underline-offset-4">
                Bespoke
              </Link>
              {" · "}
              <Link href="/trade" className="underline decoration-hairline underline-offset-4">
                Trade
              </Link>
            </dd>
          </div>
          <div className="border-b border-hairline py-6">
            <dt className="text-micro mb-3 text-ink-muted">Visit</dt>
            <dd className="font-serif text-base leading-relaxed text-ink-soft">
              The atelier receives by appointment only —{" "}
              <Link href="/boutique" className="underline decoration-hairline underline-offset-4">
                Boutique
              </Link>
            </dd>
          </div>
        </dl>
      </div>
    </PageShell>
  )
}
