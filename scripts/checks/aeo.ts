/**
 * AEO check: for every question in docs/audit/aeo-queries.md, fetches the page that should
 * answer it and checks that the evidence phrase is in the server-rendered HTML (no
 * JavaScript), and that the page shows its update date (an attributable answer).
 *
 * Run (with the site running): npm run check:aeo [-- http://localhost:3100]
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import * as cheerio from 'cheerio'

const base = (process.argv[2] ?? 'http://localhost:3100').replace(/\/$/, '')
const md = readFileSync(resolve('docs/audit/aeo-queries.md'), 'utf8')

type Query = { n: string; locale: string; query: string; page: string; evidence: string }
const queries: Query[] = md
  .split('\n')
  .map((line) => line.split('|').map((c) => c.trim()))
  .filter((cells) => /^\d+$/.test(cells[1] ?? ''))
  .map(([, n, locale, query, page, evidence]) => ({ n, locale, query, page, evidence }))

const normalise = (s: string) => s.replace(/\s+/g, ' ').toLocaleLowerCase('ro')
const pages = new Map<string, Promise<{ text: string; dated: boolean } | null>>()
const load = (path: string) => {
  if (!pages.has(path)) {
    pages.set(
      path,
      fetch(base + path).then(async (res) => {
        if (!res.ok) return null
        const $ = cheerio.load(await res.text())
        const dated = $('main time[datetime]').length > 0
        $('script, style, noscript').remove()
        return { text: normalise($('main').text()), dated }
      }),
    )
  }
  return pages.get(path)!
}

let failed = 0
for (const q of queries) {
  const page = await load(q.page)
  const problems = !page
    ? ['page not found']
    : [
        !page.text.includes(normalise(q.evidence)) && `no "${q.evidence}"`,
        !page.dated && 'no update date',
      ].filter(Boolean)
  if (problems.length) failed++
  console.log(
    `${problems.length ? 'FAIL' : 'ok  '}  ${q.n.padStart(2)} ${q.locale}  ${q.query}  →  ${q.page}${problems.length ? `  (${problems.join(', ')})` : ''}`,
  )
}
console.log(`\n${queries.length - failed}/${queries.length} questions answered in the HTML`)
if (failed) process.exit(1)
