"use client"

import Link from "next/link"
import { useState } from "react"
import { formatPrice, type Product } from "@/lib/products"

export function ShopClient({
  products,
  categories,
}: {
  products: Product[]
  categories: string[]
}) {
  const [active, setActive] = useState("All")

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
            {c}
          </button>
        ))}
      </nav>

      <div className="mx-auto mt-16 grid max-w-[1560px] grid-cols-2 gap-x-6 gap-y-16 px-6 md:mt-24 md:grid-cols-3 md:gap-x-12 lg:grid-cols-4">
        {filtered.map((p) => (
          <Link key={p.id} href={`/product/${p.id}`} className="group">
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
                {formatPrice(p.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-24 text-center font-serif text-lg italic text-ink-muted">
          Nothing in this category at the moment.
        </p>
      )}
    </>
  )
}
