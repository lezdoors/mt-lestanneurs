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
  const cookie = request.cookies.get(CURRENCY_COOKIE)?.value
  if (isCurrency(cookie)) return { currency: cookie, fromCookie: true }
  const country = request.headers.get("x-vercel-ip-country") || ""
  if (country === "GB") return { currency: "GBP", fromCookie: false }
  if (EUR_COUNTRIES.has(country)) return { currency: "EUR", fromCookie: false }
  return { currency: DEFAULT_CURRENCY, fromCookie: false }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
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
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|icon-light-32x32.png|icon-dark-32x32.png|robots.txt|sitemap.xml|llms.txt|feed|.*\\..*).*)",
  ],
}
