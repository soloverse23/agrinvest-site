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
          name: 'blurb',
          type: 'textarea',
          admin: { description: 'One sentence shown in the menu panel next to the sub-pages.' },
        },
        {
          name: 'panel',
          type: 'select',
          defaultValue: 'links',
          options: [
            { label: 'Links in columns', value: 'links' },
            { label: 'Shop (built from the live categories)', value: 'shop' },
          ],
          admin: {
            description:
              'The shop panel lists the categories, crops and brands with their product counts.',
          },
        },
        {
          name: 'promo',
          type: 'group',
          admin: { description: 'Optional card on the right of the panel. Leave empty for none.' },
          fields: [
            { name: 'title', type: 'text' },
            { name: 'text', type: 'textarea' },
            link('link'),
          ],
        },
        {
          name: 'children',
          type: 'array',
          fields: [
            link('link', true),
            { name: 'description', type: 'text' },
            {
              name: 'group',
              type: 'text',
              admin: {
                description: 'Column heading. Links with the same heading share a column.',
              },
            },
          ],
        },
      ],
    },
    link('cta'),
  ],
}
