import type { GlobalConfig, RelationshipField } from 'payload'

import { anyone, isStaff } from '@/access'
import { link } from '@/fields'
import { featuredProducts, shopGroup } from '@/fields/shop'
import { revalidate, tags } from '@/lib/revalidate'

/**
 * The shop landing's editable parts (Phase 7c): the seasonal promo card in the hero and the
 * featured products. Without a promo, or after its end date, the card falls back to the
 * category with the most products in stock for the season (`seasonalCategory`).
 */
export const ShopHome: GlobalConfig = {
  slug: 'shop-home',
  label: { ro: 'Pagina magazinului', en: 'Shop landing' },
  admin: { group: shopGroup },
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [() => revalidate(tags.global('shop-home'))] },
  fields: [
    {
      name: 'promo',
      type: 'group',
      label: { ro: 'Card promoțional', en: 'Promo card' },
      admin: {
        description:
          'Shown in the hero while it has a title and a link and its end date has not passed.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'kicker',
              type: 'text',
              localized: true,
              label: { ro: 'Supratitlu', en: 'Kicker' },
              admin: { placeholder: 'Sezonul de toamnă' },
            },
            {
              name: 'endsAt',
              type: 'date',
              label: { ro: 'Se ascunde după', en: 'Hide after' },
              admin: { date: { pickerAppearance: 'dayOnly' } },
            },
          ],
        },
        { name: 'title', type: 'text', localized: true, label: { ro: 'Titlu', en: 'Title' } },
        { name: 'text', type: 'textarea', localized: true, label: { ro: 'Text', en: 'Text' } },
        {
          ...link('link'),
          label: {
            ro: 'Link (categorie, cultură sau filtru)',
            en: 'Link (category, crop or filter)',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: { ro: 'Imagine', en: 'Image' },
        },
      ],
    },
    {
      ...(featuredProducts as RelationshipField),
      admin: { description: 'Up to 8. Empty: the newest in stock.' },
    },
  ],
}
