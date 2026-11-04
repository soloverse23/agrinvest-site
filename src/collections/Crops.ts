import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { faq, seo, slug } from '@/fields'
import { enrichmentLedger, hubFields } from '@/fields/shop'
import { localeOf } from '@/i18n/config'
import { cropPath } from '@/i18n/routes'
import { revalidate, tags } from '@/lib/revalidate'
import { pingIndexNow } from '@/lib/seo/indexnow'

/**
 * Crops. `isGrain` marks the ones Agrinvest buys: only those get grain pages, sitemap entries
 * and lead options. All crops serve the shop (dose tables, crop hubs), prices and guides.
 */
export const Crops: CollectionConfig = {
  slug: 'crops',
  labels: { singular: { ro: 'Cultură', en: 'Crop' }, plural: { ro: 'Culturi', en: 'Crops' } },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug', 'key', '_status'] },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    afterChange: [
      ({ doc, req }) => {
        revalidate(tags.crops)
        // The slug is per language: ping the URL of the language that was saved.
        if (doc._status === 'published' && doc.isGrain)
          void pingIndexNow([cropPath(doc.slug, localeOf(req.locale))])
      },
    ],
    afterDelete: [() => revalidate(tags.crops)],
  },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      validate: (value: null | string | undefined) =>
        /^[a-z][a-z-]*$/.test(value ?? '') || 'Lowercase English letters and hyphens only.',
      admin: { description: 'Stable English key for icons, prices and data colours.' },
    },
    {
      name: 'isGrain',
      type: 'checkbox',
      defaultValue: false,
      label: { ro: 'Agrinvest cumpără această cultură', en: 'Agrinvest buys this crop' },
      admin: {
        position: 'sidebar',
        description: 'Turns on the grain page, the sitemap entry and the lead form option.',
      },
    },
    { name: 'intro', type: 'textarea', localized: true },
    {
      name: 'quality',
      type: 'group',
      admin: { description: 'Reception standards (STAS). To confirm with Agrinvest.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'moisture', type: 'number', admin: { description: 'Max. %' } },
            { name: 'impurities', type: 'number', admin: { description: 'Max. %' } },
            { name: 'hectolitre', type: 'number', admin: { description: 'Min. kg/hl' } },
          ],
        },
        { name: 'notes', type: 'textarea', localized: true },
      ],
    },
    faq,
    seo,
    {
      name: 'shop',
      type: 'group',
      label: { ro: 'Pagina din magazin', en: 'Shop hub' },
      admin: { description: 'The crop hub in the shop (/magazin/cultura/…).' },
      fields: hubFields,
    },
    slug('name', true),
    enrichmentLedger,
  ],
}
