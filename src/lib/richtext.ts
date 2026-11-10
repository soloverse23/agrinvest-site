/**
 * Minimal Markdown → Lexical (Payload rich text) for seed content and generated drafts.
 * Supports: paragraphs (blank-line separated), `## ` / `### ` headings, `- ` bullet lists,
 * `| a | b |` tables (the first row is the header), `**bold**` and `[label](/path)` links. Enough for page copy; editors take over in the admin.
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

const cells = (line: string) =>
  line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim())

/** The node shape of Payload's table feature. */
function table(lines: string[]): Node {
  const rows = lines.filter((l) => !/^\|[\s:|-]+\|$/.test(l)).map(cells)
  return {
    type: 'table',
    version: 1,
    format: '',
    indent: 0,
    direction: 'ltr',
    children: rows.map((row, r) => ({
      type: 'tablerow',
      version: 1,
      format: '',
      indent: 0,
      direction: 'ltr',
      children: row.map((text) => ({
        type: 'tablecell',
        version: 1,
        format: '',
        indent: 0,
        direction: 'ltr',
        // 1 marks a header row in Lexical.
        headerState: r === 0 ? 1 : 0,
        colSpan: 1,
        rowSpan: 1,
        children: [{ ...base, type: 'paragraph', textFormat: 0, children: inline(text) }],
      })),
    })),
  }
}

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
      /^#{2,3} /.test(l)
        ? 'heading'
        : l.startsWith('- ')
          ? 'item'
          : l.startsWith('|')
            ? 'row'
            : 'text'
    if (!text) flush()
    else if (kind(text) === 'heading') {
      flush()
      lines.push(text)
      flush()
    } else {
      // A list or a table starts or ends the block before it.
      if (lines.length && kind(text) !== kind(lines[0])) flush()
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
    if (chunk[0].startsWith('|')) {
      children.push(table(chunk))
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
