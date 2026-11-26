import type { CollectionSlug, Endpoint, PayloadRequest, Where } from 'payload'

import { staffRequest } from '@/access'
import {
  collectionsFor,
  configOf,
  editHref,
  hasSlug,
  langOf,
  pick,
  rowSelect,
  rowTitle,
  statusOf,
  titleField,
} from './sections'

export type FoundRow = {
  section: string
  title: string
  href: string
  status: { label: string; tone: string } | null
  locale: 'ro' | 'en'
}

/** A pasted site link (`https://…/en/magazin/x`, `/magazin/x`) as a locale and a path. */
export function parseLink(input: string): { locale: 'ro' | 'en'; path: string } | null {
  const text = input.trim()
  let path: string
  try {
    if (text.startsWith('/')) path = text.split(/[?#]/)[0]
    else if (/^https?:\/\//i.test(text)) path = new URL(text).pathname
    else if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/|$)/i.test(text))
      path = new URL(`https://${text}`).pathname
    else return null
  } catch {
    return null
  }
  path = decodeURIComponent(path).replace(/\/+$/, '') || '/'
  if (path === '/en' || path.startsWith('/en/')) return { locale: 'en', path: path.slice(3) || '/' }
  if (path === '/ro' || path.startsWith('/ro/')) path = path.slice(3) || '/'
  return { locale: 'ro', path }
}

/** Finds the documents behind a pasted link, or by title, among the account's own sections. */
export async function findForPanel(req: PayloadRequest, query: string): Promise<FoundRow[]> {
  const lang = langOf(req)
  const adminRoute = req.payload.config.routes.admin
  const link = parseLink(query)
  const lastSegment = link?.path.split('/').filter(Boolean).pop()
  const rows: FoundRow[] = []

  for (const slug of collectionsFor(req)) {
    const config = configOf(req.payload, slug)
    if (!config || config.upload) continue
    let where: Where | null = null
    if (link) {
      const clauses: Where[] = []
      if (slug === 'pages') clauses.push({ path: { equals: link.path } })
      if (lastSegment && hasSlug(config)) clauses.push({ slug: { equals: lastSegment } })
      if (clauses.length) where = clauses.length === 1 ? clauses[0] : { or: clauses }
    } else {
      const title = titleField(config)
      if (title !== 'id') where = { [title]: { like: query.trim() } }
    }
    if (!where) continue
    const locale = link?.locale ?? 'ro'
    const { docs } = await req.payload
      .find({
        collection: slug as CollectionSlug,
        where,
        limit: link ? 3 : 5,
        depth: 0,
        draft: true,
        locale,
        overrideAccess: false,
        user: req.user,
        select: rowSelect(config) as never,
        req,
      })
      .catch(() => ({ docs: [] as Record<string, unknown>[] }))
    for (const doc of docs as Record<string, unknown>[])
      rows.push({
        section: pick(config.labels?.plural, lang, slug),
        title: rowTitle(config, doc),
        href: editHref(adminRoute, slug, doc.id as number, locale),
        status: statusOf(config, doc, lang),
        locale,
      })
  }
  return rows.slice(0, 20)
}

/** `GET /api/panel/find?q=…`: staff accounts only, limited to their own sections. */
export const panelFindEndpoint: Endpoint = {
  path: '/panel/find',
  method: 'get',
  handler: async (req) => {
    if (!staffRequest(req)) return Response.json({ error: 'unauthorized' }, { status: 401 })
    const q = String(req.searchParams.get('q') ?? '').slice(0, 300)
    if (q.trim().length < 2) return Response.json({ rows: [] })
    return Response.json({ rows: await findForPanel(req, q) })
  },
}
