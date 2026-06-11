import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/editorial/site-header"
import { SiteFooter } from "@/components/editorial/site-footer"
import { PdpGallery } from "@/components/editorial/pdp-gallery"
import { AddToCart } from "@/components/editorial/add-to-cart"
import { MtMark } from "@/components/editorial/mt-mark"
import { fetchAllProducts, fetchProductBySlug } from "@/lib/supabase"
import { adaptProduct, curate, formatPrice, isCurated, relatedTo } from "@/lib/products"
import { ProductJsonLd } from "@/components/seo/json-ld"

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const row = await fetchProductBySlug(id)
  if (!row) return { title: "Maison Tanneurs" }
  const p = adaptProduct(row)
  return {
    title: `${p.name} — Maison Tanneurs`,
    description: p.description || undefined,
    alternates: { canonical: `/product/${id}` },
    openGraph: {
      title: `${p.name} — Maison Tanneurs`,
      description: p.description || undefined,
      images: [{ url: p.image }],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!isCurated(id)) notFound()
  const row = await fetchProductBySlug(id)
  if (!row) notFound()

  const product = adaptProduct(row)
  const all = curate((await fetchAllProducts()).map(adaptProduct))
  const related = relatedTo(product, all, 3)

  return (
    <>
      <ProductJsonLd
        product={{
          slug: id,
          name: product.name,
          description: product.longDescription || product.description,
          image: product.images,
          priceUsdCents: product.price,
          inStock: row.status === "available" && row.available_quantity > 0,
          category: product.category,
        }}
      />
      <SiteHeader variant="solid" />
      <main className="bg-ground pt-[72px] md:pt-[96px]">
        <nav
          aria-label="Breadcrumb"
          className="mx-auto max-w-[1560px] px-6 pb-2 pt-8 md:px-10"
        >
          <ol className="text-micro flex items-center gap-3 text-ink-muted">
            <li>
              <Link href="/shop" className="transition-opacity hover:opacity-60">
                La Collection
              </Link>
            </li>
            <li aria-hidden>—</li>
            <li className="text-ink-soft">{product.name}</li>
          </ol>
        </nav>

        <section className="mx-auto grid max-w-[1560px] grid-cols-1 gap-12 px-6 pb-24 pt-6 md:grid-cols-2 md:gap-16 md:px-10 md:pb-36">
          <PdpGallery images={product.images} productName={product.name} />

          <div className="md:sticky md:top-32 md:self-start">
            <h1 className="font-serif text-4xl leading-tight text-ink md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 font-sans text-sm tracking-[0.08em] text-ink-soft">
              {formatPrice(product.price)}
            </p>

            {product.longDescription && (
              <p className="mt-8 max-w-md font-serif text-lg leading-relaxed text-ink-soft">
                {product.longDescription}
              </p>
            )}

            <div className="mt-10">
              <AddToCart product={product} />
              <div className="mt-5 flex flex-col items-center gap-1.5">
                <MtMark className="text-base text-ink-muted" />
                <p className="text-micro text-ink-muted">
                  Cut and stitched by Les Tanneurs — Marrakech
                </p>
              </div>
            </div>

            <dl className="mt-12 border-t border-hairline">
              <div className="border-b border-hairline py-5">
                <dt className="text-micro mb-3 text-ink-muted">Materials</dt>
                <dd className="font-serif text-base leading-relaxed text-ink-soft">
                  {product.materials.join(" — ")}
                </dd>
              </div>
              {product.details.length > 0 && (
                <div className="border-b border-hairline py-5">
                  <dt className="text-micro mb-3 text-ink-muted">Details</dt>
                  <dd>
                    <ul className="flex flex-col gap-1.5 font-serif text-base leading-relaxed text-ink-soft">
                      {product.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              <div className="border-b border-hairline py-5">
                <dt className="text-micro mb-3 text-ink-muted">Care</dt>
                <dd>
                  <ul className="flex flex-col gap-1.5 font-serif text-base leading-relaxed text-ink-soft">
                    {product.care.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>

            {/* Service strip — lifetime repair leads; each links to policy */}
            <div className="mt-2">
              <Link
                href="/legal/repair"
                className="group flex items-baseline justify-between border-b border-hairline py-4"
              >
                <span className="text-micro text-ink">Lifetime Repair</span>
                <span className="font-serif text-sm text-ink-muted transition-opacity group-hover:opacity-60">
                  Re-stitched at the bench, for as long as the bag exists
                </span>
              </Link>
              <Link
                href="/legal/shipping"
                className="group flex items-baseline justify-between border-b border-hairline py-4"
              >
                <span className="text-micro text-ink">Shipping</span>
                <span className="font-serif text-sm text-ink-muted transition-opacity group-hover:opacity-60">
                  Free DHL Express worldwide
                </span>
              </Link>
              <Link
                href="/legal/returns"
                className="group flex items-baseline justify-between border-b border-hairline py-4"
              >
                <span className="text-micro text-ink">Returns</span>
                <span className="font-serif text-sm text-ink-muted transition-opacity group-hover:opacity-60">
                  30 days, unused, original packaging
                </span>
              </Link>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="border-t border-hairline px-6 py-24 md:py-32">
            <h2 className="text-center font-serif text-3xl text-ink md:text-4xl">
              You may also like
            </h2>
            <div className="mx-auto mt-14 grid max-w-[1200px] grid-cols-3 gap-x-6 md:mt-20 md:gap-x-12">
              {related.map((p) => (
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
                    <h3 className="font-serif text-base leading-snug text-ink md:text-lg">
                      {p.name}
                    </h3>
                    <p className="mt-1.5 font-sans text-[11px] tracking-[0.08em] text-ink-muted">
                      {formatPrice(p.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
