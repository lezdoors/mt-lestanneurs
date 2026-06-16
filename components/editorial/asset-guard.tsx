"use client"

import { useEffect } from "react"

// Deters casual asset theft: blocks the right-click "Save image" menu and
// drag-to-desktop on images and videos site-wide. Trivially bypassable by
// anyone with devtools (impossible to truly prevent), but it stops the 95%
// case and is the luxury-house standard. Pairs with edge hotlink protection
// (proxy.ts) and embedded IPTC copyright metadata in the files.
export function AssetGuard() {
  useEffect(() => {
    const block = (e: Event) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === "IMG" || t.tagName === "VIDEO" || t.tagName === "PICTURE")) {
        e.preventDefault()
      }
    }
    document.addEventListener("contextmenu", block)
    document.addEventListener("dragstart", block)
    return () => {
      document.removeEventListener("contextmenu", block)
      document.removeEventListener("dragstart", block)
    }
  }, [])
  return null
}
