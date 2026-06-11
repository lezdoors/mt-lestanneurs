import Link from "next/link"

// Full-bleed editorial moment — caption-scale type, bottom-left, once.
export function TravelEditorial() {
  return (
    <section className="relative w-full overflow-hidden bg-dark-close">
      <img
        src="/tanneurs/editorial/travel-olive-parapet.webp"
        alt="A woman seated on a stone parapet above endless olive groves, a tooled leather satchel beside her"
        loading="lazy"
        className="h-[72vh] min-h-[480px] w-full object-cover md:h-[92vh]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 px-6 pb-14 [text-shadow:0_1px_14px_rgba(0,0,0,0.35)] md:px-14 md:pb-20">
        <h2 className="max-w-xl font-serif text-3xl leading-[1.15] text-white md:text-[40px]">
          Carried — at first light.
        </h2>
        <p className="mt-4 max-w-md font-serif text-lg italic leading-relaxed text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.45)]">
          Cut at the bench. Broken in everywhere else.
        </p>
        <Link
          href="/shop"
          className="link-caps mt-8 inline-block text-white"
        >
          Discover
        </Link>
      </div>
    </section>
  )
}
