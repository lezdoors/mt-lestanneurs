"use client"

import { useEffect, useRef } from "react"

export function CampaignFilm() {
  const videoRef = useRef<HTMLVideoElement>(null)

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
    <section className="bg-ground px-6 py-28 md:py-44">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center md:mb-20">
          <p className="text-micro mb-8 text-ink-muted">Un film</p>
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
            poster="/tanneurs/films/the-departure-poster.jpg"
            className="h-full w-full object-cover"
          >
            <source src="/tanneurs/films/the-departure.mp4" type="video/mp4" />
          </video>
        </div>
        <p className="mt-10 text-center font-serif text-lg italic text-ink-muted">
          A window seat, an old line south — and a bag that has done this
          before.
        </p>
      </div>
    </section>
  )
}
