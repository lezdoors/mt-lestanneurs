import { getLocale, t } from "@/lib/i18n"

// Thin reassurance line, placed directly under the hero so cold paid traffic
// sees the proposition (atelier-direct, shipping, returns, repair) before the
// editorial scroll. One quiet line — the detailed TrustBand sits lower.
export async function TrustStrip() {
  const lo = await getLocale()
  return (
    <div className="border-b border-hairline bg-white">
      <p className="text-micro mx-auto max-w-[1560px] px-6 py-4 text-center text-ink-muted">
        {t(lo, "trust.strip")}
      </p>
    </div>
  )
}
