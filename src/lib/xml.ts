/** XML character references and the five named entities, decoded. */
const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }
export const decodeXml = (s: string) =>
  s.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (m, e: string) =>
    e[0] === '#'
      ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1))
      : (entities[e] ?? m),
  )
