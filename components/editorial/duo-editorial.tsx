// Wordless 2-up — one world, two frames: the same rooftop, the same
// dusk, two departures. Cognac and noir, one skyline.
export function DuoEditorial() {
  return (
    <section className="grid grid-cols-1 gap-1 bg-ground md:grid-cols-2">
      <picture>
        <source media="(max-width: 767px)" srcSet="/tanneurs/editorial/duo-rooftop-cognac-m.webp" />
        <img
          src="/tanneurs/editorial/duo-rooftop-cognac.webp"
          alt="A cognac leather duffle beside a stone table on a medina rooftop at dusk, the Koutoubia minaret on the skyline"
          loading="lazy"
          className="aspect-[4/5] w-full object-cover md:aspect-[5/6]"
        />
      </picture>
      <picture>
        <source media="(max-width: 767px)" srcSet="/tanneurs/editorial/duo-rooftop-noir-m.webp" />
        <img
          src="/tanneurs/editorial/duo-rooftop-noir.webp"
          alt="A black rolltop backpack at the same rooftop table in the last warm light, mint tea waiting"
          loading="lazy"
          className="aspect-[4/5] w-full object-cover md:aspect-[5/6]"
        />
      </picture>
    </section>
  )
}
