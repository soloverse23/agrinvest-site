/**
 * `npm run apply:tools`: the price and tool entry points in the menu and footer, and the
 * one-time diesel history backfill (Phase 5).
 * Idempotent. Runs on every deploy, after the seed.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { backfillDiesel } from './backfill'
import { applyToolsEntryPoints } from './entry-points'

const payload = await getPayload({ config })
await applyToolsEntryPoints(payload)
// A year of diesel prices on the first deploy; a no-op afterwards.
await backfillDiesel(payload)
process.exit(0)
