"use client"

import { useEffect, useRef } from "react"
import { useCart } from "@/lib/cart"
import { trackPixelEvent } from "@/components/seo/meta-pixel"
import { trackGA4Event } from "@/components/seo/ga4"

// Client side of the confirmation page: clears the cart and fires the
// browser Purchase events exactly once per order. The Pixel eventID is the
// order number — the same event_id the server CAPI uses — so Meta dedupes.

export function SuccessClient({
  orderNumber,
  total,
  currency,
  items,
}: {
  orderNumber: string
  total: number
  currency: string
  items: { slug: string; quantity: number; price: number }[]
}) {
  const { items: cartItems, removeItem } = useCart()
  const firedRef = useRef(false)

  useEffect(() => {
    // Empty the cart once on mount.
    cartItems.forEach((i) => removeItem(i.slug))
    // Clear the parked order-id cookie now that this order has confirmed —
    // otherwise a later visit to /checkout/success (back button, bookmark)
    // would re-resolve this same id and render a false "success" for an
    // order the shopper didn't just place.
    document.cookie = "mt_pending_order=; max-age=0; path=/"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (firedRef.current) return
    const key = `mt-purchase-${orderNumber}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, "1")
    } catch {}
    firedRef.current = true
    const value = total / 100
    trackPixelEvent(
      "Purchase",
      {
        value,
        currency,
        content_ids: items.map((i) => i.slug),
        content_type: "product",
        num_items: items.reduce((sum, i) => sum + i.quantity, 0),
      },
      orderNumber,
    )
    trackGA4Event("purchase", {
      transaction_id: orderNumber,
      currency,
      value,
      items: items.map((i) => ({
        item_id: i.slug,
        price: i.price / 100,
        quantity: i.quantity,
      })),
    })
  }, [orderNumber, total, currency, items])

  return null
}
