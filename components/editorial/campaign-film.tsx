"use client"

import { useEffect, useRef } from "react"
import { useT } from "@/lib/i18n-client"

export function CampaignFilm() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const t = useT()

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
    <section className="bg-ground px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center md:mb-14">
          <p className="text-micro mb-6 text-ink-muted">{t("film.eyebrow")}</p>
          <h2 className="font-serif text-4xl text-ink md:text-5xl">
            Le Départ
          </h2>
        </div>
        <div className="aspect-video w-full overflow-hidden">
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="metadata"
            poster="/tanneurs/films/maison-reel-v3-poster.jpg"
            className="h-full w-full object-cover"
          >
            <source src="/tanneurs/films/maison-reel-v3.mp4" type="video/mp4" />
          </video>
        </div>
        <p className="mt-8 text-center font-serif text-lg italic text-ink-muted">
          {t("film.caption")}
        </p>
      </div>
    </section>
  )
}
