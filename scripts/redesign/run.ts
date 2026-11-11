/**
 * `npm run apply:redesign`: the Phase 7b menu, footer, home and bases changes on a live
 * database. Idempotent; runs on every deploy after `apply:articles`.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { applyRedesign } from './apply'

const payload = await getPayload({ config })
await applyRedesign(payload)
process.exit(0)
