export function MaisonStatement() {
  return (
    <section className="bg-ground px-6 py-32 text-center md:py-48">
      <p className="text-micro mb-12 text-ink-muted md:mb-16">
        Maison Tanneurs — Marrakech
      </p>
      <h2 className="mx-auto max-w-5xl font-display text-[44px] font-medium leading-[1.04] tracking-[0.02em] text-ink md:text-7xl">
        L&rsquo;Équilibre
        <br />
        <span className="font-serif text-[0.82em] font-normal lowercase italic tracking-normal text-ink-soft">
          de la
        </span>
        <br />
        Forme.
      </h2>
      <p className="mx-auto mt-12 max-w-md font-serif text-lg leading-relaxed text-ink-soft md:mt-16 md:text-xl">
        A leather house, not a catalogue. Full-grain hides, cut and
        saddle-stitched at one bench in Marrakech, in editions small enough
        to keep every stitch honest.
      </p>

      {/* The proof image — the statement made visible */}
      <div className="-mx-6 mt-20 md:mt-28">
        <img
          src="/tanneurs/editorial/statement-hall.webp"
          alt="A monumental cognac duffle centered in a symmetric arched hall, mashrabiya light across the stone floor"
          loading="lazy"
          className="h-[62vh] min-h-[420px] w-full object-cover md:h-[80vh]"
        />
      </div>
    </section>
  )
}
