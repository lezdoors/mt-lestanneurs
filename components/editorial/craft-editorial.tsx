import Link from "next/link"

// Savoir-faire — 50/50 split: statement against a single tactile frame.
export function CraftEditorial() {
  return (
    <section className="grid grid-cols-1 bg-ground md:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-24 md:px-20 md:py-32 lg:px-28">
        <p className="text-micro mb-10 text-ink-muted">Savoir-Faire</p>
        <h2 className="max-w-md font-display text-3xl font-medium leading-[1.12] tracking-[0.02em] text-ink md:text-[44px]">
          Made at the speed of the hand.
        </h2>
        <p className="mt-10 max-w-sm font-serif text-lg leading-relaxed text-ink-soft md:text-xl">
          Full-grain leather, saddle-stitched in waxed linen thread. Edges
          burnished by hand, never sealed by machine. Each piece carries the
          blind stamp of the bench it was made on.
        </p>
        <Link
          href="/heritage"
          className="link-caps mt-12 inline-block self-start text-ink"
        >
          L&rsquo;Atelier
        </Link>
      </div>
      <div className="relative min-h-[520px] md:min-h-[820px]">
        <img
          src="/tanneurs/editorial/craft-artisan-window.webp"
          alt="An artisan bent over the work at an arched window, brass hardware laid out, a finished tote beside him"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </section>
  )
}
