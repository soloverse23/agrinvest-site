import type { ReactNode } from 'react'

/**
 * Labelled values with their source, e.g. the public figures register. A table from 768 px;
 * on phones each row stacks (label, value, source), so nothing scrolls sideways.
 */
export function FactTable({
  caption,
  labels,
  rows,
}: {
  caption?: string
  labels: { label: string; value: string; source: string }
  rows: { key: string; label: string; value: ReactNode; source?: ReactNode }[]
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-raised shadow-soft ring-1 ring-line">
      <table className="w-full text-left text-small">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="hidden bg-surface text-caption text-muted md:table-header-group">
          <tr>
            <th scope="col" className="px-5 py-3 font-medium">
              {labels.label}
            </th>
            <th scope="col" className="px-5 py-3 font-medium">
              {labels.value}
            </th>
            <th scope="col" className="px-5 py-3 font-medium">
              {labels.source}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.key} className="grid gap-1 px-5 py-4 md:table-row md:p-0">
              <th scope="row" className="font-normal text-muted md:w-1/3 md:px-5 md:py-4">
                {row.label}
              </th>
              <td className="font-semibold text-ink tabular-nums md:px-5 md:py-4">{row.value}</td>
              <td className="text-caption text-subtle md:w-1/4 md:px-5 md:py-4">
                {row.source && (
                  <>
                    <span className="md:sr-only">{labels.source}: </span>
                    {row.source}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
