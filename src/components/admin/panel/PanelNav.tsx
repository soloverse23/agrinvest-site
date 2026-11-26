import type { Payload, SanitizedPermissions, TypedUser } from 'payload'
import type { I18nClient } from '@payloadcms/translations'
import React from 'react'

import { adminRequest, departments, sectionsFor } from '@/access/departments'
import { panelNav, sectionIcon } from '@/lib/panel/nav'
import { pick, type PanelLang } from '@/lib/panel/sections'

import { PanelNavLinks, type NavGroupView } from './PanelNavLinks'

type Props = {
  payload: Payload
  user?: TypedUser | null
  i18n: I18nClient
  permissions?: SanitizedPermissions
}

const text = {
  home: { ro: 'Acasă', en: 'Home' },
  guide: { ro: 'Ghidul panoului', en: 'Panel guide' },
  technical: { ro: 'Tehnic (administrator)', en: 'Technical (admin)' },
}

/**
 * The panel sidebar (Phase 9): Home and the guide on top, then the account's sections in work
 * categories per department (`src/lib/panel/nav.ts`). The admin also gets every other section,
 * folded under "Tehnic". Replaces Payload's own link list, which `custom.scss` hides.
 */
export function PanelNav({ payload, user, i18n }: Props) {
  const req = { user: (user ?? null) as never }
  const lang: PanelLang = i18n?.language === 'en' ? 'en' : 'ro'
  const adminRoute = payload.config.routes.admin
  const isAdmin = adminRequest(req)
  const seen = new Set<string>()

  const entry = (slug: string) => {
    const global = payload.config.globals.find((g) => g.slug === slug)
    const collection = payload.collections[slug as keyof typeof payload.collections]?.config
    if (!global && !collection) return null
    return {
      slug,
      label: pick(global ? global.label : collection?.labels?.plural, lang, slug),
      href: `${adminRoute}/${global ? 'globals' : 'collections'}/${slug}`,
      icon: sectionIcon[slug],
    }
  }

  const departmentsShown = sectionsFor(req)
  const groups: NavGroupView[] = []
  for (const role of departmentsShown) {
    for (const group of panelNav[role]) {
      const items = group.items
        .filter((slug) => !(isAdmin && seen.has(slug)))
        .map((slug) => {
          seen.add(slug)
          return entry(slug)
        })
        .filter((x): x is NonNullable<typeof x> => Boolean(x))
      if (items.length === 0) continue
      groups.push({
        key: `${role}-${group.label.en}`,
        department: departmentsShown.length > 1 ? pick(departments[role].label, lang) : undefined,
        label: pick(group.label, lang),
        items,
      })
    }
  }

  if (isAdmin) {
    const hiddenFor = (hidden: unknown) =>
      typeof hidden === 'function' ? Boolean(hidden({ user })) : Boolean(hidden)
    const rest = [
      ...payload.config.collections
        .filter((c) => !seen.has(c.slug) && !hiddenFor(c.admin?.hidden))
        .filter((c) => !c.slug.startsWith('payload-') || c.slug === 'payload-jobs')
        .map((c) => c.slug),
      ...payload.config.globals
        .filter((g) => !seen.has(g.slug) && !hiddenFor(g.admin?.hidden))
        .map((g) => g.slug),
    ]
      .map(entry)
      .filter((x): x is NonNullable<typeof x> => Boolean(x))
      .map((x) => ({ ...x, icon: x.icon ?? 'gear' }))
    if (rest.length)
      groups.push({ key: 'technical', label: text.technical[lang], items: rest, folded: true })
  }

  return (
    <PanelNavLinks
      home={{ label: text.home[lang], href: adminRoute }}
      guide={{ label: text.guide[lang], href: `${adminRoute}#ghid` }}
      groups={groups}
    />
  )
}
