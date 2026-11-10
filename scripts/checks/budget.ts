/**
 * Byte budgets without Lighthouse (decision 0003, update 2026-11-10).
 * Loads each URL in mobile Chromium against a running site and sums the compressed bytes
 * of scripts and fonts, and counts external stylesheets. Fails above the budgets that
 * Lighthouse asserts, so sub-phases stay within them while Lighthouse runs once per phase.
 *
 *   npm run check:budget [-- http://localhost:3100]
 *
 * URLs come from lighthouserc.json, so a page added there is covered here too.
 */
import { readFileSync } from 'node:fs'

import { chromium, devices } from '@playwright/test'

const SCRIPT_MAX = 160_000
const FONT_MAX = 32_000
const STYLESHEET_MAX = 0

const base = (process.argv[2] ?? 'http://localhost:3100').replace(/\/$/, '')
const config = JSON.parse(
  readFileSync(new URL('../../lighthouserc.json', import.meta.url), 'utf8'),
) as {
  ci: { collect: { url: string[] } }
}
const paths = config.ci.collect.url.map((u) => {
  const url = new URL(u)
  return url.pathname + url.search
})

const kb = (n: number) => `${(n / 1000).toFixed(1)} KB`

const browser = await chromium.launch()
let failures = 0

for (const path of paths) {
  // A fresh context per URL: a cold cache, as Lighthouse measures.
  const context = await browser.newContext({ ...devices['Pixel 7'] })
  const page = await context.newPage()
  const pending: Promise<void>[] = []
  const totals = { script: 0, font: 0, stylesheet: 0 }

  page.on('requestfinished', (request) => {
    const type = request.resourceType()
    if (type !== 'script' && type !== 'font' && type !== 'stylesheet') return
    pending.push(
      request.sizes().then((sizes) => {
        if (type === 'stylesheet') totals.stylesheet += 1
        else totals[type] += sizes.responseBodySize + sizes.responseHeadersSize
      }),
    )
  })

  const response = await page.goto(base + path, { waitUntil: 'networkidle' })
  await Promise.all(pending)
  await context.close()

  const problems = [
    response?.status() !== 200 && `status ${response?.status()}`,
    totals.script > SCRIPT_MAX && `script ${kb(totals.script)} > ${kb(SCRIPT_MAX)}`,
    totals.font > FONT_MAX && `font ${kb(totals.font)} > ${kb(FONT_MAX)}`,
    totals.stylesheet > STYLESHEET_MAX && `${totals.stylesheet} external stylesheet(s)`,
  ].filter(Boolean)
  if (problems.length) failures += 1

  console.log(
    `${problems.length ? 'FAIL' : 'ok  '} ${path.padEnd(60)} script ${kb(totals.script).padStart(9)}  font ${kb(totals.font).padStart(8)}${problems.length ? `  ← ${problems.join('; ')}` : ''}`,
  )
}

await browser.close()
console.log(`\n${paths.length} URL(s), ${failures} over budget.`)
process.exit(failures ? 1 : 0)
