import type { CollectionConfig } from 'payload'

import { publishedOrStaff } from '@/access'
import { seo, slug } from '@/fields'
import { fileKey, financeGroup, review, sources } from '@/fields/finance'
import { enrichmentLedger } from '@/fields/shop'
import { questionTopicLabels, questionTopics } from '@/lib/finance/topics'
import { revalidate, tags } from '@/lib/revalidate'
import { adminOnly, creators, editors, hiddenUnlessOwner } from '@/access/departments'

const label = (ro: string, en: string) => ({ ro, en })

/**
 * One farmer question, one page: `/finantare/intrebari/{slug}` (Phase 7g). The page answers
 * directly, says what decides the answer for a given farm (terms differ from farm to farm),
 * and hands over to the matching credit and a consultant. Facts about Agrinvest are written
 * as `{{KEY}}`, so they stay marked until confirmed.
 */
export const FinanceQuestions: CollectionConfig = {
  slug: 'finance-questions',
  labels: {
    singular: label('Întrebare', 'Question'),
    plural: label('Întrebări de finanțare', 'Finance questions'),
  },
  admin: {
    hidden: hiddenUnlessOwner('finance-questions'),
    group: financeGroup,
    useAsTitle: 'title',
    defaultColumns: ['title', 'topic', 'product', 'review.legalStatus', '_status', 'updatedAt'],
    listSearchableFields: ['title', 'slug', 'key'],
  },
  access: {
    read: publishedOrStaff,
    create: creators('finance-questions'),
    update: editors('finance-questions'),
    delete: adminOnly,
  },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    afterChange: [() => revalidate(tags.finance)],
    afterDelete: [() => revalidate(tags.finance)],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
      label: label('Întrebarea', 'Question'),
      admin: { description: 'As a farmer would type it into a search box or an assistant.' },
    },
    fileKey,
    slug('title', true),
    {
      name: 'topic',
      type: 'select',
      required: true,
      options: questionTopics.map((value) => ({ value, label: questionTopicLabels[value] })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar', description: 'Position inside its topic and on the hub.' },
    },
    {
      name: 'popular',
      type: 'checkbox',
      defaultValue: false,
      label: label('Pe pagina Finanțare', 'On the finance hub'),
      admin: { position: 'sidebar' },
    },
    {
      name: 'answer',
      type: 'textarea',
      localized: true,
      required: true,
      label: label('Răspunsul pe scurt', 'Short answer'),
      admin: { description: 'Two or three sentences that answer on their own, even if quoted.' },
    },
    {
      name: 'factors',
      type: 'array',
      localized: true,
      minRows: 2,
      label: label('Ce decide la tine', 'What decides it for you'),
      admin: { description: 'What changes the answer from one farm to another.' },
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    {
      name: 'practice',
      type: 'richText',
      localized: true,
      label: label('Ce înseamnă în practică', 'What it means in practice'),
      admin: { description: 'Optional: an example or a short table, only when sources allow.' },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'finance-products',
      required: true,
      label: label('Creditul potrivit', 'Matching credit'),
    },
    {
      name: 'guide',
      type: 'relationship',
      relationTo: 'guides',
      label: label('Ghidul din bibliotecă', 'Library guide'),
      filterOptions: { section: { equals: 'finantare' } },
    },
    {
      name: 'related',
      type: 'relationship',
      relationTo: 'finance-questions',
      hasMany: true,
      label: label('Întrebări înrudite', 'Related questions'),
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    sources,
    seo,
    review,
    enrichmentLedger,
  ],
}
