import type { Access, CollectionConfig } from 'payload'

import { isStaff, staffRequest } from '@/access'
import { toolsGroup } from '@/fields/tools'
import { topicLabels } from '@/i18n/news'
import { topicKeys } from '@/lib/news/lexicon'
import { dropFromEditions, REMOVING_STORY, removeStory } from '@/lib/news/remove'
import { revalidate, tags } from '@/lib/revalidate'
import { newsSourceKeys, newsSources } from '@/lib/sources'

const visibleOrStaff: Access = ({ req }) =>
  staffRequest(req) ? true : { status: { equals: 'visible' } }

const topicOptions = topicKeys.map((value) => ({ value, label: topicLabels[value] }))

/**
 * Headlines about the same event, grouped and ranked by the hourly `ingestNews` job
 * (decision 0011). The job writes them; staff pin, hide or delete. Deleting a story deletes
 * its headlines and blocks their links, so the next run does not fetch them again.
 */
export const NewsStories: CollectionConfig = {
  slug: 'news-stories',
  labels: {
    singular: { ro: 'Subiect de știri', en: 'News story' },
    plural: { ro: 'Subiecte de știri', en: 'News stories' },
  },
  admin: {
    group: toolsGroup,
    useAsTitle: 'title',
    defaultColumns: ['title', 'topic', 'sourceCount', 'baseScore', 'lastSeen', 'status'],
    description:
      'Grouped and ranked every hour. Hide a story to take it off the site; delete it to remove it and its headlines for good.',
  },
  defaultSort: '-lastSeen',
  access: { read: visibleOrStaff, create: () => false, update: isStaff, delete: isStaff },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        // A story staff hide leaves the daily editions at once, not at the next run.
        if (doc.status === 'hidden' && previousDoc?.status !== 'hidden')
          await dropFromEditions(req.payload, doc.key, req)
        revalidate(tags.news)
      },
    ],
    beforeDelete: [
      async ({ req, id, context }) => {
        if (!context?.[REMOVING_STORY]) await removeStory(req.payload, Number(id), req)
      },
    ],
    afterDelete: [() => revalidate(tags.news)],
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true, description: 'The id of the story’s first headline.' },
    },
    { name: 'title', type: 'text', required: true, admin: { readOnly: true } },
    {
      name: 'items',
      type: 'relationship',
      relationTo: 'news-items',
      hasMany: true,
      admin: { readOnly: true, description: 'Oldest first; the first is the lead.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'topic',
          type: 'select',
          required: true,
          index: true,
          options: topicOptions,
          admin: { readOnly: true },
        },
        {
          name: 'topics',
          type: 'select',
          hasMany: true,
          options: topicOptions,
          admin: { readOnly: true },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'sources',
          type: 'select',
          hasMany: true,
          options: newsSourceKeys.map((value) => ({ value, label: newsSources[value].name })),
          admin: { readOnly: true },
        },
        { name: 'sourceCount', type: 'number', admin: { readOnly: true } },
        { name: 'lang', type: 'select', options: ['ro', 'en'], admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'baseScore',
          type: 'number',
          index: true,
          admin: {
            readOnly: true,
            description: 'Topic × relevance × coverage × source. Pages multiply it by freshness.',
          },
        },
        { name: 'scoreParts', type: 'json', admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'firstSeen', type: 'date', required: true, index: true, admin: { readOnly: true } },
        { name: 'lastSeen', type: 'date', required: true, index: true, admin: { readOnly: true } },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'visible',
      index: true,
      options: [
        { value: 'visible', label: { ro: 'Vizibil', en: 'Visible' } },
        { value: 'hidden', label: { ro: 'Ascuns', en: 'Hidden' } },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'pinnedUntil',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Pinned at the top of “Important acum” until this time (at most 48 hours).',
      },
    },
  ],
}
