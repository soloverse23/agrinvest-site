'use client'
import { useRowLabel } from '@payloadcms/ui'

/** Shows "S1 · Number of bases" on each figures register row in the admin. */
export function FigureRowLabel() {
  const { data, rowNumber } = useRowLabel<{ key?: string; label?: string; status?: string }>()
  const mark = data?.status === 'confirmed' ? '✓' : data?.status === 'conflict' ? '!' : '?'
  return (
    <span>
      {data?.key ? `${mark} ${data.key} · ${data.label ?? ''}` : `Figure ${(rowNumber ?? 0) + 1}`}
    </span>
  )
}
