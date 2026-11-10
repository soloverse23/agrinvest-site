import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { faq, seo, slug } from '@/fields'
import { fileKey, financeGroup, review, sources } from '@/fields/finance'
import { enrichmentLedger } from '@/fields/shop'
import { revalidate, tags } from '@/lib/revalidate'

const label = (ro: string, en: string) => ({ ro, en })

/**
 * Long guides. Only the finance section uses them for now; `section` is here so the article
 * engine (Phase 6) extends this collection instead of migrating it. Every public fact in a
 * guide has a source, and the page shows who wrote it, who checked it and when.
 */
export const Guides: CollectionConfig = {
  slug: 'guides',
  labels: { singular: label('Ghid', 'Guide'), plural: label('Ghiduri', 'Guides') },
  admin: {
    group: financeGroup,
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'section', 'review.legalStatus', '_status', 'updatedAt'],
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    afterChange: [() => revalidate(tags.guides)],
    afterDelete: [() => revalidate(tags.guides)],
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    fileKey,
    slug('title', true),
    {
      name: 'section',
      type: 'select',
      required: true,
      defaultValue: 'finantare',
      options: [
        { value: 'finantare', label: label('Finanțare', 'Financing') },
        { value: 'pagina-finantare', label: label('Pagină fixă', 'Fixed finance page') },
        { value: 'stiri', label: label('Știri Agrinvest', 'Agrinvest news') },
        { value: 'piata', label: label('Nota de piață', 'Market note') },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
      required: true,
      label: label('Răspuns direct', 'Direct answer'),
    },
    { name: 'body', type: 'richText', localized: true, required: true },
    {
      name: 'terms',
      type: 'array',
      localized: true,
      label: label('Termeni', 'Terms'),
      admin: { description: 'Only for the glossary.' },
      fields: [
        { name: 'term', type: 'text', required: true },
        { name: 'definition', type: 'textarea', required: true },
      ],
    },
    faq,
    {
      type: 'row',
      fields: [
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'people',
          label: label('Autor', 'Author'),
        },
        {
          name: 'reviewer',
          type: 'relationship',
          relationTo: 'people',
          label: label('Verificat de', 'Reviewed by'),
        },
      ],
    },
    {
      name: 'relatedProducts',
      type: 'relationship',
      relationTo: 'finance-products',
      hasMany: true,
    },
    {
      name: 'relatedGuides',
      type: 'relationship',
      relationTo: 'guides',
      hasMany: true,
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    sources,
    seo,
    review,
    enrichmentLedger,
  ],
}
