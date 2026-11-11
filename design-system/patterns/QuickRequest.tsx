'use client'

import { useActionState, useEffect, useId, useRef } from 'react'

import type { Locale } from '@/i18n/config'
import { initialQuickState, type QuickRequestState } from '@/lib/leads/state'

import { ArrowRightIcon, CheckIcon, PhoneIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { Button } from '../primitives/Button'

export type QuickRequestProps = {
  locale: Locale
  action: (state: QuickRequestState, form: FormData) => Promise<QuickRequestState>
  /** The page it sits on: stored with the lead and used as the no-JavaScript permalink. */
  sourcePath: string
  privacyHref: string
  /** The question above the field. Defaults to a general one. */
  label?: string
  /** The button text. Defaults to "Sună-mă" / "Call me". */
  submitLabel?: string
  /** `inline`: field and button on one row (buy box, cart, empty states). `compact`: stacked, for cards. */
  layout?: 'inline' | 'compact'
  /** What the request is about, stored with the lead. */
  products?: number[]
  variant?: string
  quantity?: number
  hectares?: number
  /** Story and test hook; real forms start idle. */
  initialState?: QuickRequestState
  className?: string
}

const copy = {
  ro: {
    label: 'Vrei o ofertă? Lasă telefonul sau e-mailul.',
    field: 'Telefon sau e-mail',
    placeholder: '07xx xxx xxx sau nume@firma.ro',
    submit: 'Sună-mă',
    send: 'Trimite',
    sending: 'Se trimite…',
    privacy: 'Te contactăm doar despre această cerere.',
    privacyLink: 'Cum folosim datele',
    done: 'Mulțumim! Te contactăm în curând.',
    keep: 'Poți continua cumpărăturile.',
    addPhone: 'Adaugă și telefonul',
    phone: 'Telefon',
    save: 'Adaugă',
    completed: 'Am adăugat telefonul. Te sunăm în curând.',
  },
  en: {
    label: 'Want a quote? Leave your phone or email.',
    field: 'Phone or email',
    placeholder: '+40 7xx xxx xxx or name@company.com',
    submit: 'Call me',
    send: 'Send',
    sending: 'Sending…',
    privacy: 'We contact you only about this request.',
    privacyLink: 'How we use your data',
    done: 'Thank you! We will be in touch soon.',
    keep: 'You can keep shopping.',
    addPhone: 'Add your phone too',
    phone: 'Phone',
    save: 'Add',
    completed: 'Phone added. We will call you soon.',
  },
}

const input =
  'h-12 w-full min-w-0 rounded-md border bg-raised px-4 text-body text-ink placeholder:text-subtle transition duration-150 ease-move focus-visible:outline-none focus-visible:ring-4'
const inputState = (error?: string) =>
  error
    ? 'border-danger focus-visible:border-danger focus-visible:ring-danger/15'
    : 'border-field-line hover:border-ink focus-visible:border-accent focus-visible:ring-accent/15'

/** Fields every submission carries; the honeypot catches bots that fill everything. */
function Hidden({
  locale,
  sourcePath,
  extra,
}: {
  locale: Locale
  sourcePath: string
  extra: Record<string, string | number | undefined>
}) {
  return (
    <>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="sourcePath" value={sourcePath} />
      {Object.entries(extra).map(([name, value]) =>
        value === undefined || value === '' ? null : (
          <input key={name} type="hidden" name={name} value={value} />
        ),
      )}
      <div aria-hidden="true" className="sr-only">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
    </>
  )
}

/**
 * One field, a phone or an email, and one button (decision 0010). The visitor stays on the
 * page. There is no consent box: the notice line links to the privacy page, because the
 * visitor asks to be contacted. Without JavaScript the form posts and the page reloads with
 * the result. After an email, the visitor may add a phone to the same request.
 */
export function QuickRequest({
  locale,
  action,
  sourcePath,
  privacyHref,
  label,
  submitLabel,
  layout = 'inline',
  products,
  variant,
  quantity,
  hectares,
  initialState = initialQuickState,
  className,
}: QuickRequestProps) {
  const [state, formAction, pending] = useActionState(action, initialState, sourcePath)
  const t = copy[locale]
  const id = useId()
  const status = useRef<HTMLDivElement>(null)
  const compact = layout === 'compact'

  useEffect(() => {
    if (state.status === 'success' && !state.completed) {
      status.current?.focus()
      // Analytics (src/components/Analytics.tsx) records this as generate_lead, with consent.
      window.dispatchEvent(new CustomEvent('agrinvest:lead', { detail: { type: 'quick' } }))
    }
  }, [state])

  if (state.status === 'success' || (state.status === 'error' && state.followUp)) {
    const followUp = state.followUp
    return (
      <div
        ref={status}
        tabIndex={-1}
        role="status"
        className={cx(
          'grid gap-2 rounded-lg bg-accent-soft text-ink',
          compact ? 'p-3' : 'p-4',
          className,
        )}
      >
        <p
          className={cx(
            'flex items-start gap-2 font-semibold',
            compact ? 'text-small' : 'text-body',
          )}
        >
          <CheckIcon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
          {state.completed ? t.completed : t.done}
        </p>
        {!state.completed && !compact && <p className="text-small text-muted">{t.keep}</p>}
        {followUp && !state.completed && (
          // <details> opens without JavaScript; the phone goes to the same lead.
          <details className="group" open={state.status === 'error'}>
            <summary className="inline-flex cursor-pointer items-center gap-1.5 text-small font-medium text-accent hover:underline">
              <PhoneIcon className="size-4" aria-hidden="true" />
              {t.addPhone}
            </summary>
            <form action={formAction} noValidate className="mt-2 flex flex-wrap gap-2">
              <Hidden locale={locale} sourcePath={sourcePath} extra={followUp} />
              <label htmlFor={`${id}-phone`} className="sr-only">
                {t.phone}
              </label>
              <input
                id={`${id}-phone`}
                name="contact"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                defaultValue={state.value}
                aria-invalid={state.error ? true : undefined}
                aria-describedby={state.error ? `${id}-phone-error` : undefined}
                className={cx(input, inputState(state.error), 'h-10 flex-1 basis-40 text-small')}
              />
              <Button type="submit" size="sm" variant="secondary" disabled={pending}>
                {pending ? t.sending : t.save}
              </Button>
              {state.error && (
                <p id={`${id}-phone-error`} className="w-full text-caption font-medium text-danger">
                  {state.error}
                </p>
              )}
            </form>
          </details>
        )}
      </div>
    )
  }

  const error = state.status === 'error' ? state.error : undefined
  const form = (
    <form action={formAction} noValidate className={cx('grid gap-2', compact ? 'mt-2' : className)}>
      <Hidden
        locale={locale}
        sourcePath={sourcePath}
        extra={{ product: products?.join(','), variant, quantity, hectares }}
      />
      <label
        htmlFor={id}
        className={cx('font-medium text-ink', compact ? 'text-caption' : 'text-small')}
      >
        {label || t.label}
      </label>
      <div className={cx('flex gap-2', compact ? 'flex-col' : 'flex-col md:flex-row')}>
        <input
          id={id}
          name="contact"
          type="text"
          placeholder={compact ? t.field : t.placeholder}
          defaultValue={state.value}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={[error && `${id}-error`, `${id}-privacy`].filter(Boolean).join(' ')}
          className={cx(input, inputState(error), compact && 'h-10 px-3 text-small', 'md:flex-1')}
        />
        <Button
          type="submit"
          disabled={pending}
          size={compact ? 'sm' : 'md'}
          icon={compact ? undefined : <ArrowRightIcon />}
          className="shrink-0"
        >
          {pending ? t.sending : compact ? t.send : submitLabel || t.submit}
        </Button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-caption font-medium text-danger">
          {error}
        </p>
      )}
      <p id={`${id}-privacy`} className="text-caption text-subtle">
        {compact ? null : <>{t.privacy} </>}
        <a href={privacyHref} className="text-subtle underline hover:text-ink">
          {t.privacyLink}
        </a>
      </p>
    </form>
  )
  if (!compact) return form
  // On a card the field opens from a button, so cards keep one height; <details> needs no JS.
  return (
    <details className={cx('group', className)} open={Boolean(error)}>
      <summary className="flex h-10 cursor-pointer list-none items-center justify-center gap-1.5 rounded-md bg-raised px-3 text-center text-small leading-tight font-semibold text-ink shadow-soft ring-1 ring-line-strong ring-inset hover:bg-surface group-open:bg-surface [&::-webkit-details-marker]:hidden">
        <PhoneIcon className="size-4 shrink-0" aria-hidden="true" />
        {submitLabel || t.submit}
      </summary>
      {form}
    </details>
  )
}
