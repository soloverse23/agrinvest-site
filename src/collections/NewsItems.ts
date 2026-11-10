import type { Access, CollectionConfig } from 'payload'

import { isStaff, staffRequest } from '@/access'
import { toolsGroup } from '@/fields/tools'
import { revalidate, tags } from '@/lib/revalidate'
import { newsSourceKeys, newsSources } from '@/lib/sources'

/** Visitors see every headline staff have not hidden (5.6: shown unless hidden). */
const visibleOrStaff: Access = ({ req }) =>
  staffRequest(req) ? true : { status: { not_equals: 'ascuns' } }

/**
 * Headlines from the partner feeds (`src/lib/sources.ts`). The `ingestNews` job adds them
 * as `nou` and they show at once; staff hide (`ascuns`) what does not belong on the site. We keep the
 * headline, date, link and, where the publisher allows it, a short excerpt from the feed.
 */
export const NewsItems: CollectionConfig = {
  slug: 'news-items',
  labels: {
    singular: { ro: 'Știre din presă', en: 'News headline' },
    plural: { ro: 'Știri din presă', en: 'News headlines' },
  },
  admin: {
    group: toolsGroup,
    useAsTitle: 'title',
    defaultColumns: ['title', 'source', 'publishedAt', 'status'],
  },
  defaultSort: '-publishedAt',
  access: { read: visibleOrStaff, create: () => false, update: isStaff, delete: isStaff },
  hooks: {
    afterChange: [() => revalidate(tags.news)],
    afterDelete: [() => revalidate(tags.news)],
  },
  fields: [
    { name: 'title', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'url', type: 'text', required: true, unique: true, admin: { readOnly: true } },
    {
      type: 'row',
      fields: [
        {
          name: 'source',
          type: 'select',
          required: true,
          index: true,
          options: newsSourceKeys.map((value) => ({ value, label: newsSources[value].name })),
          admin: { readOnly: true },
        },
        {
          name: 'publishedAt',
          type: 'date',
          required: true,
          index: true,
          admin: { readOnly: true },
        },
      ],
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 500,
      admin: { readOnly: true, description: 'From the feed, within the publisher’s limit.' },
    },
    {
      name: 'crops',
      type: 'relationship',
      relationTo: 'crops',
      hasMany: true,
      admin: { description: 'Shown on these crops’ price pages.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'nou',
      index: true,
      options: [
        { value: 'nou', label: { ro: 'Nou', en: 'New' } },
        { value: 'aprobat', label: { ro: 'Aprobat', en: 'Approved' } },
        { value: 'ascuns', label: { ro: 'Ascuns', en: 'Hidden' } },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
