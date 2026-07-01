function normalizeQuantity(value, fallback = 1) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.floor(n))
}

// Made-to-order atelier: supply is effectively unlimited, so a purchase must
// NEVER retire a SKU. Quantity decrements only as a sales counter and floors
// at 1 so the piece stays visible and buyable; status never leaves available.
export function nextInventoryState({ availableQuantity, orderedQuantity }) {
  const available = normalizeQuantity(availableQuantity, 0)
  const ordered = normalizeQuantity(orderedQuantity, 1)
  const remaining = Math.max(1, available - ordered)
  return {
    status: 'available',
    available_quantity: remaining,
  }
}

export function shouldMarkCheckoutConverted({ persistedOrder }) {
  return Boolean(persistedOrder)
}

export function abandonedCheckoutPatchForOrderResult({ persistedOrder }) {
  if (!shouldMarkCheckoutConverted({ persistedOrder })) return null
  return { status: 'converted' }
}
