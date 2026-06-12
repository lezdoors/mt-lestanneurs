"use client"

import { useEffect, useRef } from "react"

// Quiet ambient video: muted loop that plays only in view and respects
// reduced motion (poster stands in). The house pattern for giving a
// still subject breath without becoming a screensaver.
export function AmbientLoop({
  src,
  poster,
  alt,
  className = "",
}: {
  src: string
  poster: string
  alt: string
  className?: string
}) {
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
      { threshold: 0.3 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-label={alt}
      className={className}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}
