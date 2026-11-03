import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
  PayloadRequest,
} from 'payload'

import { publishedOrStaff, isStaff } from '@/access'
import { pageBlocks } from '@/blocks'
import { faq, seo, slug } from '@/fields'
import { localePath, locales, type Locale } from '@/i18n/config'
import { revalidate, tags } from '@/lib/revalidate'
import { pingIndexNow } from '@/lib/seo/indexnow'

/** The request's content locale, or undefined for `all` (then Payload uses the default). */
const localeOf = (req: PayloadRequest) =>
  req.locale && req.locale !== 'all' ? (req.locale as Locale) : undefined

/**
 * Builds the page's path in the current locale from its parent chain:
 * home → `/`, `depozitare` → `/depozitare`, `uscare` under it → `/depozitare/uscare`.
 * The path is locale-relative; `localePath` adds `/en` for English.
 */
const buildPath: CollectionBeforeChangeHook = async ({ data, req, originalDoc }) => {
  if (data.isHome) {
    data.path = '/'
    return data
  }
  const own = data.slug ?? originalDoc?.slug
  if (!own) return data
  const parentId =
    typeof data.parent === 'object' && data.parent ? data.parent.id : (data.parent ?? null)
  let prefix = ''
  if (parentId) {
    const parent = await req.payload.findByID({
      collection: 'pages',
      id: parentId,
      locale: localeOf(req),
      depth: 0,
      draft: true,
      req,
      select: { path: true },
    })
    prefix = parent?.path && parent.path !== '/' ? parent.path : ''
  }
  data.path = `${prefix}/${own}`
  return data
}

/** Keeps children's paths in step when a parent's path changes. */
const updateChildren: CollectionAfterChangeHook = async ({ doc, previousDoc, req, context }) => {
  revalidate(tags.pages)
  const locale = localeOf(req) ?? 'ro'
  if (doc._status === 'published' && doc.path && doc.languages?.includes(locale)) {
    void pingIndexNow([localePath(doc.path, locale)])
  }
  if (context.skipChildren || doc.path === previousDoc?.path) return doc
  const { docs } = await req.payload.find({
    collection: 'pages',
    where: { parent: { equals: doc.id } },
    locale: localeOf(req),
    depth: 0,
    draft: true,
    limit: 200,
    req,
  })
  for (const child of docs) {
    await req.payload.update({
      collection: 'pages',
      id: child.id,
      locale: localeOf(req),
      data: { slug: child.slug },
      draft: child._status !== 'published',
      req,
    })
  }
  return doc
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: { ro: 'Pagină', en: 'Page' }, plural: { ro: 'Pagini', en: 'Pages' } },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'path', 'languages', '_status', 'updatedAt'],
    preview: (doc, { locale }) =>
      typeof doc?.path === 'string'
        ? `/next/preview?path=${encodeURIComponent(doc.path)}&locale=${locale}`
        : null,
  },
  access: {
    read: publishedOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  versions: { drafts: true, maxPerDoc: 50 },
  hooks: {
    beforeChange: [buildPath],
    afterChange: [updateChildren],
    afterDelete: [() => revalidate(tags.pages)],
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
      admin: {
        description:
          'The direct answer this page gives, in 1–3 sentences. Shown near the top and used as the default meta description.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        { label: 'Content', fields: [{ name: 'layout', type: 'blocks', blocks: pageBlocks }] },
        { label: 'FAQ', fields: [faq] },
        { label: 'SEO', fields: [seo] },
      ],
    },
    // Sidebar
    slug('title', true),
    {
      name: 'path',
      type: 'text',
      localized: true,
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Built from the parent and slug.',
      },
    },
    {
      name: 'isHome',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      admin: { position: 'sidebar', condition: (data) => !data?.isHome },
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    {
      name: 'languages',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['ro'],
      options: locales.map((value) => ({ value, label: value.toUpperCase() })),
      admin: {
        position: 'sidebar',
        description:
          'Languages this page is published in. English pages are business-led, not a mirror; a page in one language has no hreflang pair.',
      },
    },
  ],
}
