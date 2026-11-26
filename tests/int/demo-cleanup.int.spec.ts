import { describe, expect, it } from 'vitest'

import { hiddenContact, isDemoNote } from '../../scripts/site/demo-cleanup'

describe('demo content on a live site', () => {
  it('hides only the demo seed’s invented contacts', () => {
    expect(
      hiddenContact({
        email: 'demo.3@agrinvest.test',
        publishEmail: true,
        phone: '0741 000 000',
        publishPhone: true,
      }),
    ).toEqual({ publishEmail: false })
    expect(hiddenContact({ phone: '+40 700 000 014', publishPhone: true })).toEqual({
      publishPhone: false,
    })
    expect(hiddenContact({ email: 'office@agrinvest.ro', publishEmail: true })).toEqual({})
  })

  it('recognises a market note by its demo sentence', () => {
    const body = (text: string) => ({ root: { children: [{ children: [{ text }] }] } })
    expect(isDemoNote(body('Verifică prețul bazei tale (text demonstrativ).'))).toBe(true)
    expect(isDemoNote(body('Verifică prețul bazei tale.'))).toBe(false)
    expect(isDemoNote(null)).toBe(false)
  })
})
