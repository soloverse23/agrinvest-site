import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '@/access'
import { slug } from '@/fields'
import { shopGroup } from '@/fields/shop'
import { revalidate, tags } from '@/lib/revalidate'

/** What a product acts on: weeds, diseases, pests and deficiencies. A shop filter. */
export const Targets: CollectionConfig = {
  slug: 'targets',
  labels: {
    singular: { ro: 'Țintă', en: 'Target' },
    plural: { ro: 'Ținte (buruieni, boli, dăunători)', en: 'Targets' },
  },
  admin: { group: shopGroup, useAsTitle: 'name', defaultColumns: ['name', 'kind', 'slug'] },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    afterChange: [() => revalidate(tags.targets, tags.products)],
    afterDelete: [() => revalidate(tags.targets, tags.products)],
  },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: { ro: 'Buruiană', en: 'Weed' }, value: 'weed' },
        { label: { ro: 'Boală', en: 'Disease' }, value: 'disease' },
        { label: { ro: 'Dăunător', en: 'Pest' }, value: 'pest' },
        { label: { ro: 'Carență', en: 'Deficiency' }, value: 'deficiency' },
      ],
    },
    { name: 'crops', type: 'relationship', relationTo: 'crops', hasMany: true },
    slug('name', true),
  ],
}
