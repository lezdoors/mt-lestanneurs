"use client"

import { useEffect } from "react"

// Recovery landing for abandoned-cart emails. Rehydrates the exact bag from
// the token, then hard-redirects to /checkout so the CartProvider re-reads
// localStorage on a fresh mount. Storage key must match lib/cart.tsx.
const STORAGE_KEY = "mt-cart-v1"

export default function RecoverPage() {
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token")
    if (!token) {
      window.location.assign("/")
      return
    }
    fetch(`/api/cart/recover?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.items) && d.items.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(d.items))
        }
        window.location.assign("/checkout")
      })
      .catch(() => window.location.assign("/checkout"))
  }, [])

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Georgia, serif",
        fontStyle: "italic",
        color: "#57534c",
      }}
    >
      Restoring your selection…
    </div>
  )
}
