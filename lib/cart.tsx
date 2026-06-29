"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

export interface CartItem {
  slug: string
  name: string
  price: number // cents
  image: string
  quantity: number
  maxQuantity?: number // stock cap; undefined = no client-side cap
}

interface CartContextValue {
  items: CartItem[]
  count: number
  subtotal: number
  isOpen: boolean
  // False until cart prices have been re-validated against the server on load.
  // Checkout must not show a chargeable amount before this is true (a stale
  // localStorage cart could otherwise display a price that differs from what
  // the server will actually charge).
  pricesReady: boolean
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (slug: string) => void
  setQuantity: (slug: string, quantity: number) => void
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = "mt-cart-v1"

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [pricesReady, setPricesReady] = useState(false)
  const repricedRef = useRef(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
    setHydrated(true)
  }, [])

  // Re-price the cart against the server the moment it hydrates. The stored
  // price is treated as untrusted (it can be stale from an older build, in the
  // wrong unit, or reflect a price change) — we overwrite every line with the
  // authoritative cents price, clamp quantity to current stock, and drop items
  // that are no longer purchasable. This guarantees the displayed total and the
  // Stripe Elements / wallet amount always equal what the server will charge.
  useEffect(() => {
    if (!hydrated || repricedRef.current) return
    repricedRef.current = true
    const slugs = items.map((i) => i.slug)
    if (slugs.length === 0) {
      setPricesReady(true)
      return
    }
    let cancelled = false
    const controller = new AbortController()
    // Never let a hung request leave checkout stuck on the skeleton — bail to
    // fail-open (keep stored prices, set pricesReady) after 8s.
    const timer = setTimeout(() => controller.abort(), 8000)
    ;(async () => {
      try {
        const res = await fetch("/api/cart/price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slugs }),
          signal: controller.signal,
        })
        if (res.ok) {
          const data = (await res.json()) as {
            items: {
              slug: string
              price: number
              available_quantity: number | null
              available: boolean
            }[]
          }
          const bySlug = new Map(data.items.map((p) => [p.slug, p]))
          if (!cancelled) {
            setItems((prev) =>
              prev
                .map((i) => {
                  const p = bySlug.get(i.slug)
                  if (!p || !p.available) return null
                  const cap =
                    typeof p.available_quantity === "number"
                      ? p.available_quantity
                      : undefined
                  return {
                    ...i,
                    price: p.price,
                    maxQuantity: cap,
                    quantity:
                      typeof cap === "number"
                        ? Math.min(i.quantity, cap)
                        : i.quantity,
                  }
                })
                .filter((i): i is CartItem => i !== null),
            )
          }
        }
      } catch {
        /* keep the existing cart if the network call fails or times out */
      } finally {
        clearTimeout(timer)
        if (!cancelled) setPricesReady(true)
      }
    })()
    return () => {
      cancelled = true
      clearTimeout(timer)
      controller.abort()
      // Allow a fresh reprice on remount (e.g. React StrictMode double-invoke
      // in dev) so pricesReady can't deadlock on the skeleton.
      repricedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items, hydrated])

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      // Out-of-stock guard. A maxQuantity of 0 means there is nothing to sell;
      // adding it would seed the cart with a line that dead-ends at checkout
      // (and the Math.min cap below would otherwise zero-out a re-add).
      if (typeof item.maxQuantity === "number" && item.maxQuantity <= 0) return prev
      const existing = prev.find((i) => i.slug === item.slug)
      if (existing) {
        // Never let a re-add push quantity past available stock — one-of-one
        // SKUs would otherwise reach qty 2 and dead-end at the payment step.
        const cap = item.maxQuantity ?? existing.maxQuantity
        const next = typeof cap === "number" ? Math.min(existing.quantity + 1, cap) : existing.quantity + 1
        return prev.map((i) =>
          i.slug === item.slug ? { ...i, quantity: next, maxQuantity: cap } : i,
        )
      }
      const startQty = typeof item.maxQuantity === "number" ? Math.min(1, item.maxQuantity) : 1
      return [...prev, { ...item, quantity: Math.max(1, startQty) }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug))
  }, [])

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.slug !== slug)
        : prev.map((i) =>
            i.slug === slug
              ? {
                  ...i,
                  quantity:
                    typeof i.maxQuantity === "number"
                      ? Math.min(quantity, i.maxQuantity)
                      : quantity,
                }
              : i,
          ),
    )
  }, [])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((acc, i) => acc + i.quantity, 0)
    const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0)
    return {
      items,
      count,
      subtotal,
      isOpen,
      pricesReady,
      addItem,
      removeItem,
      setQuantity,
      openCart,
      closeCart,
    }
  }, [items, isOpen, pricesReady, addItem, removeItem, setQuantity, openCart, closeCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
