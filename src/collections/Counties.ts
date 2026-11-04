import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '@/access'
import { coordinates, slug } from '@/fields'
import { revalidate, tags } from '@/lib/revalidate'

export const Counties: CollectionConfig = {
  slug: 'counties',
  labels: { singular: { ro: 'Județ', en: 'County' }, plural: { ro: 'Județe', en: 'Counties' } },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'code', 'slug'] },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
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
