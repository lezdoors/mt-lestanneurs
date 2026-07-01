import type { Metadata } from "next"
import { PageShell } from "@/components/editorial/page-shell"
import { RepairRegister } from "@/components/editorial/repair-register"

export const metadata: Metadata = {
  title: "Lifetime Repair — Maison Tanneurs",
  description:
    "Register your Maison Tanneurs piece for lifetime re-stitching at our Marrakech bench, and keep its authenticity record.",
}

export default function RepairPage() {
  return (
    <PageShell
      eyebrow="Lifetime Repair"
      title="Register your piece."
      lede="This piece left our bench once. Register it, and re-stitching at the bench is yours for as long as the bag exists."
    >
      <div className="mx-auto max-w-md px-6">
        <RepairRegister />

        <dl className="mt-24 border-t border-hairline text-left">
          <div className="border-b border-hairline py-6">
            <dt className="text-micro mb-3 text-ink-muted">Care</dt>
            <dd className="font-serif text-base leading-relaxed text-ink-soft">
              Wipe with a soft, dry cloth. Condition twice a year with a neutral
              wax. Keep from prolonged sun and rain — rest it in its dust bag.
            </dd>
          </div>
          <div className="border-b border-hairline py-6">
            <dt className="text-micro mb-3 text-ink-muted">Lifetime Repair</dt>
            <dd className="font-serif text-base leading-relaxed text-ink-soft">
              Re-stitched at our bench for as long as the bag exists. Once your
              piece is registered, write to{" "}
              <a
                href="mailto:hello@maisontanneurs.com"
                className="underline decoration-hairline underline-offset-4"
              >
                hello@maisontanneurs.com
              </a>{" "}
              and we arrange the return.
            </dd>
          </div>
          <div className="border-b border-hairline py-6">
            <dt className="text-micro mb-3 text-ink-muted">The maison</dt>
            <dd className="font-serif text-base leading-relaxed text-ink-soft">
              Cut and stitched by hand in Marrakech. Full-grain leather, saddle
              stitch, solid brass — made to soften and take a patina as it
              travels with you.
            </dd>
          </div>
        </dl>
      </div>
    </PageShell>
  )
}
