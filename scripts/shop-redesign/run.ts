/**
 * `npm run apply:shop`: the Phase 7c shop data on a live database. Idempotent.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { applyShop } from './apply'

const payload = await getPayload({ config })
await applyShop(payload)
process.exit(0)
