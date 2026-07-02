"use client"

import { useEffect, useRef } from "react"

// The Making — documentary beat on the atelier page. Same in-view
// play/pause discipline as Le Départ.
export function AtelierFilm() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reduced.matches) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.35 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-ground px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center md:mb-12">
          <p className="text-micro mb-6 text-ink-muted">Un film</p>
          <h2 className="font-serif text-4xl text-ink md:text-5xl">
            The Making
          </h2>
        </div>
        <div className="aspect-[1600/1014] w-full overflow-hidden">
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="metadata"
            poster="/tanneurs/films/la-fabrication-poster.jpg"
            className="h-full w-full object-cover"
          >
            <source src="/tanneurs/films/la-fabrication.mp4" type="video/mp4" />
          </video>
        </div>
        <p className="mt-8 text-center font-serif text-lg italic text-ink-muted">
          Two pairs of hands, one bench — the hour before a bag exists.
        </p>
      </div>
    </section>
  )
}
