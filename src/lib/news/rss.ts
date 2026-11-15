import { newsSources, type NewsSource } from '@/lib/sources'
import { decodeXml } from '@/lib/xml'

import { imageAllowed } from './image-hosts'

export type FeedItem = {
  source: NewsSource
  title: string
  url: string
  publishedAt: Date
  /** Plain text, within the publisher's limit; empty when only headlines are allowed. */
  excerpt: string
  /** The feed's own photo for the item, on one of the source's image hosts; else null. */
  image: string | null
}

const tag = (xml: string, name: string) => {
  const m = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(xml)
  if (!m) return ''
  const cdata = /^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/.exec(m[1])
  return cdata ? cdata[1] : decodeXml(m[1])
}

/** Zero-width characters some feeds (MADR) put in front of titles and paragraphs. */
const INVISIBLE = /[​-‍⁠﻿]/g

/** Tags out, entities decoded, invisible characters dropped, whitespace collapsed. */
export const plainText = (html: string) =>
  decodeXml(html.replace(/<[^>]+>/g, ' '))
    .replace(INVISIBLE, '')
    .replace(/\s*\[(?:…|&#8230;|\.\.\.)\]\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()

/** Cuts at a word boundary and marks the cut, keeping within `max` characters. */
export function clip(text: string, max: number): string {
  if (max <= 0) return ''
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const space = cut.lastIndexOf(' ')
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:–-]+$/, '')}…`
}

const attr = (tagText: string, name: string) =>
  new RegExp(`\\s${name}="([^"]+)"`).exec(tagText)?.[1]

/**
 * The item's photo: `media:content` or `media:thumbnail`, an image `enclosure`, else the first
 * `<img>` in the description (raw or entity-encoded). Kept only on the source's image hosts.
 */
export function feedImage(item: string, source: NewsSource): string | null {
  const candidates: string[] = []
  for (const m of item.matchAll(/<media:(?:content|thumbnail)\b[^>]*>/g)) {
    const url = attr(m[0], 'url')
    const medium = attr(m[0], 'medium') ?? attr(m[0], 'type') ?? 'image'
    if (url && /image/.test(medium)) candidates.push(url)
  }
  for (const m of item.matchAll(/<enclosure\b[^>]*>/g)) {
    const url = attr(m[0], 'url')
    if (url && /^image\//.test(attr(m[0], 'type') ?? '')) candidates.push(url)
  }
  const desc = decodeXml(item.replace(/<!\[CDATA\[|\]\]>/g, ''))
  const img = /<img\b[^>]*\ssrc="([^"]+)"/.exec(desc)?.[1]
  if (img) candidates.push(img)
  for (const c of candidates) {
    const url = decodeXml(c).trim()
    if (imageAllowed(source, url)) return url
  }
  return null
}

/** True when `host` is one of `allowed` or a subdomain of one. */
export const hostAllowed = (host: string, allowed: string[]) => {
  const h = host.replace(/^www\./, '')
  return allowed.some((a) => h === a || h.endsWith(`.${a}`))
}

/**
 * Items of an RSS 2.0 feed: headline, link, date and, where the source allows it, a short
 * plain-text excerpt (`newsSources[source].excerptMax`). Items without a link or a valid date
 * are skipped, and so are links outside the source's hosts. Full article text
 * (`content:encoded`) is never read.
 *
 * Google News items (Reuters) end their title with " - Reuters" and name the real publisher
 * in `<source url>`; items from any other publisher are skipped.
 */
export function parseRss(xml: string, source: NewsSource): FeedItem[] {
  const info = newsSources[source]
  const max = info.excerptMax
  const publisherHost = new URL(info.site).hostname.replace(/^www\./, '')
  const viaGoogle = info.linkHosts.includes('news.google.com')
  const items: FeedItem[] = []
  for (const [, item] of xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/g)) {
    let title = plainText(tag(item, 'title'))
    const url = tag(item, 'link').trim()
    const publishedAt = new Date(tag(item, 'pubDate').trim())
    if (!title || !/^https:\/\//.test(url) || Number.isNaN(publishedAt.getTime())) continue
    if (!hostAllowed(new URL(url).hostname, info.linkHosts)) continue
    if (viaGoogle) {
      const publisher = /<source\s+url="([^"]+)"/.exec(item)?.[1]
      if (!publisher || !hostAllowed(new URL(publisher).hostname, [publisherHost])) continue
      title = title.replace(new RegExp(`\\s+-\\s+${info.name}$`), '')
    }
    items.push({
      source,
      title: title.slice(0, 300),
      url,
      publishedAt,
      excerpt: viaGoogle ? '' : clip(plainText(tag(item, 'description')), max),
      image: viaGoogle ? null : feedImage(item, source),
    })
  }
  return items
}

/** Why an item was refused before it was stored; `null` when it is fine. */
export type Rejection = 'title' | 'future' | 'old' | null

/** Items newer than this are kept; older ones are history the site never needs. */
export const MAX_AGE_DAYS = 7

/**
 * Checks an item before it is stored: a headline of 10–300 characters, a date not in the
 * future (a few minutes of clock skew allowed) and not older than `MAX_AGE_DAYS`.
 */
export function validate(item: FeedItem, now: Date): Rejection {
  if (item.title.length < 10 || item.title.length > 300) return 'title'
  const t = item.publishedAt.getTime()
  if (t > now.getTime() + 10 * 60_000) return 'future'
  if (t < now.getTime() - MAX_AGE_DAYS * 86_400_000) return 'old'
  return null
}
