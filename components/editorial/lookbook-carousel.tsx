"use client"

import { useCallback, useEffect, useRef, useState } from "react"

// One deliberate horizontal lookbook instead of a vertical stack of full-bleed
// frames (which read as a photo album). Pure CSS scroll-snap track — no library:
// native swipe/drag on touch, a refined bottom nav cluster (counter + chevrons)
// and a step progress line on desktop, slow autoplay that pauses on
// interaction and is skipped entirely under reduced-motion.

type Slide = {
  src: string
  srcMobile: string
  alt: string
  caption: string
}

// Curated from a full visual audit of the Drive editorial library
// (2026-06-26): all landscape, logo-free, on-brand Parisian register, casting
// European/Black/East-Asian. Arc: maison figure → object → Mediterranean →
// carved-door provenance → open country → quiet interior.
const SLIDES: Slide[] = [
  {
    src: "/tanneurs/editorial/lookbook-stone.webp",
    srcMobile: "/tanneurs/editorial/lookbook-stone-m.webp",
    alt: "A woman in a cream wool coat carries a leather tote past a sunlit honey-stone facade",
    caption: "The Maison",
  },
  {
    src: "/tanneurs/editorial/lookbook-duffle.webp",
    srcMobile: "/tanneurs/editorial/lookbook-duffle-m.webp",
    alt: "A cognac leather holdall on a pale stone plinth against a warm raking-lit wall",
    caption: "The Object",
  },
  {
    src: "/tanneurs/editorial/lookbook-coast.webp",
    srcMobile: "/tanneurs/editorial/lookbook-coast-m.webp",
    alt: "A man in cream linen carries a leather bag down a whitewashed Mediterranean lane, the sea beyond",
    caption: "Mediterranean",
  },
  {
    src: "/tanneurs/editorial/lookbook-door.webp",
    srcMobile: "/tanneurs/editorial/lookbook-door-m.webp",
    alt: "A woman in cream holds a chocolate leather duffle before a tall carved wooden door in warm light",
    caption: "Carved Light",
  },
  {
    src: "/tanneurs/editorial/lookbook-field.webp",
    srcMobile: "/tanneurs/editorial/lookbook-field-m.webp",
    alt: "A woman crosses a golden wheat field with a white horse, a cognac leather bag at her side",
    caption: "Open Country",
  },
  {
    src: "/tanneurs/editorial/lookbook-interior.webp",
    srcMobile: "/tanneurs/editorial/lookbook-interior-m.webp",
    alt: "A tan full-grain leather rucksack in a quiet interior, a shaft of morning light across the wall",
    caption: "Morning Light",
  },
]

const AUTOPLAY_MS = 7000
const pad = (n: number) => String(n).padStart(2, "0")

export function LookbookCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const pausedRef = useRef(false)
  const total = SLIDES.length

  const goTo = useCallback((i: number) => {
    const track = trackRef.current
    if (!track) return
    const clamped = (i + total) % total
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" })
  }, [total])

  // Keep the active index in sync with the user's own scrolling/swiping.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        setActive(Math.round(track.scrollLeft / track.clientWidth))
      })
    }
    track.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      track.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  // Slow autoplay — skipped under reduced-motion, paused on hover/touch.
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }
    const id = setInterval(() => {
      const track = trackRef.current
      if (!track || pausedRef.current) return
      const next =
        (Math.round(track.scrollLeft / track.clientWidth) + 1) % total
      track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" })
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [total])

  const pause = () => {
    pausedRef.current = true
  }
  const resume = () => {
    pausedRef.current = false
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-dark-close"
      aria-roledescription="carousel"
      aria-label="Lookbook"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
    >
      <div
        ref={trackRef}
        className="lookbook-track flex snap-x snap-mandatory overflow-x-auto"
      >
        {SLIDES.map((s, i) => (
          <div
            key={s.src}
            className="relative h-[72vh] min-h-[460px] w-full shrink-0 snap-center md:h-[84vh]"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${total}`}
          >
            <picture className="block h-full w-full">
              <source media="(max-width: 767px)" srcSet={s.srcMobile} />
              <img
                src={s.src}
                alt={s.alt}
                loading="eager"
                decoding="async"
                className="block h-full w-full object-cover"
              />
            </picture>
          </div>
        ))}
      </div>

      {/* Bottom scrim so the chrome reads on any frame */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/55 to-transparent" />

      {/* Editorial nav bar: caption left, counter + chevrons right */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-6 pb-7 md:px-10 md:pb-9">
        <p className="text-micro text-white/90 [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
          {SLIDES[active]?.caption}
        </p>
        <div className="flex items-center gap-6 text-white">
          <p className="font-sans text-[11px] tracking-[0.25em] tabular-nums text-white/90 [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
            {pad(active + 1)}
            <span className="mx-1.5 text-white/40">/</span>
            <span className="text-white/55">{pad(total)}</span>
          </p>
          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Previous"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 transition-colors hover:border-white/80"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Next"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 transition-colors hover:border-white/80"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Step progress line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/20">
        <div
          className="h-full bg-white transition-[width] duration-500 ease-out"
          style={{ width: `${((active + 1) / total) * 100}%` }}
        />
      </div>
    </section>
  )
}
