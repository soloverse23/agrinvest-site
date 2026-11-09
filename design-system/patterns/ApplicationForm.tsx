'use client'

import { useActionState, useEffect, useRef, type ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import type { ApplicationLabels } from '@/i18n/finance-apply'
import type { CompanyLookup } from '@/lib/commerce/state'
import {
  initialApplicationState,
  type ApplicationField,
  type ApplicationState,
} from '@/lib/finance/application-state'

import { ArrowRightIcon, CheckIcon } from '../icons/icons'
import { Button } from '../primitives/Button'
import { CheckboxField, SelectField, TextAreaField, TextField } from '../primitives/Field'
import { CompanyLookupField } from './CompanyLookupField'

type Option = { value: string; label: string }

export type ApplicationFormProps = {
  locale: Locale
  /** The form's strings in the page's language (`applicationUi`). */
  labels: ApplicationLabels
  action: (state: ApplicationState, form: FormData) => Promise<ApplicationState>
  lookup: (cui: string) => Promise<CompanyLookup>
  borrowers: Option[]
  counties: Option[]
  products: Option[]
  crops: Option[]
  guarantees: Option[]
  /** The longest term in months, from the register. */
  maxMonths: number
  /** When the IFN replies, rendered on the server with its register mark. */
  replyTime: ReactNode
  sourcePath: string
  privacyHref: string
  /** Prefill from a product page or the simulator, or a story's state. */
  initialState?: ApplicationState
}

function Group({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-4">
      <legend className="mb-3 text-h4 font-semibold">{legend}</legend>
      {children}
    </fieldset>
  )
}

/** Several checkboxes under one name, laid out as a wrapping grid. */
function Checks({
  name,
  legend,
  hint,
  options,
  checked,
  error,
}: {
  name: string
  legend: string
  hint?: string
  options: Option[]
  checked: string[]
  error?: string
}) {
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-1.5 text-small font-medium text-ink">{legend}</legend>
      {hint && <p className="text-caption text-muted">{hint}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <CheckboxField
            key={o.value}
            name={name}
            value={o.value}
            label={o.label}
            defaultChecked={checked.includes(o.value)}
          />
        ))}
      </div>
      {error && <p className="text-caption font-medium text-danger">{error}</p>}
    </fieldset>
  )
}

/**
 * The credit application on one page. Works without JavaScript: the server action checks
 * everything, and JavaScript adds only the ANAF lookup. No files and no personal numeric code:
 * the IFN asks for documents after the first conversation (decision 0007).
 */
export function ApplicationForm({
  locale,
  labels: t,
  action,
  lookup,
  borrowers,
  counties,
  products,
  crops,
  guarantees,
  maxMonths,
  replyTime,
  sourcePath,
  privacyHref,
  initialState = initialApplicationState,
}: ApplicationFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState, sourcePath)
  const status = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state.status === 'error' || state.status === 'success') status.current?.focus()
    // Analytics (src/components/Analytics.tsx) records this as `generate_lead`, with consent.
    if (state.status === 'success')
      window.dispatchEvent(
        new CustomEvent('agrinvest:lead', { detail: { type: 'credit-application' } }),
      )
  }, [state])

  const error = (f: ApplicationField) => state.errors?.[f]
  const value = (f: ApplicationField) => state.values?.[f]
  const list = (f: ApplicationField) => value(f)?.split(',').filter(Boolean) ?? []

  if (state.status === 'success')
    return (
      <div
        ref={status}
        tabIndex={-1}
        role="status"
        className="grid gap-5 rounded-lg bg-accent-soft p-6 md:p-8"
      >
        <p className="flex items-center gap-2 text-h3 font-semibold text-ink">
          <CheckIcon className="size-6 text-accent" aria-hidden="true" />
          {t.done}
        </p>
        {state.reference && (
          <p className="text-body">
            {t.reference}:{' '}
            <strong className="font-semibold tabular-nums" data-application-reference>
              {state.reference}
            </strong>
            <span className="block text-small text-muted">{t.referenceNote}</span>
          </p>
        )}
        <div className="grid gap-2">
          <p className="text-h4 font-semibold text-ink">{t.next}</p>
          <ol className="grid gap-2 pl-5 text-body text-muted [list-style:decimal]">
            <li>
              {state.assignee
                ? t.callNamed.replace(
                    '{person}',
                    [state.assignee.name, state.assignee.role].filter(Boolean).join(', '),
                  )
                : t.callGeneric}
            </li>
            <li>{t.documents}</li>
            <li>
              {t.reply} {replyTime}.
            </li>
          </ol>
        </div>
        <p className="text-small text-muted">{t.notDecided}</p>
      </div>
    )

  return (
    <form key={state.attempt ?? 0} action={formAction} noValidate className="grid gap-10">
      <p className="text-caption text-subtle">{t.required}</p>
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

      <Group legend={t.who}>
        <SelectField
          name="borrower"
          label={t.borrower}
          defaultValue={value('borrower') ?? ''}
          error={error('borrower')}
          options={[{ value: '', label: t.choose }, ...borrowers]}
        />
        <CompanyLookupField
          lookup={lookup}
          labels={t}
          fill={{ name: 'company' }}
          defaultValue={value('cui')}
          error={error('cui')}
        />
        <TextField
          name="company"
          label={t.company}
          autoComplete="organization"
          defaultValue={value('company')}
          error={error('company')}
        />
        <TextField
          name="name"
          label={t.name}
          autoComplete="name"
          defaultValue={value('name')}
          error={error('name')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="phone"
            label={t.phone}
            type="tel"
            autoComplete="tel"
            defaultValue={value('phone')}
            error={error('phone')}
          />
          <TextField
            name="email"
            label={t.email}
            type="email"
            autoComplete="email"
            defaultValue={value('email')}
            error={error('email')}
          />
        </div>
        <SelectField
          name="county"
          label={t.county}
          defaultValue={value('county') ?? ''}
          error={error('county')}
          options={[{ value: '', label: t.choose }, ...counties]}
        />
      </Group>

      <Group legend={t.need}>
        <SelectField
          name="product"
          label={t.product}
          defaultValue={value('product') ?? ''}
          error={error('product')}
          options={[{ value: '', label: t.unsure }, ...products]}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="amount"
            label={t.amount}
            inputMode="numeric"
            suffix="lei"
            defaultValue={value('amount')}
            error={error('amount')}
          />
          <TextField
            name="termMonths"
            label={t.term}
            hint={t.termHint.replace('{max}', String(maxMonths))}
            inputMode="numeric"
            suffix={t.months}
            defaultValue={value('termMonths')}
            error={error('termMonths')}
          />
        </div>
        <Checks
          name="crops"
          legend={t.crops}
          options={crops}
          checked={list('crops')}
          error={error('crops')}
        />
        <TextField
          name="area"
          label={t.area}
          inputMode="numeric"
          suffix="ha"
          defaultValue={value('area')}
          error={error('area')}
          className="sm:max-w-xs"
        />
        <Checks
          name="guarantees"
          legend={t.guarantees}
          hint={t.guaranteesHint}
          options={guarantees}
          checked={list('guarantees')}
          error={error('guarantees')}
        />
        <TextAreaField
          name="message"
          label={t.message}
          defaultValue={value('message')}
          error={error('message')}
        />
      </Group>

      <Group legend={t.consents}>
        <p className="text-caption text-subtle">{t.draft}</p>
        <CheckboxField
          name="consent"
          label={
            <>
              {t.consent} <a href={privacyHref}>{t.privacy}</a>
            </>
          }
          defaultChecked={Boolean(value('consent'))}
          error={error('consent')}
        />
        <CheckboxField
          name="creditBureau"
          label={t.creditBureau}
          defaultChecked={Boolean(value('creditBureau'))}
        />
      </Group>

      {/* Honeypot: hidden from people, filled in by bots. */}
      <div aria-hidden="true" className="sr-only">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="sourcePath" value={sourcePath} />

      <div className="grid gap-3">
        <p className="text-small text-muted">{t.note}</p>
        <Button type="submit" size="lg" disabled={pending} icon={<ArrowRightIcon />}>
          {pending ? t.sending : t.submit}
        </Button>
      </div>
    </form>
  )
}
