'use client'

import { useActionState, useEffect, useRef } from 'react'

import type { Locale } from '@/i18n/config'
import {
  initialSubscriptionState,
  subscriptionConsent,
  type SubscriptionField,
  type SubscriptionFormState,
} from '@/lib/subscriptions/state'

import { ArrowRightIcon, CheckIcon } from '../icons/icons'
import { Button } from '../primitives/Button'
import { CheckboxField, SelectField, TextField } from '../primitives/Field'

export type SubscribeFormProps = {
  locale: Locale
  action: (state: SubscriptionFormState, form: FormData) => Promise<SubscriptionFormState>
  heading: string
  body?: string
  /** `price-alert` (needs `crop`) or the weekly `newsletter`. */
  topic?: 'price-alert' | 'newsletter'
  /** A price alert for this crop id. */
  crop?: string
  /** The page the form is on: stored with the subscription and the no-JavaScript permalink. */
  sourcePath: string
  privacyHref: string
  labels: {
    rule?: string
    rules?: { any: string; above: string; below: string }
    threshold?: string
    email: string
    submit: string
    sending: string
    done: string
    doneBody: string
    privacy: string
  }
  /** Story and test hook; real forms start empty. */
  initialState?: SubscriptionFormState
}

/**
 * Price-alert or newsletter sign-up. Email only for now; the consent text shown is the one stored with the
 * subscription. Works without JavaScript (server action with a permalink).
 */
export function SubscribeForm({
  locale,
  action,
  heading,
  body,
  topic = 'price-alert',
  crop,
  sourcePath,
  privacyHref,
  labels,
  initialState = initialSubscriptionState,
}: SubscribeFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState, sourcePath)
  const status = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (state.status !== 'idle') status.current?.focus()
  }, [state])

  const error = (f: SubscriptionField) => state.errors?.[f]
  const value = (f: SubscriptionField) => state.values?.[f]

  if (state.status === 'success') {
    return (
      <div
        ref={status}
        tabIndex={-1}
        role="status"
        className="grid gap-2 rounded-lg bg-accent-soft p-6"
      >
        <p className="flex items-center gap-2 text-h4 font-semibold text-ink">
          <CheckIcon className="size-6 text-accent" aria-hidden="true" />
          {labels.done}
        </p>
        <p className="text-small text-muted">{labels.doneBody}</p>
      </div>
    )
  }

  return (
    <form action={formAction} noValidate className="grid gap-5">
      <div className="grid gap-2">
        <h2 className="text-h3 font-semibold">{heading}</h2>
        {body && <p className="text-body text-muted">{body}</p>}
      </div>
      {(state.message || state.errors) && (
        <div
          ref={status}
          tabIndex={-1}
          role="alert"
          className="rounded-md bg-danger-soft px-4 py-3 text-small text-danger"
        >
          {state.message ??
            Object.values(state.errors ?? {})
              .filter(Boolean)
              .join(' ')}
        </div>
      )}
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="sourcePath" value={sourcePath} />
      <input type="hidden" name="channel" value="email" />
      <input type="hidden" name="topic" value={topic} />
      {crop && <input type="hidden" name="crop" value={crop} />}
      <div aria-hidden="true" className="sr-only">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {topic === 'price-alert' && labels.rules && (
          <>
            <SelectField
              name="rule"
              label={labels.rule ?? ''}
              defaultValue={value('rule') ?? 'any'}
              options={(['any', 'above', 'below'] as const).map((r) => ({
                value: r,
                label: labels.rules![r],
              }))}
            />
            <TextField
              name="threshold"
              label={labels.threshold ?? ''}
              inputMode="decimal"
              suffix="lei/t"
              defaultValue={value('threshold')}
              error={error('threshold')}
            />
          </>
        )}
        <TextField
          name="email"
          type="email"
          label={labels.email}
          autoComplete="email"
          required
          defaultValue={value('email')}
          error={error('email')}
          className="md:col-span-2"
        />
      </div>
      <CheckboxField
        name="consent"
        required
        defaultChecked={value('consent') === 'on'}
        error={error('consent')}
        label={
          <>
            {subscriptionConsent[locale]} <a href={privacyHref}>{labels.privacy}</a>
          </>
        }
      />
      <div>
        <Button type="submit" disabled={pending} icon={<ArrowRightIcon />}>
          {pending ? labels.sending : labels.submit}
        </Button>
      </div>
    </form>
  )
}
