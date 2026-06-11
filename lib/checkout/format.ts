// Price formatting + order-number generation for the checkout API.

import type { Currency } from "./currency";

const CURRENCY_INTL_LOCALE: Record<Currency, string> = {
  USD: "en-US",
  EUR: "fr-FR",
  GBP: "en-GB",
};

export function formatPrice(cents: number, currency: Currency = "USD"): string {
  return new Intl.NumberFormat(CURRENCY_INTL_LOCALE[currency], {
    style: "currency",
    currency,
  }).format(cents / 100);
}

// Maison Tanneurs order number — "MT-NNNNNN".
export function generateOrderNumber(): string {
  const num = Math.floor(Math.random() * 999999)
    .toString()
    .padStart(6, "0");
  return `MT-${num}`;
}
