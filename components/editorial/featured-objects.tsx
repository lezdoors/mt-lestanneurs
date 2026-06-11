import Link from "next/link"
import type { Product } from "@/lib/products"
import { formatPrice } from "@/lib/products"

// Floating collection — no plates, no borders, no buttons. White packshot
// grounds dissolve into the page via multiply; the bag sits as sculpture.
export function FeaturedObjects({ products }: { products: Product[] }) {
  if (products.length === 0) return null

  return (
    <section className="bg-ground px-6 pb-28 pt-4 md:pb-44">
      <div className="mx-auto max-w-[1560px]">
        <div className="mb-16 text-center md:mb-24">
          <h2 className="font-serif text-4xl text-ink md:text-5xl">
            Les Premiers Modèles
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-[5fr_7fr] md:gap-14">
          {/* Campaign panel — the Oasis Weekender in the teal zellige arch */}
          <Link
            href="/product/oasis-weekender-oxblood"
            className="group relative block overflow-hidden"
          >
            <img
              src="/tanneurs/editorial/collection-arch.webp"
              alt="The Oasis Weekender in oxblood on a carved bench beneath a teal zellige arch, an artisan walking into the light"
              loading="lazy"
              className="h-full max-h-[560px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] md:max-h-none"
            />
            <span className="text-micro absolute bottom-5 left-5 bg-white/95 px-4 py-2.5 text-ink">
              Oasis Weekender · Oxblood
            </span>
          </Link>

          {/* The white-plate tiles */}
          <div className="grid grid-cols-2 content-center gap-x-6 gap-y-14 md:gap-x-10">
            {products.map((p) => (
              <Link key={p.id} href={`/product/${p.id}`} className="group">
                <div className="relative aspect-square w-full">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="img-float absolute inset-0 h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mt-5 text-center">
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
        </div>

        <div className="mt-20 text-center md:mt-24">
          <Link href="/shop" className="link-caps inline-block text-ink">
            View the Collection
          </Link>
        </div>
      </div>
    </section>
  )
}
