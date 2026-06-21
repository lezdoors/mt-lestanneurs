"use client"

import { useEffect } from "react"

// GA4 loader. Companion to the Meta Pixel (meta-pixel.tsx) and server CAPI.
// Standard ecommerce events go through trackGA4Event() — this is also the
// surface Google Ads tag-based conversions read from (purchase event +
// Enhanced Conversions), matching the fleet's proven pattern.
//
// Env var: NEXT_PUBLIC_GA4_MEASUREMENT_ID ("G-XXXXXXXX"). Unset = no-op, so
// previews never pollute the production property.
//
// Verify firing: GA4 DebugView with ?debug_mode=1 appended.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID

function injectGA4(id: string) {
  if (typeof window === "undefined") return
  if (window.gtag) return // already loaded

  window.dataLayer = window.dataLayer || []
  // gtag.js only treats a dataLayer entry as a COMMAND when it is the special
  // `arguments` object. The previous arrow-function impl pushed a plain array
  // (`[...args]`), which gtag.js reads as a data-layer variable merge — so the
  // `config` command never registered and NO /collect hit was ever sent (GA
  // recorded zero traffic despite the library loading). Must push `arguments`.
  const gtag: (...args: unknown[]) => void = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag = gtag

  gtag("js", new Date())
  gtag("config", id, {
    send_page_view: true,
    anonymize_ip: true,
  })

  const script = document.createElement("script")
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  document.head.appendChild(script)
}

export function GA4() {
  useEffect(() => {
    if (!MEASUREMENT_ID) return
    injectGA4(MEASUREMENT_ID)
  }, [])

  return null
}

// Helper for components firing standard ecommerce events.
// https://developers.google.com/analytics/devguides/collection/ga4/reference/events
export function trackGA4Event(
  event:
    | "view_item"
    | "add_to_cart"
    | "remove_from_cart"
    | "view_cart"
    | "begin_checkout"
    | "add_payment_info"
    | "purchase"
    | "search",
  params?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return
  if (!window.gtag) return
  window.gtag("event", event, params || {})
}
