import type { CollectionConfig } from 'payload'

import { isStaff } from '@/access'
import { revalidate, tags } from '@/lib/revalidate'

const label = (ro: string, en: string) => ({ ro, en })

/**
 * Important recent LinkedIn posts, picked by hand (Phase 7). LinkedIn has no open feed, so staff
 * paste the post link and its text once; the site shows a card that links back to the post.
 * Text is kept in the language it was posted in and shows on both language versions.
 */
export const SocialPosts: CollectionConfig = {
  slug: 'social-posts',
  labels: {
    singular: label('Postare LinkedIn', 'LinkedIn post'),
    plural: label('Postări LinkedIn', 'LinkedIn posts'),
  },
  admin: {
    group: label('Conținut', 'Content'),
    useAsTitle: 'text',
    defaultColumns: ['text', 'postedAt', 'visible'],
    description: label(
      'Postările importante de pe LinkedIn, afișate pe prima pagină. Adaugă doar ce merită văzut; apar primele 3, cele mai noi.',
      'Important LinkedIn posts shown on the home page. Add only what is worth seeing; the newest 3 show.',
    ),
  },
  defaultSort: '-postedAt',
  access: {
    read: ({ req }) => (req.user?.collection === 'users' ? true : { visible: { equals: true } }),
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  hooks: {
    afterChange: [() => revalidate(tags.social)],
    afterDelete: [() => revalidate(tags.social)],
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      unique: true,
      label: label('Link către postare', 'Post link'),
      validate: (v: string | null | undefined) =>
        /^https:\/\/(www\.)?linkedin\.com\//.test(v ?? '') ||
        'Link LinkedIn (https://www.linkedin.com/…)',
      admin: {
        description: label(
          'Pe LinkedIn: ⋯ la postare → „Copiază linkul postării”.',
          'On LinkedIn: ⋯ on the post → “Copy link to post”.',
        ),
      },
    },
    {
      name: 'postedAt',
      type: 'date',
      required: true,
      index: true,
      label: label('Data postării', 'Posted on'),
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
      maxLength: 600,
      label: label('Text', 'Text'),
      admin: {
        description: label(
          'Începutul postării sau un rezumat scurt, în limba în care a fost scrisă.',
          'The start of the post or a short summary, in the language it was written in.',
        ),
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: label('Imagine', 'Image'),
      admin: {
        description: label(
          'Opțional. Imaginea postării, salvată pe site.',
          'Optional. The post image, saved on the site.',
        ),
      },
    },
    {
      name: 'visible',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      label: label('Afișată pe site', 'Shown on the site'),
    },
  ],
}
