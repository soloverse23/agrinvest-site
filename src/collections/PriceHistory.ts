import type { CollectionConfig } from 'payload'

import { isStaff } from '@/access'
import { shopGroup } from '@/fields/shop'

/**
 * One row each time a published pack size changes price, written by the Products hook. It
 * is append-only. Staff-only until the price pages (Phase 5) decide what goes public; rows
 * outlive a deleted product, so the product link is optional and the SKU is the key.
 */
export const PriceHistory: CollectionConfig = {
  slug: 'price-history',
  labels: {
    singular: { ro: 'Preț înregistrat', en: 'Price record' },
    plural: { ro: 'Istoric prețuri', en: 'Price history' },
  },
  admin: {
    group: shopGroup,
    useAsTitle: 'sku',
    defaultColumns: ['sku', 'product', 'price', 'date'],
  },
  defaultSort: '-date',
  access: { read: isStaff, create: () => false, update: () => false, delete: () => false },
  fields: [
    { name: 'product', type: 'relationship', relationTo: 'products', index: true },
    { name: 'sku', type: 'text', required: true, index: true },
    { name: 'price', type: 'number', required: true, admin: { description: 'Lei.' } },
    { name: 'date', type: 'date', required: true, index: true },
    { name: 'source', type: 'text' },
  ],
}
