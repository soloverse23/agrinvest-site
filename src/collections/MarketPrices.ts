import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '@/access'
import { dayOnly, toolsGroup } from '@/fields/tools'
import { marketSourceKeys, marketSources } from '@/lib/sources'

/**
 * Public market series (EU cereal, fertiliser and diesel prices), one row per source, series,
 * market and period. Written only by the fetch jobs (Local API); `key` makes each write an
 * upsert, so a job that runs twice adds nothing. Staff may delete a bad row; nobody edits one.
 */
export const MarketPrices: CollectionConfig = {
  slug: 'market-prices',
  labels: {
    singular: { ro: 'Preț de piață', en: 'Market price' },
    plural: { ro: 'Prețuri de piață', en: 'Market prices' },
  },
  admin: {
    group: toolsGroup,
    useAsTitle: 'key',
    defaultColumns: ['source', 'series', 'market', 'period', 'price', 'unit'],
  },
  defaultSort: '-period',
  access: { read: anyone, create: () => false, update: () => false, delete: isStaff },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      admin: { readOnly: true, description: 'source|series|market|period' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'source',
          type: 'select',
          required: true,
          index: true,
          options: marketSourceKeys.map((value) => ({
            value,
            label: marketSources[value].name,
          })),
        },
        {
          name: 'series',
          type: 'text',
          required: true,
          index: true,
          admin: { description: 'Crop key, fertiliser product or fuel, e.g. "porumb", "diesel".' },
        },
        {
          name: 'market',
          type: 'text',
          required: true,
          admin: { description: 'Market or stage as the source names it.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'price', type: 'number', required: true },
        { name: 'currency', type: 'text', required: true, defaultValue: 'EUR' },
        { name: 'unit', type: 'text', required: true, admin: { description: 'e.g. t, 1000 l' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'period',
          type: 'date',
          required: true,
          index: true,
          admin: { ...dayOnly, description: 'Start of the week or month the price is for.' },
        },
        { name: 'fetchedAt', type: 'date', required: true },
      ],
    },
  ],
}
