"use client"

import { useCart } from "@/lib/cart"
import type { Product } from "@/lib/products"

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart()

  return (
    <button
      type="button"
      onClick={() =>
        addItem({
          slug: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
        })
      }
      className="text-micro w-full bg-ink py-5 text-ground transition-opacity hover:opacity-85"
    >
      Add to Bag
    </button>
  )
}
