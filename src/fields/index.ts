import {
  slugField,
  type ArrayField,
  type GroupField,
  type RowField,
  type SelectField,
} from 'payload'

import { slugify } from '@/lib/slugify'

/** Verification state of a fact, the same three states as `docs/audit/figures-register.md`. */
export const factStatuses = [
  { label: { ro: 'De confirmat', en: 'To confirm' }, value: 'to-confirm' },
  { label: { ro: 'Conflict între surse', en: 'Conflict' }, value: 'conflict' },
  { label: { ro: 'Confirmat', en: 'Confirmed' }, value: 'confirmed' },
] as const

export type FactStatus = (typeof factStatuses)[number]['value']

export const factStatus = (name = 'status', overrides: Partial<SelectField> = {}): SelectField =>
  ({
    name,
    type: 'select',
    required: true,
    defaultValue: 'to-confirm',
    options: [...factStatuses],
    ...overrides,
  }) as SelectField

/** Slug without diacritics, generated from `useAsSlug` until an editor changes it. */
export const slug = (useAsSlug = 'title', localized = false): RowField =>
  slugField({
    useAsSlug,
    localized,
    slugify: ({ valueToSlugify }) =>
      typeof valueToSlugify === 'string' ? slugify(valueToSlugify) : undefined,
  })

/** An internal path (`/contact`) or an absolute https URL. */
const validateHref = (value: unknown) =>
  typeof value !== 'string' || value === '' || /^(\/|https:\/\/|tel:|mailto:)/.test(value)
    ? true
    : 'Use a path that starts with /, or an https://, tel: or mailto: link.'

export const link = (name: string, required = false): GroupField => ({
  name,
  type: 'group',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'label', type: 'text', localized: true, required },
        { name: 'href', type: 'text', localized: true, required, validate: validateHref },
      ],
    },
  ],
})

/** Question and answer pairs; rendered as an FAQ section with FAQPage JSON-LD. */
export const faq: ArrayField = {
  name: 'faq',
  type: 'array',
  // The whole list is per language: each language has its own questions, and saving one
  // language never replaces the other's rows.
  localized: true,
  labels: { singular: 'Question', plural: 'FAQ' },
  fields: [
    { name: 'question', type: 'text', required: true },
    { name: 'answer', type: 'textarea', required: true },
  ],
}

/** Per-document SEO overrides. Empty fields fall back to the title, summary and SEO defaults. */
export const seo: GroupField = {
  name: 'seo',
  type: 'group',
  admin: { description: 'Title 30–60 characters, description 70–160 (checked by check:seo).' },
  fields: [
    { name: 'title', type: 'text', localized: true },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'noindex', type: 'checkbox', defaultValue: false },
  ],
}

/**
 * Latitude and longitude as plain numbers (no PostGIS needed; "nearest base" over a few
 * dozen points is computed in code).
 */
export const coordinates = (name: string, description?: string): GroupField => ({
  name,
  type: 'group',
  admin: description ? { description } : undefined,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'lat', type: 'number', min: 43, max: 49 },
        { name: 'lng', type: 'number', min: 20, max: 30 },
      ],
    },
  ],
})
