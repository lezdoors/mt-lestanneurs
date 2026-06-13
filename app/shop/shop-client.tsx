"use client"

import Link from "next/link"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { type Product } from "@/lib/products"
import { useFormatPrice } from "@/lib/currency-client"
import { useHref, useT } from "@/lib/i18n-client"

export function ShopClient({
  products,
  categories,
}: {
  products: Product[]
  categories: string[]
}) {
  const t = useT()
  const formatPrice_ = useFormatPrice()
  const lhref = useHref()
  const params = useSearchParams()
  const requested = params.get("c")
  const [active, setActive] = useState(
    requested && categories.includes(requested) ? requested : "All",
  )

  const filtered =
    active === "All" ? products : products.filter((p) => p.category === active)

  return (
    <>
      <nav
        aria-label="Catégories"
        className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 px-6"
      >
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            className={`text-micro pb-1 transition-opacity ${
              active === c
                ? "border-b border-ink text-ink"
                : "border-b border-transparent text-ink-muted hover:opacity-60"
            }`}
          >
            {c === "All" ? t("shop.all") : c}
          </button>
        ))}
      </nav>

      <div className="mx-auto mt-16 grid max-w-[1560px] grid-cols-2 gap-x-6 gap-y-16 px-6 md:mt-24 md:grid-cols-3 md:gap-x-12 lg:grid-cols-4">
        {filtered.map((p) => (
          <Link key={p.id} href={lhref(`/product/${p.id}`)} className="group">
            <div className="relative aspect-square w-full">
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                className="img-float absolute inset-0 h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            </div>
            <div className="mt-6 text-center">
              <h3 className="font-serif text-lg leading-snug text-ink md:text-xl">
                {p.name}
              </h3>
              <p className="mt-2 font-sans text-[11px] tracking-[0.08em] text-ink-muted">
                {formatPrice_(p.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-24 text-center font-serif text-lg italic text-ink-muted">
          {t("shop.empty")}
        </p>
      )}
    </>
  )
}
