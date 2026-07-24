"use client"

import { useEffect, useRef } from "react"

// Scroll-scrubbed hero — the film advances only as the visitor scrolls.
// A tall shell (260/330svh) hosts a sticky full-viewport video; scroll
// progress through the shell maps to playhead position. The clip is
// keyframe-dense (GOP 4) so seeking lands instantly; raw encodes stutter.
export function HeritageScrubHero() {
  const shellRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const shell = shellRef.current
    const video = videoRef.current
    if (!shell || !video) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let target = 0
    let frame = 0

    // Seek only when the previous seek has landed; `seeked` re-schedules so
    // the video converges on the latest scroll position without queueing.
    // Each step eases part-way toward the target so wheel flicks glide.
    const applySeek = () => {
      frame = 0
      if (!video.duration || video.seeking) return
      const diff = target - video.currentTime
      if (Math.abs(diff) > 0.01) {
        video.currentTime = video.currentTime + diff * 0.16
      } else if (Math.abs(diff) > 0.002) {
        video.currentTime = target
      }
    }

    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(applySeek)
    }

    const measure = () => {
      const rect = shell.getBoundingClientRect()
      const travel = Math.max(1, shell.offsetHeight - window.innerHeight)
      const progress = Math.min(1, Math.max(0, -rect.top / travel))
      if (video.duration) {
        target = progress * Math.max(0, video.duration - 0.08)
      }
      schedule()
    }

    video.pause()
    video.addEventListener("loadedmetadata", measure)
    video.addEventListener("seeked", schedule)
    window.addEventListener("scroll", measure, { passive: true })
    window.addEventListener("resize", measure, { passive: true })
    // Kick the load explicitly: with other videos on the page the browser
    // can leave this one queued at readyState 0 and the scrub never starts.
    video.load()
    measure()

    return () => {
      video.removeEventListener("loadedmetadata", measure)
      video.removeEventListener("seeked", schedule)
      window.removeEventListener("scroll", measure)
      window.removeEventListener("resize", measure)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section
      ref={shellRef}
      className="relative h-[260svh] bg-dark-close md:h-[330svh]"
      aria-label="Maison Tanneurs Heritage Edition"
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover object-[32%_center] md:object-center"
          muted
          playsInline
          preload="auto"
          poster="/tanneurs/heritage/heritage-hero-poster.webp"
          aria-label="A model carrying the Atlas Weekender across a Mediterranean terrace"
        >
          <source src="/tanneurs/heritage/hero-walk-scrub.mp4" type="video/mp4" />
        </video>

        {/* Wash — keeps the copy legible without dimming the film */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30"
          aria-hidden
        />

        <div className="absolute inset-0 flex flex-col justify-between px-6 pb-16 pt-[104px] md:px-12 md:pb-20 md:pt-[128px]">
          <div className="text-micro flex items-center justify-end text-white/80">
            <span>Heritage Edition — 001</span>
          </div>

          <div>
            <h1 className="max-w-3xl font-serif text-5xl leading-[1.02] text-white md:text-7xl">
              Heritage <em className="italic">Edition</em>
            </h1>
            <p className="mt-6 max-w-md font-serif text-lg leading-relaxed text-white/85 md:text-xl">
              French in form. Moroccan in hand. Three enduring objects cut,
              stitched, and finished at the bench.
            </p>

            <div className="mt-10 flex items-center gap-8">
              <a href="#heritage-objects" className="link-caps text-white">
                View the objects
              </a>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div
          className="text-micro absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/60 md:flex"
          aria-hidden
        >
          <span>Scroll to enter</span>
          <span className="block h-8 w-px animate-pulse bg-white/50" />
        </div>
      </div>
    </section>
  )
}
