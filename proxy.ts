import { NextResponse, type NextRequest } from "next/server"
import { DEFAULT_LOCALE, dirForLocale, isLocale, type Locale } from "@/lib/i18n"
import {
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
  isCurrency,
  type Currency,
} from "@/lib/checkout/currency"

// Locale routing (production pattern): /fr/* and /ar/* rewrite to the same
// routes with x-mt-locale / x-mt-dir headers; English stays at the root.
//
// Geo currency: the mt-currency cookie wins; first-time visitors get a
// currency from Vercel's IP-country header (GB → GBP, Europe → EUR,
// everywhere else USD). The resolved value rides the x-mt-currency request
// header so server components and the checkout API price the same request
// identically.

// Countries whose shoppers expect € — eurozone plus European countries we
// don't have a native currency for (display preference, not legal tender).
const EUR_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR",
  "GR", "HU", "IE", "IT", "LT", "LU", "LV", "MC", "MT", "NL", "PL", "PT",
  "RO", "SE", "SI", "SK", "AD", "SM", "VA",
])

function resolveCurrency(request: NextRequest): {
  currency: Currency
  fromCookie: boolean
} {
  // [2026-06-16] USD-everywhere launch state. Revolut confirmed USD/EUR/GBP
  // are all accepted by default (each settles into its own merchant pocket),
  // so the earlier GBP-only workaround is retired. The house prices in USD;
  // we DISPLAY and CHARGE USD for every visitor (the customer's own bank
  // handles their card FX). Geo display (the cookie/IP logic above) can be
  // switched on later as a conversion lever — EUR for Europe, GBP for the UK.
  void CURRENCY_COOKIE; void EUR_COUNTRIES; void DEFAULT_CURRENCY; void isCurrency
  return { currency: "USD", fromCookie: true }
}

// Hotlink protection for /tanneurs/ imagery + films. Blocks OTHER websites
// from embedding our campaign assets via their own <img src="...">, while
// keeping everything that drives traffic working: direct access / right-click-
// open (no referer), our own pages, and the crawlers that build OG previews
// and image search (Facebook, Instagram, Pinterest, X, Google, Bing, LinkedIn).
const REFERER_ALLOW = [
  "maisontanneurs.com",
  "vercel.app",
  "facebook.com",
  "fbcdn.net",
  "instagram.com",
  "pinterest.com",
  "pinimg.com",
  "twitter.com",
  "x.com",
  "t.co",
  "google.com",
  "googleusercontent.com",
  "bing.com",
  "linkedin.com",
]

function hotlinkBlocked(request: NextRequest): boolean {
  const referer = request.headers.get("referer")
  if (!referer) return false // direct nav, OG/social crawlers, image search
  let host: string
  try {
    host = new URL(referer).hostname.toLowerCase()
  } catch {
    return false
  }
  // Same-origin is never a hotlink: our own pages requesting our own assets,
  // on whatever host is serving them (localhost + LAN IP in dev, *.vercel.app
  // previews, the production domain). This is what makes local QA work without
  // weakening cross-site protection — a foreign embedder's referer host will
  // never match our serving host.
  const self = (request.headers.get("host") || "").split(":")[0].toLowerCase()
  if (self && host === self) return false
  return !REFERER_ALLOW.some((d) => host === d || host.endsWith(`.${d}`))
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Asset hotlink guard runs before locale logic.
  if (pathname.startsWith("/tanneurs/")) {
    if (hotlinkBlocked(request)) {
      return new NextResponse(null, { status: 403, statusText: "Forbidden" })
    }
    return NextResponse.next()
  }
  const first = pathname.split("/").filter(Boolean)[0]
  const locale: Locale = isLocale(first) ? first : DEFAULT_LOCALE
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-mt-locale", locale)
  requestHeaders.set("x-mt-dir", dirForLocale(locale))

  const { currency, fromCookie } = resolveCurrency(request)
  requestHeaders.set("x-mt-currency", currency)

  let response: NextResponse
  if (locale !== DEFAULT_LOCALE) {
    const url = request.nextUrl.clone()
    url.pathname =
      pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "") || "/"
    response = NextResponse.rewrite(url, { request: { headers: requestHeaders } })
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } })
  }

  if (!fromCookie) {
    response.cookies.set(CURRENCY_COOKIE, currency, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    })
  }
  return response
}

export const config = {
  matcher: [
    // Page routes (locale + currency handling)
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|icon-light-32x32.png|icon-dark-32x32.png|robots.txt|sitemap.xml|llms.txt|feed|.*\\..*).*)",
    // Brand assets (hotlink protection)
    "/tanneurs/:path*",
  ],
}
