"use client"

import { useEffect, useRef } from "react"
import { useCart } from "@/lib/cart"
import { trackPixelEvent } from "@/components/seo/meta-pixel"
import { trackGA4Event } from "@/components/seo/ga4"

// Client side of the confirmation page: clears the cart and fires the
// browser Purchase events exactly once per order. The Pixel eventID is the
// order number — the same event_id the server CAPI uses — so Meta dedupes.

export function SuccessClient({
  orderId,
  orderNumber,
  total,
  currency,
  items,
}: {
  orderId: string
  orderNumber?: string
  total: number
  currency: string
  items: { slug: string; quantity: number; price: number }[]
}) {
  const { items: cartItems, removeItem } = useCart()
  const firedRef = useRef(false)

  useEffect(() => {
    // Empty the cart once on mount.
    cartItems.forEach((i) => removeItem(i.slug))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (firedRef.current) return
    const key = `mt-purchase-${orderId}`
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
      orderNumber || orderId,
    )
    trackGA4Event("purchase", {
      transaction_id: orderNumber || orderId,
      currency,
      value,
      items: items.map((i) => ({
        item_id: i.slug,
        price: i.price / 100,
        quantity: i.quantity,
      })),
    })
  }, [orderId, orderNumber, total, currency, items])

  return null
}
