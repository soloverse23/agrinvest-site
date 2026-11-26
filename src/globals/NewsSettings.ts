import type { GlobalConfig } from 'payload'

import { anyone } from '@/access'
import { toolsGroup } from '@/fields/tools'
import { defaultWeights } from '@/lib/news/score'
import { revalidate, tags } from '@/lib/revalidate'
import { newsSourceKeys, newsSources } from '@/lib/sources'
import { adminOnly, hiddenUnlessAdmin } from '@/access/departments'

const weight = (name: string, label: string, defaultValue: number) => ({
  name,
  type: 'number' as const,
  label,
  defaultValue,
  min: 0,
  max: 5,
  admin: { step: 0.1 },
})

/**
 * The news ranking's knobs (decision 0011). Changes apply at the next hourly run. Public
 * read: the pages need `indexEditions` and nothing here is private.
 */
export const NewsSettings: GlobalConfig = {
  slug: 'news-settings',
  label: { ro: 'Setări știri', en: 'News settings' },
  admin: {
    hidden: hiddenUnlessAdmin,
    group: toolsGroup,
  },
  access: { read: anyone, update: adminOnly },
  hooks: { afterChange: [() => revalidate(tags.news, tags.global('news-settings'))] },
  fields: [
    {
      name: 'disabledSources',
      type: 'select',
      hasMany: true,
      label: { ro: 'Surse oprite', en: 'Disabled sources' },
      options: newsSourceKeys.map((value) => ({ value, label: newsSources[value].name })),
      admin: { description: 'Not fetched while listed here. Their stored headlines stay.' },
    },
    {
      name: 'indexEditions',
      type: 'checkbox',
      defaultValue: false,
      label: { ro: 'Indexează edițiile zilnice', en: 'Index daily editions' },
      admin: {
        description:
          'Off by default: a page of other publishers’ headlines is thin content (decision 0011).',
      },
    },
    {
      name: 'weights',
      type: 'group',
      label: { ro: 'Ponderi', en: 'Weights' },
      fields: [
        {
          type: 'row',
          fields: [
            weight('official', 'Official', defaultWeights.source.official),
            weight('wire', 'Reuters', defaultWeights.source.wire),
            weight('farm', 'Farm press', defaultWeights.source.farm),
            weight('general', 'General press', defaultWeights.source.general),
          ],
        },
        {
          type: 'row',
          fields: [
            weight('romania', 'Romania', defaultWeights.romania),
            weight('region', 'EU / Black Sea', defaultWeights.region),
            {
              ...weight('halfLifeHours', 'Freshness half-life (h)', defaultWeights.halfLifeHours),
              min: 1,
              max: 72,
              admin: { step: 1 },
            },
          ],
        },
      ],
    },
  ],
}
