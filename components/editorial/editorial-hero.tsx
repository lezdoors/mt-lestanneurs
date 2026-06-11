import Link from "next/link"
import type { Product } from "@/lib/products"
import { formatPrice } from "@/lib/products"

// Atmosphere-first hero: no headline, no button. The only words on the
// frame are the floating product card naming the bag being carried.
export function EditorialHero({ product }: { product?: Product }) {
  return (
    <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-dark-close">
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet="/tanneurs/editorial/hero-ryad-9x16.webp"
        />
        <img
          src="/tanneurs/editorial/hero-ryad-16x9.webp"
          alt="A woman in cream crossing a white carved-stucco riad courtyard under blue sky, a cognac leather weekender in hand"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
      </picture>
      {/* Top scrim keeps the white header legible over the bright sky */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-black/60 to-transparent" />

      {product && (
        <Link
          href={`/product/${product.id}`}
          className="group absolute bottom-8 left-5 flex w-[184px] flex-col bg-white p-4 md:bottom-12 md:left-12 md:w-[264px] md:p-6"
        >
          <div className="relative aspect-square w-full overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>
          <p className="mt-4 font-serif text-lg leading-none text-ink">
            {product.name}
          </p>
          <p className="mt-2 font-sans text-[11px] tracking-[0.08em] text-ink-muted">
            {formatPrice(product.price)}
          </p>
        </Link>
      )}
    </section>
  )
}
