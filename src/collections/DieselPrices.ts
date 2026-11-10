import type { CollectionConfig } from 'payload'

import { isStaff } from '@/access'
import { dayOnly, publishedRowsOrStaff, publishStatus, toolsGroup } from '@/fields/tools'
import { revalidate, tags } from '@/lib/revalidate'

/** Agrinvest's diesel price, typed in by staff. Without a published row, pages say "on request". */
export const DieselPrices: CollectionConfig = {
  slug: 'diesel-prices',
  labels: {
    singular: { ro: 'Preț motorină', en: 'Diesel price' },
    plural: { ro: 'Prețuri motorină', en: 'Diesel prices' },
  },
  admin: {
    group: toolsGroup,
    useAsTitle: 'price',
    defaultColumns: ['price', 'vat', 'minimumLitres', 'validFrom', 'status'],
  },
  defaultSort: '-validFrom',
  access: { read: publishedRowsOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    afterChange: [() => revalidate(tags.diesel)],
    afterDelete: [() => revalidate(tags.diesel)],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0.01,
          admin: { description: 'Lei per litre.', step: 0.01 },
        },
        {
          name: 'vat',
          type: 'select',
          required: true,
          defaultValue: 'fara-tva',
          options: [
            { value: 'fara-tva', label: { ro: 'Fără TVA', en: 'Before VAT' } },
            { value: 'cu-tva', label: { ro: 'Cu TVA', en: 'VAT included' } },
          ],
        },
        { name: 'validFrom', type: 'date', required: true, index: true, admin: dayOnly },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'minimumLitres', type: 'number', min: 0, admin: { description: 'Litres.' } },
        {
          name: 'counties',
          type: 'relationship',
          relationTo: 'counties',
          hasMany: true,
          admin: { description: 'Delivery counties. Empty means on request.' },
        },
      ],
    },
    { name: 'note', type: 'textarea', localized: true },
    publishStatus,
  ],
}
