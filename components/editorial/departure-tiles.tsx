import Link from "next/link"
import { getLocale, t, withLocale } from "@/lib/i18n"
import { Reveal, RevealGroup } from "@/components/editorial/reveal"

// L'Heure du Départ — one campaign, three frames (DeMellier's
// signature-row device): the same morning, the same street, three bags
// carried. Each tile links to the bag being worn.
const TILES = [
  {
    img: "depart-street-saddlebag",
    href: "/product/medina-saddlebag-tooled-cognac",
    alt: "The tooled cognac saddlebag worn crossbody on a limestone street in morning light",
  },
  {
    img: "depart-street-tote-camel",
    href: "/product/marrakech-tote-cognac",
    alt: "A model in navy carrying the camel tote past sunlit stone facades",
  },
  {
    img: "depart-street-satchel",
    href: "/product/classic-cognac-satchel",
    alt: "A model mid-stride with the structured cognac satchel in hand on a sunlit limestone street",
  },
]

export async function DepartureTiles() {
  const lo = await getLocale()
  return (
    <section className="bg-ground px-6 pb-4 pt-14 md:px-10 md:pt-20">
      <Reveal>
        <p className="text-micro mb-10 text-center text-ink-muted md:mb-12">
          L&rsquo;Heure du Départ
        </p>
      </Reveal>
      <RevealGroup className="mx-auto grid max-w-[1560px] grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {TILES.map((tile) => (
          <Link key={tile.img} href={withLocale(tile.href, lo)} className="group">
            <div className="overflow-hidden">
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet={`/tanneurs/editorial/${tile.img}-m.webp`}
                />
                <img
                  src={`/tanneurs/editorial/${tile.img}.webp`}
                  alt={tile.alt}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </picture>
            </div>
          </Link>
        ))}
      </RevealGroup>
      <Reveal delay={120}>
        <p className="mt-10 text-center md:mt-12">
          <Link
            href={withLocale("/shop", lo)}
            className="link-caps inline-block text-ink"
          >
            {t(lo, "featured.cta")}
          </Link>
        </p>
      </Reveal>
    </section>
  )
}
