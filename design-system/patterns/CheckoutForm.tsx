'use client'

import { useActionState, useEffect, useRef, type ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import {
  initialCheckoutState,
  type CheckoutField,
  type CheckoutState,
  type CompanyLookup,
} from '@/lib/commerce/state'

import {
  ArrowRightIcon,
  CardIcon,
  CheckIcon,
  ChevronDownIcon,
  DocumentIcon,
  PhoneIcon,
  PinIcon,
  TruckIcon,
} from '../icons/icons'
import { Badge } from '../primitives/Badge'
import { Button } from '../primitives/Button'
import { CheckboxField, SelectField, TextAreaField, TextField } from '../primitives/Field'
import { CompanyLookupField } from './CompanyLookupField'

type Option = { value: string; label: string }

/** A cart line as the summary shows it; amounts come formatted from the server. */
export type CheckoutLine = {
  sku: string
  name: string
  pack?: string
  quantity: number
  total: string
}

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
  /** The cart, for the summary column. */
  lines?: CheckoutLine[]
  total?: string
  /** Breadcrumb trail, rendered by the page. */
  crumbs?: ReactNode
  sourcePath: string
  privacyHref: string
  termsHref: string
  shopHref: string
  cartHref?: string
  contactHref?: string
  /** Story and test hook; real forms start empty. */
  initialState?: CheckoutState
}

const copy = {
  ro: {
    title: 'Finalizează comanda',
    steps: ['Coș', 'Detalii', 'Confirmare'],
    stepsLabel: 'Pașii comenzii',
    required: 'Toate câmpurile sunt obligatorii, dacă nu scrie „opțional”.',
    fix: (n: number) => (n === 1 ? 'Verifică un câmp:' : `Verifică ${n} câmpuri:`),
    buyer: 'Datele tale',
    buyerType: 'Cumperi ca',
    person: 'Persoană fizică',
    company: 'Firmă',
    name: 'Nume și prenume',
    phone: 'Telefon',
    phoneHint: 'Te sunăm pe acest număr.',
    email: 'E-mail',
    emailHint: 'Aici primești confirmarea.',
    cui: 'CUI',
    find: 'Caută la ANAF',
    finding: 'Se caută…',
    found: 'Am completat datele firmei. Verifică-le.',
    notFound: 'ANAF nu a găsit acest CUI. Completează datele manual.',
    invalid: 'Scrie un CUI valid.',
    unavailable: 'Serviciul ANAF nu răspunde acum. Completează datele manual.',
    companyName: 'Denumirea firmei',
    regCom: 'Nr. Reg. Com. (opțional)',
    billing: 'Sediul firmei',
    delivery: 'Livrare',
    deliveryType: 'Cum primești produsele',
    toAddress: 'Livrare la adresă',
    toAddressNote: 'Costul se confirmă la telefon.',
    pickup: 'Ridici de la o bază',
    pickupNote: 'Fără cost de livrare.',
    county: 'Județ',
    choose: 'Alege',
    address: 'Localitate, stradă, număr',
    base: 'Baza Agrinvest',
    certificate: 'Certificat profesional',
    certificateNote:
      'Ai în coș produse de uz profesional. Legea ne cere numărul certificatului tău.',
    certificateNumber: 'Număr certificat',
    certificateDate: 'Valabil până la',
    payment: 'Plată',
    paymentType: 'Cum plătești',
    callback: 'Te sunăm noi',
    callbackNote:
      'Un consultant confirmă stocul, prețul și livrarea. Plătești apoi prin transfer bancar, pe baza proformei.',
    card: 'Plată online cu cardul',
    cardNote: 'Plătești sigur, direct pe site.',
    soon: 'În curând',
    message: 'Adaugă un mesaj (opțional)',
    messageLabel: 'Mesaj',
    adult: 'Am cel puțin 18 ani.',
    consent: 'Sunt de acord să fiu contactat despre această comandă.',
    privacy: 'Cum folosim datele',
    terms: 'Accept',
    termsLink: 'termenii de vânzare',
    submit: 'Trimite comanda',
    sending: 'Se trimite…',
    noPay: 'Nu plătești nimic acum. Te sunăm înainte de orice plată.',
    summary: 'Comanda ta',
    edit: 'Modifică',
    subtotal: 'Produse',
    shipping: 'Livrare',
    shippingValue: 'se confirmă',
    total: 'Total estimat',
    totalNote: 'Fără livrare. TVA-ul, stocul și prețul final se confirmă la telefon.',
    next: 'Ce urmează',
    nextSteps: [
      'Te sunăm să confirmăm stocul, prețul și livrarea.',
      'Primești proforma pe e-mail.',
      'Plătești, apoi primești produsele.',
    ],
    empty: 'Coșul este gol.',
    emptyNote: 'Alege produsele din magazin, apoi revino aici.',
    toShop: 'Mergi la magazin',
    // Confirmation
    thanks: (first?: string) => (first ? `Mulțumim, ${first}!` : 'Mulțumim!'),
    doneTitle: 'Comanda a ajuns la noi. Te sunăm noi.',
    doneLead: (phone?: string) =>
      phone
        ? `Un consultant te sună la ${phone} ca să confirme stocul, prețul și livrarea.`
        : 'Un consultant te sună ca să confirme stocul, prețul și livrarea.',
    reference: 'Numărul comenzii',
    keep: 'Păstrează-l dacă ne suni despre comandă.',
    who: 'Cine te sună',
    whoGeneric: 'Echipa comercială Agrinvest',
    when: 'În timpul programului, cât mai curând.',
    doneSteps: [
      { title: 'Te sunăm', text: 'Confirmăm împreună produsele, prețul final și livrarea.' },
      {
        title: 'Primești proforma',
        text: (email?: string) => (email ? `Pe e-mail, la ${email}.` : 'Pe e-mail.'),
      },
      {
        title: 'Livrare sau ridicare',
        text: 'După plată, livrăm la adresă sau pregătim comanda la bază.',
      },
    ],
    ordered: 'Ce ai comandat',
    noPayYet: 'Nu ai plătit nimic încă.',
    backToShop: 'Înapoi la magazin',
    question: 'Ai o întrebare? Scrie-ne',
  },
  en: {
    title: 'Complete your order',
    steps: ['Cart', 'Details', 'Confirmation'],
    stepsLabel: 'Order steps',
    required: 'All fields are required unless marked “optional”.',
    fix: (n: number) => (n === 1 ? 'Please check one field:' : `Please check ${n} fields:`),
    buyer: 'Your details',
    buyerType: 'Buying as',
    person: 'Person',
    company: 'Company',
    name: 'Full name',
    phone: 'Phone',
    phoneHint: 'We will call you on this number.',
    email: 'Email',
    emailHint: 'Your confirmation goes here.',
    cui: 'Tax ID (CUI)',
    find: 'Look up at ANAF',
    finding: 'Searching…',
    found: 'We filled in the company details. Please check them.',
    notFound: 'ANAF did not find this tax ID. Please enter the details by hand.',
    invalid: 'Please enter a valid tax ID.',
    unavailable: 'The ANAF service is not answering. Please enter the details by hand.',
    companyName: 'Company name',
    regCom: 'Trade register no. (optional)',
    billing: 'Registered address',
    delivery: 'Delivery',
    deliveryType: 'How you receive the products',
    toAddress: 'Delivery to an address',
    toAddressNote: 'The cost is confirmed on the phone.',
    pickup: 'Pickup at a base',
    pickupNote: 'No delivery cost.',
    county: 'County',
    choose: 'Choose',
    address: 'Town, street, number',
    base: 'Agrinvest base',
    certificate: 'Professional certificate',
    certificateNote:
      'Your cart has products for professional use. The law requires your certificate number.',
    certificateNumber: 'Certificate number',
    certificateDate: 'Valid until',
    payment: 'Payment',
    paymentType: 'How you pay',
    callback: 'We call you back',
    callbackNote:
      'A consultant confirms stock, price and delivery. You then pay by bank transfer, against a proforma invoice.',
    card: 'Online card payment',
    cardNote: 'Pay securely, right on the site.',
    soon: 'Coming soon',
    message: 'Add a message (optional)',
    messageLabel: 'Message',
    adult: 'I am at least 18 years old.',
    consent: 'I agree to be contacted about this order.',
    privacy: 'How we use your data',
    terms: 'I accept the',
    termsLink: 'terms of sale',
    submit: 'Send order',
    sending: 'Sending…',
    noPay: 'You pay nothing now. We call you before any payment.',
    summary: 'Your order',
    edit: 'Edit',
    subtotal: 'Products',
    shipping: 'Delivery',
    shippingValue: 'to be confirmed',
    total: 'Estimated total',
    totalNote: 'Without delivery. VAT, stock and the final price are confirmed on the phone.',
    next: 'What happens next',
    nextSteps: [
      'We call you to confirm stock, price and delivery.',
      'You receive the proforma invoice by email.',
      'You pay, then you receive the products.',
    ],
    empty: 'Your cart is empty.',
    emptyNote: 'Pick your products in the shop, then come back here.',
    toShop: 'Go to the shop',
    thanks: (first?: string) => (first ? `Thank you, ${first}!` : 'Thank you!'),
    doneTitle: 'We have your order. We will call you back.',
    doneLead: (phone?: string) =>
      phone
        ? `A consultant will call you on ${phone} to confirm stock, price and delivery.`
        : 'A consultant will call you to confirm stock, price and delivery.',
    reference: 'Order number',
    keep: 'Keep it in case you call us about the order.',
    who: 'Who will call',
    whoGeneric: 'The Agrinvest sales team',
    when: 'During office hours, as soon as possible.',
    doneSteps: [
      {
        title: 'We call you',
        text: 'Together we confirm the products, the final price and delivery.',
      },
      {
        title: 'You get the proforma',
        text: (email?: string) => (email ? `By email, at ${email}.` : 'By email.'),
      },
      {
        title: 'Delivery or pickup',
        text: 'Once paid, we deliver to your address or prepare the order at the base.',
      },
    ],
    ordered: 'What you ordered',
    noPayYet: 'You have not paid anything yet.',
    backToShop: 'Back to the shop',
    question: 'A question? Write to us',
  },
}

type Copy = (typeof copy)[Locale]

/** Cart ✓ → Details → Confirmation. It shows where the buyer is; everything is one page. */
function Steps({ t, current }: { t: Copy; current: 1 | 2 }) {
  return (
    <ol aria-label={t.stepsLabel} className="flex items-center gap-2 text-small">
      {t.steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={step} className="flex items-center gap-2">
            {i > 0 && <span className="h-px w-6 bg-line-strong md:w-10" aria-hidden="true" />}
            <span
              aria-current={active ? 'step' : undefined}
              className={`flex items-center gap-2 ${active ? 'font-semibold text-ink' : 'text-muted'}`}
            >
              <span
                className={`grid size-6 place-items-center rounded-full text-caption font-semibold ${
                  done
                    ? 'bg-accent text-on-accent'
                    : active
                      ? 'bg-ink text-paper'
                      : 'bg-surface text-muted ring-1 ring-line-strong'
                }`}
                aria-hidden="true"
              >
                {done ? <CheckIcon className="size-3.5" /> : i + 1}
              </span>
              {step}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/** A numbered part of the form. */
function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-5 border-t border-line pt-8 first-of-type:border-t-0 first-of-type:pt-0">
      <h2 className="flex items-center gap-3 text-h4 font-semibold">
        <span
          className="grid size-7 place-items-center rounded-full bg-accent-soft text-small font-semibold text-accent"
          aria-hidden="true"
        >
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

/** A radio drawn as a tile: icon, title, note and the radio itself on the right. */
function Tile({
  name,
  value,
  checked,
  icon,
  title,
  note,
  badge,
  disabled,
}: {
  name: string
  value: string
  checked?: boolean
  icon: ReactNode
  title: string
  note?: string
  badge?: string
  disabled?: boolean
}) {
  return (
    <label className="group/tile flex cursor-pointer items-start gap-3 rounded-md border border-field-line bg-raised p-4 transition duration-150 ease-move hover:border-ink has-checked:border-accent has-checked:bg-accent-soft has-checked:ring-1 has-checked:ring-accent has-focus-visible:ring-4 has-focus-visible:ring-accent/15 has-disabled:cursor-not-allowed has-disabled:border-dashed has-disabled:bg-surface has-disabled:hover:border-field-line">
      <span
        className="grid size-10 shrink-0 place-items-center rounded-md bg-surface text-accent *:size-5 group-has-checked/tile:bg-raised group-has-disabled/tile:text-subtle"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="grid flex-1 gap-0.5">
        <span className="flex flex-wrap items-center gap-2 text-small font-semibold text-ink group-has-disabled/tile:text-muted">
          {title}
          {badge && <Badge tone="lime">{badge}</Badge>}
        </span>
        {note && <span className="text-caption text-muted">{note}</span>}
      </span>
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={checked}
        disabled={disabled}
        className="mt-0.5 size-5 shrink-0 accent-accent focus-visible:outline-none"
      />
    </label>
  )
}

/** Person / company as a pill switch made of radios, so it works without JavaScript. */
function Pills({
  name,
  legend,
  options,
  value,
}: {
  name: string
  legend: string
  options: { value: string; label: string }[]
  value: string
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-small font-medium text-ink">{legend}</legend>
      <div className="inline-flex w-fit gap-1 rounded-md bg-surface p-1">
        {options.map((o) => (
          <label
            key={o.value}
            className="relative flex h-10 cursor-pointer items-center rounded-sm px-4 text-small font-medium text-muted transition duration-150 ease-move hover:text-ink has-checked:bg-raised has-checked:text-ink has-checked:shadow-soft has-focus-visible:ring-2 has-focus-visible:ring-accent"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              defaultChecked={o.value === value}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function SummaryBody({
  t,
  lines,
  total,
  cartHref,
}: {
  t: Copy
  lines: CheckoutLine[]
  total: string
  cartHref?: string
}) {
  return (
    <div className="grid gap-5">
      <ul className="grid gap-4">
        {lines.map((l) => (
          <li key={l.sku} className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-surface text-small font-semibold text-ink tabular-nums">
              {l.quantity}×
            </span>
            <span className="grid flex-1 gap-0.5">
              <span className="text-small font-medium text-ink">{l.name}</span>
              {l.pack && <span className="text-caption text-muted">{l.pack}</span>}
            </span>
            <span className="text-small font-medium tabular-nums">{l.total}</span>
          </li>
        ))}
      </ul>
      <dl className="grid gap-2 border-t border-line pt-4 text-small">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{t.subtotal}</dt>
          <dd className="tabular-nums">{total}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{t.shipping}</dt>
          <dd className="text-muted">{t.shippingValue}</dd>
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-line pt-4">
          <dt className="font-semibold text-ink">{t.total}</dt>
          <dd className="text-h3 font-semibold text-ink tabular-nums">{total}</dd>
        </div>
      </dl>
      <p className="text-caption text-muted">{t.totalNote}</p>
      <div className="grid gap-3 rounded-md bg-surface p-4">
        <p className="text-small font-semibold text-ink">{t.next}</p>
        <ol className="grid gap-2">
          {t.nextSteps.map((s, i) => (
            <li key={s} className="flex gap-3 text-caption text-muted">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-raised font-semibold text-ink ring-1 ring-line">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>
      {cartHref && (
        <a href={cartHref} className="text-small font-medium text-accent">
          {t.edit}
        </a>
      )}
    </div>
  )
}

/** What the buyer sees once the order is in: "we will call you back", with the next steps. */
function Confirmation({
  t,
  state,
  shopHref,
  contactHref,
  focus,
}: {
  t: Copy
  state: CheckoutState
  shopHref: string
  contactHref?: string
  focus: React.RefObject<HTMLDivElement | null>
}) {
  const order = state.order
  const icons = [<PhoneIcon key="p" />, <DocumentIcon key="d" />, <TruckIcon key="t" />]
  return (
    <div
      ref={focus}
      tabIndex={-1}
      role="status"
      className="grid gap-8 focus:outline-none lg:grid-cols-12 lg:gap-12"
    >
      <div className="grid content-start gap-8 lg:col-span-7">
        <div className="grid gap-4">
          <span className="grid size-14 place-items-center rounded-full bg-accent text-on-accent">
            <CheckIcon className="size-7" aria-hidden="true" />
          </span>
          <p className="text-lead font-semibold text-accent">{t.thanks(order?.firstName)}</p>
          <h1 className="text-h2 font-semibold text-balance">{t.doneTitle}</h1>
          <p className="text-lead text-muted">{t.doneLead(order?.phone)}</p>
        </div>

        <div className="grid gap-4 rounded-lg bg-raised p-5 ring-1 ring-line md:grid-cols-2 md:p-6">
          {state.reference && (
            <div className="grid gap-1">
              <p className="text-caption text-muted">{t.reference}</p>
              <p
                className="text-h3 font-semibold tracking-wide text-ink tabular-nums"
                data-order-reference
              >
                {state.reference}
              </p>
              <p className="text-caption text-muted">{t.keep}</p>
            </div>
          )}
          <div className="grid content-start gap-1 md:border-l md:border-line md:pl-6">
            <p className="text-caption text-muted">{t.who}</p>
            <p className="flex items-center gap-2 text-body font-semibold text-ink">
              <PhoneIcon className="size-5 text-accent" aria-hidden="true" />
              {state.assignee
                ? [state.assignee.name, state.assignee.role].filter(Boolean).join(', ')
                : t.whoGeneric}
            </p>
            <p className="text-caption text-muted">{t.when}</p>
          </div>
        </div>

        <div className="grid gap-4">
          <h2 className="text-h4 font-semibold">{t.next}</h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {t.doneSteps.map((step, i) => (
              <li
                key={step.title}
                className="flex items-start gap-3 rounded-md bg-surface p-4 md:grid md:content-start md:gap-2"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-raised text-accent ring-1 ring-line *:size-5">
                  {icons[i]}
                </span>
                <span className="grid gap-1">
                  <span className="text-small font-semibold text-ink">
                    <span className="text-muted tabular-nums">{i + 1}. </span>
                    {step.title}
                  </span>
                  <span className="text-caption text-muted">
                    {typeof step.text === 'function' ? step.text(order?.email) : step.text}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button href={shopHref} icon={<ArrowRightIcon />}>
            {t.backToShop}
          </Button>
          {contactHref && (
            <a href={contactHref} className="text-small font-medium text-accent">
              {t.question}
            </a>
          )}
        </div>
      </div>

      {order && order.lines.length > 0 && (
        <aside className="grid content-start gap-4 self-start rounded-lg bg-raised p-5 shadow-soft ring-1 ring-line md:p-6 lg:col-span-5">
          <h2 className="text-h4 font-semibold">{t.ordered}</h2>
          <ul className="grid gap-3">
            {order.lines.map((l, i) => (
              <li key={i} className="flex items-start justify-between gap-4 text-small">
                <span>
                  <span className="font-medium text-ink tabular-nums">{l.quantity}× </span>
                  {l.name}
                  {l.pack && <span className="text-muted"> · {l.pack}</span>}
                </span>
                <span className="tabular-nums">{l.total}</span>
              </li>
            ))}
          </ul>
          <p className="flex items-baseline justify-between gap-4 border-t border-line pt-4">
            <span className="font-semibold">{t.total}</span>
            <span className="text-h4 font-semibold tabular-nums">{order.total}</span>
          </p>
          <p className="flex items-center gap-2 rounded-md bg-accent-soft px-3 py-2 text-caption font-medium text-accent">
            <CheckIcon className="size-4" aria-hidden="true" />
            {t.noPayYet}
          </p>
        </aside>
      )}
    </div>
  )
}

/**
 * Checkout on one page: the buyer, delivery, payment and a summary that stays in view. Works
 * without JavaScript: the server action does all the checking, and the company and address
 * fields hide with CSS alone. JavaScript adds the ANAF lookup and moves focus to errors.
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
  lines = [],
  total = '',
  crumbs,
  sourcePath,
  privacyHref,
  termsHref,
  shopHref,
  cartHref,
  contactHref,
  initialState = initialCheckoutState,
}: CheckoutFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState, sourcePath)
  const t = copy[locale]
  const status = useRef<HTMLDivElement>(null)
  const form = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.status === 'success') {
      status.current?.focus()
      window.scrollTo({ top: 0 })
      // Analytics (src/components/Analytics.tsx) records this as `order`, with consent.
      window.dispatchEvent(new CustomEvent('agrinvest:order'))
    } else if (state.status === 'error') {
      const first = form.current?.querySelector<HTMLElement>('[aria-invalid=true]')
      ;(first ?? status.current)?.focus()
    }
  }, [state])

  const error = (f: CheckoutField) => state.errors?.[f]
  const value = (f: CheckoutField) => state.values?.[f]
  const errors = Object.entries(state.errors ?? {}).filter(([, m]) => m) as [
    CheckoutField,
    string,
  ][]

  const shell = (body: ReactNode, step: 1 | 2 = 1) => (
    <div className="mx-auto grid max-w-page gap-8 px-4 pt-6 pb-16 md:px-8 md:pt-8">
      <div className="grid gap-4">
        {crumbs}
        {step === 1 && (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-h2 font-semibold">{t.title}</h1>
            <Steps t={t} current={1} />
          </div>
        )}
      </div>
      {body}
    </div>
  )

  if (state.status === 'success')
    return shell(
      <Confirmation
        t={t}
        state={state}
        shopHref={shopHref}
        contactHref={contactHref}
        focus={status}
      />,
      2,
    )

  if (empty)
    return shell(
      <div className="grid justify-items-start gap-4 rounded-lg bg-surface p-6 md:p-8">
        <p className="text-h4 font-semibold">{t.empty}</p>
        <p className="text-body text-muted">{t.emptyNote}</p>
        <Button href={shopHref} icon={<ArrowRightIcon />}>
          {t.toShop}
        </Button>
      </div>,
    )

  const summary = <SummaryBody t={t} lines={lines} total={total} cartHref={cartHref} />

  return shell(
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
      {/* Phones: the summary folds at the top. */}
      <details className="group/sum rounded-lg bg-raised ring-1 ring-line lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 [&::-webkit-details-marker]:hidden">
          <span className="text-small font-semibold">
            {t.summary} · <span className="tabular-nums">{total}</span>
          </span>
          <ChevronDownIcon
            className="size-5 text-muted transition group-open/sum:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="border-t border-line p-4">{summary}</div>
      </details>

      <form
        ref={form}
        key={state.attempt ?? 0}
        action={formAction}
        noValidate
        className="group grid gap-8 rounded-lg bg-raised p-5 shadow-soft ring-1 ring-line md:p-8 lg:col-span-7"
      >
        {(state.message || errors.length > 0) && (
          <div
            ref={status}
            tabIndex={-1}
            role="alert"
            className="grid gap-2 rounded-md bg-danger-soft px-4 py-3 text-small text-danger"
          >
            {state.message ? (
              <p>{state.message}</p>
            ) : (
              <>
                <p className="font-semibold">{t.fix(errors.length)}</p>
                <ul className="grid list-disc gap-1 pl-5">
                  {errors.map(([field, message]) => (
                    <li key={field}>
                      <button
                        type="button"
                        className="text-left underline underline-offset-2"
                        onClick={() =>
                          form.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus()
                        }
                      >
                        {message}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        <Section n={1} title={t.buyer}>
          <Pills
            name="buyerType"
            legend={t.buyerType}
            value={value('buyerType') === 'company' ? 'company' : 'person'}
            options={[
              { value: 'person', label: t.person },
              { value: 'company', label: t.company },
            ]}
          />
          <div
            data-company-fields
            className="grid gap-4 rounded-md bg-surface p-4 group-has-[input[name=buyerType][value=person]:checked]:hidden"
          >
            <CompanyLookupField
              lookup={lookup}
              labels={t}
              fill={{ name: 'company', address: 'billingAddress', regCom: 'regCom' }}
              defaultValue={value('cui')}
              error={error('cui')}
            />
            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
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
            </div>
            <TextField
              name="billingAddress"
              label={t.billing}
              defaultValue={value('billingAddress')}
              error={error('billingAddress')}
            />
          </div>
          <TextField
            name="name"
            label={t.name}
            autoComplete="name"
            defaultValue={value('name')}
            error={error('name')}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              name="phone"
              label={t.phone}
              hint={t.phoneHint}
              type="tel"
              autoComplete="tel"
              defaultValue={value('phone')}
              error={error('phone')}
            />
            <TextField
              name="email"
              label={t.email}
              hint={t.emailHint}
              type="email"
              autoComplete="email"
              defaultValue={value('email')}
              error={error('email')}
            />
          </div>
        </Section>

        <Section n={2} title={t.delivery}>
          <fieldset className="grid gap-3 md:grid-cols-2">
            <legend className="sr-only">{t.deliveryType}</legend>
            <Tile
              name="deliveryMethod"
              value="delivery"
              icon={<TruckIcon />}
              title={t.toAddress}
              note={t.toAddressNote}
              checked={value('deliveryMethod') !== 'pickup'}
            />
            <Tile
              name="deliveryMethod"
              value="pickup"
              icon={<PinIcon />}
              title={t.pickup}
              note={t.pickupNote}
              checked={value('deliveryMethod') === 'pickup'}
            />
          </fieldset>
          <div className="grid gap-4 md:grid-cols-[1fr_2fr] group-has-[input[name=deliveryMethod][value=pickup]:checked]:hidden">
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
        </Section>

        {needsCertificate && (
          <Section n={3} title={t.certificate}>
            <p className="-mt-2 text-small text-muted">{t.certificateNote}</p>
            <div className="grid gap-4 md:grid-cols-2">
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
          </Section>
        )}

        <Section n={needsCertificate ? 4 : 3} title={t.payment}>
          <fieldset className="grid gap-3">
            <legend className="sr-only">{t.paymentType}</legend>
            <Tile
              name="payment"
              value="consultant"
              icon={<PhoneIcon />}
              title={t.callback}
              note={t.callbackNote}
              checked
            />
            <Tile
              name="payment"
              value="card"
              icon={<CardIcon />}
              title={t.card}
              note={t.cardNote}
              badge={t.soon}
              disabled
            />
          </fieldset>

          <details className="group/msg" open={Boolean(value('message'))}>
            <summary className="flex w-fit cursor-pointer list-none items-center gap-1 text-small font-medium text-accent [&::-webkit-details-marker]:hidden">
              {t.message}
              <ChevronDownIcon
                className="size-4 transition group-open/msg:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <TextAreaField
              className="mt-3"
              name="message"
              label={t.messageLabel}
              rows={3}
              defaultValue={value('message')}
              error={error('message')}
            />
          </details>

          <div className="grid gap-3 rounded-md bg-surface p-4">
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
        </Section>

        {/* Honeypot: hidden from people, filled in by bots. */}
        <div aria-hidden="true" className="sr-only">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <input type="hidden" name="locale" value={locale} />

        <div className="grid gap-3">
          <Button type="submit" size="lg" fullWidth disabled={pending} icon={<ArrowRightIcon />}>
            {pending ? t.sending : total ? `${t.submit} · ${total}` : t.submit}
          </Button>
          <p className="flex items-center justify-center gap-2 text-center text-caption text-muted">
            <PhoneIcon className="size-4 shrink-0 text-accent" aria-hidden="true" />
            {t.noPay}
          </p>
          <p className="text-center text-caption text-subtle">{t.required}</p>
        </div>
      </form>

      {/* Larger screens: the summary stays in view beside the form. */}
      <aside
        aria-label={t.summary}
        className="hidden self-start rounded-lg bg-raised p-6 shadow-soft ring-1 ring-line lg:sticky lg:top-(--site-header-offset) lg:col-span-5 lg:grid lg:gap-5 xl:col-span-4 xl:col-start-9"
      >
        <h2 className="text-h4 font-semibold">{t.summary}</h2>
        {summary}
      </aside>
    </div>,
  )
}
