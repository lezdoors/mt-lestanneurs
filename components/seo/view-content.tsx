"use client"

import { useEffect, useRef } from "react"
import { useCurrency } from "@/lib/currency-client"
import { trackPixelEvent } from "@/components/seo/meta-pixel"
import { trackGA4Event } from "@/components/seo/ga4"

// Fires ViewContent (Meta) + view_item (GA4) once per PDP view, with the
// content_ids the catalog uses — so cold optimization, dynamic retargeting,
// and "viewed product" audiences all have signal. Value is reported in the
// visitor's display currency to match InitiateCheckout/Purchase.
export function ViewContentTracker({
  slug,
  priceCents,
  name,
  category,
}: {
  slug: string
  priceCents: number
  name: string
  category: string
}) {
  const { currency, rate } = useCurrency()
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    const value = Math.round((priceCents * rate) / 100)
    trackPixelEvent("ViewContent", {
      content_ids: [slug],
      content_type: "product",
      content_name: name,
      content_category: category,
      value,
      currency,
    })
    trackGA4Event("view_item", {
      currency,
      value,
      items: [{ item_id: slug, item_name: name, price: priceCents / 100 }],
    })
  }, [slug, priceCents, name, category, rate, currency])

  return null
}
