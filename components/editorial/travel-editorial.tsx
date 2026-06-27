"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useT, useHref } from "@/lib/i18n-client"

// Contained editorial split — model image left, copy right. The copy drifts
// with the scroll *within* the section (DeMellier device, bounded), on white,
// so this beat reads as a composed page rather than another full-bleed image
// stacked against its neighbours. Disabled under reduced-motion.
export function TravelEditorial() {
  const sectionRef = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0.5)
  const t = useT()
  const lhref = useHref()

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const el = sectionRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const vh = window.innerHeight
        const p = (vh - rect.top) / (vh + rect.height)
        setProgress(Math.min(1, Math.max(0, p)))
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  // Copy drifts a gentle ~64px across the section — stays contained.
  const textShift = (0.5 - progress) * 64

  return (
    <section
      ref={sectionRef}
      className="bg-ground px-6 py-20 md:px-10 md:py-28 lg:px-14"
    >
      <div className="mx-auto grid max-w-[1560px] grid-cols-1 gap-8 md:grid-cols-12 md:gap-12 lg:gap-16">
        {/* Image — left */}
        <div className="overflow-hidden md:col-span-7">
          <picture>
            <source media="(max-width: 767px)" srcSet="/tanneurs/editorial/depart-carriage-m.webp" />
            <img
              src="/tanneurs/editorial/depart-carriage.webp"
              alt="A cognac leather holdall resting on the green velvet seat of a Marrakech carriage"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover md:aspect-auto md:h-[78vh] md:min-h-[460px]"
            />
          </picture>
        </div>

        {/* Copy — right, drifts with scroll */}
        <div className="flex flex-col justify-center md:col-span-5">
          <div
            className="will-change-transform"
            style={{ transform: `translate3d(0, ${textShift}px, 0)` }}
          >
            <h2 className="max-w-md font-serif text-3xl leading-[1.15] text-ink md:text-[44px]">
              {t("travel.title")}
            </h2>
            <p className="mt-5 max-w-sm font-serif text-lg italic leading-relaxed text-ink-soft">
              {t("travel.body")}
            </p>
            <Link href={lhref("/shop")} className="link-caps mt-8 inline-block text-ink">
              {t("travel.cta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
