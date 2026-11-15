'use client'

import { useActionState, useEffect, useId, useRef, useState } from 'react'

import type { Locale } from '@/i18n/config'
import { initialLeadState, type LeadFormState } from '@/lib/leads/state'

import { ArrowRightIcon, CheckIcon } from '../icons/icons'
import { Button } from '../primitives/Button'
import { CheckboxField, SelectField, TextAreaField, TextField } from '../primitives/Field'

export type ConsultantDialogProps = {
  locale: Locale
  action: (state: LeadFormState, form: FormData) => Promise<LeadFormState>
  /** The page it opens on: stored with the lead. */
  sourcePath: string
  privacyHref: string
  /** "Pentru ce?" choices: the finance needs (`src/lib/finance/needs.ts`). */
  needs: { id: string; label: string }[]
  /** The need the page is about; a trigger's `data-need` overrides it. */
  defaultNeed?: string
  /** The credit page it opens on, by key, stored in the lead's message. */
  credit?: string
  /** The detailed application, offered after sending (pre-filled with the credit). */
  applyHref: string
  /** The reply time from the register, already resolved ("în 24 h de la dosarul complet"). */
  reply?: string
  /** Stories: render the panel open, without a trigger. */
  open?: boolean
  initialState?: LeadFormState
}

const copy = {
  ro: {
    kicker: 'Agrinvest Credit IFN',
    title: 'Vorbește cu un consultant',
    lead: 'Lasă-ne datele și te sună un consultant. Îți spune ce credit se potrivește fermei tale și ce trebuie pregătit.',
    terms:
      'Condițiile se stabilesc pentru fiecare fermă, după analiză. Discuția nu te obligă la nimic.',
    name: 'Nume și prenume',
    phone: 'Telefon',
    email: 'E-mail',
    need: 'Pentru ce ai nevoie de bani?',
    unsure: 'Nu știu încă',
    note: 'Ceva ce ne ajută să te pregătim (opțional)',
    noteHint: 'Suprafața, suma estimată, când ai nevoie de bani.',
    consent:
      'Sunt de acord ca Agrinvest Credit IFN să mă contacteze pe telefon sau e-mail despre această cerere.',
    privacy: 'Cum folosim datele',
    submit: 'Cere să fiu sunat',
    sending: 'Se trimite…',
    close: 'Închide',
    done: 'Mulțumim! Te sună un consultant.',
    doneReply: (reply: string) => `După ce ai trimis actele cerute, răspunsul vine ${reply}.`,
    faster: 'Vrei să grăbești analiza?',
    fasterLink: 'Completează detaliile fermei',
  },
  en: {
    kicker: 'Agrinvest Credit IFN',
    title: 'Talk to a consultant',
    lead: 'Leave your details and a consultant will call you. They will tell you which loan suits your farm and what to prepare.',
    terms: 'Terms are set for each farm after the review. Talking commits you to nothing.',
    name: 'Full name',
    phone: 'Phone',
    email: 'Email',
    need: 'What do you need the money for?',
    unsure: 'Not sure yet',
    note: 'Anything that helps us prepare (optional)',
    noteHint: 'Your area, a rough amount, when you need the money.',
    consent:
      'I agree that Agrinvest Credit IFN may contact me by phone or email about this request.',
    privacy: 'How we use your data',
    submit: 'Ask for a call',
    sending: 'Sending…',
    close: 'Close',
    done: 'Thank you! A consultant will call you.',
    doneReply: (reply: string) =>
      `Once you have sent the papers asked for, you get a reply ${reply}.`,
    faster: 'Want to speed up the review?',
    fasterLink: 'Fill in your farm’s details',
  },
}

/**
 * The consultant drawer of the finance section (Phase 7g): a native `<dialog>` that every
 * `[data-consultant]` link on the page opens. Those links point at the detailed application,
 * so without JavaScript a farmer still reaches a form. A side panel on wide screens, a bottom
 * sheet on phones. Escape and the backdrop close it; the dialog keeps focus inside.
 */
export function ConsultantDialog({
  locale,
  action,
  sourcePath,
  privacyHref,
  needs,
  defaultNeed,
  credit,
  applyHref,
  reply,
  open,
  initialState = initialLeadState,
}: ConsultantDialogProps) {
  const t = copy[locale]
  const id = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const status = useRef<HTMLDivElement>(null)
  const [need, setNeed] = useState(defaultNeed ?? '')
  const [state, formAction, pending] = useActionState(action, initialState, sourcePath)

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    const show = (wanted?: string | null) => {
      if (wanted !== undefined) setNeed(wanted ?? defaultNeed ?? '')
      if (!el.open) el.showModal()
    }
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const trigger = (e.target as Element | null)?.closest<HTMLElement>('[data-consultant]')
      if (!trigger) return
      e.preventDefault()
      e.stopPropagation()
      show(trigger.dataset.need || null)
    }
    window.addEventListener('click', onClick, true)
    if (window.location.hash === '#consultant') show()
    return () => window.removeEventListener('click', onClick, true)
  }, [defaultNeed])

  useEffect(() => {
    if (open && dialog.current && !dialog.current.open) dialog.current.showModal()
  }, [open])

  useEffect(() => {
    if (state.status !== 'idle') status.current?.focus()
    if (state.status === 'success')
      window.dispatchEvent(new CustomEvent('agrinvest:lead', { detail: { type: 'finantare' } }))
  }, [state])

  // Carry campaign parameters from the landing URL into the lead.
  const utm = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    utm.current?.querySelectorAll('input').forEach((input) => {
      input.value = params.get(input.name) ?? ''
    })
  }, [])

  const error = (f: 'name' | 'phone' | 'email' | 'consent') => state.errors?.[f]
  const value = (f: 'name' | 'phone' | 'email' | 'message') => state.values?.[f]

  return (
    <dialog
      ref={dialog}
      id="consultant"
      aria-labelledby={`${id}-title`}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog itself, outside the panel.
        if (e.target === e.currentTarget) e.currentTarget.close()
      }}
      className="m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-xl bg-paper p-0 text-ink shadow-floating backdrop:bg-forest/50 backdrop:backdrop-blur-[2px] motion-safe:open:animate-sheet-in md:mt-0 md:ml-auto md:h-dvh md:max-h-dvh md:w-[28rem] md:rounded-none md:rounded-l-xl motion-safe:md:open:animate-panel-in"
    >
      <div className="grid gap-6 p-5 md:p-8">
        <header className="flex items-start justify-between gap-4">
          <div className="grid gap-2">
            <p className="text-caption font-semibold tracking-wide text-accent uppercase">
              {t.kicker}
            </p>
            <h2 id={`${id}-title`} className="text-h3 font-semibold text-balance">
              {t.title}
            </h2>
          </div>
          <form method="dialog">
            <button
              type="submit"
              aria-label={t.close}
              className="grid size-10 shrink-0 place-items-center rounded-full text-muted ring-1 ring-line hover:text-ink hover:ring-ink"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </form>
        </header>

        {state.status === 'success' ? (
          <div ref={status} tabIndex={-1} role="status" className="grid gap-5 outline-none">
            <div className="flex items-start gap-3 rounded-lg bg-accent-soft p-4">
              <span
                className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent text-on-accent"
                aria-hidden="true"
              >
                <CheckIcon className="size-4" />
              </span>
              <div className="grid gap-1">
                <p className="font-semibold">{t.done}</p>
                {reply && <p className="text-small text-muted">{t.doneReply(reply)}</p>}
              </div>
            </div>
            <div className="grid gap-2 rounded-lg p-4 ring-1 ring-line">
              <p className="text-small text-muted">{t.faster}</p>
              <a
                href={applyHref}
                className="inline-flex items-center gap-2 font-semibold text-accent no-underline hover:underline"
              >
                {t.fasterLink}
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        ) : (
          <form action={formAction} noValidate className="grid gap-4">
            <p className="text-body text-muted">{t.lead}</p>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="sourcePath" value={sourcePath} />
            {credit && <input type="hidden" name="credit" value={credit} />}
            <div ref={utm} hidden>
              <input type="hidden" name="utm_source" />
              <input type="hidden" name="utm_medium" />
              <input type="hidden" name="utm_campaign" />
            </div>
            <div className="hidden" aria-hidden="true">
              <label>
                Website
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <SelectField
              name="need"
              label={t.need}
              value={need}
              onChange={(e) => setNeed(e.currentTarget.value)}
              options={[
                { value: '', label: t.unsure },
                ...needs.map((n) => ({ value: n.id, label: n.label })),
              ]}
            />
            <TextField
              name="name"
              label={t.name}
              autoComplete="name"
              defaultValue={value('name')}
              error={error('name')}
            />
            <div className="grid gap-4">
              <TextField
                name="phone"
                label={t.phone}
                type="tel"
                inputMode="tel"
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
            <TextAreaField
              name="note"
              label={t.note}
              hint={t.noteHint}
              rows={3}
              defaultValue={value('message')}
            />
            <CheckboxField
              name="consent"
              label={
                <>
                  {t.consent}{' '}
                  <a href={privacyHref} className="text-accent underline underline-offset-2">
                    {t.privacy}
                  </a>
                </>
              }
              error={error('consent')}
            />
            {state.message && (
              <div
                ref={status}
                tabIndex={-1}
                role="alert"
                className="rounded-md bg-danger-soft p-3 text-small text-danger outline-none"
              >
                {state.message}
              </div>
            )}
            <Button type="submit" disabled={pending} icon={<ArrowRightIcon />} fullWidth>
              {pending ? t.sending : t.submit}
            </Button>
            <p className="text-caption text-muted">{t.terms}</p>
          </form>
        )}
      </div>
    </dialog>
  )
}
