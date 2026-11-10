import type { CollectionConfig } from 'payload'

import { isStaff } from '@/access'
import { toolsGroup } from '@/fields/tools'
import { messageChannels, messageTemplates } from '@/lib/messaging/types'

/**
 * Every message the site would send (alerts, newsletters, confirmations), written by
 * `sendMessage`. Until the owner picks a provider each row is `stubbed`: nothing leaves the
 * site, and staff can read here what would have gone out (decision 0008). Nobody edits a row.
 */
export const Outbox: CollectionConfig = {
  slug: 'outbox',
  labels: {
    singular: { ro: 'Mesaj de trimis', en: 'Outgoing message' },
    plural: { ro: 'Mesaje de trimis', en: 'Outbox' },
  },
  admin: {
    group: toolsGroup,
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'to', 'template', 'channel', 'status', 'createdAt'],
  },
  defaultSort: '-createdAt',
  access: { read: isStaff, create: () => false, update: () => false, delete: isStaff },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'channel', type: 'select', required: true, options: [...messageChannels] },
        { name: 'to', type: 'text', required: true, index: true },
        { name: 'template', type: 'select', required: true, options: [...messageTemplates] },
      ],
    },
    { name: 'subject', type: 'text', required: true },
    { name: 'body', type: 'textarea', required: true },
    { name: 'payload', type: 'json' },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'stubbed',
          index: true,
          options: [
            {
              value: 'stubbed',
              label: { ro: 'Netrimis (fără furnizor)', en: 'Not sent (no provider)' },
            },
            { value: 'sent', label: { ro: 'Trimis', en: 'Sent' } },
            { value: 'failed', label: { ro: 'Eșuat', en: 'Failed' } },
          ],
        },
        { name: 'subscription', type: 'relationship', relationTo: 'subscriptions' },
        {
          name: 'dedupeKey',
          type: 'text',
          unique: true,
          admin: { description: 'Stops the same alert from being written twice.' },
        },
      ],
    },
    { name: 'error', type: 'text' },
  ],
}
