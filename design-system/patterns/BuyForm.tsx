'use client'

import Link from 'next/link'
import { useActionState, useEffect, useId, useRef, useState, type ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { initialQuickAddState, type QuickAddState } from '@/lib/commerce/state'
import { formatQuantity } from '@/lib/format'

import { CartIcon, CheckIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { Button } from '../primitives/Button'

export type BuyPack = {
  sku: string
  /** `5 kg`, `20 l`. */
  label: string
  price: number | null
  /** Already formatted: `172,4 lei/kg`. */
  unitPrice?: string
  stock: 'in-stock' | 'on-request' | 'out-of-stock'
}

export type BuyFormLabels = {
  packs: string
  quantity: string
  decrease: string
  increase: string
  lineTotal: string
  add: string
  adding: string
  added: string
  viewCart: string
  failed: string
  unavailable: string
  onRequest: string
  /** The stock words for the chips. */
  inStock: string
  stockOnRequest: string
}

export type BuyFormProps = {
  locale: Locale
  name: string
  packs: BuyPack[]
  action: (state: QuickAddState, form: FormData) => Promise<QuickAddState>
  /** The cart: where the form goes without JavaScript, and the "view cart" link. */
  cartHref: string
  labels: BuyFormLabels
  /** The "to confirm" marker after each price, rendered on the server (`PriceMark`). */
  priceMark?: ReactNode
  /** Story hooks: the phone bar shown at once, a state after adding. */
  barVisible?: boolean
  initialState?: QuickAddState
}

const buyable = (p: BuyPack) => p.stock !== 'out-of-stock' && p.price != null

/** The quantity limit per line (`MAX_QUANTITY` in pricing). */
const MAX = 999

/**
 * The buy box's form: pack chips (radios, so the choice works without JavaScript), a quantity
 * stepper, the line total and "Adaugă în coș". With JavaScript the visitor stays on the page
 * and the header count updates; without it the form posts and opens the cart. On phones and
 * tablets a bar with the total and the button slides in once the form scrolls out of view.
 */
export function BuyForm({
  locale,
  name,
  packs,
  action,
  cartHref,
  labels,
  priceMark,
  barVisible,
  initialState,
}: BuyFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialState ?? initialQuickAddState,
    cartHref,
  )
  const first = packs.find(buyable)
  const [sku, setSku] = useState(first?.sku)
  const [quantity, setQuantity] = useState(1)
  const [bar, setBar] = useState(Boolean(barVisible))
  const form = useRef<HTMLFormElement>(null)
  const id = useId()

  useEffect(() => {
    if (state.status === 'added') window.dispatchEvent(new Event('agrinvest:cart'))
  }, [state])

  useEffect(() => {
    if (barVisible) return
    // Shown once the whole form is above the screen. A scroll check, not an
    // IntersectionObserver: a jump past the form (Home, an anchor) crosses no threshold, so an
    // observer would leave the bar in its old state.
    let frame = 0
    const check = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const bottom = form.current?.getBoundingClientRect().bottom
        setBar(bottom != null && bottom < 0)
      })
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => {
      window.removeEventListener('scroll', check)
      cancelAnimationFrame(frame)
    }
  }, [barVisible])

  const pack = packs.find((p) => p.sku === sku)
  const total = pack?.price != null ? pack.price * quantity : null
  const set = (n: number) => setQuantity(Math.min(MAX, Math.max(1, Math.round(n) || 1)))
  const button = pending ? labels.adding : state.status === 'added' ? labels.added : labels.add
  const mark = priceMark

  return (
    <form ref={form} action={formAction} className="grid gap-5">
      <input type="hidden" name="locale" value={locale} />
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-small font-semibold text-ink">{labels.packs}</legend>
        <div className="grid grid-cols-2 gap-2">
          {packs.map((p) => {
            const off = !buyable(p)
            return (
              <label
                key={p.sku}
                className={cx(
                  'relative grid cursor-pointer gap-0.5 rounded-md bg-raised p-3 ring-1 ring-line-strong transition duration-150 ease-move ring-inset',
                  'hover:ring-ink has-checked:bg-accent-soft has-checked:ring-2 has-checked:ring-accent has-focus-visible:ring-4 has-focus-visible:ring-accent/30',
                  off && 'cursor-not-allowed bg-surface opacity-70 hover:ring-line-strong',
                )}
              >
                <input
                  type="radio"
                  name="sku"
                  value={p.sku}
                  disabled={off}
                  defaultChecked={p.sku === first?.sku}
                  onChange={() => setSku(p.sku)}
                  className="sr-only"
                />
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-ink tabular-nums">{p.label}</span>
                  {p.sku === sku && (
                    <CheckIcon className="size-4 shrink-0 text-accent" aria-hidden="true" />
                  )}
                </span>
                <span className="text-body font-semibold text-ink tabular-nums">
                  {p.price != null ? (
                    <>
                      {formatQuantity(p.price, 'lei', locale)}
                      {mark}
                    </>
                  ) : (
                    <span className="text-small">{labels.onRequest}</span>
                  )}
                </span>
                <span className="text-caption text-muted tabular-nums">
                  {p.stock === 'out-of-stock'
                    ? labels.unavailable
                    : p.stock === 'on-request'
                      ? labels.stockOnRequest
                      : (p.unitPrice ?? labels.inStock)}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <label htmlFor={`${id}-qty`} className="text-small font-semibold text-ink">
            {labels.quantity}
          </label>
          <div className="flex h-12 items-stretch rounded-md bg-raised ring-1 ring-field-line ring-inset">
            <button
              type="button"
              onClick={() => set(quantity - 1)}
              disabled={quantity <= 1}
              aria-label={labels.decrease}
              className="grid w-11 place-items-center rounded-l-md text-h4 text-ink hover:bg-surface disabled:text-subtle"
            >
              −
            </button>
            <input
              id={`${id}-qty`}
              name="quantity"
              type="number"
              min={1}
              max={MAX}
              inputMode="numeric"
              value={quantity}
              onChange={(e) => set(Number(e.target.value))}
              className="w-14 bg-transparent text-center text-body font-semibold text-ink tabular-nums focus-visible:outline-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => set(quantity + 1)}
              disabled={quantity >= MAX}
              aria-label={labels.increase}
              className="grid w-11 place-items-center rounded-r-md text-h4 text-ink hover:bg-surface disabled:text-subtle"
            >
              +
            </button>
          </div>
        </div>
        {total != null && (
          <p className="ml-auto grid justify-items-end pb-1" aria-live="polite">
            <span className="text-caption text-muted">{labels.lineTotal}</span>
            <span className="text-h3 font-semibold text-ink tabular-nums">
              {formatQuantity(total, 'lei', locale)}
            </span>
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Button
          type="submit"
          size="lg"
          fullWidth
          disabled={pending || !pack}
          leadingIcon={state.status === 'added' ? <CheckIcon /> : <CartIcon />}
        >
          {button}
        </Button>
        <p role="status" className="text-center text-small empty:hidden">
          {state.status === 'added' && (
            <Link href={cartHref} className="font-semibold text-accent">
              {labels.viewCart}
            </Link>
          )}
          {state.status === 'error' && <span className="text-danger">{labels.failed}</span>}
        </p>
      </div>

      {/* Phones and tablets: the same form's button, kept in reach while reading. */}
      <div
        aria-hidden={bar ? undefined : true}
        className={cx(
          'fixed inset-x-0 bottom-0 z-30 border-t border-line bg-raised/95 px-4 py-3 shadow-floating backdrop-blur transition-[transform,visibility] duration-200 ease-move lg:hidden',
          bar ? 'visible translate-y-0' : 'pointer-events-none invisible translate-y-full',
        )}
      >
        <div className="mx-auto flex max-w-page items-center gap-3">
          <p className="grid min-w-0 flex-1">
            <span className="truncate text-caption text-muted">
              {name}
              {pack && ` · ${pack.label}${quantity > 1 ? ` × ${quantity}` : ''}`}
            </span>
            <span className="text-h4 font-semibold text-ink tabular-nums">
              {total != null ? formatQuantity(total, 'lei', locale) : labels.onRequest}
            </span>
          </p>
          <Button
            type="submit"
            disabled={pending || !pack}
            tabIndex={bar ? undefined : -1}
            leadingIcon={state.status === 'added' ? <CheckIcon /> : <CartIcon />}
            className="shrink-0"
          >
            {button}
          </Button>
        </div>
      </div>
    </form>
  )
}
