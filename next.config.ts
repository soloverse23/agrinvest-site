import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import { createHash } from 'crypto'
import { existsSync, readdirSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

/**
 * Hash of the reviewed enrichment files. The apply step (`scripts/products/apply.ts`) runs
 * outside Next.js and cannot refresh Vercel's data cache, which survives deploys. The shop's
 * cache keys carry this hash, so a deploy with new data reads the database afresh.
 */
function enrichmentEpoch() {
  const hash = createHash('sha256')
  const walk = (dir: string) => {
    if (!existsSync(dir)) return
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const file = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(file)
      else if (entry.name.endsWith('.json')) hash.update(file).update(readFileSync(file))
    }
  }
  for (const dir of ['products', 'hubs', 'finance']) walk(path.join(dirname, 'data', dir))
  for (const name of ['targets.json', 'pages.json']) {
    const file = path.join(dirname, 'data', name)
    if (existsSync(file)) hash.update(readFileSync(file))
  }
  // The register rows that `apply:finance` adds to a live site come from the seed's data.
  hash.update(readFileSync(path.join(dirname, 'scripts/seed/data.ts')))
  // Steps that rewrite menus and page links on a live site (`apply:finance`).
  for (const name of ['corrections.ts', 'entry-points.ts'])
    hash.update(readFileSync(path.join(dirname, 'scripts/finance', name)))
  return hash.digest('hex').slice(0, 12)
}

const nextConfig: NextConfig = {
  env: { ENRICHMENT_EPOCH: enrichmentEpoch() },
  experimental: {
    // Tailwind's CSS is small: inlining it removes the render-blocking stylesheet request.
    inlineCss: true,
  },
  images: {
    // 60 for full-bleed photos under a scrim (Hero), 75 (the default) for everything else.
    qualities: [60, 75],
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
