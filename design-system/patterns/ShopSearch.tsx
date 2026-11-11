'use client'

import { useRouter } from 'next/navigation'
import { useId, useMemo, useRef, useState, type ReactNode } from 'react'

import { cx } from '../lib/cx'

/**
 * The suggestion index, kept small (≤ 10 KB) because it is fetched on the first focus.
 * `p`: products as [name, path, brand, ingredient or nutrient line].
 * `t`: other terms as [kind, label, slug, product count]; i = active ingredient, c = crop,
 * b = brand, k = category.
 */
export type ShopSearchIndex = {
  /** Path prefix of each href below: products (p), categories (k), crops (c), brands (b), ingredients (i). */
  h: Record<'p' | 'k' | 'c' | 'b' | 'i', string>
  p: [string, string, string, string][]
  t: ['i' | 'c' | 'b' | 'k', string, string, number][]
}

type Suggestion = { href: string; label: string; meta: string; kind: string }

export type ShopSearchProps = {
  /** The search results page; the form submits `q` there, with or without JavaScript. */
  action: string
  /** Where the index is fetched from on the first focus. */
  indexUrl: string
  labels: {
    label: string
    placeholder: string
    submit: string
    /** "Caută „{q}” în tot magazinul"; `{q}` is replaced by the query. */
    searchAll: string
    /** One per term kind, shown next to the suggestion. */
    kinds: { p: string; i: string; c: string; b: string; k: string }
    /** "1 produs" / "{n} produse"; `de` is the Romanian "de" from 20 products up. */
    products: { one: string; many: string; de?: string }
  }
  /** Decorative magnifier, passed from the server so the icon stays out of this chunk. */
  icon?: ReactNode
  defaultQuery?: string
  /** Stories only: a preloaded index and an open list. */
  index?: ShopSearchIndex
  defaultOpen?: boolean
  tone?: 'forest' | 'paper'
}

/** Lower case without diacritics, so "rapita" finds "Rapiță". */
const fold = (s: string) => s.toLocaleLowerCase('ro').normalize('NFD').replace(/[̀-ͯ]/g, '')

/** A term matches when every word of the query starts a word of the text. */
function matches(text: string, words: string[]) {
  const parts = fold(text).split(/[^a-z0-9]+/)
  return words.every((w) => parts.some((p) => p.startsWith(w)))
}

function countLabel(n: number, l: ShopSearchProps['labels']['products']) {
  if (n === 1) return l.one
  const de = l.de && (n % 100 >= 20 || (n >= 100 && n % 100 === 0)) ? `${l.de} ` : ''
  return `${n} ${de}${l.many}`
}

function suggest(index: ShopSearchIndex, query: string, labels: ShopSearchProps['labels']) {
  const words = fold(query)
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
  if (!words.length) return []
  const terms: Suggestion[] = index.t
    .filter(([, label]) => matches(label, words))
    .slice(0, 4)
    .map(([kind, label, slug, count]) => ({
      href: `${index.h[kind]}${slug}`,
      label,
      kind: labels.kinds[kind],
      meta: countLabel(count, labels.products),
    }))
  const products: Suggestion[] = index.p
    .filter(([name, , brand, line]) => matches(`${name} ${brand} ${line}`, words))
    .slice(0, 6 - Math.min(terms.length, 2))
    .map(([name, path, brand, line]) => ({
      href: `${index.h.p}${path}`,
      label: name,
      kind: labels.kinds.p,
      meta: [brand, line].filter(Boolean).join(' · '),
    }))
  return [...products, ...terms].slice(0, 8)
}

/**
 * The shop's search with live suggestions (Phase 7c). A plain GET form to the results page,
 * so it works without JavaScript; with it, the index loads on the first focus and suggests
 * products, active ingredients, crops, brands and categories as you type (ARIA combobox).
 */
export function ShopSearch({
  action,
  indexUrl,
  labels,
  icon,
  defaultQuery = '',
  index: preloaded,
  defaultOpen = false,
  tone = 'forest',
}: ShopSearchProps) {
  const router = useRouter()
  const id = useId()
  const listId = `${id}-list`
  const [query, setQuery] = useState(defaultQuery)
  const [index, setIndex] = useState<ShopSearchIndex | null>(preloaded ?? null)
  const [open, setOpen] = useState(defaultOpen)
  const [active, setActive] = useState(-1)
  const loading = useRef(false)

  const items = useMemo(() => (index ? suggest(index, query, labels) : []), [index, query, labels])
  const expanded = open && query.trim().length > 0 && items.length > 0

  function load() {
    if (index || loading.current) return
    loading.current = true
    fetch(indexUrl)
      .then((r) => (r.ok ? (r.json() as Promise<ShopSearchIndex>) : null))
      .then((data) => data && setIndex(data))
      .catch(() => {})
      .finally(() => {
        loading.current = false
      })
  }

  function go(href: string) {
    setOpen(false)
    router.push(href)
  }

  return (
    <form
      action={action}
      role="search"
      className="relative w-full"
      onSubmit={(e) => {
        if (expanded && active >= 0) {
          e.preventDefault()
          go(items[active].href)
        }
      }}
    >
      <label htmlFor={`${id}-q`} className="sr-only">
        {labels.label}
      </label>
      <div
        className={cx(
          'flex items-center gap-2 rounded-lg bg-raised p-1.5 pl-4 shadow-floating',
          tone === 'paper' && 'ring-1 ring-field-line',
        )}
      >
        {icon && <span className="shrink-0 text-subtle">{icon}</span>}
        <input
          id={`${id}-q`}
          name="q"
          type="search"
          role="combobox"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={expanded && active >= 0 ? `${id}-o${active}` : undefined}
          autoComplete="off"
          enterKeyHint="search"
          value={query}
          placeholder={labels.placeholder}
          onFocus={() => {
            load()
            setOpen(true)
          }}
          onBlur={() => setOpen(false)}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(-1)
            setOpen(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false)
            if (!items.length) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
              setActive((a) => (a + 1) % items.length)
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => (a <= 0 ? items.length - 1 : a - 1))
            }
          }}
          className="h-12 min-w-0 flex-1 bg-transparent text-lead text-ink placeholder:text-subtle focus:outline-none md:h-14"
        />
        <button
          type="submit"
          className={cx(
            'h-12 shrink-0 rounded-md px-5 font-semibold transition duration-150 ease-move md:h-14 md:px-7 md:text-lead',
            tone === 'forest'
              ? 'bg-lime text-forest hover:bg-lime-hover'
              : 'bg-accent text-on-accent hover:bg-accent-hover',
          )}
        >
          {labels.submit}
        </button>
      </div>
      <ul
        id={listId}
        role="listbox"
        aria-label={labels.label}
        hidden={!expanded}
        className="absolute inset-x-0 top-full z-30 mt-2 grid max-h-[26rem] overflow-y-auto rounded-lg bg-raised p-1.5 text-ink shadow-floating ring-1 ring-line"
      >
        {items.map((s, i) => (
          <li
            key={s.href}
            id={`${id}-o${i}`}
            role="option"
            aria-selected={i === active}
            onMouseDown={(e) => {
              e.preventDefault()
              go(s.href)
            }}
            onMouseEnter={() => setActive(i)}
            className={cx(
              'flex cursor-pointer items-baseline justify-between gap-4 rounded-md px-3 py-2.5',
              i === active && 'bg-surface',
            )}
          >
            <span className="grid min-w-0 gap-0.5">
              <span className="truncate font-medium">{s.label}</span>
              <span className="truncate text-caption text-muted">{s.meta}</span>
            </span>
            <span className="shrink-0 text-caption text-subtle">{s.kind}</span>
          </li>
        ))}
        <li
          role="option"
          aria-selected={false}
          onMouseDown={(e) => {
            e.preventDefault()
            go(`${action}?q=${encodeURIComponent(query.trim())}`)
          }}
          className="mt-1 cursor-pointer rounded-md border-t border-line px-3 py-2.5 text-small font-medium text-accent hover:bg-surface"
        >
          {labels.searchAll.replace('{q}', query.trim())}
        </li>
      </ul>
    </form>
  )
}
