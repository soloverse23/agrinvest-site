import type { AdminViewServerProps, CollectionSlug } from 'payload'
import { Gutter } from '@payloadcms/ui'
import React from 'react'

import {
  adminRequest,
  departmentRows,
  departments,
  rolesOf,
  sectionsFor,
} from '@/access/departments'
import {
  configOf,
  editHref,
  langOf,
  pick,
  rowSelect,
  rowTitle,
  statusOf,
  type PanelLang,
} from '@/lib/panel/sections'

import { sectionIcon } from '@/lib/panel/nav'

import { PageFinder } from './PageFinder'
import { PanelGuide } from './PanelGuide'
import { SectionIcon } from './PanelIcons'

const text = {
  hello: { ro: 'Bună', en: 'Hello' },
  intro: {
    ro: 'Găsește pagina pe care ai văzut-o pe site, schimbă textul, apasă Salvează și alege starea.',
    en: 'Find the page you saw on the site, change the text, press Save and choose its status.',
  },
  steps: {
    ro: [
      'Lipește linkul paginii sau scrie titlul.',
      'Deschide rezultatul și schimbă textul.',
      '„Salvează ciorna” păstrează lucrul; „Publică pe site” îl arată vizitatorilor.',
    ],
    en: [
      'Paste the page link or type its title.',
      'Open the result and change the text.',
      '“Save draft” keeps your work; “Publish changes” shows it to visitors.',
    ],
  },
  recent: { ro: 'Modificate recent', en: 'Recently changed' },
  openAll: { ro: 'Vezi toate', en: 'See all' },
  open: { ro: 'Deschide', en: 'Open' },
  empty: { ro: 'Nimic încă.', en: 'Nothing yet.' },
  noRole: {
    ro: 'Contul tău nu are încă un departament. Cere-i administratorului să ți-l aleagă.',
    en: 'Your account has no department yet. Ask the administrator to choose one.',
  },
  settings: { ro: 'Setări pagină', en: 'Page settings' },
  guide: { ro: 'Vezi ghidul video (1 minut)', en: 'Watch the video guide (1 minute)' },
} as const

type Row = { title: string; href: string; status: ReturnType<typeof statusOf> }
type Section = { slug: string; label: string; href: string; count?: number; rows?: Row[] }

/**
 * The panel's home screen (Phase 9). One block per department the account belongs to; each
 * section shows its last changed documents with their status, so the usual task, open the
 * page, edit, save, is one click from here. The finder takes a pasted site link or a title.
 */
export async function PanelDashboard(props: AdminViewServerProps) {
  const { req } = props.initPageResult
  const { payload } = req
  const lang: PanelLang = langOf(req)
  const adminRoute = payload.config.routes.admin
  const roles = sectionsFor(req)
  const name = (req.user as { name?: string | null } | null)?.name
  const shown = new Set<string>()

  const blocks = await Promise.all(
    roles.map(async (role) => {
      const sections: Section[] = []
      for (const slug of departments[role].sections) {
        // Shared sections (pages, articles, requests) show each department's own documents.
        const own = departmentRows(role, slug)
        if (adminRequest(req) && !own && shown.has(slug)) continue
        shown.add(slug)
        const global = payload.config.globals.find((g) => g.slug === slug)
        if (global) {
          sections.push({
            slug,
            label: pick(global.label, lang, slug),
            href: `${adminRoute}/globals/${slug}`,
          })
          continue
        }
        const config = configOf(payload, slug)
        if (!config) continue
        const result = await payload
          .find({
            collection: slug as CollectionSlug,
            sort: '-updatedAt',
            ...(own ? { where: own } : {}),
            limit: config.upload ? 0 : 4,
            depth: 0,
            draft: true,
            overrideAccess: false,
            user: req.user,
            select: rowSelect(config) as never,
            req,
          })
          .catch(() => null)
        if (!result) continue
        sections.push({
          slug,
          label: pick(config.labels?.plural, lang, slug),
          href: `${adminRoute}/collections/${slug}`,
          count: result.totalDocs,
          rows: config.upload
            ? undefined
            : (result.docs as Record<string, unknown>[]).map((doc) => ({
                title: rowTitle(config, doc),
                href: editHref(adminRoute, slug, doc.id as number),
                status: statusOf(config, doc, lang),
              })),
        })
      }
      return { role, sections }
    }),
  )

  return (
    <Gutter className="panel">
      <header className="panel-hero">
        <div className="panel-hero__text">
          {rolesOf(req).length > 0 && (
            <p className="panel-hero__roles">
              {roles.map((r) => pick(departments[r].label, lang)).join(' · ')}
            </p>
          )}
          <h1 className="panel-hero__title">
            {text.hello[lang]}
            {name ? `, ${name}` : ''}
          </h1>
          <p className="panel-hero__intro">{text.intro[lang]}</p>
        </div>
        {roles.length > 0 && (
          <div className="panel-hero__find">
            <PageFinder lang={lang} />
            <ol className="panel__steps">
              {text.steps[lang].map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <a className="panel-hero__guide" href="#ghid">
              ▶ {text.guide[lang]}
            </a>
          </div>
        )}
      </header>

      {roles.length === 0 ? (
        <p className="panel__notice">{text.noRole[lang]}</p>
      ) : (
        <>
          <PanelGuide lang={lang} roles={roles} />
          {blocks.map(({ role, sections }) =>
            sections.length === 0 ? null : (
              <section key={role} className="panel__dept">
                <div className="panel__dept-head">
                  <h2>{pick(departments[role].label, lang)}</h2>
                  <p>{pick(departments[role].hint, lang)}</p>
                </div>
                <div className="panel__grid">
                  {sections.map((s) => (
                    <SectionCard key={s.slug} section={s} lang={lang} />
                  ))}
                </div>
              </section>
            ),
          )}
        </>
      )}
    </Gutter>
  )
}

function SectionCard({ section, lang }: { section: Section; lang: PanelLang }) {
  return (
    <article className="panel-card">
      <a className="panel-card__head" href={section.href}>
        <span className="panel-card__chip">
          <SectionIcon name={sectionIcon[section.slug]} />
        </span>
        <span className="panel-card__name">{section.label}</span>
        {section.count !== undefined ? (
          <span className="panel-card__count">{section.count}</span>
        ) : (
          <span className="panel-card__count">{text.settings[lang]}</span>
        )}
      </a>
      {section.rows && (
        <>
          <p className="panel-card__label">{text.recent[lang]}</p>
          {section.rows.length === 0 ? (
            <p className="panel-card__empty">{text.empty[lang]}</p>
          ) : (
            <ul className="panel-card__rows">
              {section.rows.map((row) => (
                <li key={row.href}>
                  <a href={row.href}>
                    <span className="panel-card__row-title">{row.title}</span>
                    {row.status && (
                      <span className={`panel-status panel-status--${row.status.tone}`}>
                        {row.status.label}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      <a className="panel-card__all" href={section.href}>
        {section.count !== undefined ? text.openAll[lang] : text.open[lang]} →
      </a>
    </article>
  )
}
