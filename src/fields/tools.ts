import type { Access, SelectField } from 'payload'

import { staffRequest } from '@/access'

/** Admin group for prices, diesel, news, alerts and the Outbox (Phase 5). */
export const toolsGroup = { ro: 'Prețuri și unelte', en: 'Prices and tools' }

/**
 * Draft / published switch for the rows staff type in by hand (Agrinvest's own prices). A
 * plain select rather than Payload versions: a price row is replaced by a newer row, never
 * edited through drafts, and the history is the list of rows.
 */
export const publishStatus: SelectField = {
  name: 'status',
  type: 'select',
  required: true,
  defaultValue: 'draft',
  index: true,
  options: [
    { value: 'draft', label: { ro: 'Ciornă', en: 'Draft' } },
    { value: 'published', label: { ro: 'Publicat', en: 'Published' } },
  ],
  admin: { position: 'sidebar' },
}

/** Staff read every row; visitors only published ones. */
export const publishedRowsOrStaff: Access = ({ req }) =>
  staffRequest(req) ? true : { status: { equals: 'published' } }

export const dayOnly = { date: { pickerAppearance: 'dayOnly' as const } }
