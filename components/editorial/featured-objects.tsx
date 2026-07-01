import Link from "next/link"
import { getLocale, t, withLocale } from "@/lib/i18n"
import type { Product } from "@/lib/products"
import { formatDisplayPrice, getDisplayCurrency, getRates } from "@/lib/currency-display"
import { Reveal } from "@/components/editorial/reveal"

// Floating collection — no plates, no borders, no buttons. White packshot
// grounds dissolve into the page via multiply; the bag sits as sculpture.
export async function FeaturedObjects({ products }: { products: Product[] }) {
  const currency = await getDisplayCurrency()
  const rates = await getRates()
  if (products.length === 0) return null
  const lo = await getLocale()
  return (
    <section className="bg-ground px-6 pb-24 pt-4 md:pb-32">
      <div className="mx-auto max-w-[1560px]">
        <Reveal>
          <div className="mb-12 text-center md:mb-16">
            <h2 className="font-serif text-4xl text-ink md:text-5xl">
              {t(lo, "featured.title")}
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-[5fr_7fr] md:gap-14">
          {/* Campaign panel — golden-hour Marrakech rooftop, the maison's
              provenance in one frame. Was collection-portrait, a fourth
              limestone-street model shot in the first two viewports. */}
          <Link
            href={withLocale("/shop?c=Weekender", lo)}
            className="group relative block overflow-hidden"
          >
            <picture>
              <source
                media="(max-width: 767px)"
                srcSet="/tanneurs/editorial/duo-rooftop-cognac-m.webp"
              />
              <img
                src="/tanneurs/editorial/duo-rooftop-cognac.webp"
                alt="A cognac leather weekender beside a stone table with mint tea, on a Marrakech rooftop at golden hour"
                loading="lazy"
                className="h-full max-h-[560px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] md:max-h-none"
              />
            </picture>
            <span className="text-micro absolute bottom-5 left-5 bg-white/95 px-4 py-2.5 text-ink">
              Les Weekenders — Marrakech
            </span>
          </Link>

          {/* The white-plate tiles */}
          <div className="grid grid-cols-2 content-center gap-x-6 gap-y-14 md:gap-x-10">
            {products.map((p) => (
              <Link key={p.id} href={withLocale(`/product/${p.id}`, lo)} className="group">
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
                    {formatDisplayPrice(p.price, currency, rates)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <Reveal delay={120}>
          <div className="mt-14 text-center md:mt-16">
            <Link href={withLocale("/shop", lo)} className="link-caps inline-block text-ink">
              {t(lo, "featured.cta")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
