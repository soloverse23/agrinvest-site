import type { CollectionConfig } from 'payload'

import { anyone } from '@/access'
import { coordinates, slug } from '@/fields'
import { revalidate, tags } from '@/lib/revalidate'
import { adminOnly, hiddenUnlessAdmin } from '@/access/departments'

export const Counties: CollectionConfig = {
  slug: 'counties',
  labels: { singular: { ro: 'Județ', en: 'County' }, plural: { ro: 'Județe', en: 'Counties' } },
  admin: {
    hidden: hiddenUnlessAdmin,
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'slug'],
  },
  access: { read: anyone, create: adminOnly, update: adminOnly, delete: adminOnly },
  hooks: { afterChange: [() => revalidate(tags.counties, tags.bases)] },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'With diacritics: Ialomița.' },
    },
    slug('name'),
    { name: 'code', type: 'text', required: true, unique: true, maxLength: 2 },
    coordinates('centroid', 'Used on the map when a base has no GPS yet.'),
  ],
}
