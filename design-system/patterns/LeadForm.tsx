'use client'

import { useActionState, useEffect, useRef } from 'react'

import type { Locale } from '@/i18n/config'
import { initialLeadState, type LeadField, type LeadFormState } from '@/lib/leads/state'
import type { LeadType } from '@/lib/leads/types'

import { ArrowRightIcon, CheckIcon } from '../icons/icons'
import { Button } from '../primitives/Button'
import { CheckboxField, SelectField, TextAreaField, TextField } from '../primitives/Field'

type Option = { value: string; label: string }
export type LeadExtraField = 'company' | 'county' | 'base' | 'crop'

export type LeadFormProps = {
  locale: Locale
  type: LeadType
  action: (state: LeadFormState, form: FormData) => Promise<LeadFormState>
  heading?: string | null
  body?: string | null
  extra?: readonly LeadExtraField[] | null
  options?: Partial<Record<'county' | 'base' | 'crop', Option[]>>
  /** Pre-selected option values, e.g. the base on its own page. */
  defaults?: Partial<Record<'county' | 'base' | 'crop', string>>
  /** The page the form is on: stored with the lead and used as the no-JavaScript permalink. */
  sourcePath: string
  privacyHref: string
  /** Story and test hook; real forms start empty. */
  initialState?: LeadFormState
}

const copy = {
  ro: {
    heading: 'Scrie-ne',
    name: 'Nume și prenume',
    phone: 'Telefon',
    email: 'E-mail',
    company: 'Firmă (opțional)',
    cui: 'CUI (opțional)',
    county: 'Județ',
    base: 'Baza cea mai apropiată',
    crop: 'Cultură',
    choose: 'Alege',
    message: 'Mesaj',
    messageHint: 'Cantitate, perioadă, orice ne ajută să-ți răspundem mai repede.',
    consent:
      'Sunt de acord ca Agrinvest să mă contacteze pe telefon sau e-mail despre această cerere.',
    privacy: 'Cum folosim datele',
    submit: 'Trimite cererea',
    sending: 'Se trimite…',
    done: 'Mulțumim, am primit cererea.',
    reply: (name: string, role?: string | null) =>
      `Îți răspunde ${name}${role ? `, ${role}` : ''}, cât mai curând în timpul programului.`,
    replyGeneric: 'Te contactăm cât mai curând în timpul programului.',
    required: 'Câmpurile fără „opțional” sunt obligatorii.',
  },
  en: {
    heading: 'Write to us',
    name: 'Full name',
    phone: 'Phone',
    email: 'Email',
    company: 'Company (optional)',
    cui: 'Tax ID (optional)',
    county: 'County',
    base: 'Nearest base',
    crop: 'Crop',
    choose: 'Choose',
    message: 'Message',
    messageHint: 'Quantity, timing, anything that helps us reply faster.',
    consent: 'I agree that Agrinvest may contact me by phone or email about this request.',
    privacy: 'How we use your data',
    submit: 'Send request',
    sending: 'Sending…',
    done: 'Thank you, we have your request.',
    reply: (name: string, role?: string | null) =>
      `${name}${role ? `, ${role},` : ''} will get back to you as soon as possible during office hours.`,
    replyGeneric: 'We will get back to you as soon as possible during office hours.',
    required: 'Fields not marked “optional” are required.',
  },
}

/**
 * Lead form for every enquiry type. Phone and email are both required. Works without
 * JavaScript (server action with a permalink); with JavaScript it keeps the page in place.
 */
export function LeadForm({
  locale,
  type,
  action,
  heading,
  body,
  extra,
  options = {},
  sourcePath,
  privacyHref,
  initialState = initialLeadState,
  defaults,
}: LeadFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState, sourcePath)
  const t = copy[locale]
  const utm = useRef<HTMLDivElement>(null)
  const status = useRef<HTMLDivElement>(null)

  // Carry campaign parameters from the landing URL into the lead.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    utm.current?.querySelectorAll('input').forEach((input) => {
      input.value = params.get(input.name) ?? ''
    })
  }, [])

  useEffect(() => {
    if (state.status !== 'idle') status.current?.focus()
  }, [state])

  const error = (f: LeadField) => state.errors?.[f]
  const value = (f: LeadField) => state.values?.[f]
  const has = (f: LeadExtraField) => extra?.includes(f)
  const select = (f: 'county' | 'base' | 'crop') =>
    has(f) && options[f]?.length ? (
      <SelectField
        name={f}
        label={t[f]}
        defaultValue={value(f) ?? defaults?.[f] ?? ''}
        error={error(f)}
        options={[{ value: '', label: t.choose }, ...options[f]]}
      />
    ) : null

  if (state.status === 'success') {
    return (
      <div
        ref={status}
        tabIndex={-1}
        role="status"
        className="grid gap-3 rounded-lg bg-accent-soft p-6 md:p-8"
      >
        <p className="flex items-center gap-2 text-h4 font-semibold text-ink">
          <CheckIcon className="size-6 text-accent" aria-hidden="true" />
          {t.done}
        </p>
        <p className="text-body text-muted">
          {state.assignee ? t.reply(state.assignee.name, state.assignee.role) : t.replyGeneric}
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} noValidate className="grid gap-6">
      <div className="grid gap-2">
        <h2 className="text-h3 font-semibold">{heading || t.heading}</h2>
        {body && <p className="text-body text-muted">{body}</p>}
        <p className="text-caption text-subtle">{t.required}</p>
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

      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="sourcePath" value={sourcePath} />
      <div ref={utm} hidden>
        <input type="hidden" name="utm_source" />
        <input type="hidden" name="utm_medium" />
        <input type="hidden" name="utm_campaign" />
      </div>
      {/* Honeypot: hidden from people and assistive tech, filled by bots. */}
      <div aria-hidden="true" className="sr-only">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          name="name"
          label={t.name}
          autoComplete="name"
          required
          defaultValue={value('name')}
          error={error('name')}
          className="md:col-span-2"
        />
        <TextField
          name="phone"
          type="tel"
          label={t.phone}
          autoComplete="tel"
          inputMode="tel"
          required
          defaultValue={value('phone')}
          error={error('phone')}
        />
        <TextField
          name="email"
          type="email"
          label={t.email}
          autoComplete="email"
          required
          defaultValue={value('email')}
          error={error('email')}
        />
        {has('company') && (
          <>
            <TextField
              name="company"
              label={t.company}
              autoComplete="organization"
              defaultValue={value('company')}
              error={error('company')}
            />
            <TextField name="cui" label={t.cui} defaultValue={value('cui')} error={error('cui')} />
          </>
        )}
        {select('county')}
        {select('crop')}
        {select('base')}
        <TextAreaField
          name="message"
          label={t.message}
          hint={t.messageHint}
          defaultValue={value('message')}
          error={error('message')}
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
            {t.consent} <a href={privacyHref}>{t.privacy}</a>
          </>
        }
      />

      <div>
        <Button type="submit" disabled={pending} icon={<ArrowRightIcon />}>
          {pending ? t.sending : t.submit}
        </Button>
      </div>
    </form>
  )
}
