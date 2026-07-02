"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { useHref, useT } from "@/lib/i18n-client"

// Full-bleed brand film. Autoplays muted/looped only while in view, pauses out
// of view, and never autoplays under reduced-motion.
export function CampaignFilm() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const t = useT()
  const href = useHref()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reduced.matches) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.35 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative w-full overflow-hidden bg-dark-close">
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="metadata"
        poster="/tanneurs/films/le-train-poster.jpg"
        className="h-[90vh] min-h-[520px] w-full object-cover"
      >
        <source src="/tanneurs/films/le-train.mp4" type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />
      <div className="absolute inset-x-0 bottom-0 px-6 pb-14 [text-shadow:0_1px_14px_rgba(0,0,0,0.4)] md:px-14 md:pb-20">
        <p className="text-micro mb-4 text-white/80">{t("film.eyebrow")}</p>
        <h2 className="font-serif text-4xl text-white md:text-6xl">Le Départ</h2>
        <p className="mt-4 max-w-md font-serif text-lg italic leading-relaxed text-white/90">
          {t("film.caption")}
        </p>
        {/* The page's largest section must exit somewhere — 90vh of film
            with no CTA was a dead-end admiration zone. */}
        <Link
          href={href("/shop")}
          className="link-caps mt-7 inline-block text-white transition-opacity hover:opacity-70"
        >
          {t("featured.cta")}
        </Link>
      </div>
    </section>
  )
}
