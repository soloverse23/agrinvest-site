'use client'

import { useState } from 'react'

import { cx } from '../lib/cx'

export type SegmentedOption<T extends string> = { value: T; label: string }

/**
 * A pill switch between a few views (bases, periods, units). Each option is a toggle button
 * with `aria-pressed`; the group is labelled. Controlled (`value` + `onChange`) or not.
 */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  defaultValue,
  onChange,
  size = 'md',
  className,
}: {
  label: string
  options: SegmentedOption<T>[]
  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
  size?: 'sm' | 'md'
  className?: string
}) {
  const [inner, setInner] = useState<T>(defaultValue ?? options[0].value)
  const current = value ?? inner

  return (
    <div
      role="group"
      aria-label={label}
      className={cx('inline-flex max-w-full flex-wrap gap-1 rounded-md bg-surface p-1', className)}
    >
      {options.map((option) => {
        const selected = option.value === current
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => {
              setInner(option.value)
              onChange?.(option.value)
            }}
            className={cx(
              'rounded-sm font-medium whitespace-nowrap transition duration-150 ease-move',
              size === 'sm' ? 'h-8 px-3 text-caption' : 'h-10 px-4 text-small',
              selected ? 'bg-raised text-ink shadow-soft' : 'text-muted hover:text-ink',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
