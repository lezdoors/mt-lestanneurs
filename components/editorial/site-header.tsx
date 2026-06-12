"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useCart } from "@/lib/cart"
import { useHref, useLocale, useSwitchLocaleHref, useT } from "@/lib/i18n-client"
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n-shared"

const NAV_LEFT = [
  { href: "/shop", label: "nav.collection" },
  { href: "/heritage", label: "nav.savoirFaire" },
]

// variant "overlay": transparent white-on-image over a full-bleed hero,
// refining to solid on scroll. variant "solid": ink-on-ground from the start.
export function SiteHeader({
  variant = "overlay",
}: {
  variant?: "overlay" | "solid"
}) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const ticking = useRef(false)
  const { count, openCart } = useCart()
  const t = useT()
  const href = useHref()
  const locale = useLocale()
  const switchHref = useSwitchLocaleHref()

  useEffect(() => {
    if (variant === "solid") return
    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        // Hysteresis so the header doesn't flicker at the threshold
        setScrolled((prev) => (prev ? y > 48 : y > 96))
        ticking.current = false
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [variant])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    if (!langOpen) return
    const close = () => setLangOpen(false)
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [langOpen])

  const solid = variant === "solid" || scrolled || open
  const tone = solid
    ? "text-ink"
    : "text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.35)]"
  const rule = solid ? "border-hairline" : "border-white/30"

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid ? "bg-ground/95 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div
        className={`mx-auto grid h-[72px] max-w-[1760px] grid-cols-[1fr_auto_1fr] items-center border-b px-5 transition-colors duration-500 md:h-[96px] md:px-10 ${rule}`}
      >
        <nav className={`hidden items-center gap-9 md:flex ${tone}`}>
          {NAV_LEFT.map((l) => (
            <Link
              key={l.href}
              href={href(l.href)}
              className="text-micro font-sans opacity-90 transition-opacity hover:opacity-50"
            >
              {t(l.label)}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className={`flex h-10 w-10 items-center justify-center md:hidden ${tone}`}
        >
          <span className="relative block h-3 w-5">
            <span
              className={`absolute left-0 top-0 h-px w-full bg-current transition-transform duration-300 ${
                open ? "translate-y-[5.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-300 ${
                open ? "-translate-y-[5.5px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>

        <Link
          href={href("/")}
          onClick={() => setOpen(false)}
          aria-label="Maison Tanneurs home"
          className={`justify-self-center whitespace-nowrap px-3 font-wordmark font-normal uppercase leading-none transition-all duration-500 md:px-0 ${
            solid
              ? "text-[15px] tracking-[0.18em] md:text-[length:clamp(20px,2.05vw,30px)] md:tracking-[clamp(0.18em,0.6vw,0.3em)]"
              : "text-[16px] tracking-[0.18em] md:text-[length:clamp(24px,2.65vw,38px)] md:tracking-[clamp(0.2em,0.8vw,0.34em)]"
          } ${tone}`}
        >
          <span>Maison</span>
          <span aria-hidden className="inline-block w-[1.15ch]" />
          <span>Tanneurs</span>
        </Link>

        <div className={`flex items-center justify-end gap-7 md:gap-9 ${tone}`}>
          <span className="relative hidden md:block">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              onClick={(e) => {
                e.stopPropagation()
                setLangOpen(!langOpen)
              }}
              className="text-micro flex items-center gap-2 font-sans opacity-90 transition-opacity hover:opacity-50"
            >
              {LOCALE_LABELS[locale]}
              <span
                aria-hidden
                className={`text-[8px] transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>
            {langOpen && (
              <span className="absolute right-0 top-full z-50 mt-4 flex min-w-[72px] flex-col border border-hairline bg-ground py-1.5 shadow-[0_8px_30px_rgba(28,26,23,0.08)]">
                {LOCALES.map((l) => (
                  <a
                    key={l}
                    href={switchHref(l)}
                    className={`text-micro px-5 py-2 text-left transition-colors ${
                      l === locale
                        ? "bg-ground-deep/60 text-ink"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    {LOCALE_LABELS[l]}
                  </a>
                ))}
              </span>
            )}
          </span>
          <Link
            href={href("/atelier")}
            className="text-micro hidden font-sans opacity-90 transition-opacity hover:opacity-50 md:block"
          >
            {t("nav.atelier")}
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              openCart()
            }}
            className="text-micro font-sans opacity-90 transition-opacity hover:opacity-50"
          >
            {t("nav.bag")}{count > 0 ? ` (${count})` : ""}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed left-0 right-0 top-[72px] z-40 h-[calc(100dvh-72px)] bg-ground transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex flex-col px-6 pt-10">
          {[...NAV_LEFT, { href: "/atelier", label: "nav.atelier" }].map((l) => (
            <Link
              key={l.label}
              href={href(l.href)}
              onClick={() => setOpen(false)}
              className="border-b border-hairline py-6 font-serif text-3xl text-ink"
            >
              {t(l.label)}
            </Link>
          ))}
          <div className="text-micro flex items-center gap-4 py-6 text-ink-soft">
            {LOCALES.map((l) => (
              <a
                key={l}
                href={switchHref(l)}
                className={l === locale ? "text-ink" : "opacity-60"}
              >
                {LOCALE_LABELS[l]}
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              openCart()
            }}
            className="text-micro py-7 text-left text-ink-soft"
          >
            {t("nav.bag")}{count > 0 ? ` (${count})` : ""}
          </button>
        </nav>
      </div>
    </header>
  )
}
