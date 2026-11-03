import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'

import { ChevronDownIcon } from '../icons/icons'
import { cx } from '../lib/cx'

type FieldFrame = {
  label: string
  /** Help text under the label. */
  hint?: string
  /** Error message; marks the control invalid. */
  error?: string
  /** Unit shown inside the input, on the right (e.g. `ha`, `lei/t`). */
  suffix?: string
}

const control =
  'h-12 w-full rounded-md border bg-raised px-4 text-body text-ink placeholder:text-subtle transition duration-150 ease-move focus-visible:outline-none focus-visible:ring-4'
const controlState = (error?: string) =>
  error
    ? 'border-danger focus-visible:border-danger focus-visible:ring-danger/15'
    : 'border-field-line hover:border-ink focus-visible:border-accent focus-visible:ring-accent/15'

function Frame({
  id,
  label,
  hint,
  error,
  children,
}: FieldFrame & { id: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-small font-medium text-ink">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="-mt-1 text-caption text-muted">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="text-caption font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

const describedBy = (id: string, hint?: string, error?: string) =>
  [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined

export function TextField({
  label,
  hint,
  error,
  suffix,
  className,
  ...props
}: FieldFrame & Omit<InputHTMLAttributes<HTMLInputElement>, 'children'>) {
  const id = useId()
  return (
    <Frame id={id} label={label} hint={hint} error={error}>
      <div className={cx('relative', className)}>
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cx(
            control,
            controlState(error),
            suffix && 'pr-16',
            props.inputMode === 'decimal' && 'tabular-nums',
          )}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-small text-muted">
            {suffix}
          </span>
        )}
      </div>
    </Frame>
  )
}

export function SelectField({
  label,
  hint,
  error,
  options,
  className,
  ...props
}: FieldFrame & { options: { value: string; label: string }[] } & Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    'children'
  >) {
  const id = useId()
  return (
    <Frame id={id} label={label} hint={hint} error={error}>
      <div className={cx('relative', className)}>
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cx(control, controlState(error), 'appearance-none pr-12')}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-muted" />
      </div>
    </Frame>
  )
}
