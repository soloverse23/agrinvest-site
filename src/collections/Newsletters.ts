import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'

import { isStaff } from '@/access'
import { dayOnly, toolsGroup } from '@/fields/tools'
import { locales } from '@/i18n/config'
import { queueNewsletter } from '@/lib/news/queue'
import type { Newsletter } from '@/payload-types'

/** Approving an issue puts it in the Outbox once, then marks it queued. */
const queueOnApprove: CollectionAfterChangeHook<Newsletter> = async ({ doc, previousDoc, req }) => {
  if (doc.status !== 'approved' || previousDoc?.status === 'approved') return doc
  await queueNewsletter(req.payload, doc)
  return req.payload.update({
    collection: 'newsletters',
    id: doc.id,
    data: { status: 'queued' },
    depth: 0,
    req,
  })
}

/**
 * The weekly newsletter, one issue per week and language. `buildNewsletter` drafts it from
 * the week's market note, prices and approved headlines; staff review and approve it.
 * Approving queues it to the Outbox, where it stays unsent until a provider exists.
 */
export const Newsletters: CollectionConfig = {
  slug: 'newsletters',
  labels: {
    singular: { ro: 'Buletin săptămânal', en: 'Newsletter issue' },
    plural: { ro: 'Buletine săptămânale', en: 'Newsletter' },
  },
  admin: {
    group: toolsGroup,
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'week', 'locale', 'status'],
  },
  defaultSort: '-week',
  access: { read: isStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [queueOnApprove] },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      admin: { readOnly: true, description: 'week|locale' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'week',
          type: 'date',
          required: true,
          index: true,
          admin: { ...dayOnly, description: 'Monday of the week.' },
        },
        { name: 'locale', type: 'select', required: true, options: [...locales] },
      ],
    },
    { name: 'subject', type: 'text', required: true },
    { name: 'intro', type: 'textarea' },
    {
      name: 'content',
      type: 'json',
      admin: { description: 'Generated sections: market note, prices, headlines.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { value: 'draft', label: { ro: 'Ciornă', en: 'Draft' } },
        { value: 'approved', label: { ro: 'Aprobat', en: 'Approved' } },
        { value: 'queued', label: { ro: 'Pus în Outbox', en: 'Queued to the Outbox' } },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
