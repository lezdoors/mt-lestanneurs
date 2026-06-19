"use client"

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"

// Scroll-reveal primitives. Thin client wrappers so server-rendered sections
// stay on the server — children are passed straight through. The entrance
// styling lives in globals.css (.reveal / [data-reveal-group]); these only
// flip the `is-in` class once the element crosses into view, and fall back to
// fully-visible for reduced-motion (handled in CSS) with a JS short-circuit.

function useInView(threshold: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Reduced-motion: reveal immediately, skip the observer entirely.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return { ref, inView }
}

// A single block that settles in as one. `delay` lets a CTA trail its heading.
export function Reveal({
  children,
  className = "",
  delay = 0,
  y,
  threshold = 0.15,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  threshold?: number
}) {
  const { ref, inView } = useInView(threshold)
  const style: CSSProperties = {
    transitionDelay: inView ? `${delay}ms` : "0ms",
  }
  if (y != null) (style as Record<string, string>)["--reveal-y"] = `${y}px`
  return (
    <div ref={ref} className={`reveal ${inView ? "is-in" : ""} ${className}`} style={style}>
      {children}
    </div>
  )
}

// A container whose direct children cascade in, staggered by position. Pass the
// grid/flex classes straight through `className` so this *is* the layout node.
export function RevealGroup({
  children,
  className = "",
  y,
  threshold = 0.12,
}: {
  children: ReactNode
  className?: string
  y?: number
  threshold?: number
}) {
  const { ref, inView } = useInView(threshold)
  const style: CSSProperties | undefined =
    y != null ? ({ "--reveal-y": `${y}px` } as Record<string, string>) : undefined
  return (
    <div
      ref={ref}
      data-reveal-group=""
      className={`${inView ? "is-in" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
