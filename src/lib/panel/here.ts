import type { CollectionSlug, Endpoint, PayloadRequest, Where } from 'payload'

import { staffRequest } from '@/access'
import { adminRequest, ownersOf, rolesOf } from '@/access/departments'

import { parseLink } from './find'
import { targetsFor, type PageTarget } from './onPage'
import { configOf, editHref, langOf, pick } from './sections'

export type EditLink = { label: string; href: string }

const text = {
  page: { ro: 'Editează pagina', en: 'Edit this page' },
  list: { ro: 'Editează', en: 'Edit' },
}

/** Admin, or a department that owns the section. Globals are readable by anyone, so access alone is not enough. */
const mayEdit = (req: PayloadRequest, slug: string) =>
  adminRequest(req) || ownersOf(slug).some((role) => rolesOf(req).includes(role))

async function linkFor(req: PayloadRequest, target: PageTarget, locale: 'ro' | 'en') {
  const lang = langOf(req)
  const admin = req.payload.config.routes.admin
  const suffix = locale === 'en' ? '?locale=en' : ''

  if (target.kind === 'global') {
    if (!mayEdit(req, target.global)) return null
    return { label: text.page[lang], href: `${admin}/globals/${target.global}${suffix}` }
  }
  if (target.kind === 'list') {
    const config = configOf(req.payload, target.collection)
    if (!config || !mayEdit(req, target.collection)) return null
    const name = pick(config.labels?.plural, lang, target.collection).toLocaleLowerCase(lang)
    return {
      label: `${text.list[lang]}: ${name}`,
      href: `${admin}/collections/${target.collection}`,
    }
  }

  const collection = target.kind === 'page' ? 'pages' : target.collection
  if (!configOf(req.payload, collection) || !mayEdit(req, collection)) return null
  const where: Where =
    target.kind === 'page'
      ? { path: { equals: target.path } }
      : {
          slug: { equals: target.slug },
          ...(target.section ? { section: { equals: target.section } } : {}),
        }
  const { docs } = await req.payload
    .find({
      collection: collection as CollectionSlug,
      where,
      limit: 1,
      depth: 0,
      draft: true,
      locale,
      overrideAccess: false,
      user: req.user,
      select: { updatedAt: true } as never,
      req,
    })
    .catch(() => ({ docs: [] as { id: number }[] }))
  const doc = docs[0] as { id: number } | undefined
  return doc ? { label: text.page[lang], href: editHref(admin, collection, doc.id, locale) } : null
}

/** Edit links for a public URL, limited to what the account may change. */
export async function editLinksFor(req: PayloadRequest, url: string): Promise<EditLink[]> {
  const link = parseLink(url)
  if (!link) return []
  const links: EditLink[] = []
  for (const target of targetsFor(link.locale, link.path)) {
    const found = await linkFor(req, target, link.locale)
    if (found && !links.some((l) => l.href === found.href)) links.push(found)
  }
  return links
}

/** `GET /api/panel/here?path=/en/shop/x`: the edit links for a site page, staff only. */
export const panelHereEndpoint: Endpoint = {
  path: '/panel/here',
  method: 'get',
  handler: async (req) => {
    if (!staffRequest(req)) return Response.json({ links: [] }, { status: 401 })
    const path = String(req.searchParams.get('path') ?? '').slice(0, 500)
    if (!path.startsWith('/')) return Response.json({ links: [] })
    const links = await editLinksFor(req, path)
    return Response.json({ links }, { headers: { 'Cache-Control': 'private, no-store' } })
  },
}
