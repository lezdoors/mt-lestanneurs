"use client"

import { useEffect, useRef, useState } from "react"
import { useCart } from "@/lib/cart"
import type { Product } from "@/lib/products"
import { useFormatPrice, useCurrency } from "@/lib/currency-client"
import { useT } from "@/lib/i18n-client"
import { trackAddToCart } from "@/lib/track"

// Mobile-only sticky bar: appears once the primary Add to Bag scrolls
// out of view, so the buy action never leaves the thumb's reach.
export function StickyAddToCart({ product }: { product: Product }) {
  const { addItem } = useCart()
  const t = useT()
  const formatPrice_ = useFormatPrice()
  const { currency, rate } = useCurrency()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setShow(el.getBoundingClientRect().top < 0)
        ticking = false
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      {/* Sentinel marks the bottom of the primary buy block */}
      <div ref={sentinelRef} aria-hidden className="h-px w-full" />

      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-ground transition-transform duration-300 md:hidden ${
          show ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-3">
          <div className="min-w-0">
            <p className="truncate font-serif text-base leading-tight text-ink">
              {product.name}
            </p>
            <p className="font-sans text-[11px] tracking-[0.08em] text-ink-muted">
              {formatPrice_(product.price)}
            </p>
          </div>
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
            className="text-micro shrink-0 bg-ink px-6 py-3.5 text-ground transition-opacity hover:opacity-85"
          >
            {t("pdp.addToBag")}
          </button>
        </div>
      </div>
    </>
  )
}
