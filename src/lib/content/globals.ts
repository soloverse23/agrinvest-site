import { unstable_cache } from 'next/cache'

import type { FactStatus } from '@/fields'
import type { Locale } from '@/i18n/config'
import { tags } from '@/lib/revalidate'

import { payloadClient } from './payload'

export type Figure = {
  key: string
  label: string
  value: string
  number?: number | null
  unit?: string | null
  source?: string | null
  status: FactStatus
}

export type Figures = Record<string, Figure>

/** The figures register for one locale, keyed by register key. */
export const getFigures = unstable_cache(
  async (locale: Locale): Promise<Figures> => {
    const payload = await payloadClient()
    const global = await payload.findGlobal({ slug: 'figures', locale, depth: 0 })
    return Object.fromEntries(
      (global.rows ?? []).map((row) => [
        row.key,
        {
          key: row.key,
          label: row.label,
          value: row.value,
          number: row.number,
          unit: row.unit,
          source: row.source,
          status: row.status,
        },
      ]),
    )
  },
  ['global:figures'],
  { tags: [tags.global('figures')] },
)

export const getNavigation = unstable_cache(
  async (locale: Locale) => {
    const payload = await payloadClient()
    return payload.findGlobal({ slug: 'navigation', locale, depth: 0 })
  },
  ['global:navigation'],
  { tags: [tags.global('navigation')] },
)

export const getFooter = unstable_cache(
  async (locale: Locale) => {
    const payload = await payloadClient()
    return payload.findGlobal({ slug: 'footer', locale, depth: 0 })
  },
  ['global:footer'],
  { tags: [tags.global('footer')] },
)

export const getSeoDefaults = unstable_cache(
  async (locale: Locale) => {
    const payload = await payloadClient()
    return payload.findGlobal({ slug: 'seo-defaults', locale, depth: 1 })
  },
  ['global:seo-defaults'],
  { tags: [tags.global('seo-defaults')] },
)
