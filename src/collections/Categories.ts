import { ValidationError, type CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { faq, slug } from '@/fields'
import { featuredProducts, hubFields, shopGroup } from '@/fields/shop'
import { revalidate, tags } from '@/lib/revalidate'
import { reservedCategorySlugs } from '@/lib/shop/rules'

/**
 * Shop categories, two levels deep. Every category has a one-segment URL
 * (`/magazin/erbicide`), whatever its parent, and a product's URL uses its primary category.
 */
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: { ro: 'Categorie', en: 'Category' },
    plural: { ro: 'Categorii', en: 'Categories' },
  },
  admin: {
    group: shopGroup,
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'parent', 'order', 'products', 'indexable', '_status'],
  },
  defaultSort: 'order',
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if ((reservedCategorySlugs as readonly string[]).includes(data?.slug))
          throw new ValidationError({
            collection: 'categories',
            errors: [{ path: 'slug', message: `"${data?.slug}" is reserved for a shop route.` }],
          })
        return data
      },
    ],
    afterChange: [() => revalidate(tags.categories, tags.products)],
    afterDelete: [() => revalidate(tags.categories, tags.products)],
  },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'role',
          type: 'select',
          required: true,
          defaultValue: 'category',
          label: { ro: 'Rol', en: 'Role' },
          options: [
            { label: { ro: 'Grup de categorii', en: 'Group of categories' }, value: 'group' },
            { label: { ro: 'Categorie', en: 'Category' }, value: 'category' },
            {
              label: { ro: 'Temă (doar secundară)', en: 'Theme (secondary only)' },
              value: 'theme',
            },
          ],
          admin: {
            description:
              'Products get a Category as their primary one. Groups only hold categories; themes cut across them.',
          },
        },
        {
          name: 'parent',
          type: 'relationship',
          relationTo: 'categories',
          label: { ro: 'Părinte', en: 'Parent' },
          filterOptions: ({ id }) => ({
            role: { equals: 'group' },
            ...(id ? { id: { not_equals: id } } : {}),
          }),
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0,
          label: { ro: 'Ordine', en: 'Order' },
        },
      ],
    },
    {
      name: 'icon',
      type: 'select',
      label: { ro: 'Pictogramă', en: 'Icon' },
      options: ['leaf', 'drop', 'silo', 'scale', 'document'],
    },
    ...hubFields,
    {
      name: 'buyingAdvice',
      type: 'richText',
      localized: true,
      label: { ro: 'Sfaturi de alegere', en: 'Buying advice' },
    },
    faq,
    featuredProducts,
    {
      name: 'facets',
      type: 'select',
      hasMany: true,
      label: { ro: 'Filtre afișate', en: 'Filters shown' },
      defaultValue: ['crop', 'brand', 'stock'],
      options: [
        { label: { ro: 'Cultură', en: 'Crop' }, value: 'crop' },
        { label: { ro: 'Producător', en: 'Brand' }, value: 'brand' },
        { label: { ro: 'Țintă', en: 'Target' }, value: 'target' },
        { label: { ro: 'Substanță activă', en: 'Active ingredient' }, value: 'ingredient' },
        { label: { ro: 'Formulare', en: 'Formulation' }, value: 'formulation' },
        { label: { ro: 'Stoc', en: 'Stock' }, value: 'stock' },
      ],
    },
    {
      name: 'products',
      type: 'join',
      collection: 'products',
      on: 'primaryCategory',
      label: { ro: 'Produse', en: 'Products' },
      defaultLimit: 20,
      admin: { defaultColumns: ['name', 'commerceStatus', '_status'] },
    },
    slug('name', true),
  ],
}
