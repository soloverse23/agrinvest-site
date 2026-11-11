import {
  ValidationError,
  type CollectionBeforeChangeHook,
  type CollectionBeforeValidateHook,
  type CollectionConfig,
} from 'payload'

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
 * Contact rules per type (decision 0010). A quick request needs one contact, a phone or an
 * email, and no name. Every other type needs a name, a phone and an email.
 */
export function leadContactErrors(data: {
  type?: string | null
  name?: string | null
  phone?: string | null
  email?: string | null
}): { path: string; message: string }[] {
  const has = (v?: string | null) => Boolean(v?.trim())
  if (data.type === 'quick')
    return has(data.phone) || has(data.email)
      ? []
      : [{ path: 'phone', message: 'A quick request needs a phone or an email.' }]
  return (['name', 'phone', 'email'] as const)
    .filter((f) => !has(data[f]))
    .map((path) => ({ path, message: `This lead type needs a ${path}.` }))
}

/** Runs on every save, so staff edits follow the same rules as the site's forms. */
const contactRules: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  const errors = leadContactErrors({ ...originalDoc, ...data })
  if (errors.length) throw new ValidationError({ collection: 'leads', errors })
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
    defaultColumns: ['name', 'type', 'phone', 'email', 'assignedTo', 'status', 'createdAt'],
  },
  access: { read: isStaff, create: () => false, update: isStaff, delete: isStaff },
  hooks: { beforeValidate: [contactRules], beforeChange: [assign] },
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
        // Required per type by `contactRules`: a quick request may have only one contact.
        { name: 'name', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'email', type: 'email' },
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
      admin: { condition: (data) => data?.type === 'motorina' || data?.type === 'quick' },
      fields: [
        {
          name: 'quantity',
          type: 'number',
          min: 0,
          admin: { description: 'Diesel: litres. Quick request: packs.' },
        },
        {
          name: 'deliveryDate',
          type: 'date',
          admin: {
            condition: (data) => data?.type === 'motorina',
            date: { pickerAppearance: 'dayOnly' },
          },
        },
      ],
    },
    {
      type: 'row',
      admin: { condition: (data) => data?.type === 'quick' },
      fields: [
        {
          name: 'variant',
          type: 'text',
          label: { ro: 'Ambalaj (SKU)', en: 'Pack (SKU)' },
        },
        {
          name: 'hectares',
          type: 'number',
          min: 0,
          label: { ro: 'Suprafață (ha)', en: 'Area (ha)' },
          admin: { description: 'From the dose calculator, when the visitor used it.' },
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
