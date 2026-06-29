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

// Maison Tanneurs order number — "MT-NNNNNNNN-RRR". Seconds since the house
// epoch + three random digits: collision needs the same second AND the same
// 1-in-1000 draw. (The orders table also has UNIQUE(stripe_payment_intent_id) —
// legacy column name now holds the Stripe PaymentIntent id — which is the
// real idempotency guard — this only needs to be human-friendly and distinct.)
const HOUSE_EPOCH = Date.UTC(2026, 0, 1) / 1000;
export function generateOrderNumber(): string {
  const seconds = Math.floor(Date.now() / 1000 - HOUSE_EPOCH);
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `MT-${seconds}${rand}`;
}
