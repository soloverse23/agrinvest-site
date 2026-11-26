import type { CollectionConfig } from 'payload'

import {} from '@/access'
import { toolsGroup } from '@/fields/tools'
import { adminOnly, hiddenUnlessAdmin } from '@/access/departments'

/**
 * One row per hourly news run: what each source answered, what was added or refused, and
 * the run's state. It is also the run lock (a `running` row younger than ten minutes) and
 * each source's memory: its last ETag, and how many runs in a row it failed. Kept 30 days.
 */
export const NewsRuns: CollectionConfig = {
  slug: 'news-runs',
  labels: {
    singular: { ro: 'Rulare știri', en: 'News run' },
    plural: { ro: 'Rulări știri', en: 'News runs' },
  },
  admin: {
    hidden: hiddenUnlessAdmin,
    group: toolsGroup,
    useAsTitle: 'startedAt',
    defaultColumns: ['startedAt', 'status', 'created', 'summary'],
  },
  defaultSort: '-startedAt',
  access: { read: adminOnly, create: () => false, update: () => false, delete: adminOnly },
  fields: [
    { name: 'startedAt', type: 'date', required: true, index: true, admin: { readOnly: true } },
    { name: 'finishedAt', type: 'date', admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      required: true,
      index: true,
      options: [
        { value: 'running', label: { ro: 'În lucru', en: 'Running' } },
        { value: 'ok', label: { ro: 'Reușită', en: 'OK' } },
        { value: 'partial', label: { ro: 'Parțială', en: 'Partial' } },
        { value: 'failed', label: { ro: 'Eșuată', en: 'Failed' } },
      ],
      admin: { readOnly: true },
    },
    { name: 'created', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'summary', type: 'text', admin: { readOnly: true } },
    {
      name: 'sources',
      type: 'json',
      admin: {
        readOnly: true,
        description:
          'Per source: state (ok, unchanged, failed, paused, off), HTTP status, items new / known / refused, error, ETag.',
      },
    },
  ],
}
