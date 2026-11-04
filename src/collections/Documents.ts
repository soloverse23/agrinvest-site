import type { Access, CollectionConfig } from 'payload'

import { isStaff, staffRequest } from '@/access'
import { shopGroup, urlField } from '@/fields/shop'

/** Files whose reuse is not yet allowed stay private: the public sees approved ones only. */
const readApproved: Access = ({ req }) =>
  staffRequest(req) ? true : { rights: { not_equals: 'pending' } }

/** Product PDFs: technical sheets, safety data sheets and labels. */
export const Documents: CollectionConfig = {
  slug: 'documents',
  // `Document` would shadow the DOM type in the generated file.
  typescript: { interface: 'ProductDocument' },
  labels: {
    singular: { ro: 'Document', en: 'Document' },
    plural: { ro: 'Documente', en: 'Documents' },
  },
  admin: {
    group: shopGroup,
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'language', 'rights', 'updatedAt'],
  },
  access: { read: readApproved, create: isStaff, update: isStaff, delete: isStaff },
  upload: { staticDir: 'media/documents', mimeTypes: ['application/pdf'] },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'kind',
          type: 'select',
          required: true,
          label: { ro: 'Tip', en: 'Kind' },
          options: [
            { label: { ro: 'Fișă tehnică', en: 'Technical sheet' }, value: 'technical' },
            { label: { ro: 'Fișă de securitate', en: 'Safety data sheet' }, value: 'safety' },
            { label: { ro: 'Etichetă', en: 'Label' }, value: 'label' },
          ],
        },
        {
          name: 'language',
          type: 'select',
          required: true,
          defaultValue: 'ro',
          label: { ro: 'Limba fișierului', en: 'File language' },
          options: ['ro', 'en'],
        },
        { name: 'version', type: 'text', label: { ro: 'Versiune', en: 'Version' } },
      ],
    },
    urlField('source', { ro: 'Sursă (URL)', en: 'Source (URL)' }),
    {
      name: 'rights',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { value: 'owned', label: { ro: 'Agrinvest', en: 'Owned by Agrinvest' } },
        { value: 'licensed', label: { ro: 'Permisă', en: 'Reuse allowed' } },
        { value: 'pending', label: { ro: 'Permisiune în așteptare', en: 'Permission pending' } },
      ],
      admin: {
        position: 'sidebar',
        description: 'A "pending" file is not public. The product links to its source instead.',
      },
    },
  ],
}
