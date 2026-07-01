"use client"

import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import { useHref, useT } from "@/lib/i18n-client"

// Consent gate for the three trackers (Meta Pixel, GA4, Clarity), which
// previously loaded unconditionally — an ePrivacy/GDPR exposure while
// running paid traffic into the EU/UK.
//
// Model: outside the EU/UK (timezone heuristic) tracking loads immediately
// and no banner shows — US paid traffic keeps its full conversion signal.
// EU/UK visitors get a quiet opt-in notice; trackers stay dark until they
// accept. The choice persists in localStorage ("mt-consent").

const STORAGE_KEY = "mt-consent"

type ConsentState = "pending" | "granted" | "denied"

function isEuLikeTimezone(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""
    return (
      tz.startsWith("Europe/") ||
      tz === "Atlantic/Canary" ||
      tz === "Atlantic/Madeira" ||
      tz === "Atlantic/Azores" ||
      tz === "Atlantic/Reykjavik"
    )
  } catch {
    return false
  }
}

export function ConsentGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConsentState>("pending")
  const [showBanner, setShowBanner] = useState(false)
  const t = useT()
  const href = useHref()

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(STORAGE_KEY)
    } catch {
      /* private mode — treat as unset */
    }
    if (stored === "granted" || stored === "denied") {
      setState(stored)
      return
    }
    if (!isEuLikeTimezone()) {
      setState("granted")
      return
    }
    setShowBanner(true)
  }, [])

  const decide = (next: "granted" | "denied") => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* non-persistent is fine */
    }
    setState(next)
    setShowBanner(false)
  }

  return (
    <>
      {state === "granted" ? children : null}
      {showBanner && (
        <div
          role="dialog"
          aria-label={t("consent.title")}
          className="fixed bottom-4 left-4 right-4 z-[70] max-w-md border border-hairline bg-ground p-5 shadow-[0_8px_30px_rgba(28,26,23,0.12)] md:left-6 md:right-auto"
        >
          <p className="font-serif text-sm leading-relaxed text-ink-soft">
            {t("consent.body")}{" "}
            <Link
              href={href("/legal/privacy")}
              className="underline decoration-hairline underline-offset-4"
            >
              {t("consent.privacy")}
            </Link>
          </p>
          <div className="mt-4 flex items-center gap-5">
            <button
              type="button"
              onClick={() => decide("granted")}
              className="text-micro bg-ink px-6 py-3 text-white transition-opacity hover:opacity-80"
            >
              {t("consent.accept")}
            </button>
            <button
              type="button"
              onClick={() => decide("denied")}
              className="text-micro text-ink-muted underline decoration-hairline underline-offset-4 transition-opacity hover:opacity-60"
            >
              {t("consent.decline")}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
