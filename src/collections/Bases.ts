import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { coordinates, factStatus, faq, seo, slug } from '@/fields'
import { locales } from '@/i18n/config'
import { basePath } from '@/i18n/routes'
import { revalidate, tags } from '@/lib/revalidate'
import { pingIndexNow } from '@/lib/seo/indexnow'

/**
 * Silo bases and collection points (`/baze/{slug}`, `/en/bases/{slug}`; the slug is shared). Most details are not published yet
 * (figures register S4), so each group carries its own verification status and the page
 * shows only what exists.
 */
export const Bases: CollectionConfig = {
  slug: 'bases',
  labels: { singular: { ro: 'Bază', en: 'Base' }, plural: { ro: 'Baze', en: 'Bases' } },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'county', 'capacity', '_status'] },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    afterChange: [
      ({ doc, req }) => {
        revalidate(tags.bases)
        if (doc._status === 'published' && (!req.locale || req.locale === 'ro')) {
          void pingIndexNow(locales.map((l) => basePath(doc.slug, l)))
        }
      },
    ],
    afterDelete: [() => revalidate(tags.bases)],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'With diacritics: Crețești.' },
    },
    { name: 'intro', type: 'textarea', localized: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Capacity and services',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'capacity', type: 'number', min: 0, admin: { description: 'Tonnes.' } },
                factStatus('capacityStatus'),
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'services',
                  type: 'select',
                  hasMany: true,
                  options: [
                    { value: 'reception', label: { ro: 'Recepție', en: 'Reception' } },
                    { value: 'drying', label: { ro: 'Uscare', en: 'Drying' } },
                    { value: 'cleaning', label: { ro: 'Precurățare', en: 'Cleaning' } },
                    { value: 'weighing', label: { ro: 'Cântărire', en: 'Weighing' } },
                    { value: 'storage', label: { ro: 'Depozitare', en: 'Storage' } },
                  ],
                },
                factStatus('servicesStatus'),
              ],
            },
          ],
        },
        {
          label: 'Location and contact',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'county', type: 'relationship', relationTo: 'counties' },
                factStatus('locationStatus'),
              ],
            },
            {
              name: 'address',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'street', type: 'text' },
                    { name: 'locality', type: 'text' },
                    { name: 'postalCode', type: 'text' },
                  ],
                },
              ],
            },
            coordinates('geo'),
            {
              type: 'row',
              fields: [
                { name: 'phone', type: 'text' },
                { name: 'contact', type: 'relationship', relationTo: 'people' },
                factStatus('contactStatus'),
              ],
            },
            {
              name: 'hours',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'days',
                      type: 'select',
                      hasMany: true,
                      required: true,
                      options: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
                    },
                    {
                      name: 'opens',
                      type: 'text',
                      required: true,
                      admin: { placeholder: '08:00' },
                    },
                    {
                      name: 'closes',
                      type: 'text',
                      required: true,
                      admin: { placeholder: '17:00' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Media',
          fields: [{ name: 'photos', type: 'upload', relationTo: 'media', hasMany: true }],
        },
        { label: 'FAQ', fields: [faq] },
        { label: 'SEO', fields: [seo] },
      ],
    },
    slug('name'),
  ],
}
