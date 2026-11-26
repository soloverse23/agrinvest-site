/**
 * `npm run apply:redesign`: the Phase 7b menu, footer, home and bases changes on a live
 * database, then Company to the front of the menu and the shorter panels and footer.
 * Idempotent; runs on every deploy after `apply:articles`.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { moveCompanyFirst } from '../site/company-first'
import { hideDemoContent } from '../site/demo-cleanup'
import { simplifyStructure } from '../site/structure'
import { applyRedesign } from './apply'

const payload = await getPayload({ config })
await applyRedesign(payload)
await moveCompanyFirst(payload)
await simplifyStructure(payload)
await hideDemoContent(payload)
process.exit(0)
