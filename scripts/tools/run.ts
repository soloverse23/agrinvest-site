/**
 * `npm run apply:tools`: the price and tool entry points in the menu and footer (Phase 5).
 * Idempotent. Runs on every deploy, after the seed.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { applyToolsEntryPoints } from './entry-points'

const payload = await getPayload({ config })
await applyToolsEntryPoints(payload)
process.exit(0)
