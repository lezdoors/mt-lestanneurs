import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/lib/cart"
import { CartDrawer } from "@/components/editorial/cart-drawer"
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
  metadataBase: new URL("https://maisontanneurs.com"),
  title: {
    default: "Maison Tanneurs — Leather Goods, Made in Marrakech",
    template: "%s",
  },
  description:
    "Full-grain leather bags, cut and saddle-stitched by hand in our Marrakech atelier. A leather house built on patience — objects made to be carried for decades.",
  openGraph: {
    siteName: "Maison Tanneurs",
    type: "website",
    images: [{ url: "/tanneurs/editorial/hero-ryad-16x9.webp" }],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bodoniSC.variable} ${cormorant.variable}`}
    >
      <body className="font-sans antialiased">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
