import type { Metadata } from "next"
import { PageShell } from "@/components/editorial/page-shell"

export const metadata: Metadata = {
  title: "Trade — Maison Tanneurs",
  description:
    "Maison Tanneurs works with a small number of hotels, stockists, and houses each season. Numbered editions from a single Marrakech bench — by application.",
}

const PROGRAMS = [
  {
    label: "01 — Hospitality",
    title: "For the houses that host.",
    body: "Guest amenities, suite pieces and house gifts in full-grain leather, blind-stamped for the property or left unmarked. Small programmes, renewed by edition.",
    subject: "Trade%20—%20Hospitality",
    image: "/tanneurs/editorial/trade-hospitality.webp",
    alt: "A travel range — duffle, rucksack and tote — on a stone bench in a sea-view room",
  },
  {
    label: "02 — Selected Retail",
    title: "A small number of stockists.",
    body: "We place the collection with a few stores whose floor it belongs on. Numbered editions, honest margins, no wholesale catalogue — each season is built together.",
    subject: "Trade%20—%20Stockists",
    image: "/tanneurs/editorial/trade-boutique-wide.webp",
    alt: "A boutique interior — the collection presented on pale stone shelving",
  },
  {
    label: "03 — Gifting",
    title: "Corporate, without the corporate.",
    body: "Editions for teams and clients, made on the same bench as everything else. Lead times follow the bench, not the calendar quarter.",
    subject: "Trade%20—%20Gifting",
    image: "/tanneurs/editorial/trade-gifting.webp",
    alt: "A cognac duffle in a walnut presentation box on sunlit marble",
  },
]

export default function TradePage() {
  return (
    <PageShell
      eyebrow="Trade"
      title="Hospitality, stockists, gifting."
      lede="Maison Tanneurs works with a small number of houses each season. Numbered editions from a single Marrakech bench — by application."
    >
      <div className="mx-auto max-w-5xl px-6">
        <ol className="flex flex-col gap-20 pt-8 md:gap-28">
          {PROGRAMS.map((p, i) => (
            <li
              key={p.label}
              className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14"
            >
              <div className={i % 2 === 1 ? "md:order-2" : ""}>
                <img
                  src={p.image}
                  alt={p.alt}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className={i % 2 === 1 ? "md:order-1" : ""}>
                <p className="text-micro mb-6 text-ink-muted">{p.label}</p>
                <h2 className="font-serif text-2xl text-ink md:text-3xl">
                  {p.title}
                </h2>
                <p className="mt-5 max-w-md font-serif text-base leading-relaxed text-ink-soft md:text-lg">
                  {p.body}
                </p>
                <a
                  href={`mailto:hello@maisontanneurs.com?subject=${p.subject}`}
                  className="link-caps mt-8 inline-block text-ink"
                >
                  Write — {p.label.split("— ")[1]}
                </a>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </PageShell>
  )
}
