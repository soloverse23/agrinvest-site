import { randomInt } from 'node:crypto'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/**
 * A reference that is hard to guess and easy to read over the phone: `AGR-2611-7KQ2M` for an
 * order, `CRD-2611-7KQ2M` for a credit application. No 0/O or 1/I to confuse.
 */
export function newReference(prefix: string, now = new Date()) {
  const stamp = now.toISOString().slice(2, 7).replace('-', '')
  const tail = Array.from({ length: 5 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')
  return `${prefix}-${stamp}-${tail}`
}
