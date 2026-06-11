import Link from "next/link"

// Closing — the statement set in the dark negative space of the final
// frame: one duffle, one pool of light. The image is the sentence.
export function ClosingInvitation() {
  return (
    <section className="relative w-full overflow-hidden bg-dark-close">
      <img
        src="/tanneurs/editorial/closing-plinth.webp"
        alt="A single cognac duffle on a travertine plinth in one pool of golden light against a dark wall"
        loading="lazy"
        className="h-[78vh] min-h-[520px] w-full object-cover md:h-[92vh]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
      <div className="absolute left-6 top-14 max-w-md md:left-14 md:top-20 [text-shadow:0_1px_14px_rgba(0,0,0,0.4)]">
        <h2 className="font-display text-4xl font-medium leading-[1.08] tracking-[0.02em] text-white md:text-6xl">
          Small on purpose.
        </h2>
        <p className="mt-7 max-w-sm font-serif text-lg leading-relaxed text-white/85 md:text-xl">
          Few objects, made in small editions. When a piece is right, we
          make it again — never faster.
        </p>
        <Link href="/shop" className="link-caps mt-10 inline-block text-white">
          View the Collection
        </Link>
      </div>
    </section>
  )
}
