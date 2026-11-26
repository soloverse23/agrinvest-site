import type { CollectionSlug, Payload, PayloadRequest, SanitizedCollectionConfig } from 'payload'

import { departments, sectionsFor } from '@/access/departments'

export type PanelLang = 'ro' | 'en'

type Labelish = string | Record<string, string> | undefined | unknown

export const pick = (label: Labelish, lang: PanelLang, fallback = ''): string => {
  if (typeof label === 'string') return label
  if (label && typeof label === 'object') {
    const map = label as Record<string, string>
    return map[lang] ?? map.ro ?? map.en ?? fallback
  }
  return fallback
}

export const langOf = (req: Pick<PayloadRequest, 'i18n'>): PanelLang =>
  req.i18n?.language === 'en' ? 'en' : 'ro'

/** Slugs of the collections (not globals) a request may open in the panel, in panel order. */
export function collectionsFor(req: PayloadRequest): CollectionSlug[] {
  const seen = new Set<string>()
  for (const role of sectionsFor(req))
    for (const slug of departments[role].sections)
      if (req.payload.collections[slug as CollectionSlug]) seen.add(slug)
  return [...seen] as CollectionSlug[]
}

export const configOf = (payload: Payload, slug: string): SanitizedCollectionConfig | undefined =>
  payload.collections[slug as CollectionSlug]?.config

export const titleField = (config: SanitizedCollectionConfig): string =>
  config.admin?.useAsTitle || 'id'

const hasField = (config: SanitizedCollectionConfig, name: string) =>
  config.flattenedFields.some((f) => f.name === name)

const draftLabels = {
  draft: { ro: 'Ciornă', en: 'Draft' },
  published: { ro: 'Publicat', en: 'Published' },
}

export type StatusTone = 'draft' | 'live' | 'neutral'

/** A short status for a row: the publish state, or the section's own `status` field. */
export function statusOf(
  config: SanitizedCollectionConfig,
  doc: Record<string, unknown>,
  lang: PanelLang,
): { label: string; tone: StatusTone } | null {
  const value = doc._status ?? doc.status
  if (typeof value !== 'string') return null
  if (doc._status && (value === 'draft' || value === 'published'))
    return { label: draftLabels[value][lang], tone: value === 'published' ? 'live' : 'draft' }
  const field = config.flattenedFields.find((f) => f.name === 'status')
  const options = field && 'options' in field ? field.options : []
  const option = options.find((o) => (typeof o === 'string' ? o : o.value) === value)
  const label = option && typeof option !== 'string' ? pick(option.label, lang, value) : value
  const tone = value === 'published' ? 'live' : value === 'draft' ? 'draft' : 'neutral'
  return { label, tone }
}

/** The fields a short row needs, only those the collection has. */
export function rowSelect(config: SanitizedCollectionConfig): Record<string, true> {
  const select: Record<string, true> = { updatedAt: true }
  const title = titleField(config)
  if (title !== 'id') select[title] = true
  if (hasField(config, 'status')) select.status = true
  if (config.versions?.drafts) select._status = true
  return select
}

export const hasSlug = (config: SanitizedCollectionConfig) => hasField(config, 'slug')

export const editHref = (adminRoute: string, slug: string, id: number | string, locale?: string) =>
  `${adminRoute}/collections/${slug}/${id}${locale && locale !== 'ro' ? `?locale=${locale}` : ''}`

export const rowTitle = (config: SanitizedCollectionConfig, doc: Record<string, unknown>) => {
  const value = doc[titleField(config)]
  return value === undefined || value === null || value === '' ? `#${doc.id}` : String(value)
}
