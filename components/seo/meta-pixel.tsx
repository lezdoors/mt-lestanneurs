"use client"

import { useEffect } from "react"

// Meta Pixel loader. Server-side companion: lib/checkout/meta-capi.ts fires
// Purchase via the Conversions API from the Revolut webhook; the shared
// event_id (Revolut order id) lets Meta dedupe browser vs server events.
//
// Env var: NEXT_PUBLIC_META_PIXEL_ID — unset = this component is a no-op.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: unknown
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

function injectPixel(pixelId: string) {
  if (typeof window === "undefined") return
  if (window.fbq) return // already loaded

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const w = window as any
  const fbq: any = function (...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args)
    } else {
      fbq.queue.push(args)
    }
  }
  fbq.push = fbq
  fbq.loaded = true
  fbq.version = "2.0"
  fbq.queue = []
  w.fbq = fbq
  if (!w._fbq) w._fbq = fbq
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const script = document.createElement("script")
  script.async = true
  script.src = "https://connect.facebook.net/en_US/fbevents.js"
  const firstScript = document.getElementsByTagName("script")[0]
  firstScript.parentNode!.insertBefore(script, firstScript)

  window.fbq!("init", pixelId)
  window.fbq!("track", "PageView")
}

// Fire a standard Pixel event from client components. eventID (when given)
// must match the server CAPI event_id so Meta dedupes browser vs server.
export function trackPixelEvent(
  event: string,
  params?: Record<string, unknown>,
  eventID?: string,
) {
  if (typeof window === "undefined" || !window.fbq) return
  if (eventID) {
    window.fbq("track", event, params || {}, { eventID })
  } else {
    window.fbq("track", event, params || {})
  }
}

export function MetaPixel() {
  useEffect(() => {
    if (!PIXEL_ID) return
    injectPixel(PIXEL_ID)
  }, [])

  if (!PIXEL_ID) return null

  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height={1}
        width={1}
        style={{ display: "none" }}
        alt=""
        src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
      />
    </noscript>
  )
}
