import { headers } from "next/headers"
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n-shared"

export * from "@/lib/i18n-shared"

export async function getLocale(): Promise<Locale> {
  const h = await headers()
  const v = h.get("x-mt-locale")
  return isLocale(v) ? v : DEFAULT_LOCALE
}
