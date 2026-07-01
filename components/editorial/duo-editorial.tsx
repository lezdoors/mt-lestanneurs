import { RevealGroup } from "@/components/editorial/reveal"

// Wordless 2-up — two worlds in one frame pair: the red kilim rucksack at
// the golden door in a Majorelle-blue wall, and the cognac weekender in
// the dunes at last light. Cool against warm; no copy, no chrome.
// (Ported from the storefront design experiment; rooftop-noir swapped for
// dusk-dunes so the page doesn't run the rooftop world twice.)
export function DuoEditorial() {
  return (
    <section className="bg-ground">
      <RevealGroup className="grid grid-cols-1 gap-1 md:grid-cols-2">
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
          <source media="(max-width: 767px)" srcSet="/tanneurs/editorial/duo-dusk-dunes-m.webp" />
          <img
            src="/tanneurs/editorial/duo-dusk-dunes.webp"
            alt="A traveler in cream linen carries a cognac leather weekender across golden dunes at last light"
            loading="lazy"
            className="aspect-[4/5] w-full object-cover md:aspect-[5/6]"
          />
        </picture>
      </RevealGroup>
    </section>
  )
}
