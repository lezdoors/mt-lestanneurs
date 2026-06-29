"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
    setHydrated(true)
  }, [])

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
      addItem,
      removeItem,
      setQuantity,
      openCart,
      closeCart,
    }
  }, [items, isOpen, addItem, removeItem, setQuantity, openCart, closeCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
