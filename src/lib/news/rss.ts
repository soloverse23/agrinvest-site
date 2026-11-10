import { newsSources, type NewsSource } from '@/lib/sources'
import { decodeXml } from '@/lib/xml'

export type FeedItem = {
  source: NewsSource
  title: string
  url: string
  publishedAt: Date
  /** Plain text, within the publisher's limit; empty when only headlines are allowed. */
  excerpt: string
}

const tag = (xml: string, name: string) => {
  const m = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(xml)
  if (!m) return ''
  const cdata = /^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/.exec(m[1])
  return cdata ? cdata[1] : decodeXml(m[1])
}

/** Tags out, entities decoded, whitespace collapsed. */
export const plainText = (html: string) =>
  decodeXml(html.replace(/<[^>]+>/g, ' '))
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

/**
 * Items of an RSS 2.0 feed: headline, link, date and, where the source allows it, a short
 * plain-text excerpt (`newsSources[source].excerptMax`). Items without a link or a valid date
 * are skipped. Full article text (`content:encoded`) is never read.
 */
export function parseRss(xml: string, source: NewsSource): FeedItem[] {
  const max = newsSources[source].excerptMax
  const host = new URL(newsSources[source].site).hostname.replace(/^www\./, '')
  const items: FeedItem[] = []
  for (const [, item] of xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/g)) {
    const title = plainText(tag(item, 'title'))
    const url = tag(item, 'link').trim()
    const publishedAt = new Date(tag(item, 'pubDate').trim())
    if (!title || !/^https:\/\//.test(url) || Number.isNaN(publishedAt.getTime())) continue
    // Only links back to the publisher's own site.
    if (new URL(url).hostname.replace(/^www\./, '') !== host) continue
    items.push({
      source,
      title: title.slice(0, 300),
      url,
      publishedAt,
      excerpt: clip(plainText(tag(item, 'description')), max),
    })
  }
  return items
}
