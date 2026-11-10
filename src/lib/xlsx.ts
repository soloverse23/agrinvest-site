import { inflateRawSync } from 'zlib'

import { decodeXml } from './xml'

/**
 * Just enough of XLSX to read one small sheet of numbers and labels (the Weekly Oil
 * Bulletin), so the site needs no spreadsheet library. Reads the zip's central directory,
 * inflates the parts it needs and returns each row as `{ A: '…', B: '…' }`.
 */

function unzip(buffer: Buffer): Map<string, Buffer> {
  let end = -1
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 65_557); i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      end = i
      break
    }
  }
  if (end < 0) throw new Error('Not a zip file')
  const count = buffer.readUInt16LE(end + 10)
  let p = buffer.readUInt32LE(end + 16)
  const files = new Map<string, Buffer>()
  for (let n = 0; n < count; n++) {
    if (buffer.readUInt32LE(p) !== 0x02014b50) throw new Error('Bad zip directory')
    const method = buffer.readUInt16LE(p + 10)
    const size = buffer.readUInt32LE(p + 20)
    const nameLength = buffer.readUInt16LE(p + 28)
    const extraLength = buffer.readUInt16LE(p + 30)
    const commentLength = buffer.readUInt16LE(p + 32)
    const local = buffer.readUInt32LE(p + 42)
    const name = buffer.toString('utf8', p + 46, p + 46 + nameLength)
    const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28)
    const data = buffer.subarray(start, start + size)
    files.set(name, method === 8 ? inflateRawSync(data) : data)
    p += 46 + nameLength + extraLength + commentLength
  }
  return files
}

const text = (xml: string) =>
  decodeXml([...xml.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => m[1]).join(''))

export type SheetRow = Record<string, string>

/** Rows of the first worksheet, keyed by column letter. Empty cells are left out. */
export function readFirstSheet(buffer: Buffer): SheetRow[] {
  const files = unzip(buffer)
  const sheet = files.get('xl/worksheets/sheet1.xml')?.toString('utf8')
  if (!sheet) throw new Error('No first worksheet')
  const shared = [
    ...(files.get('xl/sharedStrings.xml')?.toString('utf8') ?? '').matchAll(
      /<si>([\s\S]*?)<\/si>/g,
    ),
  ].map((m) => text(m[1]))

  return [...sheet.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map((row) => {
    const out: SheetRow = {}
    for (const c of row[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const [, col, attrs, inner = ''] = c
      const type = /t="(\w+)"/.exec(attrs)?.[1]
      const v = /<v>([\s\S]*?)<\/v>/.exec(inner)?.[1]
      const value =
        type === 's' ? shared[Number(v)] : type === 'inlineStr' ? text(inner) : v && decodeXml(v)
      if (value !== undefined && value !== '') out[col] = value
    }
    return out
  })
}

/** Excel's serial day number (1900 system) to a UTC date. */
export const excelDate = (serial: number) => new Date(Date.UTC(1899, 11, 30) + serial * 86_400_000)
