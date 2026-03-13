import { describe, it, expect } from 'vitest'

function calcPricing(
  items: Array<{ qty: number; unitPriceCents: number }>,
  tipCents: number
): { subtotalCents: number; vatCents: number; totalCents: number } {
  const subtotalCents = items.reduce((sum, i) => sum + i.qty * i.unitPriceCents, 0)
  const vatCents = Math.floor((subtotalCents * 0.09) / 1.09)
  const totalCents = subtotalCents + tipCents
  return { subtotalCents, vatCents, totalCents }
}

describe('pricing', () => {
  it('calculates subtotal correctly', () => {
    const result = calcPricing(
      [
        { qty: 2, unitPriceCents: 350 },
        { qty: 1, unitPriceCents: 1200 },
      ],
      0
    )
    expect(result.subtotalCents).toBe(1900)
  })

  it('calculates subtotal for single item', () => {
    const result = calcPricing([{ qty: 3, unitPriceCents: 500 }], 0)
    expect(result.subtotalCents).toBe(1500)
  })

  it('calculates 9% VAT (inclusive) on simple amount', () => {
    // €10,90 incl 9% VAT → floor(1090 * 0.09 / 1.09) = floor(89.9...) = 89
    const result = calcPricing([{ qty: 1, unitPriceCents: 1090 }], 0)
    expect(result.vatCents).toBe(89)
  })

  it('calculates 9% VAT (inclusive) rounds down', () => {
    // €1,00 incl 9% → VAT = floor(100 * 0.09 / 1.09) = floor(8.256...) = 8
    const result = calcPricing([{ qty: 1, unitPriceCents: 100 }], 0)
    expect(result.vatCents).toBe(8)
  })

  it('adds tip to total', () => {
    const result = calcPricing([{ qty: 1, unitPriceCents: 1000 }], 100)
    expect(result.totalCents).toBe(1100)
  })

  it('handles zero tip', () => {
    const result = calcPricing([{ qty: 1, unitPriceCents: 1000 }], 0)
    expect(result.totalCents).toBe(1000)
  })

  it('handles empty items list', () => {
    const result = calcPricing([], 50)
    expect(result.subtotalCents).toBe(0)
    expect(result.vatCents).toBe(0)
    expect(result.totalCents).toBe(50)
  })

  it('handles multiple quantities', () => {
    const result = calcPricing(
      [
        { qty: 4, unitPriceCents: 250 },
        { qty: 2, unitPriceCents: 750 },
      ],
      200
    )
    expect(result.subtotalCents).toBe(2500)
    expect(result.totalCents).toBe(2700)
  })
})
