export type InventoryStateInput = {
  availableQuantity: number | null | undefined
  orderedQuantity: number | null | undefined
}

export type InventoryStatePatch = {
  status: 'available' | 'sold'
  available_quantity: number
}

export function nextInventoryState(input: InventoryStateInput): InventoryStatePatch
export function shouldMarkCheckoutConverted(input: { persistedOrder: boolean }): boolean
export function abandonedCheckoutPatchForOrderResult(input: { persistedOrder: boolean }): { status: 'converted' } | null
