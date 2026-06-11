import type { Metadata } from "next"
import { PageShell } from "@/components/editorial/page-shell"

export const metadata: Metadata = {
  title: "Boutique — Maison Tanneurs",
  description:
    "Maison Tanneurs is a small Marrakech atelier. Visits are by appointment only — write ahead and we will plan a quiet hour.",
}

export default function BoutiquePage() {
  return (
    <PageShell
      eyebrow="Boutique · Atelier"
      title="Marrakech, by appointment."
      lede="Maison Tanneurs is a small atelier, not a shop floor. Visits are by appointment only — write ahead and we will plan a quiet hour."
    >
      <div className="mx-auto max-w-md px-6 text-center">
        <a
          href="mailto:hello@maisontanneurs.com?subject=Atelier%20Visit"
          className="link-caps text-ink"
        >
          Request an Appointment
        </a>

        <dl className="mt-20 border-t border-hairline text-left">
          <div className="border-b border-hairline py-6">
            <dt className="text-micro mb-3 text-ink-muted">What to expect</dt>
            <dd className="font-serif text-base leading-relaxed text-ink-soft">
              The current edition on the bench, the leathers in hand, and the
              maker who stitched them. One visit at a time.
            </dd>
          </div>
          <div className="border-b border-hairline py-6">
            <dt className="text-micro mb-3 text-ink-muted">Elsewhere</dt>
            <dd className="font-serif text-base leading-relaxed text-ink-soft">
              Every piece ships worldwide from the atelier — the collection
              online is the same one on the bench.
            </dd>
          </div>
        </dl>
      </div>
    </PageShell>
  )
}
