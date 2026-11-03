import { describe, expect, it } from 'vitest'

import { formatDate, formatNumber, formatPercent, formatQuantity, formatSigned } from '@/lib/format'

describe('format', () => {
  it('groups thousands per locale', () => {
    expect(formatNumber(1020, 'ro')).toBe('1.020')
    expect(formatNumber(238000, 'ro')).toBe('238.000')
    expect(formatNumber(1020, 'en')).toBe('1,020')
  })

  it('uses the decimal comma in Romanian', () => {
    expect(formatNumber(212.5, 'ro')).toBe('212,5')
    expect(formatPercent(12.5, 'ro')).toBe('12,5%')
    expect(formatPercent(12.5, 'en')).toBe('12.5%')
  })

  it('joins number and unit with a no-break space', () => {
    expect(formatQuantity(1020, 'lei/t', 'ro')).toBe('1.020 lei/t')
  })

  it('always shows a sign, with a true minus', () => {
    expect(formatSigned(15, 'ro')).toBe('+15')
    expect(formatSigned(-10, 'ro')).toBe('−10')
    expect(formatSigned(0, 'ro')).toBe('±0')
  })

  it('formats dates the Romanian way', () => {
    const date = new Date('2026-11-02T12:00:00Z')
    expect(formatDate(date, 'ro')).toBe('2 nov. 2026')
    expect(formatDate(date, 'en')).toBe('2 Nov 2026')
  })
})
