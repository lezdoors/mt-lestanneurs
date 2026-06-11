"use client"

import Link from "next/link"
import { useCart } from "@/lib/cart"
import { formatPrice } from "@/lib/products"

// Checkout entry — shipping details + order summary wired to the live
// cart. Payment processing is intentionally not wired here; the payment
// step ships with the processor integration (approval-gated).
export default function CheckoutPage() {
  const { items, subtotal } = useCart()

  return (
    <div className="min-h-screen bg-ground">
      <header className="border-b border-hairline">
        <div className="mx-auto grid h-[72px] max-w-[1560px] grid-cols-[1fr_auto_1fr] items-center px-6 md:px-10">
          <Link
            href="/shop"
            className="text-micro text-ink-soft transition-opacity hover:opacity-60"
          >
            ← Back
          </Link>
          <Link
            href="/"
            aria-label="Maison Tanneurs home"
            className="whitespace-nowrap font-wordmark text-[14px] font-normal uppercase leading-none tracking-[0.18em] text-ink md:text-xl md:tracking-[0.24em]"
          >
            <span>Maison</span>
            <span aria-hidden className="inline-block w-[1.15ch]" />
            <span>Tanneurs</span>
          </Link>
          <p className="text-micro hidden justify-self-end text-ink-muted md:block">
            Secure checkout
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-14 md:py-20">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-8 py-24 text-center">
            <h1 className="font-serif text-3xl text-ink">
              Your bag is empty.
            </h1>
            <Link href="/shop" className="link-caps text-ink">
              View the Collection
            </Link>
          </div>
        ) : (
          <div className="grid gap-14 md:grid-cols-2 md:gap-20">
            {/* Shipping form */}
            <section className="order-2 md:order-1">
              <h1 className="font-serif text-3xl text-ink">Shipping</h1>
              <form
                className="mt-10 flex flex-col gap-6"
                onSubmit={(e) => e.preventDefault()}
              >
                <Field label="Email address" id="email" type="email" />
                <div className="grid grid-cols-2 gap-5">
                  <Field label="First name" id="firstName" />
                  <Field label="Last name" id="lastName" />
                </div>
                <Field label="Address" id="address" />
                <div className="grid grid-cols-3 gap-5">
                  <Field label="City" id="city" />
                  <Field label="Postal code" id="zip" />
                  <Field label="Country" id="country" />
                </div>
                <button
                  type="submit"
                  disabled
                  className="text-micro mt-4 w-full cursor-not-allowed bg-ink/40 py-5 text-ground"
                  title="Payment opens at launch"
                >
                  Continue to payment
                </button>
                <p className="text-micro text-center text-ink-muted">
                  Payment opens at launch.
                </p>
              </form>
            </section>

            {/* Order summary */}
            <section className="order-1 md:order-2">
              <h2 className="font-serif text-3xl text-ink">Your order</h2>
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
                        Qty {item.quantity}
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
                  <dt className="text-micro text-ink-soft">Subtotal</dt>
                  <dd className="font-sans text-sm text-ink">
                    {formatPrice(subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between py-1.5">
                  <dt className="text-micro text-ink-soft">Shipping</dt>
                  <dd className="font-sans text-sm text-ink">Complimentary</dd>
                </div>
                <div className="mt-3 flex justify-between border-t border-hairline pt-4">
                  <dt className="text-micro text-ink">Total</dt>
                  <dd className="font-serif text-xl text-ink">
                    {formatPrice(subtotal)}
                  </dd>
                </div>
              </dl>

              <p className="mt-8 font-sans text-[11px] leading-relaxed text-ink-muted">
                Every order includes tracked shipping and the house packaging.
                Returns accepted within 30 days.
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
}: {
  label: string
  id: string
  type?: string
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
        className="border-b border-hairline bg-transparent pb-2 font-serif text-lg text-ink outline-none transition-colors focus:border-ink"
      />
    </div>
  )
}
