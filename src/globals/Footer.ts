import type { GlobalConfig } from 'payload'

import { anyone, isStaff } from '@/access'
import { link } from '@/fields'
import { revalidate, tags } from '@/lib/revalidate'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: { ro: 'Subsol', en: 'Footer' },
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [() => revalidate(tags.global('footer'))] },
  fields: [
    {
      name: 'columns',
      type: 'array',
      localized: true,
      maxRows: 5,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'links', type: 'array', fields: [link('link', true)] },
      ],
    },
    { name: 'legal', type: 'textarea', localized: true },
  ],
}
