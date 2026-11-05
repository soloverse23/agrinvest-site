import { ValidationError, type CollectionConfig, type Field } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { faq, seo, slug } from '@/fields'
import { fileKey, financeGroup, review, sources } from '@/fields/finance'
import { enrichmentLedger } from '@/fields/shop'
import { reservedFinanceSlugs } from '@/i18n/routes'
import {
  borrowerKinds,
  borrowerLabels,
  documentAudienceLabels,
  documentAudiences,
  guaranteeKinds,
  guaranteeLabels,
  optionsOf,
} from '@/lib/finance/options'
import { revalidate, tags } from '@/lib/revalidate'

const label = (ro: string, en: string) => ({ ro, en })

/** A fixed section of the page. Required, so a page cannot be published with one missing. */
const section = (name: string, ro: string, en: string, description?: string): Field => ({
  name,
  type: 'richText',
  localized: true,
  required: true,
  label: label(ro, en),
  admin: description ? { description } : undefined,
})

/**
 * Credit products of Agrinvest Credit IFN: `/finantare/{slug}`, and one level deeper for the
 * investment pages (`/finantare/credit-investitii/utilaje`). The sections are fields, not free
 * blocks, so every product answers the same questions and `check:finance` can measure them.
 * Facts about Agrinvest are written as `{{KEY}}`, so they stay marked until confirmed.
 */
export const FinanceProducts: CollectionConfig = {
  slug: 'finance-products',
  labels: {
    singular: label('Produs de finanțare', 'Finance product'),
    plural: label('Produse de finanțare', 'Finance products'),
  },
  admin: {
    group: financeGroup,
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'parent', 'review.legalStatus', '_status', 'updatedAt'],
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (reservedFinanceSlugs.has(data?.slug))
          throw new ValidationError({
            collection: 'finance-products',
            errors: [{ path: 'slug', message: `"${data?.slug}" is reserved for a finance route.` }],
          })
        return data
      },
    ],
    afterChange: [() => revalidate(tags.finance)],
    afterDelete: [() => revalidate(tags.finance)],
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    fileKey,
    slug('title', true),
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'finance-products',
      admin: { position: 'sidebar', description: 'Only for the investment pages.' },
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar', description: 'Position on the finance hub.' },
    },
    {
      name: 'answer',
      type: 'textarea',
      localized: true,
      required: true,
      label: label('Răspuns direct', 'Direct answer'),
      admin: { description: 'Two or three sentences at the top: what it is, who it is for.' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: label('Conținut', 'Content'),
          fields: [
            section('fits', 'Pentru cine este', 'Who it fits'),
            section(
              'notFor',
              'Când nu este potrivit',
              'When it does not fit',
              'Honest limits build trust and stop the wrong applications.',
            ),
            section('finances', 'Ce finanțează', 'What it finances'),
            section('repayment', 'Rambursarea', 'Repayment'),
            {
              name: 'harvestCalendar',
              type: 'checkbox',
              defaultValue: true,
              label: label('Arată calendarul ratelor', 'Show the instalment calendar'),
              admin: { description: 'Off where repayment does not follow the harvests.' },
            },
            {
              name: 'example',
              type: 'group',
              label: label('Exemplu', 'Worked example'),
              admin: {
                description: 'Principal only, round numbers, always labelled as an example.',
              },
              fields: [
                { name: 'title', type: 'text', localized: true, required: true },
                { name: 'scenario', type: 'richText', localized: true, required: true },
                {
                  name: 'rows',
                  type: 'array',
                  localized: true,
                  minRows: 1,
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'label', type: 'text', required: true },
                        { name: 'value', type: 'text', required: true },
                      ],
                    },
                  ],
                },
              ],
            },
            section('risks', 'Riscuri și ce faci din timp', 'Risks, and what to do early'),
          ],
        },
        {
          label: label('Condiții', 'Terms'),
          fields: [
            {
              name: 'borrowers',
              type: 'select',
              hasMany: true,
              options: optionsOf(borrowerKinds, borrowerLabels),
              label: label('Cine poate solicita', 'Who can apply'),
            },
            {
              name: 'guarantees',
              type: 'array',
              localized: true,
              label: label('Garanții', 'Guarantees'),
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'kind',
                      type: 'select',
                      required: true,
                      options: optionsOf(guaranteeKinds, guaranteeLabels),
                    },
                    { name: 'note', type: 'text', required: true },
                  ],
                },
              ],
            },
            {
              name: 'documents',
              type: 'array',
              localized: true,
              label: label('Documente', 'Documents'),
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'audience',
                      type: 'select',
                      required: true,
                      defaultValue: 'all',
                      options: optionsOf(documentAudiences, documentAudienceLabels),
                    },
                    { name: 'label', type: 'text', required: true },
                  ],
                },
              ],
            },
            {
              name: 'process',
              type: 'array',
              localized: true,
              label: label('Pași', 'Process'),
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'body', type: 'textarea', required: true },
              ],
            },
            {
              name: 'limits',
              type: 'group',
              label: label('Limite publicate', 'Published limits'),
              admin: {
                description:
                  'Only what the IFN allows. JSON-LD states these once the status is confirmed.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'amountMin', type: 'number', min: 0 },
                    { name: 'amountMax', type: 'number', min: 0 },
                    { name: 'termMonths', type: 'number', min: 1 },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: label('Întrebări și legături', 'FAQ and links'),
          fields: [
            faq,
            {
              name: 'advisor',
              type: 'relationship',
              relationTo: 'people',
              label: label('Persoană de contact', 'Contact person'),
            },
            {
              name: 'relatedProducts',
              type: 'relationship',
              relationTo: 'finance-products',
              hasMany: true,
              filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
            },
            { name: 'relatedGuides', type: 'relationship', relationTo: 'guides', hasMany: true },
            sources,
          ],
        },
        { label: 'SEO', fields: [seo] },
      ],
    },
    review,
    enrichmentLedger,
  ],
}
