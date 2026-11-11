/**
 * Builds the article covers (`scripts/seed/covers.ts`) from Agrinvest's 1080p brand film.
 *
 *   npm run brand:covers
 *
 * Download the film once (video only, 1080p), with the ffmpeg this package ships:
 *
 *   yt-dlp -f 137 --ffmpeg-location node_modules/ffmpeg-static/ffmpeg \
 *     -o "data/raw/video/hd/x5wm8dXlJt4-full.%(ext)s" "https://www.youtube.com/watch?v=x5wm8dXlJt4"
 *
 * Output: `scripts/seed/assets/covers/{name}.webp`, 1600×900. A `top` cover keeps the top 5/6
 * of the frame (the film's logo sits at the bottom), then scales back to 16:9.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import ffmpegPath from 'ffmpeg-static'

import { covers } from '../seed/covers'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const film = path.join(root, 'data/raw/video/hd/x5wm8dXlJt4-full.mp4')
const outDir = path.join(root, 'scripts/seed/assets/covers')

if (!ffmpegPath || !existsSync(ffmpegPath))
  throw new Error('ffmpeg-static missing: npm rebuild ffmpeg-static')
if (!existsSync(film)) throw new Error(`missing ${film}: see the yt-dlp command in this file`)
mkdirSync(outDir, { recursive: true })

for (const [name, c] of Object.entries(covers)) {
  const out = path.join(outDir, `${name}.webp`)
  // 1600×900 crop from the centre-top of 1920×1080 for `top`, else the whole frame.
  const crop = c.top ? 'crop=1600:900:160:0,' : ''
  const run = spawnSync(ffmpegPath, [
    '-loglevel',
    'error',
    '-y',
    '-ss',
    String(c.at),
    '-i',
    film,
    '-frames:v',
    '1',
    '-vf',
    `${crop}scale=1600:900:flags=lanczos`,
    '-c:v',
    'libwebp',
    '-quality',
    '78',
    out,
  ])
  if (run.status !== 0) throw new Error(`${name}: ${run.stderr.toString()}`)
  console.log(`${name}.webp ${Math.round(statSync(out).size / 1024)} KB`)
}
