import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { isStaff } from '@/access'
import { shopGroup } from '@/fields/shop'
import { locales } from '@/i18n/config'
import { routedPerson } from '@/lib/leads/routing'

const label = (ro: string, en: string) => ({ ro, en })

/** A new order goes to the person who owns farm-input requests, like a lead. */
const assign: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create' || data.assignedTo) return data
  data.assignedTo = await routedPerson(req, 'inputuri')
  return data
}

/**
 * Orders. An order is a request: no money is taken online, and a consultant confirms stock,
 * price and payment before anything is invoiced (decision 0006). Lines are a snapshot of the
 * name, pack and price at that moment, so later catalogue changes never alter an order.
 * Created only by the `placeOrder` server action; staff only.
 */
export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: label('Comandă', 'Order'), plural: label('Comenzi', 'Orders') },
  admin: {
    group: shopGroup,
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'buyer.name', 'status', 'total', 'assignedTo', 'createdAt'],
    listSearchableFields: ['reference', 'buyer.name', 'buyer.phone', 'buyer.email'],
  },
  defaultSort: '-createdAt',
  access: { read: isStaff, create: () => false, update: isStaff, delete: isStaff },
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
          label: label('Număr comandă', 'Reference'),
          admin: { readOnly: true },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          label: label('Stare', 'Status'),
          options: [
            { value: 'new', label: label('Nouă', 'New') },
            { value: 'contacted', label: label('Contactat', 'Contacted') },
            { value: 'confirmed', label: label('Confirmată', 'Confirmed') },
            { value: 'paid', label: label('Plătită', 'Paid') },
            { value: 'delivered', label: label('Livrată', 'Delivered') },
            { value: 'cancelled', label: label('Anulată', 'Cancelled') },
          ],
        },
        {
          name: 'assignedTo',
          type: 'relationship',
          relationTo: 'people',
          label: label('Responsabil', 'Assigned to'),
        },
      ],
    },
    {
      name: 'lines',
      type: 'array',
      required: true,
      minRows: 1,
      label: label('Produse', 'Lines'),
      admin: { readOnly: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'sku', type: 'text', required: true },
            { name: 'product', type: 'relationship', relationTo: 'products' },
            { name: 'name', type: 'text', required: true, label: label('Produs', 'Product') },
            { name: 'pack', type: 'text', label: label('Ambalaj', 'Pack') },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'quantity',
              type: 'number',
              required: true,
              min: 1,
              label: label('Cantitate', 'Quantity'),
            },
            { name: 'unitPrice', type: 'number', label: label('Preț (lei)', 'Price (lei)') },
            { name: 'lineTotal', type: 'number', label: label('Total (lei)', 'Total (lei)') },
            {
              name: 'priceConfirmed',
              type: 'checkbox',
              label: label('Preț confirmat', 'Price confirmed'),
            },
          ],
        },
      ],
    },
    {
      name: 'total',
      type: 'number',
      label: label('Total estimat (lei)', 'Estimated total (lei)'),
      admin: { readOnly: true, description: 'Delivery and VAT are confirmed by the consultant.' },
    },
    {
      name: 'buyer',
      type: 'group',
      label: label('Cumpărător', 'Buyer'),
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'type',
              type: 'select',
              required: true,
              label: label('Tip', 'Type'),
              options: [
                { value: 'person', label: label('Persoană fizică', 'Person') },
                { value: 'company', label: label('Firmă', 'Company') },
              ],
            },
            { name: 'name', type: 'text', required: true, label: label('Nume', 'Name') },
            { name: 'phone', type: 'text', required: true, label: label('Telefon', 'Phone') },
            { name: 'email', type: 'email', required: true, label: 'E-mail' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'company', type: 'text', label: label('Firmă', 'Company') },
            { name: 'cui', type: 'text', label: 'CUI' },
            { name: 'regCom', type: 'text', label: label('Nr. Reg. Com.', 'Trade register no.') },
          ],
        },
        { name: 'billingAddress', type: 'text', label: label('Sediu', 'Billing address') },
      ],
    },
    {
      name: 'delivery',
      type: 'group',
      label: label('Livrare', 'Delivery'),
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'method',
              type: 'select',
              required: true,
              label: label('Mod', 'Method'),
              options: [
                { value: 'delivery', label: label('Livrare la adresă', 'Delivery') },
                { value: 'pickup', label: label('Ridicare de la bază', 'Pickup at a base') },
              ],
            },
            {
              name: 'county',
              type: 'relationship',
              relationTo: 'counties',
              label: label('Județ', 'County'),
            },
            {
              name: 'base',
              type: 'relationship',
              relationTo: 'bases',
              label: label('Bază', 'Base'),
            },
          ],
        },
        { name: 'address', type: 'text', label: label('Adresă', 'Address') },
      ],
    },
    {
      name: 'certificate',
      type: 'group',
      label: label('Certificat de utilizator profesionist', 'Professional user certificate'),
      admin: { description: 'Captured for professional-use products.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'number', type: 'text', label: label('Număr', 'Number') },
            {
              name: 'validUntil',
              type: 'date',
              label: label('Valabil până la', 'Valid until'),
            },
          ],
        },
      ],
    },
    {
      name: 'payment',
      type: 'select',
      required: true,
      label: label('Plată', 'Payment'),
      options: [
        { value: 'consultant', label: label('Mă contactează un consultant', 'Consultant calls') },
        { value: 'proforma', label: label('Transfer bancar cu proformă', 'Proforma transfer') },
      ],
    },
    { name: 'message', type: 'textarea', label: label('Mesajul clientului', 'Buyer’s message') },
    {
      name: 'staffNotes',
      type: 'textarea',
      label: label('Note interne', 'Staff notes'),
      admin: { description: 'Internal. The buyer never sees them.' },
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
            { name: 'consentVersion', type: 'text' },
            { name: 'termsVersion', type: 'text' },
            { name: 'adultConfirmed', type: 'checkbox' },
          ],
        },
      ],
    },
  ],
}
