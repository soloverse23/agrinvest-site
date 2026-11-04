/**
 * Minimal Markdown → Lexical (Payload rich text) for seed content.
 * Supports: paragraphs (blank-line separated), `## ` / `### ` headings, `- ` bullet lists,
 * `**bold**` and `[label](/path)` links. Enough for page copy; editors take over in the admin.
 */
type Node = { type: string; version: number; [key: string]: unknown }

const base = { format: '' as const, indent: 0, version: 1, direction: 'ltr' as const }

function inline(text: string): Node[] {
  const out: Node[] = []
  const pattern = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g
  let last = 0
  for (const m of text.matchAll(pattern)) {
    if (m.index > last) out.push(textNode(text.slice(last, m.index)))
    if (m[1]) out.push(textNode(m[1], 1))
    else
      out.push({
        ...base,
        type: 'link',
        version: 3,
        fields: { linkType: 'custom', url: m[3], newTab: false },
        children: [textNode(m[2])],
      })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(textNode(text.slice(last)))
  return out
}

const textNode = (text: string, format = 0): Node => ({
  type: 'text',
  text,
  format,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

export function rt(markdown: string) {
  const children: Node[] = []
  for (const chunk of markdown.trim().split(/\n\s*\n/)) {
    const lines = chunk.trim().split('\n')
    const heading = /^(#{2,3}) (.+)$/.exec(lines[0])
    if (heading) {
      children.push({
        ...base,
        type: 'heading',
        tag: heading[1] === '##' ? 'h2' : 'h3',
        children: inline(heading[2]),
      })
      continue
    }
    if (lines.every((l) => l.startsWith('- '))) {
      children.push({
        ...base,
        type: 'list',
        listType: 'bullet',
        start: 1,
        tag: 'ul',
        children: lines.map((l, i) => ({
          ...base,
          type: 'listitem',
          value: i + 1,
          children: inline(l.slice(2)),
        })),
      })
      continue
    }
    children.push({ ...base, type: 'paragraph', textFormat: 0, children: inline(lines.join(' ')) })
  }
  return { root: { ...base, type: 'root', children } }
}
