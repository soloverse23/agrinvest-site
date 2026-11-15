import type { Access, CollectionConfig } from 'payload'

import { isStaff, staffRequest } from '@/access'
import { toolsGroup } from '@/fields/tools'
import { revalidate, tags } from '@/lib/revalidate'

const publishedOrStaff: Access = ({ req }) =>
  staffRequest(req) ? true : { status: { equals: 'published' } }

/**
 * One page a day (`/stiri/zi/{date}`): the day's stories in ranked order, built by the
 * hourly job and frozen after midnight. `entries` is a snapshot (titles, links, sources),
 * so an edition still reads the same after its stories leave the 48-hour window. Removing a
 * day takes its page off the site; the job does not rebuild a removed day.
 */
export const NewsEditions: CollectionConfig = {
  slug: 'news-editions',
  labels: {
    singular: { ro: 'Ediție zilnică', en: 'Daily edition' },
    plural: { ro: 'Ediții zilnice', en: 'Daily editions' },
  },
  admin: {
    group: toolsGroup,
    useAsTitle: 'date',
    defaultColumns: ['date', 'count', 'frozen', 'status'],
  },
  defaultSort: '-date',
  access: { read: publishedOrStaff, create: () => false, update: isStaff, delete: isStaff },
  hooks: {
    afterChange: [() => revalidate(tags.news)],
    afterDelete: [() => revalidate(tags.news)],
  },
  fields: [
    {
      name: 'date',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true, description: 'yyyy-mm-dd, Bucharest time.' },
    },
    { name: 'count', type: 'number', admin: { readOnly: true } },
    { name: 'entries', type: 'json', required: true, admin: { readOnly: true } },
    {
      name: 'frozen',
      type: 'checkbox',
      defaultValue: false,
      admin: { readOnly: true, description: 'The day is over; the job no longer changes it.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'published',
      index: true,
      options: [
        { value: 'published', label: { ro: 'Publicată', en: 'Published' } },
        { value: 'removed', label: { ro: 'Scoasă de pe site', en: 'Removed' } },
      ],
      admin: { position: 'sidebar', description: 'Removed days are not rebuilt.' },
    },
  ],
}
