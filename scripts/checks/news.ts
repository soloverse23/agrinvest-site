/**
 * `npm run check:news`: the Phase 7e news gate (decision 0011). Rules in `scripts/news/gate.ts`.
 * Exits 1 on any error.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { SITE_INDEXABLE } from '../../src/lib/site'
import { freshnessFindings, itemFindings, storyFindings } from '../news/gate'

const payload = await getPayload({ config })
const now = new Date()
const [items, stories, runs] = await Promise.all([
  payload.find({
    collection: 'news-items',
    pagination: false,
    depth: 0,
    select: { source: true, url: true, excerpt: true, image: true },
  }),
  payload.find({
    collection: 'news-stories',
    where: { status: { equals: 'visible' } },
    pagination: false,
    depth: 0,
    select: { key: true, items: true },
  }),
  payload.find({
    collection: 'news-runs',
    where: { status: { in: ['ok', 'partial'] } },
    sort: '-startedAt',
    limit: 1,
    depth: 0,
  }),
])
const lastOk = runs.docs[0] ? new Date(runs.docs[0].finishedAt ?? runs.docs[0].startedAt) : null
const findings = [
  ...itemFindings(items.docs),
  ...storyFindings(
    stories.docs.map((s) => ({ id: s.id, key: s.key, items: (s.items ?? []).length })),
  ),
  ...freshnessFindings(lastOk, now, SITE_INDEXABLE),
]
for (const f of findings)
  console.log(`${f.level === 'error' ? 'ERROR' : 'warning'} ${f.rule}: ${f.message}`)
const errors = findings.filter((f) => f.level === 'error').length
console.log(
  `check:news: ${items.totalDocs} headlines, ${stories.totalDocs} visible stories; ${errors} error(s), ${findings.length - errors} warning(s)`,
)
process.exit(errors ? 1 : 0)
