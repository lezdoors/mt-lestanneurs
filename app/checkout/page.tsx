"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import type { StripeExpressCheckoutElementConfirmEvent } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  ExpressCheckoutElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"
import { useCart } from "@/lib/cart"
import { useFormatPrice, useCurrency } from "@/lib/currency-client"
import { useHref, useT } from "@/lib/i18n-client"
import { trackPixelEvent } from "@/components/seo/meta-pixel"
import { trackGA4Event } from "@/components/seo/ga4"
import { lookupPromo, applyPromoMinor } from "@/lib/checkout/promo"

// Checkout — single-page editorial form rendered on maisontanneurs.com.
// Stripe only owns the PCI-safe card inputs (inside small, invisible iframes
// rendered by <PaymentElement>); the entire surrounding form, typography,
// and chrome are ours. <ExpressCheckoutElement> surfaces Apple Pay / Google
// Pay at the top so wallet-first shoppers never see the long form at all.
//
// Pattern: deferred PaymentIntent. <Elements> is mounted with mode/amount/
// currency at page load; the PaymentIntent is created on /api/checkout/session
// only when the shopper clicks Pay. This avoids stale intents from page
// abandons and lets the server recompute pricing right before charging.
//
// On confirmation Stripe navigates to /checkout/success?payment_intent=pi_*,
// which calls confirmAndPersistOrder server-side (the webhook does the same
// path; both idempotent on the PaymentIntent id).

const PENDING_ORDER_COOKIE = "mt_pending_order"

type ExpressCustomer = {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  zip: string
  country: string
  state: string
}

// Country selector — major shipping markets, ISO 3166-1 alpha-2 for Stripe
// billing/shipping. Extend as new markets open.
const COUNTRIES: { code: string; name: string }[] = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "IE", name: "Ireland" },
  { code: "PT", name: "Portugal" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "LU", name: "Luxembourg" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "QA", name: "Qatar" },
  { code: "KW", name: "Kuwait" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
  { code: "HK", name: "Hong Kong" },
  { code: "KR", name: "South Korea" },
  { code: "MA", name: "Morocco" },
]

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
)

function getCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined
  const prefix = `${name}=`
  const found = document.cookie
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(prefix))
  return found ? decodeURIComponent(found.slice(prefix.length)) : undefined
}

function getMetaTracking() {
  const tracking: { fbp?: string; fbc?: string } = {}
  const fbp = getCookieValue("_fbp")
  const fbc =
    getCookieValue("_fbc") ||
    (() => {
      const fbclid = new URLSearchParams(window.location.search).get("fbclid")
      return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined
    })()
  if (fbp) tracking.fbp = fbp
  if (fbc) tracking.fbc = fbc
  return Object.keys(tracking).length > 0 ? tracking : undefined
}

// Stripe Elements appearance — editorial brand register. Hairline borders
// below inputs, ink on ground, no shadows or rounded corners. Stripe's
// PaymentElement field labels and copy follow `colorText` and the inter
// font, so the embedded card form blends with the labels we render around it.
const ELEMENTS_APPEARANCE = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "#111111",
    colorBackground: "#ffffff",
    colorText: "#111111",
    colorTextSecondary: "#666666",
    colorTextPlaceholder: "#9a9a9a",
    colorDanger: "#9b2c2c",
    colorIconTab: "#2c2a28",
    fontFamily:
      '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    fontSizeBase: "16px",
    fontWeightNormal: "400",
    fontWeightMedium: "500",
    spacingUnit: "4px",
    borderRadius: "0px",
    focusBoxShadow: "none",
    focusOutline: "none",
  },
  rules: {
    ".Input": {
      backgroundColor: "transparent",
      border: "none",
      borderBottom: "1px solid #e5e5e5",
      borderRadius: "0",
      padding: "10px 0",
      fontSize: "16px",
      fontFamily:
        '"Inter", system-ui, -apple-system, sans-serif',
      transition: "border-color 0.2s ease",
    },
    ".Input:focus": {
      borderBottom: "1px solid #111111",
      boxShadow: "none",
    },
    ".Input--invalid": {
      borderBottom: "1px solid #9b2c2c",
    },
    ".Label": {
      fontSize: "11px",
      fontFamily:
        '"Inter", system-ui, -apple-system, sans-serif',
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: "#6b6663",
      fontWeight: "400",
      marginBottom: "10px",
    },
    ".Tab": {
      backgroundColor: "transparent",
      border: "1px solid #e5e5e5",
      borderRadius: "0",
      padding: "16px",
    },
    ".Tab--selected": {
      border: "1px solid #111111",
      backgroundColor: "transparent",
    },
    ".TabIcon--selected": {
      fill: "#111111",
    },
    ".TabLabel": {
      fontSize: "11px",
      letterSpacing: "0.16em",
      textTransform: "uppercase",
    },
  },
}

export default function CheckoutPage() {
  const { items, subtotal } = useCart()
  const t = useT()
  const lhref = useHref()
  const formatPrice = useFormatPrice()
  const { currency: displayCurrency, rate: displayRate } = useCurrency()

  const [promoInput, setPromoInput] = useState("")
  const [promoCode, setPromoCode] = useState<string | null>(null)
  const [promoError, setPromoError] = useState(false)
  const promoCalc = applyPromoMinor(subtotal, promoCode)
  const displayTotal = promoCalc.totalMinor
  const chargeAmount = useMemo(
    () => Math.max(50, Math.round((displayTotal * displayRate) / 100) * 100),
    [displayTotal, displayRate],
  )

  function applyPromo() {
    const p = lookupPromo(promoInput)
    if (p) {
      setPromoCode(promoInput.trim().toUpperCase())
      setPromoError(false)
    } else {
      setPromoCode(null)
      setPromoError(true)
    }
  }

  // ?promo=CODE pre-fills the discount — Facebook-ad landing only.
  useEffect(() => {
    if (typeof window === "undefined") return
    const fromUrl = new URLSearchParams(window.location.search).get("promo")
    if (!fromUrl) return
    const normalized = fromUrl.trim().toUpperCase()
    const p = lookupPromo(normalized)
    if (p) {
      setPromoInput(normalized)
      setPromoCode(normalized)
      setPromoError(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // InitiateCheckout — once, when the cart is first shown at checkout.
  const initiatedRef = useRef(false)
  useEffect(() => {
    if (items.length === 0 || initiatedRef.current) return
    initiatedRef.current = true
    const value = Math.round((subtotal * displayRate) / 100)
    trackGA4Event("begin_checkout", { currency: displayCurrency, value })
    trackPixelEvent("InitiateCheckout", {
      value,
      currency: displayCurrency,
      content_ids: items.map((i) => i.slug),
      content_type: "product",
      num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    })
  }, [items, subtotal, displayRate, displayCurrency])

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#e5e5e5]">
        <div className="mx-auto grid h-[72px] max-w-[1560px] grid-cols-[1fr_auto_1fr] items-center px-6 md:px-10">
          <Link
            href={lhref("/shop")}
            className="text-micro text-ink-soft transition-opacity hover:opacity-60"
          >
            {t("checkout.back")}
          </Link>
          <Link
            href={lhref("/")}
            aria-label="Maison Tanneurs home"
            className="whitespace-nowrap font-wordmark text-[14px] font-normal uppercase leading-none tracking-[0.18em] text-ink md:text-xl md:tracking-[0.24em]"
          >
            <span>Maison</span>
            <span aria-hidden className="inline-block w-[1.15ch]" />
            <span>Tanneurs</span>
          </Link>
          <p className="text-micro hidden justify-self-end text-ink-muted md:block">
            {t("checkout.secure")}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-14 md:py-20">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-8 py-24 text-center">
            <h1 className="font-sans text-3xl text-ink">
              {t("checkout.emptyTitle")}
            </h1>
            <Link href={lhref("/shop")} className="link-caps text-ink">
              {t("cart.viewCollection")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-[1fr_400px] md:gap-0">
            {/* Mobile compact summary — expandable. Tells the shopper what
                they're paying and lets them re-check items without scrolling
                past the whole desktop panel before reaching the form. */}
            <details className="group md:hidden">
              <summary className="flex cursor-pointer items-baseline justify-between border-y border-[#e5e5e5] py-4 [&::-webkit-details-marker]:hidden">
                <span className="text-micro text-ink transition-opacity group-open:opacity-60">
                  {t("checkout.orderTitle")} ·{" "}
                  {items.length} {items.length === 1 ? "item" : "items"}{" "}
                  <span className="ml-1 inline-block transition-transform group-open:rotate-180">
                    ⌄
                  </span>
                </span>
                <span className="font-sans text-xl text-ink">
                  {formatPrice(displayTotal)}
                </span>
              </summary>
              <div className="border-b border-[#e5e5e5] pb-6 pt-6">
                <ul className="flex flex-col gap-4">
                  {items.map((item) => (
                    <li
                      key={item.slug}
                      className="flex items-baseline gap-4 border-b border-[#e5e5e5] pb-3 last:border-0"
                    >
                      <span className="flex-1 font-sans text-base text-ink">
                        {item.name}
                        {item.quantity > 1 && (
                          <span className="text-micro ml-2 text-ink-muted">
                            ×{item.quantity}
                          </span>
                        )}
                      </span>
                      <span className="font-sans text-sm text-ink-soft">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex items-end gap-3">
                  <div className="flex flex-1 flex-col gap-2">
                    <label
                      htmlFor="promo-mobile"
                      className="text-micro text-ink-muted"
                    >
                      {t("checkout.promoLabel")}
                    </label>
                    <input
                      id="promo-mobile"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value)
                        setPromoError(false)
                      }}
                      placeholder={t("checkout.promoPlaceholder")}
                      className="border-b border-[#e5e5e5] bg-transparent pb-2 font-sans text-base uppercase text-ink outline-none transition-colors focus:border-ink"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyPromo}
                    className="text-micro pb-2 text-ink-soft underline underline-offset-4 transition-opacity hover:opacity-60"
                  >
                    {t("checkout.promoApply")}
                  </button>
                </div>
                {promoError && (
                  <p className="text-micro mt-2 text-[#9b2c2c]">
                    {t("checkout.promoInvalid")}
                  </p>
                )}
                {promoCalc.promo && (
                  <p className="text-micro mt-2 italic text-ink-soft">
                    {promoCalc.promo.label}
                  </p>
                )}

                <dl className="mt-6 border-t border-[#e5e5e5] pt-4">
                  <div className="flex justify-between py-1">
                    <dt className="text-micro text-ink-soft">
                      {t("checkout.subtotal")}
                    </dt>
                    <dd className="font-sans text-sm text-ink">
                      {formatPrice(subtotal)}
                    </dd>
                  </div>
                  {promoCalc.promo && (
                    <div className="flex justify-between py-1">
                      <dt className="text-micro text-ink-soft">
                        {t("checkout.discount")}
                      </dt>
                      <dd className="font-sans text-sm text-ink">
                        −{formatPrice(promoCalc.discountMinor)}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between py-1">
                    <dt className="text-micro text-ink-soft">
                      {t("checkout.shipping")}
                    </dt>
                    <dd className="font-sans text-sm text-ink">
                      {t("checkout.complimentary")}
                    </dd>
                  </div>
                </dl>
              </div>
            </details>

            {/* Form column — left on desktop, middle on mobile */}
            <section className="md:order-1 md:pr-12 lg:pr-16">
              <Elements
                stripe={stripePromise}
                options={{
                  mode: "payment",
                  amount: chargeAmount,
                  currency: displayCurrency.toLowerCase(),
                  appearance: ELEMENTS_APPEARANCE,
                }}
              >
                <CheckoutForm
                  promoCode={promoCode}
                  displayTotal={displayTotal}
                  formatPrice={formatPrice}
                  displayCurrency={displayCurrency}
                  displayRate={displayRate}
                />
              </Elements>
            </section>

            {/* Mobile trust footer — only on mobile, after the Pay button.
                Same copy as the desktop right column but stacked at the
                bottom of the page where it can't push the form down. */}
            <div className="flex flex-col gap-8 border-t border-[#e5e5e5] pt-10 md:hidden">
              <div>
                <h3 className="font-sans text-lg text-ink">
                  {t("checkout.assistTitle")}
                </h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink-soft">
                  {t("checkout.assistBody")}
                </p>
                <Link
                  href={lhref("/contact")}
                  className="text-micro mt-4 inline-block border border-ink px-5 py-3 text-ink transition-colors hover:bg-ink hover:text-ground"
                >
                  {t("checkout.assistCta")}
                </Link>
              </div>
              <div>
                <h3 className="font-sans text-lg text-ink">
                  {t("checkout.secureTitle")}
                </h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink-soft">
                  {t("checkout.secureBody")}
                </p>
              </div>
              <div>
                <h3 className="font-sans text-lg text-ink">
                  {t("checkout.returnsTitle")}
                </h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink-soft">
                  {t("checkout.returnsBody")}
                </p>
              </div>
            </div>

            {/* Desktop sticky aside — order summary + assurance panel.
                Hidden on mobile; the compact summary above + trust footer
                below cover the same surface area without the long scroll. */}
            <aside className="hidden md:order-2 md:block md:sticky md:top-0 md:self-start md:h-screen md:overflow-y-auto md:border-l md:border-[#e5e5e5] md:py-20 md:pl-12 lg:pl-16">
              <h2 className="font-sans text-3xl text-ink">
                {t("checkout.orderTitle")}
              </h2>

              <ul className="mt-10 flex flex-col gap-6 border-b border-[#e5e5e5] pb-6">
                {items.map((item) => (
                  <li key={item.slug} className="flex items-baseline gap-4">
                    <span className="flex-1 font-sans text-base text-ink">
                      {item.name}
                      {item.quantity > 1 && (
                        <span className="text-micro ml-2 text-ink-muted">
                          ×{item.quantity}
                        </span>
                      )}
                    </span>
                    <span className="font-sans text-sm text-ink-soft">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Promo */}
              <div className="mt-6 flex items-end gap-3">
                <div className="flex flex-1 flex-col gap-2">
                  <label htmlFor="promo" className="text-micro text-ink-muted">
                    {t("checkout.promoLabel")}
                  </label>
                  <input
                    id="promo"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value)
                      setPromoError(false)
                    }}
                    placeholder={t("checkout.promoPlaceholder")}
                    className="border-b border-[#e5e5e5] bg-transparent pb-2 font-sans text-base uppercase text-ink outline-none transition-colors focus:border-ink"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyPromo}
                  className="text-micro pb-2 text-ink-soft underline underline-offset-4 transition-opacity hover:opacity-60"
                >
                  {t("checkout.promoApply")}
                </button>
              </div>
              {promoError && (
                <p className="text-micro mt-2 text-[#9b2c2c]">
                  {t("checkout.promoInvalid")}
                </p>
              )}
              {promoCalc.promo && (
                <p className="text-micro mt-2 italic text-ink-soft">
                  {promoCalc.promo.label}
                </p>
              )}

              <dl className="mt-8 border-t border-[#e5e5e5] pt-6">
                <div className="flex justify-between py-1.5">
                  <dt className="text-micro text-ink-soft">
                    {t("checkout.subtotal")}
                  </dt>
                  <dd className="font-sans text-sm text-ink">
                    {formatPrice(subtotal)}
                  </dd>
                </div>
                {promoCalc.promo && (
                  <div className="flex justify-between py-1.5">
                    <dt className="text-micro text-ink-soft">
                      {t("checkout.discount")}
                    </dt>
                    <dd className="font-sans text-sm text-ink">
                      −{formatPrice(promoCalc.discountMinor)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between py-1.5">
                  <dt className="text-micro text-ink-soft">
                    {t("checkout.shipping")}
                  </dt>
                  <dd className="font-sans text-sm text-ink">
                    {t("checkout.complimentary")}
                  </dd>
                </div>
                <div className="mt-3 flex justify-between border-t border-[#e5e5e5] pt-4">
                  <dt className="text-micro text-ink">{t("checkout.total")}</dt>
                  <dd className="font-sans text-xl text-ink">
                    {formatPrice(displayTotal)}
                  </dd>
                </div>
              </dl>

              {/* Assurance panel — Polène-style trust block */}
              <div className="mt-10 border-t border-[#e5e5e5] pt-8">
                <h3 className="font-sans text-lg text-ink">
                  {t("checkout.assistTitle")}
                </h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink-soft">
                  {t("checkout.assistBody")}
                </p>
                <Link
                  href={lhref("/contact")}
                  className="text-micro mt-5 inline-block border border-ink px-5 py-3 text-ink transition-colors hover:bg-ink hover:text-ground"
                >
                  {t("checkout.assistCta")}
                </Link>
              </div>

              <div className="mt-8">
                <h3 className="font-sans text-lg text-ink">
                  {t("checkout.secureTitle")}
                </h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink-soft">
                  {t("checkout.secureBody")}
                </p>
              </div>

              <div className="mt-8">
                <h3 className="font-sans text-lg text-ink">
                  {t("checkout.returnsTitle")}
                </h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink-soft">
                  {t("checkout.returnsBody")}
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}

function CheckoutForm({
  promoCode,
  displayTotal,
  formatPrice,
  displayCurrency,
  displayRate,
}: {
  promoCode: string | null
  displayTotal: number
  formatPrice: (cents: number) => string
  displayCurrency: string
  displayRate: number
}) {
  const stripe = useStripe()
  const elements = useElements()
  const { items, subtotal } = useCart()
  const t = useT()

  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function confirmFromForm(
    formEl: HTMLFormElement | null,
    express?: ExpressCustomer | null,
  ) {
    if (!stripe || !elements) return
    if (submitting) return
    setSubmitting(true)
    setErrorMessage(null)

    try {
      // Stripe validates the PaymentElement state. If the card is incomplete
      // (or wallet not yet selected), submit() returns an error and the
      // PaymentElement renders the invalid field inline — no PaymentIntent
      // gets created.
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setErrorMessage(submitError.message || t("checkout.payError"))
        setSubmitting(false)
        return
      }

      const formData = formEl ? new FormData(formEl) : new FormData()
      const get = (k: string) => String(formData.get(k) || "").trim()
      const customer = express ?? {
        email: get("email"),
        firstName: get("firstName"),
        lastName: get("lastName"),
        address: get("address"),
        city: get("city"),
        zip: get("zip"),
        country: get("country"),
        state: get("state"),
      }

      trackPixelEvent("AddPaymentInfo", {
        value: Math.round((subtotal * displayRate) / 100),
        currency: displayCurrency,
        content_ids: items.map((i) => i.slug),
        content_type: "product",
      })

      // Create the PaymentIntent now — server has authoritative pricing,
      // re-validates the cart, applies the promo. We park the pi_* in a
      // cookie so /checkout/success can confirm it on return even if the
      // return_url query param is stripped.
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: "",
            slug: i.slug,
            quantity: i.quantity,
          })),
          promoCode: promoCode ?? undefined,
          customer,
          tracking: getMetaTracking(),
        }),
      })
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail?.detail || "Failed to create payment intent")
      }
      const data = (await res.json()) as {
        orderId?: string
        clientSecret?: string
      }
      if (!data.clientSecret || !data.orderId) {
        throw new Error("Missing client secret")
      }
      document.cookie = `${PENDING_ORDER_COOKIE}=${encodeURIComponent(
        data.orderId,
      )}; path=/; max-age=3600; samesite=lax; secure`

      const fullName = `${customer.firstName} ${customer.lastName}`.trim()
      const siteOrigin =
        typeof window !== "undefined" ? window.location.origin : ""

      // Wallet (Apple/Google Pay) payments already carry billing + shipping on
      // the selected payment method via `elements` — overriding billing_details
      // there can conflict, so for express we pass only the return_url and let
      // the wallet's data flow through. The form path sets billing + shipping
      // from the fields the shopper typed.
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret: data.clientSecret,
        confirmParams: express
          ? { return_url: `${siteOrigin}/checkout/success` }
          : {
              return_url: `${siteOrigin}/checkout/success`,
              payment_method_data: {
                billing_details: {
                  name: fullName || undefined,
                  email: customer.email || undefined,
                  address: {
                    line1: customer.address || undefined,
                    city: customer.city || undefined,
                    state: customer.state || undefined,
                    postal_code: customer.zip || undefined,
                    country: customer.country || undefined,
                  },
                },
              },
              shipping:
                fullName && customer.address
                  ? {
                      name: fullName,
                      address: {
                        line1: customer.address,
                        city: customer.city || undefined,
                        state: customer.state || undefined,
                        postal_code: customer.zip || undefined,
                        country: customer.country || undefined,
                      },
                    }
                  : undefined,
            },
      })

      // confirmPayment only returns when payment fails (or 3DS modal closes
      // without completing). On success Stripe navigates the browser to
      // return_url — code below this line never runs in the happy path.
      if (error) {
        setErrorMessage(error.message || t("checkout.payError"))
        setSubmitting(false)
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : t("checkout.payError"),
      )
      setSubmitting(false)
    }
  }

  // ExpressCheckoutElement intercepts wallet taps and fires its own callback
  // — we wire it through the same confirm path so a Pay-with-Apple shopper
  // hits the same metadata, the same PaymentIntent, the same persistence.
  const formRef = useRef<HTMLFormElement>(null)
  async function handleExpressConfirm(
    event: StripeExpressCheckoutElementConfirmEvent,
  ) {
    // Pull the contact + address the wallet collected instead of the (empty)
    // form fields, so wallet orders are fulfillable and the customer gets a
    // confirmation email.
    const bd = event.billingDetails
    const ba = bd?.address
    const sa = event.shippingAddress?.address ?? ba
    const name = event.shippingAddress?.name || bd?.name || ""
    const [firstName, ...rest] = name.split(" ")
    const express: ExpressCustomer = {
      email: bd?.email || "",
      firstName: firstName || "",
      lastName: rest.join(" "),
      address: sa?.line1 || ba?.line1 || "",
      city: sa?.city || ba?.city || "",
      state: sa?.state || ba?.state || "",
      zip: sa?.postal_code || ba?.postal_code || "",
      country: sa?.country || ba?.country || "",
    }
    await confirmFromForm(formRef.current, express)
  }

  return (
    <form
      ref={formRef}
      autoComplete="on"
      onSubmit={async (e) => {
        e.preventDefault()
        await confirmFromForm(e.currentTarget)
      }}
      className="flex flex-col gap-12"
    >
      {/* Express Checkout — wallet buttons at the top, Polène-style */}
      <ExpressCheckoutElement
        options={{
          layout: { maxColumns: 2, maxRows: 1 },
          buttonHeight: 48,
        }}
        onClick={({ resolve }) =>
          resolve({
            emailRequired: true,
            billingAddressRequired: true,
            shippingAddressRequired: true,
            shippingRates: [
              {
                id: "free",
                displayName: "Complimentary worldwide",
                amount: 0,
              },
            ],
          })
        }
        onConfirm={handleExpressConfirm}
      />

      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-[#e5e5e5]" />
        <span className="text-micro text-ink-muted">{t("checkout.or")}</span>
        <span className="h-px flex-1 bg-[#e5e5e5]" />
      </div>

      {/* Contact */}
      <section>
        <h2 className="font-sans text-2xl text-ink">
          {t("checkout.contactTitle")}
        </h2>
        <div className="mt-6 flex flex-col gap-6">
          <Field
            label={t("checkout.email")}
            id="email"
            type="email"
            required
            inputMode="email"
            autoComplete="email"
          />
        </div>
      </section>

      {/* Delivery */}
      <section>
        <h2 className="font-sans text-2xl text-ink">
          {t("checkout.deliveryTitle")}
        </h2>
        <div className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-5">
            <Field
              label={t("checkout.firstName")}
              id="firstName"
              required
              autoComplete="given-name"
            />
            <Field
              label={t("checkout.lastName")}
              id="lastName"
              required
              autoComplete="family-name"
            />
          </div>
          <Field
            label={t("checkout.address")}
            id="address"
            required
            autoComplete="street-address"
          />
          <div className="grid grid-cols-3 gap-5">
            <Field
              label={t("checkout.city")}
              id="city"
              required
              autoComplete="address-level2"
            />
            <Field
              label={t("checkout.state")}
              id="state"
              autoComplete="address-level1"
            />
            <Field
              label={t("checkout.zip")}
              id="zip"
              required
              autoComplete="postal-code"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="country" className="text-micro text-ink-muted">
              {t("checkout.country")}
            </label>
            <select
              id="country"
              name="country"
              required
              defaultValue=""
              autoComplete="country"
              className="border-b border-[#e5e5e5] bg-transparent pb-2 font-sans text-lg text-ink outline-none transition-colors focus:border-ink"
            >
              <option value="" disabled>
                {t("checkout.countryPlaceholder")}
              </option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Payment — Stripe's unified card/wallet picker */}
      <section>
        <h2 className="font-sans text-2xl text-ink">
          {t("checkout.payTitle")}
        </h2>
        <p className="text-micro mt-3 text-ink-muted">
          {t("checkout.payNote")}
        </p>
        <div className="mt-6">
          <PaymentElement
            options={{
              layout: "tabs",
              wallets: { applePay: "never", googlePay: "never" },
            }}
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={submitting || !stripe || !elements}
        className={`text-micro w-full py-5 text-ground transition-opacity ${
          submitting || !stripe || !elements
            ? "cursor-wait bg-ink/40"
            : "bg-ink hover:opacity-85"
        }`}
      >
        {submitting
          ? t("checkout.processing")
          : `${t("checkout.payNow")} · ${formatPrice(displayTotal)}`}
      </button>

      {errorMessage && (
        <p className="text-micro text-center text-[#9b2c2c]">{errorMessage}</p>
      )}

      <p className="text-micro text-center text-ink-muted">
        {t("checkout.payTerms")}
      </p>
    </form>
  )
}

function Field({
  label,
  id,
  type = "text",
  required = false,
  autoComplete,
  inputMode,
}: {
  label: string
  id: string
  type?: string
  required?: boolean
  autoComplete?: string
  inputMode?: "text" | "email" | "tel" | "url" | "numeric" | "decimal" | "search"
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-micro text-ink-muted">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        autoComplete={autoComplete ?? (id === "email" ? "email" : undefined)}
        inputMode={inputMode}
        className="border-b border-[#e5e5e5] bg-transparent pb-2 font-sans text-lg text-ink outline-none transition-colors focus:border-ink"
      />
    </div>
  )
}
