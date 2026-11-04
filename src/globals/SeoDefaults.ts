import type { GlobalConfig } from 'payload'

import { anyone, isStaff } from '@/access'
import { revalidate, tags } from '@/lib/revalidate'

/** Site-wide SEO settings and the organisation data behind the Organization JSON-LD. */
export const SeoDefaults: GlobalConfig = {
  slug: 'seo-defaults',
  label: { ro: 'SEO implicit', en: 'SEO defaults' },
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [() => revalidate(tags.global('seo-defaults'))] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'siteName', type: 'text', required: true, defaultValue: 'Agrinvest' },
        {
          name: 'titleTemplate',
          type: 'text',
          required: true,
          defaultValue: '%s · Agrinvest',
          admin: { description: '%s is the page title.' },
        },
      ],
    },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'ogImage', type: 'upload', relationTo: 'media' },
    {
      name: 'organization',
      type: 'group',
      fields: [
        {
          // Identifiers, phones and addresses come from the Figures register.
          type: 'row',
          fields: [
            { name: 'legalName', type: 'text', defaultValue: 'Agrinvest SRL' },
            { name: 'ifnLegalName', type: 'text', defaultValue: 'Agrinvest Credit IFN SA' },
          ],
        },
        {
          name: 'sameAs',
          type: 'array',
          admin: { description: 'Official social and directory profiles.' },
          fields: [{ name: 'url', type: 'text', required: true }],
        },
      ],
    },
    {
      name: 'verification',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'google', type: 'text' },
            { name: 'bing', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      admin: {
        description:
          'Google Analytics 4 loads only after a visitor accepts statistics cookies (Consent Mode v2). Empty = no analytics and no cookie banner.',
      },
      fields: [
        {
          name: 'ga4',
          type: 'text',
          label: 'GA4 measurement ID',
          validate: (value: string | null | undefined) =>
            !value || /^G-[A-Z0-9]{4,}$/.test(value) || 'A GA4 ID looks like G-XXXXXXXXXX.',
        },
      ],
    },
  ],
}
