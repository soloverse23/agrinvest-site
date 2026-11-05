/**
 * `npm run apply:finance`: applies the reviewed finance files and the finance rows of the figures
 * register to the database in `DATABASE_URL`. Idempotent. Runs on every deploy.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { applyFinance } from './apply'

const payload = await getPayload({ config })
await applyFinance(payload)
process.exit(0)
