"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useCart } from "@/lib/cart"
import { useFormatPrice } from "@/lib/currency-client"
import { useHref, useT } from "@/lib/i18n-client"

export function CartDrawer() {
  const { items, subtotal, isOpen, closeCart, removeItem, setQuantity } =
    useCart()
  const t = useT()
  const formatPrice_ = useFormatPrice()
  const href = useHref()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [isOpen, closeCart])

  return (
    <div
      className={`fixed inset-0 z-[60] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-ink/30 transition-opacity duration-400 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute bottom-0 right-0 top-0 flex w-full max-w-[420px] flex-col bg-ground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label={t("cart.title")}
      >
        <div className="flex items-center justify-between border-b border-hairline px-7 py-6">
          <h2 className="font-serif text-2xl text-ink">{t("cart.title")}</h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label={t("cart.close")}
            className="text-micro text-ink-soft transition-opacity hover:opacity-50"
          >
            {t("cart.close")}
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-8 px-7">
            <p className="font-serif text-lg italic text-ink-muted">
              {t("cart.empty")}
            </p>
            <Link
              href={href("/shop")}
              onClick={closeCart}
              className="link-caps text-ink"
            >
              {t("cart.viewCollection")}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-7 py-8">
              <ul className="flex flex-col gap-8">
                {items.map((item) => (
                  <li key={item.slug} className="flex gap-5">
                    <Link
                      href={href(`/product/${item.slug}`)}
                      onClick={closeCart}
                      className="relative h-28 w-24 shrink-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="img-float absolute inset-0 h-full w-full object-contain p-1"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <p className="font-serif text-lg leading-snug text-ink">
                        {item.name}
                      </p>
                      <p className="mt-1 font-sans text-[11px] tracking-[0.08em] text-ink-muted">
                        {formatPrice_(item.price)}
                      </p>
                      <div className="mt-auto flex items-center gap-4 pt-3">
                        <button
                          type="button"
                          aria-label={t("cart.decrease")}
                          onClick={() => setQuantity(item.slug, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center border border-hairline text-ink transition-opacity hover:opacity-50"
                        >
                          −
                        </button>
                        <span className="w-4 text-center font-sans text-sm text-ink">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={t("cart.increase")}
                          onClick={() => setQuantity(item.slug, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center border border-hairline text-ink transition-opacity hover:opacity-50"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.slug)}
                          className="text-micro ml-auto text-ink-muted transition-opacity hover:opacity-50"
                        >
                          {t("cart.remove")}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-hairline px-7 py-6">
              <div className="flex items-baseline justify-between">
                <span className="text-micro text-ink-soft">{t("cart.subtotal")}</span>
                <span className="font-serif text-xl text-ink">
                  {formatPrice_(subtotal)}
                </span>
              </div>
              <p className="mt-2 font-sans text-[11px] leading-relaxed text-ink-muted">
                {t("cart.note")}
              </p>
              <p className="text-micro mt-5 text-center text-tobacco">
                {t("cart.offer")}
              </p>
              <Link
                href={href("/checkout")}
                onClick={closeCart}
                className="mt-3 block w-full bg-ink py-4 text-center text-micro text-ground transition-opacity hover:opacity-85"
              >
                {t("cart.checkout")}
              </Link>
              <Link
                href={href("/shop")}
                onClick={closeCart}
                className="group mx-auto mt-5 block w-fit"
              >
                <span className="text-micro relative uppercase text-ink-soft transition-colors duration-300 group-hover:text-ink">
                  {t("cart.continue")}
                  {/* resting underline */}
                  <span className="absolute -bottom-1 left-0 h-px w-full bg-current opacity-40" />
                  {/* animated wipe on hover */}
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100" />
                </span>
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
