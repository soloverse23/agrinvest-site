import type { GlobalConfig } from 'payload'

import { anyone } from '@/access'
import { link } from '@/fields'
import { revalidate, tags } from '@/lib/revalidate'
import { adminOnly, hiddenUnlessAdmin } from '@/access/departments'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: { ro: 'Subsol', en: 'Footer' },
  access: { read: anyone, update: adminOnly },
  admin: { hidden: hiddenUnlessAdmin },
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
