import test from 'node:test'
import assert from 'node:assert/strict'

import {
  nextInventoryState,
  abandonedCheckoutPatchForOrderResult,
  shouldMarkCheckoutConverted,
} from '../lib/checkout/order-state.mjs'

test('keeps multi-quantity SKU available and decrements stock by ordered quantity', () => {
  assert.deepEqual(nextInventoryState({ availableQuantity: 12, orderedQuantity: 1 }), {
    status: 'available',
    available_quantity: 11,
  })
})

test('marks SKU sold only when ordered quantity exhausts stock', () => {
  assert.deepEqual(nextInventoryState({ availableQuantity: 1, orderedQuantity: 1 }), {
    status: 'sold',
    available_quantity: 0,
  })
})

test('never allows negative stock on oversell edge case', () => {
  assert.deepEqual(nextInventoryState({ availableQuantity: 1, orderedQuantity: 3 }), {
    status: 'sold',
    available_quantity: 0,
  })
})

test('does not convert abandoned checkout before order persistence succeeds', () => {
  assert.equal(shouldMarkCheckoutConverted({ persistedOrder: false }), false)
  assert.equal(abandonedCheckoutPatchForOrderResult({ persistedOrder: false }), null)
})

test('converts abandoned checkout only after order persistence succeeds', () => {
  assert.equal(shouldMarkCheckoutConverted({ persistedOrder: true }), true)
  assert.deepEqual(abandonedCheckoutPatchForOrderResult({ persistedOrder: true }), {
    status: 'converted',
  })
})
