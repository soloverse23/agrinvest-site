'use client'

import Link from 'next/link'
import { useActionState, useEffect } from 'react'

import type { Locale } from '@/i18n/config'
import { initialQuickAddState, type QuickAddState } from '@/lib/commerce/state'

import { CartIcon, CheckIcon } from '../icons/icons'
import { Button } from '../primitives/Button'

export type QuickAddProps = {
  locale: Locale
  sku: string
  action: (state: QuickAddState, form: FormData) => Promise<QuickAddState>
  /** The cart page: where the form goes without JavaScript, and the "view cart" link. */
  cartHref: string
  labels: { add: string; adding: string; added: string; viewCart: string; failed: string }
  initialState?: QuickAddState
}

/**
 * Add one pack to the cart from a card. The visitor stays on the listing; the header count
 * updates through the `agrinvest:cart` event. Without JavaScript it posts and opens the cart.
 */
export function QuickAdd({ locale, sku, action, cartHref, labels, initialState }: QuickAddProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialState ?? initialQuickAddState,
    cartHref,
  )

  useEffect(() => {
    if (state.status === 'added') window.dispatchEvent(new Event('agrinvest:cart'))
  }, [state])

  return (
    <form action={formAction} className="grid gap-1.5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="sku" value={sku} />
      <input type="hidden" name="quantity" value="1" />
      <Button
        type="submit"
        size="sm"
        fullWidth
        disabled={pending}
        className="px-3! leading-tight whitespace-normal!"
      >
        {state.status === 'added' ? (
          <CheckIcon className="mr-1.5 hidden size-5 align-[-0.3em] md:inline" aria-hidden="true" />
        ) : (
          <CartIcon className="mr-1.5 hidden size-5 align-[-0.3em] md:inline" aria-hidden="true" />
        )}
        {pending ? labels.adding : state.status === 'added' ? labels.added : labels.add}
      </Button>
      <p role="status" className="min-h-0 text-center text-caption empty:hidden">
        {state.status === 'added' && (
          <Link href={cartHref} className="font-medium text-accent">
            {labels.viewCart}
          </Link>
        )}
        {state.status === 'error' && <span className="text-danger">{labels.failed}</span>}
      </p>
    </form>
  )
}
