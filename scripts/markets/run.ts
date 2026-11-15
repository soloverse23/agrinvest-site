/**
 * `npm run apply:markets`: Phase 7f market history (see `backfill.ts`) and the Prices menu.
 * Idempotent. Runs on every deploy, after `apply:redesign`.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { backfillMarkets } from './backfill'
import { refreshMarketsNav } from './nav'

const payload = await getPayload({ config })
await backfillMarkets(payload)
await refreshMarketsNav(payload)
process.exit(0)
