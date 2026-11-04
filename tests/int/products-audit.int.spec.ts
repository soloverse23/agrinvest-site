import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { auditProduct } from '../../scripts/products/audit'
import { productFile, type ProductFile } from '../../scripts/products/schema'
import { loadProductFiles } from '../../scripts/products/apply'
import { markdownText, hashOf } from '../../scripts/products/view'

const ctx = {
  brands: new Set(['bayer']),
  targets: new Set([
    'stir',
    'loboda',
    'spanac-salbatic',
    'iarba-barboasa',
    'turita',
    'zarna',
    'teisor',
    'ciumafaie',
    'mohor',
    'costrei',
    'meisor',
    'coada-vulpii',
    'ardeiul-broastei',
  ]),
  today: new Date('2026-11-04'),
}
const adengo = () =>
  productFile.parse(JSON.parse(readFileSync('data/products/adengo.json', 'utf8'))) as ProductFile

describe('product enrichment rules', () => {
  it('accepts a complete file and names what is still missing', () => {
    const a = auditProduct(adengo(), 'protection', ctx)
    expect(a.errors).toEqual([])
    expect(a.gaps).toContain('registration validity date')
    expect(a.flags).toEqual([])
  })

  it('flags a protection product with no registration, or an expired one', () => {
    const none = adengo()
    delete none.protection!.registrationNumber
    expect(auditProduct(none, 'protection', ctx).flags[0]).toMatch(/REGISTRATION MISSING/)
    const expired = adengo()
    expired.protection!.registrationValidUntil = '2025-01-01'
    expect(auditProduct(expired, 'protection', ctx).flags[0]).toMatch(/REGISTRATION EXPIRED/)
  })

  it('rejects cedilla letters, unknown references and old-shop-only protection data', () => {
    const f = adengo()
    f.text.ro.summary = 'Produs ţintit.'
    f.brand = 'nu-exista'
    f.crops = ['nu-exista']
    f.sources.doses = [{ url: 'https://example.org', kind: 'old-shop', retrieved: '2026-11-04' }]
    const errors = auditProduct(f, 'protection', ctx).errors.join('\n')
    expect(errors).toMatch(/cedilla/)
    expect(errors).toMatch(/brand "nu-exista"/)
    expect(errors).toMatch(/unknown crop key/)
    expect(errors).toMatch(/not the old shop/)
  })

  it('requires a named reason for every gap', () => {
    const f = adengo()
    f.gaps = []
    expect(auditProduct(f, 'protection', ctx).errors.join()).toMatch(/none named/)
  })

  it('never lets a file confirm anything: its status is fixed', () => {
    expect(() => productFile.parse({ ...adengo(), verification: { doses: 'confirmed' } })).toThrow()
  })
})

describe('enrichment files on disk', () => {
  it('all parse and use comma-below diacritics', () => {
    const files = loadProductFiles()
    expect(files.length).toBeGreaterThan(0)
    for (const f of files) expect(JSON.stringify(f)).not.toMatch(/[şţŞŢ]/)
  })

  it('hash rich text by its text, so formatting does not matter', () => {
    expect(hashOf(markdownText('### A\nB'))).toBe(hashOf(markdownText('### A\n\nB')))
  })
})
