/**
 * The content rules of `check:finance` (Phase 4.6), as a pure function so tests can feed it
 * pages. The check script adds the review rules, which need the database.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Rough floors, far under the natural length of every page today: they catch empty pages. */
const MIN_WORDS = 150
/** A question page is short by design (Phase 7g): answer, factors, maybe an example. */
const MIN_QUESTION_WORDS = 40
const MIN_LINKS = 2
/** Share of 6-word phrases two siblings may have in common. Today's highest pair is 0.18. */
const MAX_SHARED = 0.3

const forbidden =
  /aprobare garantată|garantăm aprobarea|fără garanții|cel mai bun|cea mai bună|cele mai bune|cea mai mică dobândă|cel mai mic cost|cel mai rapid|cea mai rapidă|guaranteed approval|no guarantees needed|no collateral|the best rate|the lowest rate|the lowest cost|the fastest/i
/** A percentage next to interest or margin, outside public caps (which name ROBOR). */
const rate = /(dobând\w*|marj\w*|interest|margin)[^.%\n]{0,40}?\d+(?:[.,]\d+)?\s*%/gi

export type Lang = 'ro' | 'en'
export type File = {
  key: string
  kind: 'product' | 'guide' | 'hub' | 'question'
  parent?: string
  /** A question's matching credit, by key. */
  product?: string
  section?: string
  related: number
  text: Record<Lang, Record<string, unknown>>
}

export const strings = (v: unknown): string[] =>
  typeof v === 'string'
    ? [v]
    : Array.isArray(v)
      ? v.flatMap(strings)
      : v && typeof v === 'object'
        ? Object.values(v).flatMap(strings)
        : []
const words = (t: string) => t.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []
const phrases = (t: string) => {
  const w = words(t)
  return new Set(w.slice(0, -5).map((_, i) => w.slice(i, i + 6).join(' ')))
}
/** Page text without the SEO fields and slug, which are short by design. */
const body = (f: File, l: Lang) =>
  strings(Object.entries(f.text[l]).filter(([k]) => k !== 'seo' && k !== 'slug')).join('\n')

/** The reviewed finance files, with what the rules need. */
export function loadFinanceFiles(dir: string): File[] {
  const read = (sub: string, kind: File['kind']) =>
    readdirSync(join(dir, sub))
      .filter((n) => n.endsWith('.json'))
      .map((n) => {
        const d = JSON.parse(readFileSync(join(dir, sub, n), 'utf8'))
        return {
          key: d.key,
          kind,
          parent: d.parent,
          section: d.section,
          product: d.product,
          related:
            kind === 'question'
              ? 1 + (d.guide ? 1 : 0) + (d.related?.length ?? 0)
              : (d.relatedProducts?.length ?? 0) + (d.relatedGuides?.length ?? 0),
          text: d.text,
        } as File
      })
  const hub = JSON.parse(readFileSync(join(dir, 'hub.json'), 'utf8'))
  return [
    ...read('products', 'product'),
    ...read('guides', 'guide'),
    ...read('questions', 'question'),
    { key: 'hub', kind: 'hub', related: 0, text: hub.text },
  ]
}

export function contentErrors(files: File[]): string[] {
  const errors: string[] = []
  for (const f of files)
    for (const l of ['ro', 'en'] as const) {
      const text = body(f, l)
      const at = `${f.key} (${l})`
      // The hub is a title band since Phase 7g: its sections are code, not text.
      const floor = f.kind === 'question' ? MIN_QUESTION_WORDS : MIN_WORDS
      if (f.kind !== 'hub' && words(text).length < floor) errors.push(`${at}: under ${floor} words`)
      const links = (text.match(/\]\(\//g) ?? []).length + f.related
      if (f.key !== 'glosar' && f.kind !== 'hub' && links < MIN_LINKS)
        errors.push(`${at}: ${links} internal link(s), needs ${MIN_LINKS}`)
      const claim = forbidden.exec(text)
      if (claim) errors.push(`${at}: forbidden claim "${claim[0]}"`)
      // Guides explain public rates; products and the hub must not state one of Agrinvest's.
      if (f.kind !== 'guide')
        for (const m of text.matchAll(rate))
          if (!/ROBOR/i.test(m[0])) errors.push(`${at}: a rate is stated: "${m[0]}"`)
    }

  // Every credit page lists its questions, so each credit needs at least one.
  const asked = new Set(files.filter((f) => f.kind === 'question').map((f) => f.product))
  for (const f of files)
    if (f.kind === 'product' && !asked.has(f.key)) errors.push(`${f.key}: no question points at it`)

  // Siblings that could read as doorway pages: the investment pages, the guides, the questions.
  const groups = [
    files.filter((f) => f.parent === 'credit-investitii'),
    files.filter((f) => f.kind === 'guide' && (f.section ?? 'finantare') === 'finantare'),
    files.filter((f) => f.kind === 'question'),
  ]
  for (const group of groups)
    for (const l of ['ro', 'en'] as const) {
      const sets = group.map((f) => phrases(body(f, l)))
      for (let i = 0; i < group.length; i++)
        for (let j = i + 1; j < group.length; j++) {
          const shared = [...sets[i]].filter((p) => sets[j].has(p)).length
          const share = shared / Math.min(sets[i].size, sets[j].size)
          if (share > MAX_SHARED)
            errors.push(
              `${group[i].key} and ${group[j].key} (${l}) share ${Math.round(share * 100)}% of phrases`,
            )
        }
    }
  return errors
}
