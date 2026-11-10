/**
 * Undoes `npm run seed:demo`: deletes every row the seed created and restores every field it
 * changed, as recorded in `scripts/demo/manifest.json`. Run with `npm run unseed:demo`.
 */
import { rmSync } from 'node:fs'

import config from '@payload-config'
import { getPayload } from 'payload'

import { assertLocal, clearNextCache, loadManifest, locales, manifestPath } from './kit'

assertLocal()
const m = loadManifest()
if (!m) {
  console.log('No manifest: the demo seed is not applied.')
  process.exit(0)
}
const payload = await getPayload({ config })
const ctx = { skipAlerts: true, skipChildren: true }

// 1. Restore changed rows first (they may point at rows that are about to be deleted).
for (const [collection, rows] of Object.entries(m.changed)) {
  for (const [id, byLocale] of Object.entries(rows)) {
    for (const locale of locales) {
      const data = byLocale[locale]
      if (!data) continue
      try {
        await payload.update({
          collection: collection as never,
          id: Number(id),
          data: data as never,
          locale,
          depth: 0,
          context: ctx,
        } as never)
      } catch (e) {
        console.error(`restore ${collection}/${id} (${locale}):`, (e as Error).message)
      }
    }
  }
}
for (const [slug, byLocale] of Object.entries(m.globals)) {
  for (const locale of locales) {
    const data = byLocale[locale]
    if (data)
      await payload.updateGlobal({ slug: slug as never, data: data as never, locale, context: ctx })
  }
}

// 2. Delete what was created, newest collection last-in first-out.
const order = Object.keys(m.created).reverse()
for (const collection of order) {
  const ids = m.created[collection]
  let n = 0
  for (const id of ids) {
    try {
      await payload.delete({ collection: collection as never, id, context: ctx } as never)
      n++
    } catch (e) {
      const msg = (e as Error).message
      if (!/not found/i.test(msg)) console.error(`delete ${collection}/${id}:`, msg)
    }
  }
  console.log(`${collection}: deleted ${n}/${ids.length}`)
}
rmSync(manifestPath)
clearNextCache()
console.log('Demo data removed. Run `npm run seed` if you also want the base content re-applied.')
process.exit(0)
