import type { Metadata } from "next"
import Link from "next/link"
import { PageShell } from "@/components/editorial/page-shell"
import { AmbientLoop } from "@/components/editorial/ambient-loop"

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
        {/* The drawing comes first */}
        <figure className="mb-16">
          <picture>
            <source media="(max-width: 767px)" srcSet="/tanneurs/editorial/bespoke-drawing-m.webp" />
            <img
              src="/tanneurs/editorial/bespoke-drawing.webp"
              alt="A pencil drawing of the Classic Cognac Satchel on the drafting table"
              loading="lazy"
              className="aspect-[16/9] w-full object-cover"
            />
          </picture>
          <figcaption className="text-micro mt-4 text-center text-ink-muted">
            The drawing comes first.
          </figcaption>
        </figure>
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

        {/* The edition ritual — your piece leaving the bench */}
        <div className="mx-auto mt-16 grid grid-cols-1 items-center gap-10 md:grid-cols-[2fr_3fr] md:gap-14">
          <AmbientLoop
            src="/tanneurs/films/bespoke-tag.mp4"
            poster="/tanneurs/films/bespoke-tag-poster.jpg"
            alt="Hands tying the kraft edition tag to the finished handles"
            className="aspect-[9/16] w-full object-cover"
          />
          <p className="font-serif text-lg leading-relaxed text-ink-soft md:text-xl">
            When the piece is finished, the tag is tied by the hands that
            made it — and the commission leaves the bench for its first
            departure.
          </p>
        </div>

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
