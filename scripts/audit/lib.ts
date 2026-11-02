import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { stringify } from 'csv-stringify/sync'

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
export const auditDir = path.join(root, 'docs/audit')
export const rawDir = path.join(root, 'data/raw')

export const USER_AGENT =
  'AgrinvestSiteAudit/1.0 (+site rebuild audit; contact office@agrinvest.ro)'

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function get(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    redirect: 'manual',
    ...init,
    headers: { 'user-agent': USER_AGENT, ...init?.headers },
    signal: AbortSignal.timeout(30_000),
  })
}

/** Runs `task` over `items` with limited concurrency and a pause between requests. */
export async function pool<T, R>(
  items: T[],
  concurrency: number,
  delayMs: number,
  task: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await task(items[i], i)
      await sleep(delayMs)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))
  return results
}

export async function writeCsv(file: string, rows: Record<string, unknown>[]): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(
    file,
    stringify(rows, { header: true, bom: true, cast: { boolean: (v) => (v ? 'yes' : 'no') } }),
  )
}

export async function writeJson(file: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n')
}

export const rel = (file: string) => path.relative(root, file)
