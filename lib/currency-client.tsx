"use client"

// Client half of geo pricing: the root layout resolves currency + rate on
// the server and provides them here so cart drawer / sticky bar / shop grid
// format identically to server-rendered prices.

import { createContext, useContext } from "react"
import { CURRENCY_SYMBOLS, type Currency } from "@/lib/checkout/currency"

const CurrencyContext = createContext<{ currency: Currency; rate: number }>({
  currency: "USD",
  rate: 1,
})

export function CurrencyProvider({
  currency,
  rate,
  children,
}: {
  currency: Currency
  rate: number
  children: React.ReactNode
}) {
  return (
    <CurrencyContext.Provider value={{ currency, rate }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useFormatPrice() {
  const { currency, rate } = useContext(CurrencyContext)
  return (usdCents: number) =>
    `${CURRENCY_SYMBOLS[currency]}${Math.round((usdCents * rate) / 100).toLocaleString("en-GB")}`
}
