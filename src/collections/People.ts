import type { CollectionConfig, FieldAccess } from 'payload'

import { anyone, isStaff } from '@/access'
import { revalidate, tags } from '@/lib/revalidate'

/** Phone and email are public only when the person has agreed (`publishPhone`, `publishEmail`). */
const publishedContact =
  (flag: 'publishPhone' | 'publishEmail'): FieldAccess =>
  ({ req, doc }) =>
    Boolean(req.user) || Boolean(doc?.[flag])

/**
 * Named people: contacts per need, base contacts, lead owners, and expert authors (Phase 6).
 */
export const People: CollectionConfig = {
  slug: 'people',
  labels: { singular: { ro: 'Persoană', en: 'Person' }, plural: { ro: 'Persoane', en: 'People' } },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'role', 'isAuthor'] },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [() => revalidate(tags.people)] },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', localized: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', access: { read: publishedContact('publishPhone') } },
        { name: 'publishPhone', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', access: { read: publishedContact('publishEmail') } },
        { name: 'publishEmail', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'isAuthor',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Expert author for guides (author pages come in Phase 6).' },
    },
    {
      name: 'author',
      type: 'group',
      admin: { condition: (data) => Boolean(data?.isAuthor) },
      fields: [
        { name: 'bio', type: 'textarea', localized: true },
        { name: 'credentials', type: 'text', localized: true },
        { name: 'sameAs', type: 'array', fields: [{ name: 'url', type: 'text', required: true }] },
      ],
    },
  ],
}
