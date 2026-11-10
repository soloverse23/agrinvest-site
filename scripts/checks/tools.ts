/**
 * `npm run check:tools`: the Phase 5 data gate. Reads the newest period of every market series
 * and the calculator rule sources; rules in `scripts/tools/gate.ts`. Exits 1 on any error.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { netPriceSources } from '../../src/lib/prices/net-price-rules'
import { SITE_INDEXABLE } from '../../src/lib/site'
import { marketSourceKeys, type MarketSource } from '../../src/lib/sources'
import { ruleFindings, seriesFindings } from '../tools/gate'

const payload = await getPayload({ config })
const now = new Date()
const latest: Partial<Record<MarketSource, Date>> = {}
for (const source of marketSourceKeys) {
  const { docs } = await payload.find({
    collection: 'market-prices',
    where: { source: { equals: source } },
    sort: '-period',
    limit: 1,
    depth: 0,
  })
  if (docs[0]) latest[source] = new Date(docs[0].period)
}
const findings = [
  ...seriesFindings(latest, now, SITE_INDEXABLE),
  ...ruleFindings(netPriceSources, now),
]
for (const f of findings)
  console.log(`${f.level === 'error' ? 'ERROR' : 'warning'} ${f.rule}: ${f.message}`)
const errors = findings.filter((f) => f.level === 'error').length
console.log(`check:tools: ${errors} error(s), ${findings.length - errors} warning(s)`)
process.exit(errors ? 1 : 0)
