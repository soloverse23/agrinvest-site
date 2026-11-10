/**
 * Shared helpers of the demo seed (`npm run seed:demo`) and its undo (`npm run unseed:demo`).
 * Everything the seed creates or changes is recorded in `manifest.json`, so the undo can delete
 * the created rows and put every changed field back. Local databases only.
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Payload } from 'payload'

export const manifestPath = resolve('scripts/demo/manifest.json')
export const locales = ['ro', 'en'] as const
type Loc = (typeof locales)[number]

export type Manifest = {
  startedAt: string
  created: Record<string, (number | string)[]>
  /** collection → id → locale → the top-level fields as they were before the seed. */
  changed: Record<string, Record<string, Partial<Record<Loc, Record<string, unknown>>>>>
  globals: Record<string, Partial<Record<Loc, Record<string, unknown>>>>
}

export function assertLocal() {
  const url = process.env.DATABASE_URL ?? ''
  if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url) && !/^postgres(ql)?:\/\/localhost/.test(url))
    throw new Error('The demo seed only runs against a local database.')
}

export const loadManifest = (): Manifest | null =>
  existsSync(manifestPath) ? (JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest) : null

export const saveManifest = (m: Manifest) => writeFileSync(manifestPath, JSON.stringify(m))

const pick = (doc: Record<string, unknown>, keys: string[]) =>
  Object.fromEntries(keys.map((k) => [k, doc[k] ?? null]))

export class Demo {
  m: Manifest
  constructor(
    readonly payload: Payload,
    manifest: Manifest,
  ) {
    this.m = manifest
  }

  save() {
    saveManifest(this.m)
  }

  /** Creates a row and remembers it. */
  async create(
    collection: string,
    data: Record<string, unknown>,
    extra: Record<string, unknown> = {},
  ) {
    const doc = await this.payload.create({
      collection: collection as never,
      data: data as never,
      depth: 0,
      ...extra,
    } as never)
    const id = (doc as { id: number | string }).id
    ;(this.m.created[collection] ??= []).push(id)
    return doc as unknown as Record<string, unknown> & { id: number }
  }

  /** Remembers a row another code path created (a hook, a job). */
  track(collection: string, ids: (number | string)[]) {
    ;(this.m.created[collection] ??= []).push(...ids)
  }

  /** Changes fields of an existing row, after saving the old values of `keys` in both languages. */
  async change(
    collection: string,
    id: number,
    keys: string[],
    data: Record<string, unknown>,
    extra: Record<string, unknown> = {},
  ) {
    const slot = ((this.m.changed[collection] ??= {})[String(id)] ??= {})
    if (!slot.ro) {
      for (const locale of locales) {
        const before = await this.payload.findByID({
          collection: collection as never,
          id,
          locale,
          fallbackLocale: false,
          draft: true,
          depth: 0,
        } as never)
        slot[locale] = pick(before as never, keys)
      }
    }
    return this.payload.update({
      collection: collection as never,
      id,
      data: data as never,
      locale: 'ro',
      depth: 0,
      ...extra,
    } as never)
  }

  async changeEn(collection: string, id: number, data: Record<string, unknown>) {
    return this.payload.update({
      collection: collection as never,
      id,
      data: data as never,
      locale: 'en',
      depth: 0,
    } as never)
  }
}

/** A small deterministic random generator, so every run seeds the same numbers. */
export function rng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Monday 00:00 UTC, `weeksBack` weeks before the week of `now`. */
export function monday(now: Date, weeksBack: number) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) - weeksBack * 7)
  return d
}

/** A tiny valid one-page PDF, so demo documents open in the browser. */
export function demoPdf(title: string): Buffer {
  const text = title.replace(/[()\\]/g, '')
  const stream = `BT /F1 18 Tf 60 760 Td (${text}) Tj ET\nBT /F1 11 Tf 60 730 Td (Document demonstrativ, doar pentru testare.) Tj ET`
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let out = '%PDF-1.4\n'
  const offsets: number[] = []
  objs.forEach((o, i) => {
    offsets.push(out.length)
    out += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const xref = out.length
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`
  for (const o of offsets) out += `${String(o).padStart(10, '0')} 00000 n \n`
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return Buffer.from(out, 'latin1')
}

/** The scripts write outside Next.js, so its hooks cannot revalidate tags: drop the data cache. */
export function clearNextCache() {
  for (const dir of ['.next/cache/fetch-cache', '.next/dev/cache/fetch-cache'])
    rmSync(resolve(dir), { recursive: true, force: true })
  console.log('cleared the Next.js data cache (restart `npm run dev` if pages still look old)')
}
