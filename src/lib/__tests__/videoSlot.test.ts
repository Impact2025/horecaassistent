import { describe, it, expect } from 'vitest'
import { getVideoSlot } from '../videoSlot'

const TZ = 'Europe/Amsterdam'

function makeDate(hour: number): Date {
  // Create a date at the given UTC hour that corresponds to the local hour in Amsterdam
  // Amsterdam is UTC+1 (winter) or UTC+2 (summer). Use a known winter date to keep it simple.
  const d = new Date(`2024-01-15T${String(hour).padStart(2, '0')}:00:00+01:00`)
  return d
}

describe('getVideoSlot', () => {
  it('returns ochtend for 6:00', () => {
    expect(getVideoSlot(makeDate(6), TZ)).toBe('ochtend')
  })

  it('returns ochtend for 8:00', () => {
    expect(getVideoSlot(makeDate(8), TZ)).toBe('ochtend')
  })

  it('returns ochtend for 10:00', () => {
    expect(getVideoSlot(makeDate(10), TZ)).toBe('ochtend')
  })

  it('returns lunch for 11:00', () => {
    expect(getVideoSlot(makeDate(11), TZ)).toBe('lunch')
  })

  it('returns lunch for 12:00', () => {
    expect(getVideoSlot(makeDate(12), TZ)).toBe('lunch')
  })

  it('returns lunch for 13:00', () => {
    expect(getVideoSlot(makeDate(13), TZ)).toBe('lunch')
  })

  it('returns middag for 14:00', () => {
    expect(getVideoSlot(makeDate(14), TZ)).toBe('middag')
  })

  it('returns middag for 16:00', () => {
    expect(getVideoSlot(makeDate(16), TZ)).toBe('middag')
  })

  it('returns avond for 17:00', () => {
    expect(getVideoSlot(makeDate(17), TZ)).toBe('avond')
  })

  it('returns avond for 20:00', () => {
    expect(getVideoSlot(makeDate(20), TZ)).toBe('avond')
  })

  it('returns avond for 21:00', () => {
    expect(getVideoSlot(makeDate(21), TZ)).toBe('avond')
  })

  it('returns nacht for 22:00', () => {
    expect(getVideoSlot(makeDate(22), TZ)).toBe('nacht')
  })

  it('returns nacht for 0:00 (midnight)', () => {
    expect(getVideoSlot(makeDate(0), TZ)).toBe('nacht')
  })

  it('returns nacht for 5:00', () => {
    expect(getVideoSlot(makeDate(5), TZ)).toBe('nacht')
  })
})
