import type { Field, GroupField, TextField } from 'payload'

import { isStaffField } from '@/access'

import { factStatus, seo } from './index'

export const shopGroup = { ro: 'Magazin', en: 'Shop' }

const validateUrl = (value: null | string | undefined) =>
  !value || /^https?:\/\//.test(value) ? true : 'Use a full http(s) URL.'

export const urlField = (name: string, label: TextField['label']): TextField => ({
  name,
  type: 'text',
  label,
  validate: validateUrl,
})

/** Status and source of one group of product data, so every value can be traced. */
export const verified = (name: string, label: GroupField['label']): GroupField => ({
  name,
  type: 'group',
  label,
  fields: [
    {
      type: 'row',
      fields: [factStatus('status'), urlField('source', { ro: 'Sursă (URL)', en: 'Source (URL)' })],
    },
  ],
})

/**
 * What every shop hub shares: its own intro, the switch that allows indexing, and SEO. A hub
 * is indexed only when `isHubIndexable` agrees (`src/lib/shop/rules.ts`).
 */
export const hubFields: Field[] = [
  {
    name: 'intro',
    type: 'textarea',
    localized: true,
    label: { ro: 'Introducere', en: 'Intro' },
    admin: { description: 'Required before the hub can be indexed.' },
  },
  {
    name: 'indexable',
    type: 'checkbox',
    defaultValue: false,
    label: { ro: 'Poate fi indexată', en: 'May be indexed' },
    admin: { description: 'Also needs an intro and at least 3 products.' },
  },
  seo,
]

/** Products shown first on a hub, in this order. */
export const featuredProducts: Field = {
  name: 'featured',
  type: 'relationship',
  relationTo: 'products',
  hasMany: true,
  maxRows: 8,
  label: { ro: 'Produse evidențiate', en: 'Featured products' },
}

/**
 * Bookkeeping of the enrichment step (`scripts/products/apply.ts`): the hash of each group of
 * data it last wrote. A group whose current hash differs was changed by staff, so the step
 * leaves it alone. Hidden in the admin, and never part of a public read.
 */
export const enrichmentLedger: Field = {
  name: 'enrichment',
  type: 'json',
  access: { read: isStaffField, create: () => false, update: () => false },
  admin: { hidden: true },
}
