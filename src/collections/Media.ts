import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  admin: { defaultColumns: ['filename', 'alt', 'rights', 'updatedAt'] },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
    },
    { name: 'caption', type: 'text', localized: true },
    { name: 'credit', type: 'text' },
    {
      name: 'rights',
      type: 'select',
      required: true,
      defaultValue: 'owned',
      options: [
        { value: 'owned', label: { ro: 'Agrinvest', en: 'Owned by Agrinvest' } },
        { value: 'licensed', label: { ro: 'Licențiat', en: 'Licensed' } },
        { value: 'pending', label: { ro: 'Permisiune în așteptare', en: 'Permission pending' } },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Footage from YouTube or TV stays "pending" until Agrinvest confirms the rights.',
      },
    },
  ],
  upload: {
    focalPoint: true,
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
  },
}
