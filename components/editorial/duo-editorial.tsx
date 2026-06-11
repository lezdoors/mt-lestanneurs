// Wordless 2-up — one world, two frames (dusk, lantern light, the desert).
export function DuoEditorial() {
  return (
    <section className="grid grid-cols-1 gap-1 bg-ground md:grid-cols-2">
      <img
        src="/tanneurs/editorial/duo-noir-sun.webp"
        alt="A black leather tote under a parallelogram of sunlight on travertine stone"
        loading="lazy"
        className="aspect-[4/5] w-full object-cover md:aspect-[5/6]"
      />
      <img
        src="/tanneurs/editorial/duo-noir-pedestal.webp"
        alt="A black soft tote on a stone pedestal beside folded linen, raking light"
        loading="lazy"
        className="aspect-[4/5] w-full object-cover md:aspect-[5/6]"
      />
    </section>
  )
}
