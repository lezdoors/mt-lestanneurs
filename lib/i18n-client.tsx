"use client"

import { createContext, useContext, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import {
  DEFAULT_LOCALE,
  dictionaries,
  withLocale,
  type Locale,
} from "@/lib/i18n-shared"

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE)

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale
  children: ReactNode
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  )
}

export function useLocale(): Locale {
  return useContext(LocaleContext)
}

export function useT() {
  const locale = useLocale()
  return (key: string) =>
    dictionaries[locale]?.[key] || dictionaries.en[key] || key
}

// Localized href helper for client components
export function useHref() {
  const locale = useLocale()
  return (href: string) => withLocale(href, locale)
}

// Build the equivalent URL in another locale (for the EN·FR·AR switcher)
export function useSwitchLocaleHref() {
  const pathname = usePathname() || "/"
  return (target: Locale) => {
    const clean =
      pathname.replace(/^\/(fr|de|es|it)(?=\/|$)/, "") || "/"
    return withLocale(clean, target)
  }
}
