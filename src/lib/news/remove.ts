import type { Payload, PayloadRequest } from 'payload'

import type { EditionEntry } from './types'

/** Set on internal deletes so the item hook does not touch a story that is being removed. */
export const REMOVING_STORY = 'newsRemovingStory'

/** Adds links to the blocklist, skipping the ones already there. */
export async function blockUrls(payload: Payload, urls: string[], req?: PayloadRequest) {
  if (!urls.length) return
  const known = await payload.find({
    req,
    collection: 'news-blocked',
    where: { url: { in: urls } },
    pagination: false,
    depth: 0,
    select: { url: true },
  })
  const have = new Set(known.docs.map((d) => d.url))
  for (const url of urls) {
    if (have.has(url)) continue
    await payload.create({ req, collection: 'news-blocked', data: { url }, depth: 0 })
  }
}

/** Drops a story from every daily edition that lists it. */
export async function dropFromEditions(payload: Payload, key: string, req?: PayloadRequest) {
  const { docs } = await payload.find({
    req,
    collection: 'news-editions',
    pagination: false,
    depth: 0,
    limit: 0,
  })
  for (const ed of docs) {
    const entries = (ed.entries as EditionEntry[] | null) ?? []
    const left = entries.filter((e) => e.key !== key)
    if (left.length === entries.length) continue
    await payload.update({
      req,
      collection: 'news-editions',
      id: ed.id,
      data: { entries: left, count: left.length },
      depth: 0,
    })
  }
}

/**
 * Removes a story for good: its headlines are deleted and their links blocked, and the story
 * leaves the daily editions. Called from the story's `beforeDelete` hook, so the admin's
 * Delete button (one story or many) does all of it.
 */
export async function removeStory(payload: Payload, id: number, req?: PayloadRequest) {
  const story = await payload.findByID({
    req,
    collection: 'news-stories',
    id,
    depth: 0,
    disableErrors: true,
  })
  if (!story) return
  const ids = (story.items ?? []).map((i) => (typeof i === 'number' ? i : i.id))
  if (ids.length) {
    const items = await payload.find({
      req,
      collection: 'news-items',
      where: { id: { in: ids } },
      pagination: false,
      depth: 0,
      select: { url: true },
    })
    await blockUrls(
      payload,
      items.docs.map((d) => d.url),
      req,
    )
    await payload.delete({
      req,
      collection: 'news-items',
      where: { id: { in: ids } },
      depth: 0,
      context: { [REMOVING_STORY]: true },
    })
  }
  await dropFromEditions(payload, story.key, req)
}

/**
 * A headline deleted on its own: its link is blocked, and it leaves its story. A story left
 * with no headline is deleted too.
 */
export async function removeItem(payload: Payload, id: number, url: string, req?: PayloadRequest) {
  await blockUrls(payload, [url], req)
  const { docs } = await payload.find({
    req,
    collection: 'news-stories',
    where: { items: { contains: id } },
    pagination: false,
    depth: 0,
  })
  for (const story of docs) {
    const left = (story.items ?? [])
      .map((i) => (typeof i === 'number' ? i : i.id))
      .filter((i) => i !== id)
    if (left.length) {
      await payload.update({
        req,
        collection: 'news-stories',
        id: story.id,
        data: { items: left },
        depth: 0,
      })
    } else {
      await dropFromEditions(payload, story.key, req)
      await payload.delete({
        req,
        collection: 'news-stories',
        id: story.id,
        depth: 0,
        context: { [REMOVING_STORY]: true },
      })
    }
  }
}
