/**
 * `npm run apply:articles`: the guides menu and footer entries, and the first 20 briefs as
 * draft guides (Phase 6). Idempotent; runs on every deploy after `apply:tools`.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { applyBriefs } from './apply'
import { applyGuidesEntryPoints } from './entry-points'

const payload = await getPayload({ config })
await applyGuidesEntryPoints(payload)
await applyBriefs(payload)
process.exit(0)
