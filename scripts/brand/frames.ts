/**
 * Pulls still frames from Agrinvest's own YouTube videos, for the design-direction boards.
 * Internal review only until the footage rights are confirmed (docs/audit/agrinvest-inputs.md).
 *
 * 1. Download the video-only WebM streams (no ffmpeg needed):
 *    yt-dlp -f "bv*[ext=webm][height<=1080]" -o "data/raw/video/%(id)s.%(ext)s" <url>
 * 2. Contact sheets, one frame every N seconds:  npx tsx scripts/brand/frames.ts sheet 10
 * 3. Export chosen frames:                       npx tsx scripts/brand/frames.ts pick <id>@<seconds>:<name> …
 *
 * Frames are taken by Playwright's Chromium, which decodes VP9 itself.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium, type Page } from '@playwright/test'
import sharp, { type OverlayOptions } from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const videoDir = path.join(root, 'data/raw/video')
const frameDir = path.join(root, 'data/raw/frames')

async function open(page: Page, file: string): Promise<number> {
  // A file:// page, so Chromium lets it load the local video.
  await page.goto(`file://${path.dirname(file)}/`)
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.evaluate(() => {
    document.body.innerHTML =
      '<video muted preload="auto" style="width:1920px;height:1080px"></video>'
    document.body.style.margin = '0'
  })
  return page.evaluate(async (src) => {
    const video = document.querySelector('video')!
    video.src = src
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve
      video.onerror = () => reject(new Error(`cannot decode ${src}`))
    })
    return video.duration
  }, `file://${file}`)
}

async function grab(page: Page, seconds: number): Promise<Buffer> {
  await page.evaluate(async (t) => {
    const video = document.querySelector('video')!
    video.currentTime = t
    await new Promise((resolve) => (video.onseeked = resolve))
  }, seconds)
  return page.locator('video').screenshot({ type: 'png' })
}

async function sheet(every: number) {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await fs.mkdir(frameDir, { recursive: true })
  try {
    for (const file of (await fs.readdir(videoDir)).filter((f) => f.endsWith('.webm'))) {
      const id = path.basename(file, '.webm')
      const duration = await open(page, path.join(videoDir, file))
      const tiles: OverlayOptions[] = []
      const [w, h, cols] = [320, 180, 6]
      for (let t = 2, i = 0; t < duration; t += every, i++) {
        const thumb = await sharp(await grab(page, t))
          .resize(w, h)
          .toBuffer()
        const label = Buffer.from(
          `<svg width="${w}" height="${h}"><rect width="44" height="18" fill="#000"/><text x="4" y="14" font-size="13" fill="#fff" font-family="sans-serif">${t}s</text></svg>`,
        )
        tiles.push({ input: thumb, left: (i % cols) * w, top: Math.floor(i / cols) * h })
        tiles.push({ input: label, left: (i % cols) * w, top: Math.floor(i / cols) * h })
      }
      const rows = Math.ceil(tiles.length / 2 / cols)
      await sharp({
        create: { width: cols * w, height: rows * h, channels: 3, background: '#fff' },
      })
        .composite(tiles)
        .jpeg({ quality: 80 })
        .toFile(path.join(frameDir, `sheet-${id}.jpg`))
      console.log(`sheet-${id}.jpg (${tiles.length / 2} frames)`)
    }
  } finally {
    await browser.close()
  }
}

async function pick(specs: string[]) {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await fs.mkdir(frameDir, { recursive: true })
  try {
    for (const spec of specs) {
      const [, id, seconds, name] = /^([\w-]+)@([\d.]+):([\w-]+)$/.exec(spec) ?? []
      if (!id) throw new Error(`Bad frame spec "${spec}", expected <id>@<seconds>:<name>`)
      await open(page, path.join(videoDir, `${id}.webm`))
      const frame = await grab(page, Number(seconds))
      await sharp(frame)
        .webp({ quality: 82 })
        .toFile(path.join(frameDir, `${name}.webp`))
      console.log(`${name}.webp ← ${id} at ${seconds}s`)
    }
  } finally {
    await browser.close()
  }
}

const [command, ...args] = process.argv.slice(2)
const run =
  command === 'sheet' ? sheet(Number(args[0] ?? 10)) : command === 'pick' ? pick(args) : null
if (!run) {
  console.error('Usage: frames.ts sheet [seconds] | frames.ts pick <id>@<seconds>:<name> …')
  process.exit(1)
}
run.catch((err) => {
  console.error(err)
  process.exit(1)
})
