import Link from 'next/link'
import type { ReactNode } from 'react'

import { ArrowRightIcon, CartIcon } from '../icons/icons'
import { Badge } from '../primitives/Badge'
import { Button } from '../primitives/Button'

/**
 * Add to cart, cart lines and the order summary. Plain forms and links: everything works
 * without JavaScript, and the server recalculates every price.
 */
type FormAction = (form: FormData) => void | Promise<void>

export function AddToCartForm({
  action,
  sku,
  locale,
  labels,
}: {
  action: FormAction
  sku: string
  locale: string
  labels: { add: string; quantity: string }
}) {
  return (
    <form action={action} className="mt-3 flex items-center gap-2">
      <input type="hidden" name="sku" value={sku} />
      <input type="hidden" name="locale" value={locale} />
      <label className="sr-only" htmlFor={`qty-${sku}`}>
        {labels.quantity}
      </label>
      <input
        id={`qty-${sku}`}
        name="quantity"
        type="number"
        min={1}
        max={999}
        defaultValue={1}
        inputMode="numeric"
        className="h-10 w-16 rounded-md border border-field-line bg-raised px-2 text-center text-small tabular-nums focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15 focus-visible:outline-none"
      />
      <Button type="submit" size="sm" leadingIcon={<CartIcon />}>
        {labels.add}
      </Button>
    </form>
  )
}

/** Why a product cannot be ordered, with the way forward. */
export function OrderNotice({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div role="note" className="grid gap-1 rounded-md bg-warning-soft px-4 py-3 text-small">
      <p className="font-semibold text-ink">{title}</p>
      {children && <p className="text-muted">{children}</p>}
    </div>
  )
}

export type CartRow = {
  sku: string
  name: string
  href?: string
  pack?: string | null
  unitPrice: ReactNode
  lineTotal: ReactNode
  quantity: number
  problem?: string | null
}

export function CartTable({
  rows,
  action,
  locale,
  labels,
}: {
  rows: CartRow[]
  action: FormAction
  locale: string
  labels: { quantity: string; update: string; remove: string; each: string }
}) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-lg bg-raised shadow-soft ring-1 ring-line">
      {rows.map((row) => (
        <li key={row.sku} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center md:p-5">
          <div className="grid gap-1">
            {row.href ? (
              <Link href={row.href} className="font-semibold text-ink">
                {row.name}
              </Link>
            ) : (
              <span className="font-semibold text-ink">{row.name}</span>
            )}
            <p className="text-caption text-muted">
              {row.pack && <>{row.pack} · </>}
              {row.unitPrice} {labels.each}
            </p>
            {row.problem && (
              <p>
                <Badge tone="warning" dot>
                  {row.problem}
                </Badge>
              </p>
            )}
          </div>
          <form action={action} className="flex flex-wrap items-center gap-2 md:justify-end">
            <input type="hidden" name="sku" value={row.sku} />
            <input type="hidden" name="locale" value={locale} />
            <label className="sr-only" htmlFor={`line-${row.sku}`}>
              {labels.quantity}
            </label>
            <input
              id={`line-${row.sku}`}
              name="quantity"
              type="number"
              min={1}
              max={999}
              defaultValue={row.quantity}
              inputMode="numeric"
              className="h-10 w-16 rounded-md border border-field-line bg-raised px-2 text-center text-small tabular-nums focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15 focus-visible:outline-none"
            />
            <Button type="submit" size="sm" variant="secondary">
              {labels.update}
            </Button>
            <Button type="submit" name="remove" value="1" size="sm" variant="ghost">
              {labels.remove}
            </Button>
            <span className="min-w-24 text-right font-semibold tabular-nums">{row.lineTotal}</span>
          </form>
        </li>
      ))}
    </ul>
  )
}

export function OrderSummary({
  title,
  rows,
  total,
  note,
  action,
}: {
  title: string
  rows?: { label: string; value: ReactNode }[]
  total: { label: string; value: ReactNode }
  note?: string
  action?: { href: string; label: string }
}) {
  return (
    <aside className="grid content-start gap-4 rounded-lg bg-raised p-5 shadow-soft ring-1 ring-line">
      <h2 className="text-h4 font-semibold">{title}</h2>
      {rows && rows.length > 0 && (
        <dl className="grid gap-2 text-small">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-4">
              <dt className="text-muted">{row.label}</dt>
              <dd className="text-right tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="flex items-baseline justify-between gap-4 border-t border-line pt-4">
        <span className="font-semibold">{total.label}</span>
        <span className="text-h4 font-semibold tabular-nums">{total.value}</span>
      </p>
      {note && <p className="text-caption text-muted">{note}</p>}
      {action && (
        <Button href={action.href} fullWidth icon={<ArrowRightIcon />}>
          {action.label}
        </Button>
      )}
    </aside>
  )
}
