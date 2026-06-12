import { NextResponse, type NextRequest } from "next/server"
import { DEFAULT_LOCALE, dirForLocale, isLocale, type Locale } from "@/lib/i18n"

// Locale routing (production pattern): /fr/* and /ar/* rewrite to the same
// routes with x-mt-locale / x-mt-dir headers; English stays at the root.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const first = pathname.split("/").filter(Boolean)[0]
  const locale: Locale = isLocale(first) ? first : DEFAULT_LOCALE
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-mt-locale", locale)
  requestHeaders.set("x-mt-dir", dirForLocale(locale))

  if (locale !== DEFAULT_LOCALE) {
    const url = request.nextUrl.clone()
    url.pathname =
      pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "") || "/"
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|icon-light-32x32.png|icon-dark-32x32.png|robots.txt|sitemap.xml|llms.txt|feed|.*\\..*).*)",
  ],
}
