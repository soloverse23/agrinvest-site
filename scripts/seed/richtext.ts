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
  // Blocks are blank-line separated, but a heading or a list may also follow a line directly.
  const blocks: string[][] = []
  let lines: string[] = []
  const flush = () => {
    if (lines.length) blocks.push(lines)
    lines = []
  }
  for (const line of markdown.trim().split('\n')) {
    const text = line.trim()
    const kind = (l: string) =>
      /^#{2,3} /.test(l) ? 'heading' : l.startsWith('- ') ? 'item' : 'text'
    if (!text) flush()
    else if (kind(text) === 'heading') {
      flush()
      lines.push(text)
      flush()
    } else {
      // A list starts or ends the block before it.
      if (lines.length && (kind(text) === 'item') !== (kind(lines[0]) === 'item')) flush()
      lines.push(text)
    }
  }
  flush()
  for (const chunk of blocks) {
    const heading = /^(#{2,3}) (.+)$/.exec(chunk[0])
    if (heading) {
      children.push({
        ...base,
        type: 'heading',
        tag: heading[1] === '##' ? 'h2' : 'h3',
        children: inline(heading[2]),
      })
      continue
    }
    if (chunk.every((l) => l.startsWith('- '))) {
      children.push({
        ...base,
        type: 'list',
        listType: 'bullet',
        start: 1,
        tag: 'ul',
        children: chunk.map((l, i) => ({
          ...base,
          type: 'listitem',
          value: i + 1,
          children: inline(l.slice(2)),
        })),
      })
      continue
    }
    children.push({ ...base, type: 'paragraph', textFormat: 0, children: inline(chunk.join(' ')) })
  }
  return { root: { ...base, type: 'root', children } }
}
