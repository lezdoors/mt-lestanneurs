// Multi-currency primitives for the checkout API. Prices are stored as USD
// minor units (cents); charge currency is selected per-request (mt-currency
// cookie) with a USD default. FX conversion lives in ./fx.
//
// Self-contained — no dependency on the storefront's i18n layer.

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: Currency = "USD";
export const CURRENCY_COOKIE = "mt-currency";

export function isCurrency(value: unknown): value is Currency {
  return (
    typeof value === "string" &&
    (SUPPORTED_CURRENCIES as readonly string[]).includes(value)
  );
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};
