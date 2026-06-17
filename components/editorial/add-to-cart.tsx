"use client"

import { useCart } from "@/lib/cart"
import type { Product } from "@/lib/products"
import { useT } from "@/lib/i18n-client"
import { useCurrency } from "@/lib/currency-client"
import { trackAddToCart } from "@/lib/track"

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart()
  const t = useT()
  const { currency, rate } = useCurrency()

  return (
    <button
      type="button"
      onClick={() => {
        addItem({
          slug: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
        })
        trackAddToCart(product, rate, currency)
      }}
      className="text-micro w-full bg-ink py-5 text-ground transition-opacity hover:opacity-85"
    >
      {t("pdp.addToBag")}
    </button>
  )
}
