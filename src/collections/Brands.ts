import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { faq, slug } from '@/fields'
import { featuredProducts, hubFields, shopGroup, urlField } from '@/fields/shop'
import { revalidate, tags } from '@/lib/revalidate'

/** Manufacturers (`/magazin/producator/{slug}`). The slug is shared by both languages. */
export const Brands: CollectionConfig = {
  slug: 'brands',
  labels: {
    singular: { ro: 'Producător', en: 'Brand' },
    plural: { ro: 'Producători', en: 'Brands' },
  },
  admin: {
    group: shopGroup,
    useAsTitle: 'name',
    defaultColumns: ['name', 'country', 'products', 'indexable', '_status'],
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    afterChange: [() => revalidate(tags.brands, tags.products)],
    afterDelete: [() => revalidate(tags.brands, tags.products)],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        { name: 'country', type: 'text', localized: true, label: { ro: 'Țară', en: 'Country' } },
        urlField('website', { ro: 'Site oficial', en: 'Official website' }),
      ],
    },
    ...hubFields,
    faq,
    featuredProducts,
    {
      name: 'products',
      type: 'join',
      collection: 'products',
      on: 'brand',
      label: { ro: 'Produse', en: 'Products' },
      defaultLimit: 20,
      admin: { defaultColumns: ['name', 'commerceStatus', '_status'] },
    },
    slug('name'),
  ],
}
