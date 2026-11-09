'use client'

import { useRef, useState, useTransition } from 'react'

import type { CompanyLookup } from '@/lib/commerce/state'

import { Button } from '../primitives/Button'
import { TextField } from '../primitives/Field'

export type CompanyLookupLabels = {
  cui: string
  find: string
  finding: string
  found: string
  notFound: string
  invalid: string
  unavailable: string
}

/**
 * A tax ID (CUI) field with "Fill in from ANAF". On a match it writes the company data into the
 * named inputs of the same form; on any failure the farmer types them by hand. Without
 * JavaScript the button does nothing and the fields stay open. Shared by checkout and the
 * credit application, so both load one chunk.
 */
export function CompanyLookupField({
  lookup,
  labels,
  fill,
  defaultValue,
  error,
}: {
  lookup: (cui: string) => Promise<CompanyLookup>
  labels: CompanyLookupLabels
  /** Input names to fill: the company name, and optionally the address and trade register no. */
  fill: { name: string; address?: string; regCom?: string }
  defaultValue?: string
  error?: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const [note, setNote] = useState<string>()
  const [finding, startLookup] = useTransition()

  const run = () => {
    const inputs = box.current?.closest('form')?.elements
    const get = (name?: string) =>
      name ? (inputs?.namedItem(name) as HTMLInputElement | null) : null
    const cui = get('cui')?.value ?? ''
    startLookup(async () => {
      const result = await lookup(cui)
      if (result.status === 'found') {
        const set = (name: string | undefined, text: string) => {
          const input = get(name)
          if (input) input.value = text
        }
        set(fill.name, result.name)
        set(fill.address, result.address)
        set(fill.regCom, result.regCom)
        setNote(labels.found)
      } else
        setNote(
          {
            'not-found': labels.notFound,
            invalid: labels.invalid,
            unavailable: labels.unavailable,
          }[result.status],
        )
    })
  }

  return (
    <div ref={box} className="grid gap-2">
      <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
        <TextField
          name="cui"
          label={labels.cui}
          defaultValue={defaultValue}
          error={error}
          inputMode="text"
        />
        <Button type="button" variant="secondary" onClick={run} disabled={finding}>
          {finding ? labels.finding : labels.find}
        </Button>
      </div>
      <p aria-live="polite" className="text-caption text-muted empty:hidden">
        {note}
      </p>
    </div>
  )
}
