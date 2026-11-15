import type { Access, CollectionConfig } from 'payload'

import { isStaff, staffRequest } from '@/access'
import { toolsGroup } from '@/fields/tools'
import { topicLabels } from '@/i18n/news'
import { topicKeys } from '@/lib/news/lexicon'
import { REMOVING_STORY, removeItem } from '@/lib/news/remove'
import { revalidate, tags } from '@/lib/revalidate'
import { newsSourceKeys, newsSources } from '@/lib/sources'

/** Visitors see every headline staff have not hidden (5.6: shown unless hidden). */
const visibleOrStaff: Access = ({ req }) =>
  staffRequest(req) ? true : { status: { not_equals: 'ascuns' } }

/**
 * Headlines from the licence-checked feeds (`src/lib/sources.ts`, decision 0011). The hourly
 * `ingestNews` job adds them as `nou`, groups them into `news-stories` and they show at once;
 * staff hide (`ascuns`) what does not belong on the site, or delete it: a deleted headline's
 * link is blocked so the next run does not bring it back. We keep the headline, date, link
 * and, where the publisher allows it, a short excerpt from the feed.
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
    beforeDelete: [
      async ({ req, id, context }) => {
        if (context?.[REMOVING_STORY]) return
        const doc = await req.payload.findByID({
          req,
          collection: 'news-items',
          id,
          depth: 0,
          disableErrors: true,
        })
        if (doc) await removeItem(req.payload, Number(id), doc.url, req)
      },
    ],
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
      name: 'image',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'The feed’s own photo, shown as a small thumbnail (decision 0011).',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 500,
      admin: { readOnly: true, description: 'From the feed, within the publisher’s limit.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'topics',
          type: 'select',
          hasMany: true,
          options: topicKeys.map((value) => ({ value, label: topicLabels[value] })),
          admin: { readOnly: true, description: 'From the agriculture lexicon.' },
        },
        { name: 'lang', type: 'select', options: ['ro', 'en'], admin: { readOnly: true } },
      ],
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
