// Server-side display currency: resolved by the proxy (cookie → geo) and
// carried on the x-mt-currency request header. Display prices convert from
// stored USD cents with the same ECB rates the checkout charges with, so
// the price a visitor sees is the price their card is charged.

import { headers } from "next/headers"
import {
  CURRENCY_SYMBOLS,
  DEFAULT_CURRENCY,
  isCurrency,
  type Currency,
} from "@/lib/checkout/currency"
import { convertUSDCents, getRates, type RateMap } from "@/lib/checkout/fx"

export async function getDisplayCurrency(): Promise<Currency> {
  const h = await headers()
  const value = h.get("x-mt-currency")
  return isCurrency(value) ? value : DEFAULT_CURRENCY
}

export { getRates }
export type { Currency, RateMap }

// Whole-unit editorial price — "€299", "$325", "£256". The luxury register
// never shows decimals on the storefront; exact minor units appear only at
// checkout where the charge is created.
export function formatDisplayPrice(
  usdCents: number,
  currency: Currency,
  rates: RateMap,
): string {
  const units = Math.round(convertUSDCents(usdCents, currency, rates) / 100)
  return `${CURRENCY_SYMBOLS[currency]}${units.toLocaleString("en-GB")}`
}
