import type { CollectionConfig } from 'payload'

import { isStaff, isStaffField } from '@/access'
import { toolsGroup } from '@/fields/tools'
import { locales } from '@/i18n/config'
import { alertRules, subscriptionTopics, topicLabels } from '@/lib/subscriptions/topics'

/**
 * Alert and newsletter sign-ups. Created only by the `subscribe` server action (Local API).
 * Each row keeps the exact consent text the visitor agreed to, in their language, with the
 * time. Rows stay `pending` until a sending provider exists, because a confirmation message
 * cannot be sent yet (decision 0008).
 */
export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
  labels: {
    singular: { ro: 'Abonare', en: 'Subscription' },
    plural: { ro: 'Abonări', en: 'Subscriptions' },
  },
  admin: {
    group: toolsGroup,
    useAsTitle: 'email',
    defaultColumns: ['email', 'phone', 'channel', 'status', 'createdAt'],
  },
  access: { read: isStaff, create: () => false, update: isStaff, delete: isStaff },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'channel',
          type: 'select',
          required: true,
          defaultValue: 'email',
          options: [
            { value: 'email', label: 'E-mail' },
            { value: 'whatsapp', label: 'WhatsApp' },
          ],
        },
        { name: 'email', type: 'email', index: true },
        { name: 'phone', type: 'text', index: true },
        { name: 'locale', type: 'select', required: true, options: [...locales] },
      ],
    },
    {
      name: 'topics',
      type: 'array',
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'kind',
              type: 'select',
              required: true,
              options: subscriptionTopics.map((value) => ({ value, label: topicLabels[value] })),
            },
            {
              name: 'crop',
              type: 'relationship',
              relationTo: 'crops',
              filterOptions: { isGrain: { equals: true } },
            },
            { name: 'rule', type: 'select', options: [...alertRules] },
            { name: 'threshold', type: 'number', admin: { description: 'Lei per tonne.' } },
            { name: 'county', type: 'relationship', relationTo: 'counties' },
          ],
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { value: 'pending', label: { ro: 'În așteptare', en: 'Pending' } },
        { value: 'confirmed', label: { ro: 'Confirmată', en: 'Confirmed' } },
        { value: 'unsubscribed', label: { ro: 'Dezabonat', en: 'Unsubscribed' } },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'consent',
      type: 'group',
      admin: { readOnly: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'version', type: 'text', required: true },
            { name: 'at', type: 'date', required: true },
          ],
        },
        { name: 'text', type: 'textarea', required: true },
        { name: 'sourcePath', type: 'text' },
      ],
    },
    {
      name: 'token',
      type: 'text',
      required: true,
      unique: true,
      // The unsubscribe link carries it; staff never need to see it.
      admin: { hidden: true },
      access: { read: isStaffField },
    },
  ],
}
