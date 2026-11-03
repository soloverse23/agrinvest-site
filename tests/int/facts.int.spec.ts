import { describe, expect, it } from 'vitest'

import { factKeys, resolveFacts, schemaFaq } from '@/components/FactText'
import type { Figure, Figures } from '@/lib/content/globals'

import { rt } from '../../scripts/seed/richtext'

const fig = (key: string, value: string, status: Figure['status']): Figure => ({
  key,
  label: key,
  value,
  status,
})

const figures: Figures = {
  C8: fig('C8', 'imediat după recepție', 'to-confirm'),
  F3: fig('F3', '1 februarie 2020', 'confirmed'),
}

describe('facts in content text', () => {
  it('finds the register keys a text uses', () => {
    expect(factKeys('Plata se face {{C8}}; din {{F3}}.')).toEqual(['C8', 'F3'])
    expect(factKeys('Fără cifre.')).toEqual([])
  })

  it('resolves values and reports whether all of them are confirmed', () => {
    expect(resolveFacts('Finanțăm din {{F3}}.', figures)).toEqual({
      text: 'Finanțăm din 1 februarie 2020.',
      confirmed: true,
    })
    expect(resolveFacts('Plata se face {{C8}}.', figures)).toEqual({
      text: 'Plata se face imediat după recepție.',
      confirmed: false,
    })
    // A key missing from the register is never treated as confirmed.
    expect(resolveFacts('{{X1}}', figures).confirmed).toBe(false)
  })

  it('keeps unconfirmed facts out of FAQPage data', () => {
    const faq = schemaFaq(
      [
        { question: 'Când primesc banii?', answer: 'Plata se face {{C8}}.' },
        { question: 'De când finanțați?', answer: 'Din {{F3}}.' },
        { question: 'Ce cereale cumpărați?', answer: 'Grâu, porumb și altele.' },
      ],
      figures,
    )
    expect(faq).toEqual([
      { question: 'De când finanțați?', answer: 'Din 1 februarie 2020.' },
      { question: 'Ce cereale cumpărați?', answer: 'Grâu, porumb și altele.' },
    ])
  })
})

describe('seed rich text', () => {
  it('builds Lexical headings, lists, bold text and links', () => {
    const { root } = rt('## Titlu\n\n- unu\n- **doi**\n\nVezi [pagina](/cereale).')
    const [heading, list, paragraph] = root.children as Record<string, unknown>[]
    expect(heading).toMatchObject({ type: 'heading', tag: 'h2' })
    expect(list).toMatchObject({ type: 'list', listType: 'bullet' })
    expect((list.children as Record<string, unknown>[])[1]).toMatchObject({
      children: [{ type: 'text', text: 'doi', format: 1 }],
    })
    expect(paragraph.children).toEqual([
      expect.objectContaining({ type: 'text', text: 'Vezi ' }),
      expect.objectContaining({
        type: 'link',
        fields: expect.objectContaining({ url: '/cereale' }),
      }),
      expect.objectContaining({ type: 'text', text: '.' }),
    ])
  })
})
