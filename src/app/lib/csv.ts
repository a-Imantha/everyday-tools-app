export type CsvOptions = {
  delimiter: ',' | ';' | '\t'
  quote: '"' | '\''
  headers: boolean
}

export function detectDelimiter(sample: string): CsvOptions['delimiter'] {
  const lines = sample.split(/\r?\n/).slice(0, 5)
  const counts = [',', ';', '\t'].map((d) => lines.map((l) => (l.match(new RegExp(escapeRegex(d), 'g')) || []).length).reduce((a, b) => a + b, 0))
  const idx = counts.indexOf(Math.max(...counts))
  return idx === 0 ? ',' : idx === 1 ? ';' : '\t'
}

export function parseCSV(input: string, opt: CsvOptions): Array<Record<string, string>> {
  const rows: string[][] = []
  const delimiter = opt.delimiter
  const quote = opt.quote
  let i = 0
  let field = ''
  let row: string[] = []
  let inQuotes = false
  while (i < input.length) {
    const char = input[i]
    if (inQuotes) {
      if (char === quote) {
        if (input[i + 1] === quote) { field += quote; i += 2; continue } // escaped quote
        inQuotes = false
        i++
      } else {
        field += char; i++
      }
    } else {
      if (char === quote) { inQuotes = true; i++; continue }
      if (char === delimiter) { row.push(field); field = ''; i++; continue }
      if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue }
      if (char === '\r') { i++; continue }
      field += char; i++
    }
  }
  row.push(field); rows.push(row)

  if (opt.headers) {
    const headers = rows.shift() || []
    return rows.map((r) => Object.fromEntries(headers.map((h, idx) => [h, r[idx] ?? ''])))
  }
  const maxLen = rows.reduce((m, r) => Math.max(m, r.length), 0)
  const headers = Array.from({ length: maxLen }, (_, i2) => `col${i2 + 1}`)
  return rows.map((r) => Object.fromEntries(headers.map((h, idx) => [h, r[idx] ?? ''])))
}

export function stringifyCSV(rows: Array<Record<string, unknown>>, opt: CsvOptions): string {
  if (!rows.length) return ''
  const delimiter = opt.delimiter
  const quote = opt.quote
  const headers = Array.from(rows.reduce((s, r) => { Object.keys(r).forEach((k) => s.add(k)); return s }, new Set<string>()))
  const escapeField = (val: unknown) => {
    const str = valueToString(val)
    const needs = str.includes('\n') || str.includes('\r') || str.includes(delimiter) || str.includes(quote)
    const body = str.replaceAll(quote, quote + quote)
    return needs ? quote + body + quote : body
  }
  const out: string[] = []
  if (opt.headers) out.push(headers.map(escapeField).join(delimiter))
  for (const row of rows) {
    out.push(headers.map((h) => escapeField((row as Record<string, unknown>)[h])).join(delimiter))
  }
  return out.join('\n')
}

function valueToString(val: unknown): string {
  if (val == null) return ''
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

function escapeRegex(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

