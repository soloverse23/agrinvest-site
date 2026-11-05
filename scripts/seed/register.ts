import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { FactStatus } from '../../src/fields'

/**
 * Status per register key, read from the register's tables (the source of truth). A part key
 * (`F7.office`) has its own status when its row exists, and its base key's (`F2`) otherwise.
 */
export function registerStatuses(): (key: string) => FactStatus {
  return readRegister().status
}

/** Who confirmed a row and when, as the register states it: `confirmed (owner, 2026-11-05)`. */
export const registerConfirmation = () => readRegister().confirmation

function readRegister() {
  const md = readFileSync(resolve('docs/audit/figures-register.md'), 'utf8')
  const out = new Map<string, FactStatus>()
  const by = new Map<string, { confirmedBy: string; confirmedAt: string }>()
  for (const line of md.split('\n')) {
    const cells = line.split('|').map((c) => c.trim())
    if (!/^[A-Z]\d+(\.[a-z]+)?$/.test(cells[1] ?? '')) continue
    const status =
      cells.slice(3).find((c) => /to confirm|conflict|confirmed|snapshot|missing/i.test(c)) ?? ''
    const who = /^\**confirmed\s*\(([^,]+),\s*(\d{4}-\d{2}-\d{2})\)/i.exec(status)
    if (who) by.set(cells[1], { confirmedBy: who[1], confirmedAt: who[2] })
    out.set(
      cells[1],
      /conflict/i.test(status)
        ? 'conflict'
        : /^confirmed/i.test(status.replace(/\*/g, ''))
          ? 'confirmed'
          : 'to-confirm',
    )
  }
  const base = (key: string) => key.split('.')[0]
  return {
    status: (key: string): FactStatus => out.get(key) ?? out.get(base(key)) ?? 'to-confirm',
    confirmation: (key: string) => by.get(key) ?? by.get(base(key)),
  }
}
