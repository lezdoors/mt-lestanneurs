// Wordless 2-up — one world, two frames (dusk, lantern light, the desert).
export function DuoEditorial() {
  return (
    <section className="grid grid-cols-1 gap-1 bg-ground md:grid-cols-2">
      <img
        src="/tanneurs/editorial/duo-pool-niche.webp"
        alt="A cognac leather tote on warm stone beside a turquoise pool, white arch niche and olive branch behind"
        loading="lazy"
        className="aspect-[4/5] w-full object-cover md:aspect-[5/6]"
      />
      <img
        src="/tanneurs/editorial/duo-pool-courtyard.webp"
        alt="A poolside courtyard in bright daylight, a cognac tote carried past the colonnade"
        loading="lazy"
        className="aspect-[4/5] w-full object-cover md:aspect-[5/6]"
      />
    </section>
  )
}
