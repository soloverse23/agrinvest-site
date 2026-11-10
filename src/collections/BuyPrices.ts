import type { CollectionConfig } from 'payload'

import { isStaff } from '@/access'
import { dayOnly, publishedRowsOrStaff, publishStatus, toolsGroup } from '@/fields/tools'
import { revalidate, tags } from '@/lib/revalidate'

/**
 * Agrinvest's own buy prices, typed in by staff (decision 0008). Pages show only published
 * rows; with none, they say "price on request". Never filled from a guess or a market series.
 * A future automated feed writes here through REST with a staff API key (`source: feed`).
 */
export const BuyPrices: CollectionConfig = {
  slug: 'buy-prices',
  labels: {
    singular: { ro: 'Preț de achiziție', en: 'Buy price' },
    plural: { ro: 'Prețuri de achiziție', en: 'Buy prices' },
  },
  admin: {
    group: toolsGroup,
    useAsTitle: 'crop',
    defaultColumns: ['crop', 'base', 'price', 'basis', 'validFrom', 'status'],
  },
  defaultSort: '-validFrom',
  access: { read: publishedRowsOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    afterChange: [() => revalidate(tags.prices)],
    afterDelete: [() => revalidate(tags.prices)],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'crop',
          type: 'relationship',
          relationTo: 'crops',
          required: true,
          index: true,
          filterOptions: { isGrain: { equals: true } },
        },
        {
          name: 'base',
          type: 'relationship',
          relationTo: 'bases',
          index: true,
          admin: { description: 'Empty means the price applies at every base.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 1,
          admin: { description: 'Lei per tonne, before VAT.' },
        },
        {
          name: 'basis',
          type: 'select',
          required: true,
          defaultValue: 'la-baza',
          options: [
            { value: 'la-baza', label: { ro: 'Livrat la bază', en: 'Delivered to the base' } },
            {
              value: 'la-ferma',
              label: { ro: 'Ridicat de la fermă', en: 'Collected at the farm' },
            },
          ],
        },
        { name: 'validFrom', type: 'date', required: true, index: true, admin: dayOnly },
      ],
    },
    {
      name: 'note',
      type: 'textarea',
      localized: true,
      admin: { description: 'Shown under the price, e.g. quality terms or the harvest year.' },
    },
    publishStatus,
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [
        { value: 'manual', label: { ro: 'Introdus manual', en: 'Entered by hand' } },
        { value: 'feed', label: { ro: 'Flux automat', en: 'Automated feed' } },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
