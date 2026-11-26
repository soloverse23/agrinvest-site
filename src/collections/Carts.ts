import type { CollectionConfig } from 'payload'

import {} from '@/access'
import { shopGroup } from '@/fields/shop'
import { adminOnly, hiddenUnlessAdmin } from '@/access/departments'

/**
 * Anonymous carts, found by the token in a cookie. A cart holds only SKUs and quantities:
 * names and prices are read from the products every time, so a cart can never carry a price.
 * Written only by the server actions (Local API); nobody reaches them through the API.
 */
export const Carts: CollectionConfig = {
  slug: 'carts',
  labels: { singular: { ro: 'Coș', en: 'Cart' }, plural: { ro: 'Coșuri', en: 'Carts' } },
  admin: {
    hidden: hiddenUnlessAdmin,
    group: shopGroup,
    useAsTitle: 'token',
    defaultColumns: ['token', 'updatedAt'],
  },
  access: { read: adminOnly, create: () => false, update: () => false, delete: adminOnly },
  fields: [
    { name: 'token', type: 'text', required: true, unique: true, index: true },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'sku', type: 'text', required: true },
            { name: 'quantity', type: 'number', required: true, min: 1 },
          ],
        },
      ],
    },
  ],
}
