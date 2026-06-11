import type { ReactNode } from "react"
import { SiteHeader } from "@/components/editorial/site-header"
import { SiteFooter } from "@/components/editorial/site-footer"

// Quiet text-led page: solid header, centered title block, narrow column.
export function PageShell({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string
  title: string
  lede?: string
  children: ReactNode
}) {
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="bg-ground pb-32 pt-[72px] md:pt-[96px]">
        <header className="px-6 pb-12 pt-20 text-center md:pb-16 md:pt-28">
          <p className="text-micro mb-8 text-ink-muted">{eyebrow}</p>
          <h1 className="mx-auto max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
            {title}
          </h1>
          {lede && (
            <p className="mx-auto mt-8 max-w-md font-serif text-lg italic leading-relaxed text-ink-soft">
              {lede}
            </p>
          )}
        </header>
        {children}
      </main>
      <SiteFooter />
    </>
  )
}
