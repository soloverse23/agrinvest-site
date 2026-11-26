import type { CollectionConfig } from 'payload'

import {} from '@/access'
import { toolsGroup } from '@/fields/tools'
import { adminOnly, hiddenUnlessAdmin } from '@/access/departments'

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
  admin: {
    hidden: hiddenUnlessAdmin,
    group: toolsGroup,
    useAsTitle: 'url',
    defaultColumns: ['url', 'createdAt'],
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [{ name: 'url', type: 'text', required: true, unique: true, index: true }],
}
