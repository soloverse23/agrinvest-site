import type { GlobalConfig } from 'payload'

import { isStaff } from '@/access'
import { leadTypeOptions } from '@/lib/leads/types'

/** Who owns each type of lead. `general` is the fallback for types without a route. */
export const LeadRouting: GlobalConfig = {
  slug: 'lead-routing',
  label: { ro: 'Rutarea cererilor', en: 'Lead routing' },
  access: { read: isStaff, update: isStaff },
  fields: [
    {
      name: 'routes',
      type: 'array',
      validate: (rows: unknown) => {
        if (!Array.isArray(rows)) return true
        const types = rows.map((r) => (r as { type?: string }).type)
        const dupe = types.find((t, i) => t && types.indexOf(t) !== i)
        return dupe ? `Duplicate type: ${dupe}` : true
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'type', type: 'select', required: true, options: leadTypeOptions },
            { name: 'primary', type: 'relationship', relationTo: 'people', required: true },
            { name: 'fallback', type: 'relationship', relationTo: 'people' },
          ],
        },
      ],
    },
  ],
}
