"use client"

import Link from "next/link"
import { useRef, useState } from "react"

export type HeritageObjectProps = {
  number: string
  name: string
  material: string
  priceText: string
  href: string
  poster: string
  video: string
}

// Hover-to-rotate object card. The poster is frame 0 of the spin clip so
// the plate never jumps on play; the video stays preload="none" and only
// loads on first hover — the scrub hero owns the page's eager budget.
export function HeritageObjectCard({
  number,
  name,
  material,
  priceText,
  href,
  poster,
  video,
}: HeritageObjectProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const play = async () => {
    const el = videoRef.current
    if (!el) return
    try {
      await el.play()
      setPlaying(true)
    } catch {
      setPlaying(false)
    }
  }

  const reset = () => {
    const el = videoRef.current
    if (!el) return
    el.pause()
    el.currentTime = 0
    setPlaying(false)
  }

  return (
    <article
      className="group"
      onPointerEnter={play}
      onPointerLeave={reset}
      onFocusCapture={play}
      onBlurCapture={reset}
    >
      <Link href={href} className="relative block aspect-square overflow-hidden" aria-label={`Inspect ${name}`}>
        <img
          src={poster}
          alt={name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${playing ? "opacity-100" : "opacity-0"}`}
          muted
          loop
          playsInline
          preload="none"
          poster={poster}
          aria-hidden="true"
        >
          <source src={video} type="video/mp4" />
        </video>
        <span className="text-micro absolute bottom-4 left-4 text-white/70">
          {playing ? "In motion" : "Hover to rotate"}
        </span>
        <span className="text-micro absolute right-4 top-4 text-white/70">{number}</span>
      </Link>

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl text-white md:text-2xl">{name}</h3>
          <p className="text-micro mt-2 text-white/55">{material}</p>
        </div>
        <div className="text-right">
          <p className="text-lg text-white">{priceText}</p>
          <Link href={href} className="link-caps mt-2 inline-block text-white/80">
            Inspect
          </Link>
        </div>
      </div>
    </article>
  )
}
