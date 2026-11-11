/**
 * `npm run apply:finance`: applies the reviewed finance files and the finance rows of the figures
 * register to the database in `DATABASE_URL`, then the finance entry points in menus and pages.
 * Idempotent. Runs on every deploy.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { applyFinance } from './apply'
import { refreshSectionNav } from '../site/refresh-nav'
import { applyEntryPoints } from './entry-points'

const payload = await getPayload({ config })
await applyFinance(payload)
// Menu, footer and page links into the section (4.5); after the pages they point to exist.
await applyEntryPoints(payload)
await refreshSectionNav(payload)
process.exit(0)
