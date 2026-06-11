"use client"

import { useEffect } from "react"

// Microsoft Clarity loader — session recordings + heatmaps. Companion to
// GA4 (ga4.tsx) and the Meta Pixel (meta-pixel.tsx).
//
// Env var: NEXT_PUBLIC_CLARITY_PROJECT_ID (the ~10-char code from
// clarity.microsoft.com). Unset = no-op, so previews never record into
// the production project.

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void
  }
}

const PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID

function injectClarity(id: string) {
  if (typeof window === "undefined") return
  if (window.clarity) return // already loaded

  window.clarity = function (...args: unknown[]) {
    // Queue calls until the tag script replaces this stub.
    const c = window.clarity as { q?: unknown[][] } & ((...a: unknown[]) => void)
    c.q = c.q || []
    c.q.push(args)
  }

  const script = document.createElement("script")
  script.async = true
  script.src = `https://www.clarity.ms/tag/${id}`
  document.head.appendChild(script)
}

export function Clarity() {
  useEffect(() => {
    if (!PROJECT_ID) return
    injectClarity(PROJECT_ID)
  }, [])

  return null
}
