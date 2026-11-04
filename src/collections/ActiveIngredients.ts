import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { faq, slug } from '@/fields'
import { featuredProducts, hubFields, shopGroup } from '@/fields/shop'
import { revalidate, tags } from '@/lib/revalidate'

/** Active substances (`/magazin/substanta-activa/{slug}`), linked from crop protection products. */
export const ActiveIngredients: CollectionConfig = {
  slug: 'active-ingredients',
  labels: {
    singular: { ro: 'Substanță activă', en: 'Active ingredient' },
    plural: { ro: 'Substanțe active', en: 'Active ingredients' },
  },
  admin: {
    group: shopGroup,
    useAsTitle: 'name',
    defaultColumns: ['name', 'chemicalGroup', 'resistanceGroup', 'products', '_status'],
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    afterChange: [() => revalidate(tags.ingredients, tags.products)],
    afterDelete: [() => revalidate(tags.ingredients, tags.products)],
  },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'chemicalGroup',
          type: 'text',
          localized: true,
          label: { ro: 'Grupă chimică', en: 'Chemical group' },
        },
        {
          name: 'resistanceGroup',
          type: 'text',
          label: { ro: 'Grupă de rezistență', en: 'Resistance group' },
          admin: { description: 'HRAC, FRAC or IRAC code.' },
        },
      ],
    },
    ...hubFields,
    faq,
    featuredProducts,
    {
      name: 'products',
      type: 'join',
      collection: 'products',
      on: 'protection.activeIngredients.ingredient',
      label: { ro: 'Produse', en: 'Products' },
      defaultLimit: 20,
      admin: { defaultColumns: ['name', 'commerceStatus', '_status'] },
    },
    slug('name', true),
  ],
}
