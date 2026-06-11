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
      <div className="mx-auto max-w-5xl px-6">
        <img
          src="/tanneurs/editorial/boutique-threshold.webp"
          alt="Carved cedar doors opening onto a riad courtyard with an olive tree and zellige fountain"
          className="aspect-[16/9] w-full object-cover"
        />

        <div className="mx-auto mt-16 max-w-md text-center md:mt-20">
          <a
            href="mailto:hello@maisontanneurs.com?subject=Atelier%20Visit"
            className="link-caps text-ink"
          >
            Request an Appointment
          </a>
        </div>

        <div className="mt-20 grid grid-cols-1 items-center gap-8 md:mt-28 md:grid-cols-2 md:gap-14">
          <img
            src="/tanneurs/editorial/boutique-worktable.webp"
            alt="A workbench with leather tools in bright window light"
            loading="lazy"
            className="aspect-[4/5] w-full object-cover"
          />
          <dl>
            <div className="border-b border-hairline py-6">
              <dt className="text-micro mb-3 text-ink-muted">What to expect</dt>
              <dd className="font-serif text-base leading-relaxed text-ink-soft md:text-lg">
                The current edition on the bench, the leathers in hand, and
                the maker who stitched them. One visit at a time.
              </dd>
            </div>
            <div className="border-b border-hairline py-6">
              <dt className="text-micro mb-3 text-ink-muted">Elsewhere</dt>
              <dd className="font-serif text-base leading-relaxed text-ink-soft md:text-lg">
                Every piece ships worldwide from the atelier — the collection
                online is the same one on the bench.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </PageShell>
  )
}
