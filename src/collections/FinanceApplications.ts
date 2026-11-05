import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { ifnRequest, isIfn } from '@/access'
import { financeGroup } from '@/fields/finance'
import { locales } from '@/i18n/config'
import { routedPerson } from '@/lib/leads/routing'
import {
  borrowerKinds,
  borrowerLabels,
  guaranteeKinds,
  guaranteeLabels,
  optionsOf,
} from '@/lib/finance/options'

const label = (ro: string, en: string) => ({ ro, en })

/** A new application goes to the person who owns financing requests, like a lead. */
const assign: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create' || data.assignedTo) return data
  data.assignedTo = await routedPerson(req, 'finantare')
  return data
}

/**
 * Credit applications. Only the IFN team can read them: not every staff account, and never the
 * public API. Created only by a server action. An application holds no files and no personal
 * numeric code (decision 0007): the IFN collects documents after contact, and the site runs no
 * credit check and takes no decision.
 */
export const FinanceApplications: CollectionConfig = {
  slug: 'finance-applications',
  labels: {
    singular: label('Cerere de credit', 'Credit application'),
    plural: label('Cereri de credit', 'Credit applications'),
  },
  admin: {
    group: financeGroup,
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'name', 'phone', 'status', 'assignedTo', 'createdAt'],
    hidden: ({ user }) => !ifnRequest({ user: user as never }),
  },
  defaultSort: '-createdAt',
  access: { read: isIfn, create: () => false, update: isIfn, delete: isIfn },
  hooks: { beforeChange: [assign] },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'reference',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          admin: { readOnly: true },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          options: [
            { value: 'new', label: label('Nouă', 'New') },
            { value: 'contacted', label: label('Contactat', 'Contacted') },
            { value: 'in-analysis', label: label('În analiză', 'In analysis') },
            { value: 'closed', label: label('Închisă', 'Closed') },
          ],
        },
        { name: 'assignedTo', type: 'relationship', relationTo: 'people' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'borrower',
          type: 'select',
          required: true,
          options: optionsOf(borrowerKinds, borrowerLabels),
          label: label('Forma de organizare', 'Legal form'),
        },
        { name: 'company', type: 'text' },
        { name: 'cui', type: 'text', label: 'CUI' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'finance-products',
          label: label('Produs', 'Product'),
        },
        { name: 'amount', type: 'number', min: 0, label: label('Suma (lei)', 'Amount (lei)') },
        {
          name: 'termMonths',
          type: 'number',
          min: 1,
          label: label('Durata (luni)', 'Term (months)'),
        },
      ],
    },
    {
      name: 'guarantees',
      type: 'select',
      hasMany: true,
      options: optionsOf(guaranteeKinds, guaranteeLabels),
      label: label('Garanții propuse', 'Guarantees offered'),
    },
    {
      type: 'row',
      fields: [
        { name: 'county', type: 'relationship', relationTo: 'counties' },
        { name: 'crops', type: 'relationship', relationTo: 'crops', hasMany: true },
        { name: 'area', type: 'number', min: 0, label: label('Suprafața (ha)', 'Area (ha)') },
      ],
    },
    { name: 'message', type: 'textarea' },
    {
      name: 'consents',
      type: 'group',
      admin: { readOnly: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'dataProcessing', type: 'checkbox', required: true },
            { name: 'creditBureau', type: 'checkbox' },
            { name: 'version', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'meta',
      type: 'group',
      admin: { readOnly: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'locale', type: 'select', options: [...locales] },
            { name: 'sourcePath', type: 'text' },
            { name: 'utmSource', type: 'text' },
            { name: 'utmCampaign', type: 'text' },
          ],
        },
      ],
    },
    { name: 'notes', type: 'textarea', admin: { description: 'Internal notes.' } },
  ],
}
