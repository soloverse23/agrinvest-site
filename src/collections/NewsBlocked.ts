import type { CollectionConfig } from 'payload'

import { isStaff } from '@/access'
import { toolsGroup } from '@/fields/tools'

/**
 * Links staff deleted. The news job never stores them again, so a deleted headline stays
 * deleted even though the publisher's feed still lists it. Delete a row here to allow the
 * link back.
 */
export const NewsBlocked: CollectionConfig = {
  slug: 'news-blocked',
  labels: {
    singular: { ro: 'Link blocat', en: 'Blocked link' },
    plural: { ro: 'Linkuri blocate', en: 'Blocked links' },
  },
  admin: { group: toolsGroup, useAsTitle: 'url', defaultColumns: ['url', 'createdAt'] },
  access: { read: isStaff, create: isStaff, update: isStaff, delete: isStaff },
  fields: [{ name: 'url', type: 'text', required: true, unique: true, index: true }],
}
