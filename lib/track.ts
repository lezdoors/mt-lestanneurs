import { trackPixelEvent } from "@/components/seo/meta-pixel"
import { trackGA4Event } from "@/components/seo/ga4"

// Shared AddToCart firing for both the primary and sticky buy buttons —
// Meta AddToCart + GA4 add_to_cart with the catalog content_ids, value in the
// visitor's display currency. Powers mid-funnel optimization and the
// "added to cart, didn't buy" retargeting audience.
export function trackAddToCart(
  product: { id: string; name: string; price: number },
  rate: number,
  currency: string,
) {
  const value = Math.round((product.price * rate) / 100)
  trackPixelEvent("AddToCart", {
    content_ids: [product.id],
    content_type: "product",
    content_name: product.name,
    value,
    currency,
  })
  trackGA4Event("add_to_cart", {
    currency,
    value,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price / 100,
        quantity: 1,
      },
    ],
  })
}
