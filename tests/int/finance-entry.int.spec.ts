import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import {
  applyEntryPoints,
  rewriteLinks,
  withFinanceFooter,
  withFinanceMenu,
} from '../../scripts/finance/entry-points'

/** Finance entry points on a live site (4.5): add what is missing, never undo staff edits. */
describe('finance entry points', () => {
  it('fills the finance menu panel only when staff have not given it one', () => {
    const plain = [{ link: { label: 'Finanțare', href: '/finantare' } }]
    const [item] = withFinanceMenu(plain, 'ro')
    expect(item.children?.length).toBe(4)
    expect(item.blurb).toBeTruthy()
    const edited = [
      { link: { label: 'Finanțare', href: '/finantare' }, children: [{ link: { label: 'X' } }] },
    ]
    expect(withFinanceMenu(edited, 'ro')).toEqual(edited)
  })

  it('adds the tool links after the finance link, once', () => {
    const columns = [
      { links: [{ link: { label: 'Finanțare', href: '/finantare' } }, { link: { href: '/x' } }] },
    ]
    const once = withFinanceFooter(columns, 'ro')
    expect(once[0].links?.map((l) => l.link?.href)).toEqual([
      '/finantare',
      '/finantare/simulator',
      '/finantare/aplica',
      '/x',
    ])
    expect(withFinanceFooter(once, 'ro')).toEqual(once)
  })

  it('rewrites only the seed’s exact old links, in the right card', () => {
    const layout = [
      {
        items: [
          {
            title: 'Finanțare',
            body: 'Ai nevoie de bani până la vânzare?',
            link: { label: 'Finanțare', href: '/finantare' },
          },
        ],
      },
      { needs: [{ link: { label: 'Finanțare', href: '/finantare' }, hint: 'Rate după recoltă' }] },
      { secondary: { label: 'Cere o ofertă', href: '/finantare#cerere' } },
      { secondary: { label: 'Altă ofertă', href: '/finantare#cerere' } },
    ]
    const out = rewriteLinks(layout) as typeof layout
    expect(out[0].items?.[0].link.href).toBe('/finantare/finantare-stocuri')
    expect(out[1].needs?.[0].link.href).toBe('/finantare')
    expect(out[2].secondary?.href).toBe('/finantare/aplica')
    expect(out[3].secondary?.href).toBe('/finantare#cerere')
    expect(rewriteLinks(out)).toEqual(out)
  })

  describe('on the database', () => {
    let payload: Payload
    beforeAll(async () => {
      payload = await getPayload({ config: await config })
    })

    it('changes nothing on a second run', async () => {
      await applyEntryPoints(payload, () => {})
      const lines: string[] = []
      await applyEntryPoints(payload, (s) => lines.push(s))
      expect(lines).toEqual([])
      const nav = await payload.findGlobal({ slug: 'navigation', locale: 'ro', depth: 0 })
      const finance = nav.items?.find((i) => i.link?.href === '/finantare')
      expect(finance?.children?.some((c) => c.link?.href === '/finantare/simulator')).toBe(true)
    })
  })
})
