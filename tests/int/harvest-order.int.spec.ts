import { describe, expect, it } from 'vitest'

import { byHarvest } from '@/lib/crops'
import { pillarOptions, pillars } from '@/lib/articles/pillars'
import { harvestCrops, instalmentSeasons } from '@/lib/finance/calendar'
import { reworded, withHarvestLinks } from '../../scripts/site/harvest-order'
import { previousPanels } from '../../scripts/site/structure'

const order = ['barley', 'wheat', 'rapeseed', 'sunflower', 'maize']

describe('harvest order', () => {
  it('sorts the grains by harvest and keeps other crops after them, as they came', () => {
    const keys = ['soybean', 'maize', 'wheat', 'rye', 'sunflower', 'barley', 'rapeseed']
    expect(byHarvest(keys.map((key) => ({ key }))).map((c) => c.key)).toEqual([
      ...order,
      'soybean',
      'rye',
    ])
  })

  it('orders the instalment crops and the guide pillars the same way', () => {
    expect(harvestCrops).toEqual(order)
    expect(Object.values(instalmentSeasons).flatMap((s) => s.cropKeys)).toEqual(order)
    expect(pillars.slice(0, 5).map((p) => p.key)).toEqual([
      'orz',
      'grau',
      'rapita',
      'floarea-soarelui',
      'porumb',
    ])
    // The database enum keeps its stored order: a change there needs a migration.
    expect(pillarOptions.slice(0, 2).map((p) => p.value)).toEqual(['grau', 'porumb'])
  })

  it('reorders the old menu crop links once and leaves a reordered menu alone', () => {
    for (const locale of ['ro', 'en'] as const) {
      // The Prices panel with its crop links, as it was before the structure simplification.
      const path = locale === 'ro' ? '/preturi' : '/en/prices'
      const wanted = previousPanels[locale][path]!.hrefs.map((href) => ({ link: { href } }))
      const old = [wanted[1]!, wanted[4]!, wanted[3]!, wanted[2]!, wanted[0]!, ...wanted.slice(5)]
      expect(withHarvestLinks(old, locale)).toEqual(wanted)
      expect(withHarvestLinks(wanted, locale)).toBe(wanted)
      const theirs = [old[1]!, old[0]!, ...old.slice(2)]
      expect(withHarvestLinks(theirs, locale)).toBe(theirs)
    }
  })

  it('rewrites only texts that are still the old words', () => {
    const edited = { blocks: [{ label: 'grâu, orz, rapiță și soia' }] }
    expect(reworded(edited)).toBe(edited)
    expect(reworded({ blocks: [{ label: 'grâu, orz, rapiță', id: 1 }] })).toEqual({
      blocks: [{ label: 'orz, grâu, rapiță', id: 1 }],
    })
  })
})
