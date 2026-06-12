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

// Maison Tanneurs order number — "MT-NNNNNNNN". Seconds since the house
// epoch + one random digit: unique per second, no coordination needed.
// (The orders table also has UNIQUE(revolut_order_id), which is the real
// idempotency guard — this only needs to be human-friendly and distinct.)
const HOUSE_EPOCH = Date.UTC(2026, 0, 1) / 1000;
export function generateOrderNumber(): string {
  const seconds = Math.floor(Date.now() / 1000 - HOUSE_EPOCH);
  return `MT-${seconds}${Math.floor(Math.random() * 10)}`;
}
