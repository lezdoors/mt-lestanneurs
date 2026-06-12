// Wordless 2-up — two departures: the red kilim rucksack at the golden
// door, the noir rolltop on the rooftop at dusk.
export function DuoEditorial() {
  return (
    <section className="grid grid-cols-1 gap-1 bg-ground md:grid-cols-2">
      <picture>
        <source media="(max-width: 767px)" srcSet="/tanneurs/editorial/duo-blue-door-m.webp" />
        <img
          src="/tanneurs/editorial/duo-blue-door.webp"
          alt="A model carrying a red kilim-trimmed leather rucksack before a golden carved door set in a Majorelle-blue wall"
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
