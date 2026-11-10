import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { contentErrors, loadFinanceFiles, type File } from '../../scripts/finance/gate'

/** `check:finance` (4.6): today's content passes, and each rule catches what it is for. */
const files = loadFinanceFiles(join(process.cwd(), 'data/finance'))
const product = files.find((f) => f.key === 'credit-productie')!
const withRo = (f: File, ro: Record<string, unknown>): File => ({
  ...f,
  text: { ...f.text, ro: { ...f.text.ro, ...ro } },
})

describe('finance content gate', () => {
  it('passes the reviewed files as they are', () => {
    expect(contentErrors(files)).toEqual([])
  })

  it('fails a near-empty page', () => {
    const thin = withRo(product, {
      answer: 'Scurt.',
      fits: '',
      notFor: '',
      finances: '',
      repayment: '',
      risks: '',
      process: [],
      example: {},
      guarantees: [],
    })
    expect(contentErrors([thin]).join()).toMatch(/under 150 words/)
  })

  it('fails a forbidden claim and an Agrinvest rate', () => {
    const claims = withRo(product, {
      answer: `${product.text.ro.answer} Aprobare garantată, dobândă de 9% pe an.`,
    })
    const out = contentErrors([claims]).join()
    expect(out).toMatch(/forbidden claim/)
    expect(out).toMatch(/a rate is stated/)
  })

  it('fails two investment pages that read the same', () => {
    const page = files.find((f) => f.key === 'utilaje')!
    const twin = { ...page, key: 'utilaje-copie' }
    expect(contentErrors([page, twin]).join()).toMatch(/share 100% of phrases/)
  })
})
