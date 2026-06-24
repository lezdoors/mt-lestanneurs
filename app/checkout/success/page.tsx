import Link from "next/link"
import { cookies } from "next/headers"
import { confirmAndPersistOrder } from "@/lib/checkout/confirm-order"
import { formatPrice as formatChargePrice } from "@/lib/checkout/format"
import type { Currency } from "@/lib/checkout/currency"
import { isCurrency } from "@/lib/checkout/currency"
import { getLocale, t, withLocale } from "@/lib/i18n"
import { SuccessClient } from "./success-client"

// Order confirmation — the webhook-less confirmation path. Verifies the
// order directly with Stripe server-side, persists it exactly once
// (idempotent), then renders. See lib/checkout/confirm-order.ts.

export const dynamic = "force-dynamic"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const lo = await getLocale()
  const sp = await searchParams
  const param = (k: string) =>
    typeof sp[k] === "string" ? (sp[k] as string) : null
  // Stripe substitutes the literal {CHECKOUT_SESSION_ID} into the
  // success_url server-side on redirect, so `session_id` is the canonical
  // source. The first-party cookie set by the checkout page is the
  // belt-and-suspenders fallback. If neither is present, the webhook path
  // still records the order and the customer still gets their email; we
  // just show the pending screen.
  const cookieStore = await cookies()
  const sessionId =
    param("session_id") ||
    cookieStore.get("mt_pending_order")?.value ||
    param("revolut_order_id") ||
    param("order_id") ||
    null

  if (!sessionId) {
    return (
      <Shell>
        <Status
          eyebrow={t(lo, "success.problemEyebrow")}
          title={t(lo, "success.missingTitle")}
          body={t(lo, "success.missingBody")}
          cta={t(lo, "success.cta")}
          href={withLocale("/shop", lo)}
        />
      </Shell>
    )
  }

  let confirmed
  try {
    confirmed = await confirmAndPersistOrder(sessionId)
  } catch {
    // The lookup failed (transient Stripe error, or an id we can't resolve).
    // The payment has very likely succeeded — never tell a paying customer
    // their order is "invalid". Show the pending screen; the webhook will
    // record it and the confirmation email will follow.
    return (
      <Shell>
        <Status
          eyebrow={t(lo, "success.pendingEyebrow")}
          title={t(lo, "success.pendingTitle")}
          body={t(lo, "success.pendingBody")}
          cta={t(lo, "success.cta")}
          href={withLocale("/shop", lo)}
        />
      </Shell>
    )
  }

  // COMPLETED without a persisted order number cannot render as success —
  // confirm-order throws on persistence failure, but keep the gate airtight.
  if (confirmed.state !== "COMPLETED" || !confirmed.orderNumber) {
    return (
      <Shell>
        <Status
          eyebrow={t(lo, "success.pendingEyebrow")}
          title={t(lo, "success.pendingTitle")}
          body={t(lo, "success.pendingBody")}
          cta={t(lo, "success.cta")}
          href={withLocale("/shop", lo)}
        />
      </Shell>
    )
  }

  const currency: Currency = isCurrency(confirmed.currency)
    ? confirmed.currency
    : "USD"
  const firstName = (confirmed.customerName || "").split(" ")[0]

  return (
    <Shell>
      <SuccessClient
        orderNumber={confirmed.orderNumber}
        total={confirmed.total}
        currency={currency}
        items={confirmed.items.map((i) => ({
          slug: i.slug || i.product_id,
          quantity: i.quantity,
          price: i.price,
        }))}
      />
      <div className="mx-auto w-full max-w-[640px]">
        <p className="text-micro mb-5 text-center text-ink-muted">
          {t(lo, "success.eyebrow")}
        </p>
        <h1 className="text-center font-serif text-4xl leading-[1.08] text-ink md:text-5xl">
          {firstName
            ? t(lo, "success.titleNamed").replace("{name}", firstName)
            : t(lo, "success.title")}
        </h1>
        <p className="mx-auto mt-6 max-w-md text-center font-serif text-lg italic leading-relaxed text-ink-soft">
          {t(lo, "success.body")}
        </p>

        <div className="mt-12 border-y border-hairline py-6 text-center">
          <p className="text-micro mb-2 text-ink-muted">
            {confirmed.orderNumber
              ? t(lo, "success.orderLabel")
              : t(lo, "success.refLabel")}
          </p>
          <p className="font-sans text-lg tracking-[0.18em] text-ink">
            {confirmed.orderNumber ||
              `${sessionId.slice(0, 8)}…${sessionId.slice(-4)}`}
          </p>
          {confirmed.customerEmail && (
            <p className="text-micro mt-3 text-ink-muted">
              {t(lo, "success.emailLine").replace(
                "{email}",
                confirmed.customerEmail,
              )}
            </p>
          )}
        </div>

        {confirmed.items.length > 0 && (
          <ul className="mt-10 flex flex-col gap-3">
            {confirmed.items.map((item, idx) => (
              <li
                key={idx}
                className="flex items-baseline justify-between gap-4 border-b border-hairline pb-3 last:border-0"
              >
                <span className="font-serif text-lg text-ink">
                  {item.title}
                  {item.quantity > 1 && (
                    <span className="text-micro ml-2 text-ink-muted">
                      ×{item.quantity}
                    </span>
                  )}
                </span>
                <span className="shrink-0 font-sans text-sm text-ink-soft">
                  {formatChargePrice(item.price * item.quantity, currency)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex items-baseline justify-between border-t border-hairline pt-5">
          <span className="text-micro text-ink">{t(lo, "success.totalLabel")}</span>
          <span className="font-serif text-2xl text-ink">
            {formatChargePrice(confirmed.total, currency)}
          </span>
        </div>

        <p className="mt-14 text-center">
          <Link href={withLocale("/shop", lo)} className="link-caps text-ink">
            {t(lo, "success.cta")}
          </Link>
        </p>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ground">
      <header className="border-b border-hairline">
        <div className="mx-auto flex h-[72px] max-w-[1560px] items-center justify-center px-6">
          <Link
            href="/"
            aria-label="Maison Tanneurs home"
            className="whitespace-nowrap font-wordmark text-[14px] font-normal uppercase leading-none tracking-[0.18em] text-ink md:text-xl md:tracking-[0.24em]"
          >
            <span>Maison</span>
            <span aria-hidden className="inline-block w-[1.15ch]" />
            <span>Tanneurs</span>
          </Link>
        </div>
      </header>
      <main className="px-6 py-16 md:py-24">{children}</main>
    </div>
  )
}

function Status({
  eyebrow,
  title,
  body,
  cta,
  href,
}: {
  eyebrow: string
  title: string
  body: string
  cta: string
  href: string
}) {
  return (
    <div className="mx-auto w-full max-w-[560px] text-center">
      <p className="text-micro mb-5 text-ink-muted">{eyebrow}</p>
      <h1 className="font-serif text-4xl leading-[1.08] text-ink">{title}</h1>
      <p className="mx-auto mt-6 max-w-md font-serif text-lg italic leading-relaxed text-ink-soft">
        {body}
      </p>
      <p className="mt-12">
        <Link href={href} className="link-caps text-ink">
          {cta}
        </Link>
      </p>
    </div>
  )
}
