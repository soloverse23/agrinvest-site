import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { isStaff } from '@/access'
import { locales } from '@/i18n/config'
import { routedPerson } from '@/lib/leads/routing'
import { leadTypeOptions } from '@/lib/leads/types'

/** Assigns a new lead to the person set for its type in the Lead routing global. */
const assign: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create' || data.assignedTo) return data
  data.assignedTo = await routedPerson(req, data.type)
  return data
}

/**
 * Enquiries from the site's forms. Created only by the `submitLead` server action
 * (Local API); visitors can neither read nor create through the REST or GraphQL API.
 */
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: { ro: 'Cerere', en: 'Lead' }, plural: { ro: 'Cereri', en: 'Leads' } },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'phone', 'assignedTo', 'status', 'createdAt'],
  },
  access: { read: isStaff, create: () => false, update: isStaff, delete: isStaff },
  hooks: { beforeChange: [assign] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'type', type: 'select', required: true, options: leadTypeOptions },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          options: [
            { value: 'new', label: { ro: 'Nouă', en: 'New' } },
            { value: 'contacted', label: { ro: 'Contactat', en: 'Contacted' } },
            { value: 'closed', label: { ro: 'Închisă', en: 'Closed' } },
          ],
        },
        { name: 'assignedTo', type: 'relationship', relationTo: 'people' },
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
        { name: 'company', type: 'text' },
        { name: 'cui', type: 'text', label: 'CUI' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'county', type: 'relationship', relationTo: 'counties' },
        { name: 'base', type: 'relationship', relationTo: 'bases' },
        {
          name: 'crop',
          type: 'relationship',
          relationTo: 'crops',
          filterOptions: { isGrain: { equals: true } },
        },
      ],
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: { ro: 'Produse', en: 'Products' },
      admin: { description: 'The product or cart a quote request came from.' },
    },
    {
      type: 'row',
      admin: { condition: (data) => data?.type === 'motorina' },
      fields: [
        { name: 'quantity', type: 'number', min: 0, admin: { description: 'Litres.' } },
        {
          name: 'deliveryDate',
          type: 'date',
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
      ],
    },
    { name: 'message', type: 'textarea' },
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
            { name: 'consentVersion', type: 'text' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'utmSource', type: 'text' },
            { name: 'utmMedium', type: 'text' },
            { name: 'utmCampaign', type: 'text' },
          ],
        },
      ],
    },
    { name: 'notes', type: 'textarea', admin: { description: 'Internal notes.' } },
  ],
}
