'use client'

import { useActionState, useEffect, useId, useState } from 'react'

import type { Locale } from '@/i18n/config'
import { initialQuickAddState, type QuickAddState } from '@/lib/commerce/state'
import { formatNumber, formatQuantity } from '@/lib/format'
import {
  clampDose,
  displayAmount,
  mixCost,
  packMix,
  parseDoseUnit,
  parseWaterVolume,
  totalNeeded,
  type PackOption,
} from '@/lib/shop/dose'

import { CartIcon, CheckIcon, PhoneIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { Button } from '../primitives/Button'

/** One use from the label's dose table: only parsed numbers drive the maths. */
export type CalcUse = {
  id: string
  /** `Grâu · BBCH 21–29`. */
  label: string
  /** The dose as printed: shown when the row has no numbers. */
  doseText: string
  min?: number | null
  max?: number | null
  /** `l/ha`, `kg/ha`, `%`, `l/t`… */
  unit?: string | null
  /** `200–300 l/ha`, as printed. */
  water?: string | null
}

export type CalcLabels = {
  title: string
  intro: string
  use: string
  dose: string
  doseRange: string
  doseFixed: string
  area: string
  seedAmount: string
  water: string
  ha: string
  t: string
  total: string
  mix: string
  leftover: string
  exact: string
  cost: string
  costNote: string
  waterTotal: string
  add: string
  adding: string
  added: string
  viewCart: string
  failed: string
  noNumbers: string
  consultant: string
  noPacks: string
  label: string
}

export type DoseCalculatorProps = {
  locale: Locale
  uses: CalcUse[]
  packs: PackOption[]
  /** Adds every pack of the mix (`addManyToCart`, the same checks as add to cart). */
  action: (state: QuickAddState, form: FormData) => Promise<QuickAddState>
  cartHref: string
  /** The quick request in the buy box (`#cerere`). */
  consultHref: string
  /** False when the product cannot be ordered online (OUG 53/2025 and the other blocks). */
  canOrder?: boolean
  labels: CalcLabels
  /** Story hooks. */
  initial?: { use?: string; dose?: number; area?: number; water?: number }
  initialState?: QuickAddState
}

const fill = (text: string, values: Record<string, string>) =>
  text.replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? '')

/** A step that fits the label's numbers: 0,01 under 1, 0,05 under 10, else 1. */
const stepFor = (max: number) => (max <= 1 ? 0.01 : max <= 10 ? 0.05 : 1)

const field =
  'h-12 w-full min-w-0 rounded-md border border-field-line bg-raised px-3 text-body text-ink tabular-nums hover:border-ink focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15 focus-visible:outline-none'

/**
 * Hectares × label dose → litres or kilograms → the packs to buy (least left over, then fewest
 * packs) and their cost, added to the cart in one go. The dose stays inside the label range.
 * A use without numbers shows the label text and sends the visitor to a consultant.
 */
export function DoseCalculator({
  locale,
  uses,
  packs,
  action,
  cartHref,
  consultHref,
  canOrder = true,
  labels,
  initial,
  initialState,
}: DoseCalculatorProps) {
  const id = useId()
  const [useKey, setUse] = useState(initial?.use ?? uses[0]?.id)
  const use = uses.find((u) => u.id === useKey) ?? uses[0]
  const unit = parseDoseUnit(use?.unit)
  const min = use?.min ?? use?.max
  const max = use?.max ?? use?.min
  const range = unit && min != null && max != null && min > 0 && max >= min ? { min, max } : null
  const waterRange = parseWaterVolume(use?.water)
  const [dose, setDose] = useState(initial?.dose ?? range?.min ?? 0)
  const [area, setArea] = useState(initial?.area ?? 10)
  const [water, setWater] = useState(initial?.water ?? waterRange?.min ?? 0)
  const [state, formAction, pending] = useActionState(
    action,
    initialState ?? initialQuickAddState,
    cartHref,
  )

  useEffect(() => {
    if (state.status === 'added') window.dispatchEvent(new Event('agrinvest:cart'))
  }, [state])

  const pick = (next: string) => {
    setUse(next)
    const u = uses.find((x) => x.id === next)
    const lo = u?.min ?? u?.max
    // A new use starts at its label minimum, as the first one did.
    if (lo != null) setDose(lo)
    const w = parseWaterVolume(u?.water)
    if (w) setWater(w.min)
  }

  const result = (() => {
    if (!unit || !range) return null
    const need = totalNeeded({
      dose: clampDose(dose, range),
      unit,
      amount: area,
      waterVolume: water,
    })
    if (need == null) return null
    const mix = packMix(need, unit.dimension, packs)
    return {
      need: displayAmount(need, unit.dimension),
      mix,
      leftover: mix ? displayAmount(mix.waste, unit.dimension) : null,
      cost: mix ? mixCost(mix, packs) : null,
    }
  })()

  const perTonne = unit?.basis === 't'
  const percent = unit?.basis === 'percent'
  const amountUnit = perTonne ? labels.t : labels.ha
  const qty = (value: number, u: string) => formatQuantity(value, u, locale)
  const sprayWater =
    waterRange && !perTonne && area > 0
      ? percent
        ? qty(water * area, 'l')
        : waterRange.min === waterRange.max
          ? qty(waterRange.min * area, 'l')
          : `${formatNumber(waterRange.min * area, locale)}–${qty(waterRange.max * area, 'l')}`
      : null

  return (
    <div
      role="group"
      aria-labelledby={`${id}-title`}
      className="grid gap-5 rounded-lg bg-raised p-5 shadow-soft ring-1 ring-line md:p-6"
    >
      <header className="grid gap-1">
        <h3 id={`${id}-title`} className="text-h4 font-semibold">
          {labels.title}
        </h3>
        <p className="text-small text-muted">{labels.intro}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {uses.length > 1 && (
          <div className="grid gap-1.5 md:col-span-2">
            <label htmlFor={`${id}-use`} className="text-small font-semibold">
              {labels.use}
            </label>
            <select
              id={`${id}-use`}
              value={use?.id}
              onChange={(e) => pick(e.target.value)}
              className={cx(field, 'pr-10')}
            >
              {uses.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {range && unit ? (
          <>
            <div className="grid content-start gap-1.5">
              <label htmlFor={`${id}-dose`} className="text-small font-semibold">
                {labels.dose}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={`${id}-dose`}
                  type="number"
                  inputMode="decimal"
                  min={range.min}
                  max={range.max}
                  step={stepFor(range.max)}
                  value={dose}
                  readOnly={range.min === range.max}
                  onChange={(e) => setDose(Number(e.target.value))}
                  onBlur={() => setDose(clampDose(dose, range))}
                  aria-describedby={`${id}-range`}
                  className={field}
                />
                <span className="shrink-0 text-small text-muted">{use?.unit}</span>
              </div>
              {range.min !== range.max && (
                <input
                  type="range"
                  aria-label={labels.dose}
                  min={range.min}
                  max={range.max}
                  step={stepFor(range.max)}
                  value={clampDose(dose, range)}
                  onChange={(e) => setDose(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              )}
              <p id={`${id}-range`} className="text-caption text-muted">
                {fill(range.min === range.max ? labels.doseFixed : labels.doseRange, {
                  min: formatNumber(range.min, locale),
                  max: formatNumber(range.max, locale),
                  unit: use?.unit ?? '',
                })}
              </p>
            </div>

            <div className="grid content-start gap-4">
              <div className="grid gap-1.5">
                <label htmlFor={`${id}-area`} className="text-small font-semibold">
                  {perTonne ? labels.seedAmount : labels.area}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={`${id}-area`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={perTonne ? 0.1 : 1}
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className={field}
                  />
                  <span className="w-6 shrink-0 text-small text-muted">{amountUnit}</span>
                </div>
              </div>
              {percent && waterRange && (
                <div className="grid gap-1.5">
                  <label htmlFor={`${id}-water`} className="text-small font-semibold">
                    {labels.water}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id={`${id}-water`}
                      type="number"
                      inputMode="numeric"
                      min={waterRange.min}
                      max={waterRange.max}
                      step={10}
                      value={water}
                      onChange={(e) => setWater(Number(e.target.value))}
                      onBlur={() => setWater(clampDose(water, waterRange))}
                      className={field}
                    />
                    <span className="shrink-0 text-small text-muted">l/ha</span>
                  </div>
                  <p className="text-caption text-muted">{use?.water}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="grid gap-3 rounded-md bg-surface p-4 md:col-span-2">
            <p className="text-small text-muted">
              {labels.noNumbers} <strong className="font-semibold text-ink">{use?.doseText}</strong>
            </p>
            <a
              href={consultHref}
              className="inline-flex h-10 items-center gap-2 justify-self-start rounded-md bg-raised px-4 text-small font-semibold text-ink no-underline shadow-soft ring-1 ring-line-strong ring-inset hover:bg-surface"
            >
              <PhoneIcon className="size-5" aria-hidden="true" />
              {labels.consultant}
            </a>
          </div>
        )}
      </div>

      {result && (
        <div className="grid gap-4 rounded-md bg-accent-soft p-4 md:p-5" aria-live="polite">
          <dl className="grid gap-4 md:grid-cols-3">
            <div className="grid content-start gap-0.5">
              <dt className="text-caption text-muted">{labels.total}</dt>
              <dd className="text-h3 font-semibold text-forest tabular-nums">
                {qty(result.need.value, result.need.unit)}
              </dd>
              {sprayWater && (
                <dd className="text-caption text-muted">
                  {labels.waterTotal}: {sprayWater}
                </dd>
              )}
            </div>
            <div className="grid content-start gap-0.5">
              <dt className="text-caption text-muted">{labels.mix}</dt>
              {result.mix ? (
                <>
                  <dd className="text-body font-semibold text-ink tabular-nums">
                    {result.mix.packs.map((p) => `${p.count} × ${qty(p.size, p.unit)}`).join(' + ')}
                  </dd>
                  <dd className="text-caption text-muted tabular-nums">
                    {result.leftover && result.leftover.value > 0
                      ? fill(labels.leftover, {
                          amount: qty(result.leftover.value, result.leftover.unit),
                        })
                      : labels.exact}
                  </dd>
                </>
              ) : (
                <dd className="text-small text-muted">{labels.noPacks}</dd>
              )}
            </div>
            {result.cost != null && (
              <div className="grid content-start gap-0.5">
                <dt className="text-caption text-muted">{labels.cost}</dt>
                <dd className="text-h3 font-semibold text-ink tabular-nums">
                  {qty(result.cost, 'lei')}
                </dd>
                <dd className="text-caption text-muted">{labels.costNote}</dd>
              </div>
            )}
          </dl>
          {result.mix && canOrder && (
            <form action={formAction} className="grid gap-2 md:flex md:items-center md:gap-4">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="hectares" value={perTonne ? '' : area} />
              {result.mix.packs.map((p) => (
                <span key={p.sku} hidden>
                  <input type="hidden" name="sku" value={p.sku} />
                  <input type="hidden" name="quantity" value={p.count} />
                </span>
              ))}
              <Button
                type="submit"
                disabled={pending}
                leadingIcon={state.status === 'added' ? <CheckIcon /> : <CartIcon />}
              >
                {pending ? labels.adding : state.status === 'added' ? labels.added : labels.add}
              </Button>
              <p role="status" className="text-small empty:hidden">
                {state.status === 'added' && (
                  <a href={cartHref} className="font-semibold text-accent">
                    {labels.viewCart}
                  </a>
                )}
                {state.status === 'error' && <span className="text-danger">{labels.failed}</span>}
              </p>
            </form>
          )}
        </div>
      )}

      <p className="flex items-start gap-2 text-caption font-medium text-ink">
        <span className="font-bold text-warning" aria-hidden="true">
          !
        </span>
        {labels.label}
      </p>
    </div>
  )
}
