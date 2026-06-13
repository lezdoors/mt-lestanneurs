import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/lib/cart"
import { CartDrawer } from "@/components/editorial/cart-drawer"
import { LocaleProvider } from "@/lib/i18n-client"
import { CurrencyProvider } from "@/lib/currency-client"
import { getDisplayCurrency, getRates } from "@/lib/currency-display"
import { dirForLocale, getLocale } from "@/lib/i18n"
import { OrganizationJsonLd } from "@/components/seo/json-ld"
import { MetaPixel } from "@/components/seo/meta-pixel"
import { GA4 } from "@/components/seo/ga4"
import { Clarity } from "@/components/seo/clarity"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

// Brand fonts from the Maison Tanneurs Drive `Fonts` folder (OFL).
const bodoniSC = localFont({
  src: [
    {
      path: "./fonts/BodoniModaSC-VariableFont_opsz,wght.ttf",
      style: "normal",
    },
    {
      path: "./fonts/BodoniModaSC-Italic-VariableFont_opsz,wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-bodoni-sc",
})

const cormorant = localFont({
  src: [
    {
      path: "./fonts/CormorantGaramond-VariableFont_wght.ttf",
      style: "normal",
    },
    {
      path: "./fonts/CormorantGaramond-Italic-VariableFont_wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-cormorant",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://www.maisontanneurs.com"),
  title: {
    default: "Maison Tanneurs — Leather Goods, Made in Marrakech",
    template: "%s",
  },
  description:
    "Full-grain leather bags, cut and saddle-stitched by hand in our Marrakech atelier. A leather house built on patience — objects made to be carried for decades.",
  alternates: {
    // Relative canonical resolves per-route against metadataBase, so every
    // page self-canonicalizes without per-page boilerplate.
    canonical: "./",
  },
  openGraph: {
    siteName: "Maison Tanneurs",
    type: "website",
    locale: "en_US",
    images: [{ url: "/tanneurs/editorial/hero-stone-16x9.webp" }],
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const currency = await getDisplayCurrency()
  const rates = await getRates()
  return (
    <html
      lang={locale}
      dir={dirForLocale(locale)}
      className={`${inter.variable} ${bodoniSC.variable} ${cormorant.variable}`}
    >
      <body className="font-sans antialiased">
        <OrganizationJsonLd />
        <LocaleProvider locale={locale}>
          <CurrencyProvider currency={currency} rate={rates[currency]}>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
          </CurrencyProvider>
        </LocaleProvider>
        <Analytics />
        <MetaPixel />
        <GA4 />
        <Clarity />
      </body>
    </html>
  )
}
