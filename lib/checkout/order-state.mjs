function normalizeQuantity(value, fallback = 1) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.floor(n))
}

export function nextInventoryState({ availableQuantity, orderedQuantity }) {
  const available = normalizeQuantity(availableQuantity, 0)
  const ordered = normalizeQuantity(orderedQuantity, 1)
  const remaining = Math.max(0, available - ordered)
  return {
    status: remaining > 0 ? 'available' : 'sold',
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
