import type { GlobalConfig } from 'payload'

import { anyone, isStaff } from '@/access'
import { link } from '@/fields'
import { revalidate, tags } from '@/lib/revalidate'

/** Main menu, organised by need. Localized as a whole: the English menu is business-led. */
export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: { ro: 'Navigație', en: 'Navigation' },
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [() => revalidate(tags.global('navigation'))] },
  fields: [
    {
      name: 'items',
      type: 'array',
      localized: true,
      fields: [
        link('link', true),
        {
          name: 'children',
          type: 'array',
          fields: [link('link', true), { name: 'description', type: 'text' }],
        },
      ],
    },
    link('cta'),
  ],
}
