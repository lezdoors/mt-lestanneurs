import type { Metadata } from "next"
import Link from "next/link"
import { PageShell } from "@/components/editorial/page-shell"

export const metadata: Metadata = {
  title: "Bespoke — Maison Tanneurs",
  description:
    "Commission a single object, designed with the atelier and made on the same bench. Twelve to fourteen weeks from confirmed design.",
}

const STEPS = [
  {
    label: "01 — Introduction",
    title: "It starts with a letter.",
    body: (
      <>
        We take commissions by introduction. Write to{" "}
        <a
          href="mailto:hello@maisontanneurs.com"
          className="underline decoration-hairline underline-offset-4"
        >
          hello@maisontanneurs.com
        </a>{" "}
        with the silhouette, the leather direction, and what the object is
        for. We reply within one working day.
      </>
    ),
  },
  {
    label: "02 — Design & leather",
    title: "Confirmed before anything is cut.",
    body: (
      <>
        The leather is chosen with you, the hardware specified by hand, and
        the design confirmed before anything is cut. Nothing goes to the
        bench until both sides have signed off on the drawing.
      </>
    ),
  },
  {
    label: "03 — The bench",
    title: "Same bench. One carrier.",
    body: (
      <>
        Twelve to fourteen weeks from confirmed design. Your piece is built
        on the same bench as the catalogue, by the same hands, at the same
        standard — for one carrier.
      </>
    ),
  },
]

export default function BespokePage() {
  return (
    <PageShell
      eyebrow="Bespoke"
      title="One object, designed with the atelier."
      lede="A single piece, made on the same bench. Twelve to fourteen weeks from confirmed design."
    >
      <div className="mx-auto max-w-2xl px-6">
        <ol className="border-t border-hairline">
          {STEPS.map((s) => (
            <li key={s.label} className="border-b border-hairline py-12">
              <p className="text-micro mb-6 text-ink-muted">{s.label}</p>
              <h2 className="font-serif text-2xl text-ink md:text-3xl">
                {s.title}
              </h2>
              <p className="mt-5 max-w-md font-serif text-base leading-relaxed text-ink-soft md:text-lg">
                {s.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-16 text-center">
          <a
            href="mailto:hello@maisontanneurs.com?subject=Bespoke%20Commission"
            className="link-caps text-ink"
          >
            Open a Commission
          </a>
          <p className="text-micro mt-10 text-ink-muted">
            <Link href="/shop" className="transition-opacity hover:opacity-60">
              Or browse the collection
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  )
}
