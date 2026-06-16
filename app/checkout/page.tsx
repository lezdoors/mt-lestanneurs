"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart"
import { useFormatPrice, useCurrency } from "@/lib/currency-client"
import { useHref, useT } from "@/lib/i18n-client"
import { trackPixelEvent } from "@/components/seo/meta-pixel"
import { trackGA4Event } from "@/components/seo/ga4"

// Checkout — shipping details + order summary wired to the live cart,
// payment via Revolut Acquiring (same flow that ran on the previous
// site): create order server-side, mount the Revolut popup, then land
// on /checkout/success which verifies + persists the order server-side.

const REVOLUT_EMBED_SRC = "https://merchant.revolut.com/embed.js"

declare global {
  interface Window {
    RevolutCheckout?: (
      token: string,
      mode?: "prod" | "sandbox",
    ) => Promise<RevolutCheckoutInstance>
  }
}

interface RevolutCheckoutInstance {
  payWithPopup: (options: {
    name?: string
    email?: string
    shippingAddress?: {
      streetLine1?: string
      city?: string
      countryCode?: string
      postcode?: string
    }
    onSuccess: () => void
    onError: (error: { message?: string }) => void
    onCancel?: () => void
  }) => void
  destroy?: () => void
}

function loadRevolutEmbed(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("server"))
  if (window.RevolutCheckout) return Promise.resolve()
  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${REVOLUT_EMBED_SRC}"]`,
  )
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve())
      existing.addEventListener("error", () =>
        reject(new Error("embed load failed")),
      )
    })
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement("script")
    s.src = REVOLUT_EMBED_SRC
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error("embed load failed"))
    document.head.appendChild(s)
  })
}

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

type Status = "loading" | "ready" | "error"

export default function CheckoutPage() {
  const { items, subtotal } = useCart()
  const t = useT()
  const lhref = useHref()
  const formatPrice = useFormatPrice()
  const { currency: displayCurrency, rate: displayRate } = useCurrency()
  const router = useRouter()

  const [status, setStatus] = useState<Status>("loading")
  const [token, setToken] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const initiatedRef = useRef<string | null>(null)

  const revolutMode =
    process.env.NEXT_PUBLIC_REVOLUT_MODE === "sandbox" ? "sandbox" : "prod"

  // Create the Revolut order as soon as the cart is known; recreate when
  // the cart contents change so the charged amount always matches.
  useEffect(() => {
    if (items.length === 0) return
    let cancelled = false
    setStatus("loading")
    ;(async () => {
      try {
        await loadRevolutEmbed()
        const res = await fetch("/api/checkout/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({
              product_id: "",
              slug: i.slug,
              quantity: i.quantity,
            })),
            tracking: getMetaTracking(),
          }),
        })
        if (!res.ok) throw new Error("Failed to create checkout order")
        const data = (await res.json()) as { token: string; orderId: string }
        if (cancelled) return
        setToken(data.token)
        setOrderId(data.orderId)
        setStatus("ready")
      } catch {
        if (!cancelled) setStatus("error")
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, subtotal])

  // InitiateCheckout — once per created order.
  useEffect(() => {
    if (status !== "ready" || !orderId || initiatedRef.current === orderId)
      return
    initiatedRef.current = orderId
    const value = Math.round((subtotal * displayRate) / 100)
    trackGA4Event("begin_checkout", { currency: displayCurrency, value })
    trackPixelEvent("InitiateCheckout", {
      value,
      currency: displayCurrency,
      content_ids: items.map((i) => i.slug),
      content_type: "product",
      num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    })
  }, [status, orderId, subtotal, items, displayRate, displayCurrency])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!token || !orderId || !window.RevolutCheckout) return
    setSubmitting(true)
    setErrorMessage(null)

    const form = new FormData(e.currentTarget)
    const get = (k: string) => String(form.get(k) || "").trim()
    const email = get("email")
    const name = `${get("firstName")} ${get("lastName")}`.trim()

    try {
      trackPixelEvent("AddPaymentInfo", {
        value: Math.round((subtotal * displayRate) / 100),
        currency: displayCurrency,
        content_ids: items.map((i) => i.slug),
        content_type: "product",
      })
      const RC = await window.RevolutCheckout(token, revolutMode)
      RC.payWithPopup({
        email,
        name,
        shippingAddress: {
          streetLine1: get("address") || undefined,
          city: get("city") || undefined,
          postcode: get("zip") || undefined,
        },
        onSuccess: () => {
          router.push(`/checkout/success?revolut_order_id=${orderId}`)
        },
        onError: (err) => {
          setErrorMessage(err.message || t("checkout.payError"))
          setSubmitting(false)
        },
        onCancel: () => setSubmitting(false),
      })
    } catch {
      setErrorMessage(t("checkout.payError"))
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-ground">
      <header className="border-b border-hairline">
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
            <h1 className="font-serif text-3xl text-ink">
              {t("checkout.emptyTitle")}
            </h1>
            <Link href={lhref("/shop")} className="link-caps text-ink">
              {t("cart.viewCollection")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-14 md:grid-cols-2 md:gap-20">
            {/* Shipping form */}
            <section className="order-2 md:order-1">
              <h1 className="font-serif text-3xl text-ink">{t("checkout.shippingTitle")}</h1>
              <form className="mt-10 flex flex-col gap-6" onSubmit={handleSubmit}>
                <Field label={t("checkout.email")} id="email" type="email" required />
                <div className="grid grid-cols-2 gap-5">
                  <Field label={t("checkout.firstName")} id="firstName" required autoComplete="given-name" />
                  <Field label={t("checkout.lastName")} id="lastName" required autoComplete="family-name" />
                </div>
                <Field label={t("checkout.address")} id="address" autoComplete="street-address" />
                <div className="grid grid-cols-3 gap-5">
                  <Field label={t("checkout.city")} id="city" autoComplete="address-level2" />
                  <Field label={t("checkout.zip")} id="zip" autoComplete="postal-code" />
                  <Field label={t("checkout.country")} id="country" autoComplete="country-name" />
                </div>
                <button
                  type="submit"
                  disabled={status !== "ready" || submitting}
                  className={`text-micro mt-4 w-full py-5 text-ground transition-opacity ${
                    status === "ready" && !submitting
                      ? "bg-ink hover:opacity-85"
                      : "cursor-wait bg-ink/40"
                  }`}
                >
                  {submitting
                    ? t("checkout.processing")
                    : `${t("checkout.continue")} · ${formatPrice(subtotal)}`}
                </button>
                {status === "error" && (
                  <p className="text-micro text-center text-[#9b2c2c]">
                    {t("checkout.sessionError")}
                  </p>
                )}
                {errorMessage && (
                  <p className="text-micro text-center text-[#9b2c2c]">
                    {errorMessage}
                  </p>
                )}
                <p className="text-micro text-center text-ink-muted">
                  {t("checkout.payNote")}
                </p>
              </form>
            </section>

            {/* Order summary */}
            <section className="order-1 md:order-2">
              <h2 className="font-serif text-3xl text-ink">{t("checkout.orderTitle")}</h2>
              <ul className="mt-10 flex flex-col gap-7">
                {items.map((item) => (
                  <li key={item.slug} className="flex gap-5">
                    <div className="relative h-24 w-20 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="img-float absolute inset-0 h-full w-full object-contain p-1"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <p className="font-serif text-lg text-ink">{item.name}</p>
                      <p className="text-micro mt-1 text-ink-muted">
                        {t("checkout.qty")} {item.quantity}
                      </p>
                    </div>
                    <p className="self-center font-sans text-sm text-ink-soft">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <dl className="mt-10 border-t border-hairline pt-6">
                <div className="flex justify-between py-1.5">
                  <dt className="text-micro text-ink-soft">{t("checkout.subtotal")}</dt>
                  <dd className="font-sans text-sm text-ink">
                    {formatPrice(subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between py-1.5">
                  <dt className="text-micro text-ink-soft">{t("checkout.shipping")}</dt>
                  <dd className="font-sans text-sm text-ink">{t("checkout.complimentary")}</dd>
                </div>
                <div className="mt-3 flex justify-between border-t border-hairline pt-4">
                  <dt className="text-micro text-ink">{t("checkout.total")}</dt>
                  <dd className="font-serif text-xl text-ink">
                    {formatPrice(subtotal)}
                  </dd>
                </div>
              </dl>

              <p className="mt-8 font-sans text-[11px] leading-relaxed text-ink-muted">
                {t("checkout.note")}
              </p>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

function Field({
  label,
  id,
  type = "text",
  required = false,
  autoComplete,
}: {
  label: string
  id: string
  type?: string
  required?: boolean
  autoComplete?: string
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
        className="border-b border-hairline bg-transparent pb-2 font-serif text-lg text-ink outline-none transition-colors focus:border-ink"
      />
    </div>
  )
}
