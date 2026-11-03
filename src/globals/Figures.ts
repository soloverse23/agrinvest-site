import type { GlobalConfig } from 'payload'

import { anyone, isStaff } from '@/access'
import { factStatus } from '@/fields'
import { revalidate, tags } from '@/lib/revalidate'

/**
 * The figures register: every fact or number the site states about Agrinvest.
 * Keys match `docs/audit/figures-register.md` (C1, S1, L1…; `C9.phone` for a part of a row).
 * Pages reference a key (`<Fact k="S1" />`) and never type the value.
 */
export const Figures: GlobalConfig = {
  slug: 'figures',
  label: { ro: 'Registrul de cifre', en: 'Figures register' },
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [() => revalidate(tags.global('figures'))] },
  fields: [
    {
      name: 'rows',
      type: 'array',
      labels: { singular: 'Figure', plural: 'Figures' },
      admin: {
        components: { RowLabel: '@/components/admin/FigureRowLabel#FigureRowLabel' },
      },
      validate: (rows: unknown) => {
        if (!Array.isArray(rows)) return true
        const keys = rows.map((r) => (r as { key?: string }).key)
        const dupe = keys.find((k, i) => k && keys.indexOf(k) !== i)
        return dupe ? `Duplicate key: ${dupe}` : true
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'key', type: 'text', required: true, admin: { width: '20%' } },
            { name: 'label', type: 'text', localized: true, required: true },
            factStatus('status', { admin: { width: '25%' } }),
          ],
        },
        {
          name: 'value',
          type: 'text',
          localized: true,
          required: true,
          admin: {
            description: 'As shown on the site: "17", "238.000 t", "imediat după recepție".',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'number',
              type: 'number',
              admin: { description: 'Numeric value, for counters and charts.' },
            },
            { name: 'unit', type: 'text', localized: true },
          ],
        },
        { name: 'source', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'confirmedBy', type: 'text' },
            { name: 'confirmedAt', type: 'date' },
          ],
        },
        { name: 'note', type: 'textarea' },
      ],
    },
  ],
}
