/**
 * Builds the home hero's silent video loops and posters from Agrinvest's own footage
 * (rights pending, like the photos: docs/audit/agrinvest-inputs.md).
 *
 *   npm run brand:clips            all slides
 *   npm run brand:clips -- grain   one slide
 *
 * Source: the full 1080p film of x5wm8dXlJt4 (the 360p WebM in data/raw/video is too soft for
 * a full-screen hero). Download it once with yt-dlp, using the ffmpeg this package ships:
 *
 *   yt-dlp -f 137 --ffmpeg-location node_modules/ffmpeg-static/ffmpeg \
 *     -o "data/raw/video/hd/x5wm8dXlJt4-full.%(ext)s" "https://www.youtube.com/watch?v=x5wm8dXlJt4"
 *
 * (Format 270, the HLS 1080p, is the same 4 Mbps stream.) Times below are seconds in the film.
 *
 * Output in public/media/hero/, per slide: `{slide}.webm|mp4|webp` (16:9, 1920w, the source's
 * own size, so nothing is scaled) and `{slide}-tall.webm|mp4|webp` (9:16, 608w, the crop's own
 * width) for phones held upright.
 * Each poster is its loop's first frame, so the swap from poster to video does not jump. The
 * loop's seam is a crossfade into its own start.
 *
 * ffmpeg-static's binary comes from its install script. If npm skipped it (install scripts
 * disabled), run `npm rebuild ffmpeg-static`.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import ffmpegPath from 'ffmpeg-static'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const source = path.join(root, 'data/raw/video/hd/x5wm8dXlJt4-full.mp4')
const outDir = path.join(root, 'public/media/hero')
const tmpDir = path.join(root, 'data/raw/video/hd/.work')

type Shot = {
  from: number
  to: number
  /** Horizontal centre of the portrait cut, 0–1 of the frame width (default 0.5). */
  focus?: number
  /** Playback stretch: 1.5 plays the shot at two thirds of its speed (default 1). */
  speed?: number
}
type Clip = { slide: string; note: string; shots: Shot[] }

// In and out points sit inside the shots: these windows hide cuts (found with ffmpeg's
// scene filter), and a frame of the next shot at either end shows up as a flash.
const clips: Clip[] = [
  {
    slide: 'grain',
    note: 'Two combines harvesting wheat, one slow drone move.',
    shots: [{ from: 266.3, to: 274.4, focus: 0.45 }],
  },
  {
    slide: 'shop',
    note: 'Agrinvest big bags in stock, fertiliser loaded onto a truck, the truck side: "Semințe · Pesticide · Îngrășăminte".',
    shots: [
      { from: 157.45, to: 158.6, speed: 1.6 },
      { from: 143.8, to: 145.8, speed: 1.25, focus: 0.58 },
      { from: 177.85, to: 182.1, focus: 0.45 },
    ],
  },
  {
    slide: 'finance',
    note: 'Sowing, then the harvest going onto trucks: credit at sowing, repaid after harvest.',
    shots: [
      { from: 350.1, to: 353.5, focus: 0.7 },
      { from: 353.7, to: 355.45, focus: 0.55 },
      { from: 262.3, to: 265.9, focus: 0.38 },
    ],
  },
]

/** Crossfade between shots and at the loop's seam, in seconds. */
const CUT = 0.4
const SEAM = 0.8
const FPS = 25

/**
 * Two cuts per slide: `wide` (16:9) for landscape screens and `tall` (9:16, framed on each
 * shot's `focus`) for phones held upright, where a 16:9 frame would show only its middle.
 * Both keep the source's pixels (no downscale) so the loop stays sharp on a full-screen hero.
 * A loop loads only once its slide shows, so the ceilings are generous: 4 MB wide, 1.5 MB tall.
 */
const shapes = {
  wide: { crop: null, width: 1920, max: 4_000_000, poster: 1920 },
  tall: { crop: 608, width: 608, max: 1_500_000, poster: 608 },
} as const
type Shape = keyof typeof shapes

const shotLength = (s: Shot) => (s.to - s.from) * (s.speed ?? 1)

function ffmpeg(args: string[]) {
  if (!ffmpegPath || !existsSync(ffmpegPath)) {
    throw new Error('ffmpeg-static has no binary: run `npm rebuild ffmpeg-static`')
  }
  const run = spawnSync(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    stdio: ['ignore', 'inherit', 'inherit'],
    // A filter graph that waits on a stream that never comes hangs without a word.
    timeout: 10 * 60_000,
  })
  if (run.error) throw run.error
  if (run.status !== 0) throw new Error(`ffmpeg failed: ${args.join(' ')}`)
}

const size = (file: string) => statSync(file).size

/** A file's real length: frame rounding makes it differ from the sum of the shot lengths. */
function seconds(file: string) {
  const info = spawnSync(ffmpegPath!, ['-hide_banner', '-i', file], { encoding: 'utf8' }).stderr
  const [, h, m, s] = /Duration: (\d+):(\d+):([\d.]+)/.exec(info) ?? []
  if (!s) throw new Error(`no duration for ${file}`)
  return Number(h) * 3600 + Number(m) * 60 + Number(s)
}

/** One 1080p master per slide and shape: shots joined with short crossfades, a seamless loop. */
function master(clip: Clip, shape: Shape): string {
  const crop = shapes[shape].crop
  const inputs = clip.shots.flatMap((s) => [
    '-ss',
    String(s.from),
    '-to',
    String(s.to),
    '-i',
    source,
  ])
  const parts: string[] = clip.shots.map((shot, i) => {
    const frame = crop
      ? `scale=1920:1080:flags=lanczos,crop=${crop}:1080:${Math.round(
          Math.min(1920 - crop, Math.max(0, (shot.focus ?? 0.5) * 1920 - crop / 2)),
        )}:0`
      : 'scale=1920:1080:flags=lanczos'
    return `[${i}:v]${frame},setsar=1,setpts=(PTS-STARTPTS)*${shot.speed ?? 1},fps=${FPS},format=yuv420p,settb=AVTB[s${i}]`
  })
  // Join the shots.
  let last = 's0'
  let length = shotLength(clip.shots[0])
  for (let i = 1; i < clip.shots.length; i++) {
    const out = `j${i}`
    parts.push(
      `[${last}][s${i}]xfade=transition=fade:duration=${CUT}:offset=${(length - CUT).toFixed(3)}[${out}]`,
    )
    length += shotLength(clip.shots[i]) - CUT
    last = out
  }
  // Seamless loop: play from SEAM to the end, then crossfade into the first SEAM seconds. The
  // last frame then leads straight back into the first. The shots are joined into a file of
  // their own first, so the crossfade can be timed on its real length: when the body outlasts
  // the crossfade, ffmpeg stalls instead of ending.
  const encode = ['-an', '-c:v', 'libx264', '-crf', '12', '-preset', 'veryfast']
  const joined = path.join(tmpDir, `${clip.slide}-${shape}-joined.mp4`)
  // A single shot needs a filter to carry the `j` label, so `null` passes it through.
  parts.push(`[${last}]null[out]`)
  ffmpeg([...inputs, '-filter_complex', parts.join(';'), '-map', '[out]', ...encode, joined])
  const from = (cut: string) => `${cut},setpts=PTS-STARTPTS,fps=${FPS},settb=AVTB`
  const loop = [
    `[0:v]${from(`trim=start=${SEAM}`)}[body]`,
    `[1:v]${from(`trim=end=${SEAM}`)}[head]`,
    `[body][head]xfade=transition=fade:duration=${SEAM}:offset=${(seconds(joined) - 2 * SEAM).toFixed(3)}[out]`,
  ]
  const file = path.join(tmpDir, `${clip.slide}-${shape}-master.mp4`)
  ffmpeg([
    '-i',
    joined,
    '-i',
    joined,
    '-filter_complex',
    loop.join(';'),
    '-map',
    '[out]',
    ...encode,
    file,
  ])
  return file
}

/** Encodes at rising CRF until the file fits its ceiling. */
function fit(
  label: string,
  max: number,
  start: number,
  step: number,
  encode: (crf: number) => string,
) {
  for (let crf = start; crf <= start + step * 8; crf += step) {
    const file = encode(crf)
    if (size(file) <= max) {
      console.log(`  ${label}: ${(size(file) / 1e6).toFixed(2)} MB (crf ${crf})`)
      return
    }
  }
  throw new Error(`${label} does not fit in ${max} bytes`)
}

function build(clip: Clip) {
  console.log(`${clip.slide}: ${clip.note}`)
  for (const shape of Object.keys(shapes) as Shape[]) {
    const { width, max, poster } = shapes[shape]
    const src = master(clip, shape)
    const name = shape === 'wide' ? clip.slide : `${clip.slide}-tall`
    const common = ['-an', '-map_metadata', '-1', '-pix_fmt', 'yuv420p']
    const scale = ['-vf', `scale=${width}:-2:flags=lanczos`]

    // Poster: the loop's first frame. The wide one stays full width for the image optimiser;
    // the tall one is served as it is.
    const still = path.join(outDir, `${name}.webp`)
    ffmpeg([
      ...['-i', src, '-frames:v', '1', '-vf', `scale=${poster}:-2:flags=lanczos`],
      ...['-c:v', 'libwebp', '-quality', shape === 'wide' ? '80' : '75', still],
    ])
    console.log(`  ${name}.webp: ${(size(still) / 1e3).toFixed(0)} KB`)

    const webm = path.join(outDir, `${name}.webm`)
    fit(`${name}.webm`, max, 26, 3, (crf) => {
      const pass = path.join(tmpDir, name)
      const vp9 = ['-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(crf)]
      const gop = ['-row-mt', '1', '-g', String(FPS * 4), '-passlogfile', pass]
      ffmpeg([
        '-i',
        src,
        ...scale,
        ...common,
        ...vp9,
        ...gop,
        '-pass',
        '1',
        '-f',
        'null',
        '/dev/null',
      ])
      ffmpeg(['-i', src, ...scale, ...common, ...vp9, ...gop, '-pass', '2', '-speed', '1', webm])
      return webm
    })

    const mp4 = path.join(outDir, `${name}.mp4`)
    fit(`${name}.mp4`, max, 20, 2, (crf) => {
      ffmpeg([
        '-i',
        src,
        ...scale,
        ...common,
        ...['-c:v', 'libx264', '-profile:v', 'high', '-crf', String(crf), '-preset', 'slow'],
        ...['-g', String(FPS * 4), '-movflags', '+faststart'],
        mp4,
      ])
      return mp4
    })
  }
}

function main() {
  const only = process.argv.slice(2)
  const todo = only.length ? clips.filter((c) => only.includes(c.slide)) : clips
  if (!todo.length) throw new Error(`unknown slide: ${only.join(', ')}`)
  if (!existsSync(source)) throw new Error('missing the source film: see the note at the top')
  mkdirSync(outDir, { recursive: true })
  mkdirSync(tmpDir, { recursive: true })
  try {
    for (const clip of todo) build(clip)
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
}

main()
