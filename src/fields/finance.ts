import type { Field, GroupField, ArrayField } from 'payload'

import { factStatus } from '@/fields'
import { legalStatuses, legalStatusLabels, optionsOf } from '@/lib/finance/options'

export const financeGroup = { ro: 'Finanțare', en: 'Financing' }

/** Where a public fact comes from. Shown on the page, so every claim can be checked. */
export const sources: ArrayField = {
  name: 'sources',
  type: 'array',
  labels: { singular: 'Source', plural: 'Sources' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
        {
          name: 'retrieved',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
      ],
    },
  ],
}

/**
 * Who has checked a page, and when. The reviewed files never set these: only the IFN and its
 * lawyer approve, in the admin. `check:finance` fails on anything else once the site is indexable.
 */
export const review: GroupField = {
  name: 'review',
  type: 'group',
  admin: { position: 'sidebar' },
  fields: [
    {
      name: 'legalStatus',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: optionsOf(legalStatuses, legalStatusLabels),
    },
    factStatus('status'),
    { name: 'reviewedAt', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'reviewedBy', type: 'text' },
  ],
}

/** Stable identity for the reviewed files: slugs change, keys do not. */
export const fileKey: Field = {
  name: 'key',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  validate: (value: null | string | undefined) =>
    /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value ?? '') || 'Lowercase letters, digits and hyphens only.',
  admin: { position: 'sidebar', description: 'Stable key used by the reviewed files.' },
}
