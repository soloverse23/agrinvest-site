import type { CollectionConfig } from 'payload'

import { isStaff, isStaffField, publishedOrStaff } from '@/access'
import { ToolWidgetBlock } from '@/blocks'
import { faq, seo, slug } from '@/fields'
import { fileKey, review, sources } from '@/fields/finance'
import { enrichmentLedger } from '@/fields/shop'
import { localeOf } from '@/i18n/config'
import { articlePath, newsArticlePath } from '@/i18n/routes'
import { pillarByKey, pillars } from '@/lib/articles/pillars'
import { revalidate, tags } from '@/lib/revalidate'
import { pingIndexNow } from '@/lib/seo/indexnow'
import { slugify } from '@/lib/slugify'

const label = (ro: string, en: string) => ({ ro, en })

type Data = { section?: string } | undefined
const isFinance = (data: Data) =>
  data?.section === 'finantare' || data?.section === 'pagina-finantare'
const isArticle = (data: Data) => data?.section === 'ghid' || data?.section === 'stiri'

export const briefStatuses = [
  { value: 'idee', label: label('Idee', 'Idea') },
  { value: 'brief', label: label('Brief scris', 'Brief written') },
  { value: 'aprobat', label: label('Brief aprobat', 'Brief approved') },
  { value: 'in-lucru', label: label('În scriere', 'Being written') },
  { value: 'de-verificat', label: label('La expert', 'With the expert') },
  { value: 'publicat', label: label('Publicat', 'Published') },
  { value: 'de-actualizat', label: label('De actualizat', 'Needs a refresh') },
]

/**
 * Every long text of the site, in sections: finance guides and fixed finance pages, farmer
 * guides (`ghid`, Phase 6, `/ghiduri/{pillar}/{slug}`), Agrinvest news (`stiri`, `/stiri/{slug}`)
 * and the weekly market note (`piata`). Every public fact in a text has a source, and the page
 * shows who wrote it, who checked it and when. Guides also carry their editorial brief
 * (keywords, intent, outline, links), which only staff can read.
 */
export const Guides: CollectionConfig = {
  slug: 'guides',
  admin: {
    group: label('Conținut', 'Content'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'section', 'pillar', 'brief.status', '_status', 'updatedAt'],
    listSearchableFields: ['title', 'slug', 'key'],
    description: label(
      'Ghiduri, știri Agrinvest, note de piață și ghiduri de finanțare. Alege secțiunea din dreapta.',
      'Guides, Agrinvest news, market notes and finance guides. Pick the section on the right.',
    ),
  },
  labels: {
    singular: label('Articol', 'Article'),
    plural: label('Articole și ghiduri', 'Articles and guides'),
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    // Editors writing news never see the key: it follows the slug (keys stay stable after).
    beforeValidate: [
      ({ data }) => {
        if (data && !data.key && data.slug) data.key = `${data.section ?? 'text'}-${data.slug}`
        if (data && !data.key && typeof data.title === 'string')
          data.key = `${data.section ?? 'text'}-${slugify(data.title)}`
        return data
      },
    ],
    afterChange: [
      ({ doc, req }) => {
        revalidate(tags.guides)
        if (doc._status !== 'published' || !doc.slug) return
        const locale = localeOf(req.locale)
        if (doc.section === 'stiri') void pingIndexNow([newsArticlePath(doc.slug, locale)])
        const pillar = pillarByKey(doc.pillar)
        if (doc.section === 'ghid' && pillar)
          void pingIndexNow([articlePath(pillar.slug[locale], doc.slug, locale)])
      },
    ],
    afterDelete: [() => revalidate(tags.guides)],
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    fileKey,
    slug('title', true),
    {
      name: 'section',
      type: 'select',
      required: true,
      defaultValue: 'finantare',
      options: [
        { value: 'finantare', label: label('Finanțare', 'Financing') },
        { value: 'pagina-finantare', label: label('Pagină fixă', 'Fixed finance page') },
        { value: 'stiri', label: label('Știri Agrinvest', 'Agrinvest news') },
        { value: 'piata', label: label('Nota de piață', 'Market note') },
        { value: 'ghid', label: label('Ghid pentru fermieri', 'Farmer guide') },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'pillar',
      type: 'select',
      label: label('Pilon', 'Pillar'),
      options: pillars.map((p) => ({ value: p.key, label: p.name })),
      validate: (value: unknown, { data }: { data: Data }) =>
        data?.section !== 'ghid' || Boolean(value) || 'Un ghid are nevoie de un pilon.',
      admin: { position: 'sidebar', condition: (data) => data?.section === 'ghid' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: label('Data publicării', 'Publication date'),
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: label(
          'Ordinea știrilor și data din pagină.',
          'Orders the news and shows on the page.',
        ),
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: label('Imagine principală', 'Cover image'),
      admin: {
        condition: isArticle,
        description: label(
          'Opțional. Fotografie orizontală, minim 1600 px lățime.',
          'Optional. A landscape photo, at least 1600 px wide.',
        ),
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
      required: true,
      label: label('Răspuns direct', 'Direct answer'),
    },
    { name: 'body', type: 'richText', localized: true, required: true },
    {
      name: 'terms',
      type: 'array',
      localized: true,
      label: label('Termeni', 'Terms'),
      admin: { description: 'Only for the glossary.', condition: isFinance },
      fields: [
        { name: 'term', type: 'text', required: true },
        { name: 'definition', type: 'textarea', required: true },
      ],
    },
    faq,
    {
      type: 'row',
      fields: [
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'people',
          label: label('Autor', 'Author'),
        },
        {
          name: 'reviewer',
          type: 'relationship',
          relationTo: 'people',
          label: label('Verificat de', 'Reviewed by'),
        },
      ],
    },
    {
      name: 'tools',
      type: 'blocks',
      label: label('Unelte în pagină', 'Tools on the page'),
      blocks: [ToolWidgetBlock],
      maxRows: 2,
      admin: {
        condition: isArticle,
        description: label(
          'Prețuri, calculator preț net, motorină: apar lângă text.',
          'Prices, net price calculator, diesel: shown beside the text.',
        ),
      },
    },
    {
      name: 'shopProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: label('Produse din magazin', 'Shop products'),
      admin: { condition: isArticle },
    },
    {
      name: 'relatedProducts',
      type: 'relationship',
      relationTo: 'finance-products',
      hasMany: true,
      label: label('Produse de finanțare', 'Finance products'),
    },
    {
      name: 'relatedGuides',
      type: 'relationship',
      relationTo: 'guides',
      hasMany: true,
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    sources,
    seo,
    { ...review, admin: { ...review.admin, condition: isFinance } },
    {
      name: 'brief',
      type: 'group',
      label: label('Brief editorial', 'Editorial brief'),
      access: { read: isStaffField },
      admin: {
        condition: (data) => data?.section === 'ghid',
        description: label(
          'Doar pentru echipă. Vezi docs/guides/articles.md.',
          'Staff only. See docs/guides/articles.md.',
        ),
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'status',
              type: 'select',
              defaultValue: 'idee',
              options: briefStatuses,
            },
            {
              name: 'intent',
              type: 'select',
              options: [
                { value: 'I', label: label('Informare', 'Informational') },
                { value: 'C', label: label('Comparație', 'Commercial') },
                { value: 'T', label: label('Tranzacție', 'Transactional') },
              ],
            },
            {
              name: 'plannedFor',
              type: 'date',
              label: label('Publicare planificată', 'Planned for'),
              admin: { date: { pickerAppearance: 'dayOnly' } },
            },
          ],
        },
        {
          name: 'primaryKeyword',
          type: 'text',
          localized: true,
          label: label('Cuvânt cheie principal', 'Primary keyword'),
        },
        {
          name: 'secondaryKeywords',
          type: 'textarea',
          localized: true,
          label: label('Cuvinte cheie secundare', 'Secondary keywords'),
        },
        {
          name: 'serpNotes',
          type: 'textarea',
          label: label('Ce arată Google acum', 'SERP notes'),
        },
        { name: 'outline', type: 'textarea', label: label('Structură', 'Outline') },
        {
          name: 'links',
          type: 'textarea',
          label: label('Linkuri interne obligatorii', 'Required internal links'),
          admin: { description: 'One path per line. check:articles verifies them.' },
        },
        { name: 'faqIdeas', type: 'textarea', label: label('Întrebări (FAQ)', 'FAQ ideas') },
        {
          type: 'row',
          fields: [
            {
              name: 'expert',
              type: 'relationship',
              relationTo: 'people',
              label: label('Expert', 'Expert'),
            },
            {
              name: 'refreshBy',
              type: 'date',
              label: label('De revizuit până la', 'Refresh by'),
              admin: { date: { pickerAppearance: 'dayOnly' } },
            },
          ],
        },
      ],
    },
    enrichmentLedger,
  ],
}
