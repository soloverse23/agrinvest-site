/**
 * Screenshots Storybook stories at 390 / 768 / 1440 px in RO and EN, for the rubric review
 * (docs/design-review/rubric.md). Serves the built Storybook (storybook-static/) itself.
 *
 * Run: npm run build-storybook && npm run review:shoot -- [title prefix, e.g. "Directions/"]
 * Output: docs/design-review/shots/<YYYY-MM-DD>/<story-id>.<locale>.<width>.png
 * Fails if any page scrolls horizontally (elements inside a `data-scroll-x` container are allowed)
 * or if axe finds WCAG 2.1 A/AA or best-practice violations (checked at the widest viewport).
 */
import fs from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'
import axe from 'axe-core'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const staticDir = path.join(root, 'storybook-static')
const WIDTHS = [390, 768, 1440]
const LOCALES = ['ro', 'en']

const TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}

function serve(): Promise<http.Server> {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    const file = path.join(
      staticDir,
      decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname),
    )
    if (!file.startsWith(staticDir)) return res.writeHead(403).end()
    try {
      const body = await fs.readFile(file)
      res.writeHead(200, {
        'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
      })
      res.end(body)
    } catch {
      res.writeHead(404).end()
    }
  })
  return new Promise((resolve) => server.listen(0, () => resolve(server)))
}

async function main() {
  const prefix = process.argv[2] ?? ''
  const index = JSON.parse(await fs.readFile(path.join(staticDir, 'index.json'), 'utf8')) as {
    entries: Record<string, { id: string; title: string; type: string }>
  }
  const stories = Object.values(index.entries).filter(
    (e) => e.type === 'story' && e.title.startsWith(prefix),
  )
  if (!stories.length)
    throw new Error(`No stories match "${prefix}". Run npm run build-storybook first.`)

  const server = await serve()
  const { port } = server.address() as { port: number }
  const outDir = path.join(root, 'docs/design-review/shots', new Date().toISOString().slice(0, 10))
  await fs.mkdir(outDir, { recursive: true })

  const browser = await chromium.launch()
  let problems = 0
  try {
    for (const story of stories) {
      let checked = 0
      for (const locale of LOCALES) {
        for (const width of WIDTHS) {
          // Reduced motion: shots show the settled state, not a frame mid-animation.
          const page = await browser.newPage({
            viewport: { width, height: 900 },
            reducedMotion: 'reduce',
          })
          await page.goto(
            `http://localhost:${port}/iframe.html?id=${story.id}&viewMode=story&globals=locale:${locale}`,
            { waitUntil: 'networkidle' },
          )
          await page.evaluate(() => document.fonts.ready)
          // Scroll through once so lazy images load before the full-page screenshot.
          await page.evaluate(async () => {
            for (let y = 0; y < document.body.scrollHeight; y += 600) {
              window.scrollTo(0, y)
              await new Promise((r) => setTimeout(r, 50))
            }
            window.scrollTo(0, 0)
          })
          await page.waitForLoadState('networkidle')
          // Horizontal page scroll is a rubric fail: report the elements that cause it.
          const overflow = await page.evaluate((w) => {
            const wide: string[] = []
            document.querySelectorAll('body *').forEach((el) => {
              // Skip what is not rendered visibly, e.g. a closed <details> menu.
              if (!el.checkVisibility({ contentVisibilityAuto: true, visibilityProperty: true }))
                return
              const right = el.getBoundingClientRect().right
              const scroller = el.closest('[data-scroll-x]')
              if (right > w + 1 && !scroller) {
                const cls = typeof el.className === 'string' ? el.className : ''
                wide.push(
                  `${el.tagName.toLowerCase()}${cls ? '.' + cls.split(' ').join('.') : ''} (${Math.round(right)}px)`,
                )
              }
            })
            return wide.slice(0, 5)
          }, width)
          if (overflow.length) {
            problems++
            console.warn(`  overflow ${story.id} ${locale} ${width}: ${overflow.join(', ')}`)
          }
          // Accessibility (WCAG 2.1 A/AA + best practice), once per story and locale.
          if (width === WIDTHS.at(-1)) {
            await page.addScriptTag({ content: axe.source })
            const { passed, violations } = await page.evaluate(async () => {
              const result = await window.axe.run('#storybook-root', {
                runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
              })
              return {
                passed: result.passes.length,
                violations: result.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`),
              }
            })
            checked = passed
            if (violations.length) {
              problems++
              console.warn(`  a11y ${story.id} ${locale}:\n    ${violations.join('\n    ')}`)
            }
          }
          await page.screenshot({
            path: path.join(outDir, `${story.id}.${locale}.${width}.png`),
            fullPage: true,
          })
          await page.close()
        }
      }
      console.log(`shot ${story.id} (axe: ${checked} rules passed)`)
    }
  } finally {
    await browser.close()
    server.close()
  }
  console.log(
    `${stories.length * LOCALES.length * WIDTHS.length} screenshots in ${path.relative(root, outDir)}`,
  )
  if (problems) {
    console.error(`${problems} problem(s): horizontal scroll or accessibility violations`)
    process.exit(1)
  }
}

declare global {
  interface Window {
    axe: typeof axe
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
