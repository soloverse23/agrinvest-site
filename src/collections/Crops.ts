import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { faq, seo, slug } from '@/fields'
import { localeOf } from '@/i18n/config'
import { cropPath } from '@/i18n/routes'
import { revalidate, tags } from '@/lib/revalidate'
import { pingIndexNow } from '@/lib/seo/indexnow'

/** Crops Agrinvest buys. Reused by the grain pages, prices (Phase 5), shop and guides. */
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
        if (doc._status === 'published')
          void pingIndexNow([cropPath(doc.slug, localeOf(req.locale))])
      },
    ],
    afterDelete: [() => revalidate(tags.crops)],
  },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    {
      name: 'key',
      type: 'select',
      required: true,
      unique: true,
      options: ['wheat', 'maize', 'sunflower', 'rapeseed', 'barley'],
      admin: { description: 'Stable key for icons, prices and data colours.' },
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
    slug('name', true),
  ],
}
