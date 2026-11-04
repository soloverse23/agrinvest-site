import type { ReactNode } from 'react'

import { cx } from '../lib/cx'

export type BadgeTone = 'neutral' | 'accent' | 'lime' | 'warning' | 'info' | 'danger' | 'forest'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-flat-soft text-ink',
  accent: 'bg-accent-soft text-accent',
  lime: 'bg-lime-soft text-forest',
  warning: 'bg-warning-soft text-warning',
  info: 'bg-info-soft text-info',
  danger: 'bg-danger-soft text-danger',
  forest: 'bg-forest text-on-forest',
}

/** Small pill label: category, status, stock. `dot` adds a status dot before the text. */
export function Badge({
  tone = 'neutral',
  dot,
  className,
  children,
}: {
  tone?: BadgeTone
  dot?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-caption font-medium',
        tones[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  )
}
