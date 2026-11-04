/**
 * `npm run apply:products`: applies the enrichment files to the database in `DATABASE_URL`.
 * Idempotent. Runs on every deploy after the migrations and the seed.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { applyEnrichment } from './apply'

const payload = await getPayload({ config })
await applyEnrichment(payload)
process.exit(0)
