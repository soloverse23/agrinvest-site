/**
 * Media uploads shared by the seed and `apply:redesign`: one upload per file, the hero
 * posters and the stills' focal points (Phase 7b).
 */
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Payload } from 'payload'

import { posterAlt } from '../site/hero'
import { posterKey } from './home'

/**
 * Where each still keeps its subject when a narrow screen crops it (x, y in %): the full-screen
 * hero on a phone shows only about a quarter of a 16:9 frame. Editors can move it in the admin.
 */
export const stillFocus: Record<string, { focalX: number; focalY: number }> = {
  'harvest-sunflower': { focalX: 30, focalY: 62 },
  combine: { focalX: 62, focalY: 45 },
  team: { focalX: 35, focalY: 50 },
  fleet: { focalX: 72, focalY: 65 },
  'grain-reception': { focalX: 58, focalY: 60 },
}

/** The Media docs whose file is `name.webp`, or a copy storage renamed (`name-1.webp`), oldest first. */
export async function findUploads(payload: Payload, name: string) {
  const found = await payload.find({
    collection: 'media',
    where: { filename: { like: name } },
    sort: 'id',
    limit: 100,
    depth: 0,
  })
  const same = new RegExp(`^${name}(-\\d+)?\\.webp$`)
  return found.docs.filter((d) => d.filename && same.test(d.filename))
}

/** Uploads a file once (or updates its texts), matching storage's renamed copies (`name-1.webp`). */
export async function uploadOnce(
  payload: Payload,
  filePath: string,
  name: string,
  alt: { ro: string; en: string },
  extra: Record<string, unknown>,
) {
  // Storage renames a file whose name is taken (`combine-1.webp`), so keep using the oldest
  // copy instead of uploading another one on every run.
  const [existing] = await findUploads(payload, name)
  const data = { alt: alt.ro, rights: 'pending' as const, ...extra }
  const doc = existing
    ? await payload.update({ collection: 'media', id: existing.id, data, locale: 'ro' })
    : await payload.create({ collection: 'media', data, filePath, locale: 'ro' })
  await payload.update({ collection: 'media', id: doc.id, data: { alt: alt.en }, locale: 'en' })
  return doc.id
}

/**
 * The home slider's posters (`public/media/hero/{grain,shop,finance}.webp`, the first frame of
 * each loop, 16:9) under their Media keys (`hero:grain`). Phones get the tall poster next to
 * the loop (`{clip}-tall.webp`), which stays a static file.
 */
export async function uploadPosters(payload: Payload) {
  const ids: Record<string, number> = {}
  for (const [file, alt] of Object.entries(posterAlt)) {
    const filePath = resolve('public/media/hero', file)
    if (!existsSync(filePath)) continue
    ids[posterKey(file)] = await uploadOnce(payload, filePath, file.replace(/\.webp$/, ''), alt, {
      credit: 'Agrinvest (YouTube)',
    })
  }
  return ids
}
