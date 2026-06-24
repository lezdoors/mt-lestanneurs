// FX rate fetcher + USD-cents converter. Source: frankfurter.app (free, ECB
// reference rates, daily). Cached 24h via Next fetch revalidate so the price
// the user saw is the price Stripe charges.

import { SUPPORTED_CURRENCIES, type Currency } from "./currency";

export type RateMap = Record<Currency, number>;

const FRANKFURTER_URL =
  "https://api.frankfurter.app/latest?base=USD&symbols=EUR,GBP";

const FALLBACK_RATES: RateMap = { USD: 1, EUR: 0.92, GBP: 0.79 };

export async function getRates(): Promise<RateMap> {
  try {
    const res = await fetch(FRANKFURTER_URL, {
      next: { revalidate: 86400, tags: ["fx-rates"] },
    });
    if (!res.ok) return FALLBACK_RATES;
    const data = (await res.json()) as { rates?: Partial<Record<Currency, number>> };
    if (!data.rates) return FALLBACK_RATES;
    return {
      USD: 1,
      EUR: data.rates.EUR ?? FALLBACK_RATES.EUR,
      GBP: data.rates.GBP ?? FALLBACK_RATES.GBP,
    };
  } catch {
    return FALLBACK_RATES;
  }
}

// Convert USD minor units (cents) → target-currency minor units.
export function convertUSDCents(
  usdCents: number,
  target: Currency,
  rates: RateMap,
): number {
  if (target === "USD") return usdCents;
  const rate = rates[target] ?? 1;
  return Math.round(usdCents * rate);
}

export function isSupportedCurrency(value: string): value is Currency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}
