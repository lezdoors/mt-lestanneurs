// Promo codes — shared by the checkout UI (display) and the session route
// (the authoritative charge). Keep this pure (no server-only imports) so the
// client can show the discount before redirecting to payment.
//
// Launch tactic: a code-gated welcome offer. The public price ladder never
// moves — only shoppers with the code get the discount. Time-box it and step
// down once the brand has momentum + reviews.

export type Promo = { pct: number; label: string }

export const PROMO_CODES: Record<string, Promo> = {
  WELCOME15: { pct: 15, label: "Launch offer — 15% off your first order" },
}

export function normalizePromo(code: string | null | undefined): string {
  return (code || "").trim().toUpperCase()
}

export function lookupPromo(code: string | null | undefined): Promo | null {
  const c = normalizePromo(code)
  return c && PROMO_CODES[c] ? PROMO_CODES[c] : null
}

// Apply a promo to a minor-unit total (cents). Discount is computed on whole
// units so the charged + displayed price stays clean (e.g. $325 → $276, not
// $276.25). Returns the resolved promo (null if invalid), the discount, and
// the new total — all in minor units.
export function applyPromoMinor(
  totalMinor: number,
  code: string | null | undefined,
): { promo: Promo | null; discountMinor: number; totalMinor: number } {
  const promo = lookupPromo(code)
  if (!promo) return { promo: null, discountMinor: 0, totalMinor }
  const units = Math.round(totalMinor / 100)
  const discountedUnits = Math.round(units * (1 - promo.pct / 100))
  const newTotal = Math.max(0, discountedUnits * 100)
  return { promo, discountMinor: totalMinor - newTotal, totalMinor: newTotal }
}
