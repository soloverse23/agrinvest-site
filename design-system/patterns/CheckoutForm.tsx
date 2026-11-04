'use client'

import { useActionState, useEffect, useRef, useState, useTransition, type ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import {
  initialCheckoutState,
  type CheckoutField,
  type CheckoutState,
  type CompanyLookup,
} from '@/lib/commerce/state'

import { ArrowRightIcon, CheckIcon } from '../icons/icons'
import { Button } from '../primitives/Button'
import { CheckboxField, SelectField, TextAreaField, TextField } from '../primitives/Field'

type Option = { value: string; label: string }

export type CheckoutFormProps = {
  locale: Locale
  action: (state: CheckoutState, form: FormData) => Promise<CheckoutState>
  lookup: (cui: string) => Promise<CompanyLookup>
  counties: Option[]
  bases: Option[]
  needsCertificate: boolean
  hasProtection: boolean
  /** No lines: the form gives way to a link back to the shop, unless an order just went in. */
  empty: boolean
  sourcePath: string
  privacyHref: string
  termsHref: string
  shopHref: string
  /** Story and test hook; real forms start empty. */
  initialState?: CheckoutState
}

const copy = {
  ro: {
    required: 'Câmpurile fără „opțional” sunt obligatorii.',
    buyer: '1. Cine comandă',
    person: 'Persoană fizică',
    company: 'Firmă',
    name: 'Nume și prenume',
    phone: 'Telefon',
    email: 'E-mail',
    cui: 'CUI',
    find: 'Completează din ANAF',
    finding: 'Se caută…',
    found: 'Am completat datele firmei. Verifică-le.',
    notFound: 'ANAF nu a găsit acest CUI. Completează datele manual.',
    invalid: 'Scrie un CUI valid.',
    unavailable: 'Serviciul ANAF nu răspunde acum. Completează datele manual.',
    companyName: 'Denumirea firmei',
    regCom: 'Nr. Registrul Comerțului (opțional)',
    billing: 'Sediul firmei',
    delivery: '2. Livrare',
    toAddress: 'Livrare la adresă',
    pickup: 'Ridicare de la o bază Agrinvest',
    county: 'Județ',
    choose: 'Alege',
    address: 'Localitate și adresă',
    base: 'Baza',
    deliveryNote: 'Costul livrării se confirmă de consultant, în funcție de zonă și cantitate.',
    certificate: '3. Certificat de utilizator profesionist',
    certificateNote: 'Coșul conține produse de uz profesional.',
    certificateNumber: 'Număr certificat',
    certificateDate: 'Valabil până la',
    payment: 'Plată',
    consultant: 'Vreau să mă contacteze un consultant',
    consultantNote: 'Stabilim împreună prețul final și modul de plată.',
    proforma: 'Transfer bancar cu proformă',
    proformaNote: 'Primești proforma după ce consultantul confirmă stocul și prețul.',
    message: 'Mesaj (opțional)',
    adult: 'Confirm că am cel puțin 18 ani.',
    consent:
      'Sunt de acord ca Agrinvest să mă contacteze pe telefon sau e-mail despre această comandă.',
    terms: 'Accept',
    termsLink: 'termenii de vânzare',
    privacy: 'Cum folosim datele',
    submit: 'Trimite comanda',
    sending: 'Se trimite…',
    note: 'Nu plătești acum. Comanda este o cerere: un consultant confirmă stocul, prețul și plata înainte de facturare.',
    done: 'Mulțumim, am primit comanda.',
    reference: 'Numărul comenzii',
    reply: (name: string, role?: string | null) =>
      `Te contactează ${name}${role ? `, ${role}` : ''}, cât mai curând în timpul programului.`,
    replyGeneric: 'Te contactăm cât mai curând în timpul programului.',
    empty: 'Coșul este gol.',
    toShop: 'Mergi la magazin',
  },
  en: {
    required: 'Fields not marked “optional” are required.',
    buyer: '1. Who is ordering',
    person: 'Person',
    company: 'Company',
    name: 'Full name',
    phone: 'Phone',
    email: 'Email',
    cui: 'Tax ID (CUI)',
    find: 'Fill in from ANAF',
    finding: 'Searching…',
    found: 'We filled in the company details. Please check them.',
    notFound: 'ANAF did not find this tax ID. Please enter the details by hand.',
    invalid: 'Please enter a valid tax ID.',
    unavailable: 'The ANAF service is not answering. Please enter the details by hand.',
    companyName: 'Company name',
    regCom: 'Trade register no. (optional)',
    billing: 'Registered address',
    delivery: '2. Delivery',
    toAddress: 'Delivery to an address',
    pickup: 'Pickup at an Agrinvest base',
    county: 'County',
    choose: 'Choose',
    address: 'Town and address',
    base: 'Base',
    deliveryNote: 'The consultant confirms the delivery cost, by area and quantity.',
    certificate: '3. Professional user certificate',
    certificateNote: 'Your cart contains products for professional use.',
    certificateNumber: 'Certificate number',
    certificateDate: 'Valid until',
    payment: 'Payment',
    consultant: 'I would like a consultant to contact me',
    consultantNote: 'We agree the final price and the way of paying together.',
    proforma: 'Bank transfer with a proforma invoice',
    proformaNote: 'You receive the proforma once the consultant confirms stock and price.',
    message: 'Message (optional)',
    adult: 'I confirm that I am at least 18 years old.',
    consent: 'I agree that Agrinvest may contact me by phone or email about this order.',
    terms: 'I accept the',
    termsLink: 'terms of sale',
    privacy: 'How we use your data',
    submit: 'Send order',
    sending: 'Sending…',
    note: 'You pay nothing now. An order is a request: a consultant confirms stock, price and payment before invoicing.',
    done: 'Thank you, we have your order.',
    reference: 'Order number',
    reply: (name: string, role?: string | null) =>
      `${name}${role ? `, ${role},` : ''} will contact you as soon as possible during office hours.`,
    replyGeneric: 'We will contact you as soon as possible during office hours.',
    empty: 'Your cart is empty.',
    toShop: 'Go to the shop',
  },
}

function Choice({
  name,
  value,
  checked,
  title,
  note,
}: {
  name: string
  value: string
  checked: boolean
  title: string
  note?: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-field-line bg-raised p-4 has-checked:border-accent has-checked:bg-accent-soft">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={checked}
        className="mt-0.5 size-5 shrink-0 accent-accent"
      />
      <span className="grid gap-0.5">
        <span className="text-small font-semibold text-ink">{title}</span>
        {note && <span className="text-caption text-muted">{note}</span>}
      </span>
    </label>
  )
}

function Group({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-4">
      <legend className="mb-3 text-h4 font-semibold">{legend}</legend>
      {children}
    </fieldset>
  )
}

/**
 * Checkout on one page. Works without JavaScript: the server action does all the checking, and
 * company and address fields hide with CSS alone. JavaScript adds only the ANAF lookup.
 */
export function CheckoutForm({
  locale,
  action,
  lookup,
  counties,
  bases,
  needsCertificate,
  hasProtection,
  empty,
  sourcePath,
  privacyHref,
  termsHref,
  shopHref,
  initialState = initialCheckoutState,
}: CheckoutFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState, sourcePath)
  const t = copy[locale]
  const status = useRef<HTMLDivElement>(null)
  const form = useRef<HTMLFormElement>(null)
  const [lookupNote, setLookupNote] = useState<string>()
  const [finding, startLookup] = useTransition()

  useEffect(() => {
    if (state.status !== 'idle') status.current?.focus()
    // Analytics (src/components/Analytics.tsx) records this as `order`, with consent.
    if (state.status === 'success') window.dispatchEvent(new CustomEvent('agrinvest:order'))
  }, [state])

  const error = (f: CheckoutField) => state.errors?.[f]
  const value = (f: CheckoutField) => state.values?.[f]

  if (state.status === 'success')
    return (
      <div
        ref={status}
        tabIndex={-1}
        role="status"
        className="grid gap-3 rounded-lg bg-accent-soft p-6 md:p-8"
      >
        <p className="flex items-center gap-2 text-h3 font-semibold text-ink">
          <CheckIcon className="size-6 text-accent" aria-hidden="true" />
          {t.done}
        </p>
        {state.reference && (
          <p className="text-body">
            {t.reference}:{' '}
            <strong className="font-semibold tabular-nums" data-order-reference>
              {state.reference}
            </strong>
          </p>
        )}
        <p className="text-body text-muted">
          {state.assignee ? t.reply(state.assignee.name, state.assignee.role) : t.replyGeneric}
        </p>
      </div>
    )

  if (empty)
    return (
      <div className="grid justify-items-start gap-4 rounded-lg bg-surface p-6">
        <p className="text-body">{t.empty}</p>
        <Button href={shopHref} icon={<ArrowRightIcon />}>
          {t.toShop}
        </Button>
      </div>
    )

  const fill = () => {
    const inputs = form.current?.elements
    const get = (name: string) => inputs?.namedItem(name) as HTMLInputElement | null
    const cui = get('cui')?.value ?? ''
    startLookup(async () => {
      const result = await lookup(cui)
      if (result.status === 'found') {
        const set = (name: string, text: string) => {
          const input = get(name)
          if (input) input.value = text
        }
        set('company', result.name)
        set('billingAddress', result.address)
        set('regCom', result.regCom)
        setLookupNote(t.found)
      } else
        setLookupNote(
          { 'not-found': t.notFound, invalid: t.invalid, unavailable: t.unavailable }[
            result.status
          ],
        )
    })
  }

  return (
    <form ref={form} action={formAction} noValidate className="group grid gap-10">
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

      <Group legend={t.buyer}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Choice
            name="buyerType"
            value="person"
            title={t.person}
            checked={value('buyerType') !== 'company'}
          />
          <Choice
            name="buyerType"
            value="company"
            title={t.company}
            checked={value('buyerType') === 'company'}
          />
        </div>
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
        <div
          data-company-fields
          className="grid gap-4 group-has-[input[name=buyerType][value=person]:checked]:hidden"
        >
          <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
            <TextField
              name="cui"
              label={t.cui}
              defaultValue={value('cui')}
              error={error('cui')}
              inputMode="text"
            />
            <Button type="button" variant="secondary" onClick={fill} disabled={finding}>
              {finding ? t.finding : t.find}
            </Button>
          </div>
          <p aria-live="polite" className="text-caption text-muted empty:hidden">
            {lookupNote}
          </p>
          <TextField
            name="company"
            label={t.companyName}
            autoComplete="organization"
            defaultValue={value('company')}
            error={error('company')}
          />
          <TextField
            name="regCom"
            label={t.regCom}
            defaultValue={value('regCom')}
            error={error('regCom')}
          />
          <TextField
            name="billingAddress"
            label={t.billing}
            defaultValue={value('billingAddress')}
            error={error('billingAddress')}
          />
        </div>
      </Group>

      <Group legend={t.delivery}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Choice
            name="deliveryMethod"
            value="delivery"
            title={t.toAddress}
            checked={value('deliveryMethod') !== 'pickup'}
          />
          <Choice
            name="deliveryMethod"
            value="pickup"
            title={t.pickup}
            checked={value('deliveryMethod') === 'pickup'}
          />
        </div>
        <div className="grid gap-4 group-has-[input[name=deliveryMethod][value=pickup]:checked]:hidden">
          <SelectField
            name="county"
            label={t.county}
            defaultValue={value('county') ?? ''}
            error={error('county')}
            options={[{ value: '', label: t.choose }, ...counties]}
          />
          <TextField
            name="address"
            label={t.address}
            autoComplete="street-address"
            defaultValue={value('address')}
            error={error('address')}
          />
        </div>
        <div className="grid gap-4 group-has-[input[name=deliveryMethod][value=delivery]:checked]:hidden">
          <SelectField
            name="base"
            label={t.base}
            defaultValue={value('base') ?? ''}
            error={error('base')}
            options={[{ value: '', label: t.choose }, ...bases]}
          />
        </div>
        <p className="text-caption text-muted">{t.deliveryNote}</p>
      </Group>

      {needsCertificate && (
        <Group legend={t.certificate}>
          <p className="text-small text-muted">{t.certificateNote}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="certificateNumber"
              label={t.certificateNumber}
              defaultValue={value('certificateNumber')}
              error={error('certificateNumber')}
            />
            <TextField
              name="certificateValidUntil"
              label={t.certificateDate}
              type="date"
              defaultValue={value('certificateValidUntil')}
              error={error('certificateValidUntil')}
            />
          </div>
        </Group>
      )}

      <Group legend={t.payment}>
        <div className="grid gap-3">
          <Choice
            name="payment"
            value="consultant"
            title={t.consultant}
            note={t.consultantNote}
            checked={value('payment') !== 'proforma'}
          />
          <Choice
            name="payment"
            value="proforma"
            title={t.proforma}
            note={t.proformaNote}
            checked={value('payment') === 'proforma'}
          />
        </div>
      </Group>

      <TextAreaField
        name="message"
        label={t.message}
        defaultValue={value('message')}
        error={error('message')}
      />

      <div className="grid gap-3">
        {hasProtection && <CheckboxField name="adult" label={t.adult} error={error('adult')} />}
        <CheckboxField
          name="consent"
          label={
            <>
              {t.consent} <a href={privacyHref}>{t.privacy}</a>
            </>
          }
          error={error('consent')}
        />
        <CheckboxField
          name="terms"
          label={
            <>
              {t.terms} <a href={termsHref}>{t.termsLink}</a>
            </>
          }
          error={error('terms')}
        />
      </div>

      {/* Honeypot: hidden from people, filled in by bots. */}
      <div aria-hidden="true" className="sr-only">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input type="hidden" name="locale" value={locale} />

      <div className="grid gap-3">
        <p className="text-small text-muted">{t.note}</p>
        <Button type="submit" size="lg" disabled={pending} icon={<ArrowRightIcon />}>
          {pending ? t.sending : t.submit}
        </Button>
      </div>
    </form>
  )
}
