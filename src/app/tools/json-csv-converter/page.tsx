"use client"
import { useMemo, useRef, useState } from 'react'
import { ToolLayout } from '../../components/tools/ToolLayout'
import { Textarea } from '../../components/ui/textarea'
import { Button } from '../../components/ui/button'
import { FileUpload } from '../../components/tools/FileUpload'
import { detectDelimiter, parseCSV, stringifyCSV, type CsvOptions } from '../../lib/csv'

function jsonToCsv(json: Array<Record<string, unknown>>): string {
  if (!json.length) return ''
  const headers = Array.from(
    json.reduce((s, r) => {
      Object.keys(r).forEach((k) => s.add(k))
      return s
    }, new Set<string>())
  )
  const rows = json.map((row) => headers.map((h) => JSON.stringify((row as Record<string, unknown>)[h] ?? '')).join(','))
  return [headers.join(','), ...rows].join('\n')
}

function csvToJson(csv: string): Array<Record<string, unknown>> {
  const [headerLine, ...lines] = csv.split(/\r?\n/).filter(Boolean)
  if (!headerLine) return []
  const headers = headerLine.split(',')
  return lines.map((line) => {
    const cols = line.split(',').map((c) => {
      try { return JSON.parse(c) as unknown } catch { return c as unknown }
    })
    return Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? '']))
  })
}

export default function JsonCsvConverterPage() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [mode, setMode] = useState<'json2csv' | 'csv2json'>('json2csv')
  const [delimiter, setDelimiter] = useState<CsvOptions['delimiter']>(',')
  const [quote, setQuote] = useState<CsvOptions['quote']>('"')
  const [headers, setHeaders] = useState(true)
  const [encoding, setEncoding] = useState<'utf-8' | 'windows-1252' | 'iso-8859-1'>('utf-8')
  const dataRef = useRef<Array<Record<string, unknown>>>([])

  const sampleJson = useMemo(() => (
    [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' },
    ]
  ), [])

  const convert = () => {
    try {
      if (mode === 'json2csv') {
        const data = JSON.parse(left) as unknown
        const arr: Array<Record<string, unknown>> = Array.isArray(data) ? (data as Array<Record<string, unknown>>) : [data as Record<string, unknown>]
        dataRef.current = arr
        setRight(stringifyCSV(arr, { delimiter, quote, headers }))
      } else {
        const rows = parseCSV(left, { delimiter, quote, headers })
        dataRef.current = rows
        setRight(JSON.stringify(rows, null, 2))
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setRight(`Error: ${msg}`)
    }
  }

  const onUpload = async (files: File[]) => {
    const file = files[0]
    if (!file) return
    const buf = await file.arrayBuffer()
    const txt = new TextDecoder(encoding).decode(buf)
    if (mode === 'csv2json') {
      const det = detectDelimiter(txt)
      setDelimiter(det)
    }
    setLeft(txt)
  }

  const download = (as: 'json' | 'csv') => async () => {
    if (as === 'json') {
      const blob = new Blob([JSON.stringify(dataRef.current, null, 2)], { type: 'application/json' })
      triggerDownload(blob, 'data.json')
    } else {
      const csv = stringifyCSV(dataRef.current, { delimiter, quote, headers })
      const blob = new Blob([csv], { type: 'text/csv' })
      triggerDownload(blob, 'data.csv')
    }
  }

  return (
    <ToolLayout title="JSON ⇄ CSV Converter" description="Convert between JSON and CSV with upload, options, and download.">
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={mode} onChange={(e) => setMode(e.target.value as 'json2csv' | 'csv2json')}>
          <option value="json2csv">JSON → CSV</option>
          <option value="csv2json">CSV → JSON</option>
        </select>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={delimiter} onChange={(e) => setDelimiter(e.target.value as CsvOptions['delimiter'])}>
          <option value=",">Comma ,</option>
          <option value=";">Semicolon ;</option>
          <option value="\t">Tab \t</option>
        </select>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={quote} onChange={(e) => setQuote(e.target.value as CsvOptions['quote'])}>
          <option value='"'>Quote &quot;</option>
          <option value="'">Apostrophe &#39;</option>
        </select>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={headers} onChange={(e) => setHeaders(e.target.checked)} /> Headers
        </label>
        <div className="sm:col-span-2">
          <select className="h-9 rounded-md border bg-background px-3 text-sm" value={encoding} onChange={(e) => setEncoding(e.target.value as 'utf-8' | 'windows-1252' | 'iso-8859-1')}>
            <option value="utf-8">UTF-8</option>
            <option value="windows-1252">Windows-1252</option>
            <option value="iso-8859-1">ISO-8859-1</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button onClick={convert}>Convert</Button>
          <Button variant="outline" onClick={() => { setLeft(JSON.stringify(sampleJson, null, 2)); setMode('json2csv') }}>Sample JSON</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <FileUpload onFiles={onUpload} />
          <Textarea className="min-h-[280px] font-mono" value={left} onChange={(e) => setLeft(e.target.value)} placeholder={mode === 'json2csv' ? '[{"a":1}]' : 'a,b\n1,2'} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => navigator.clipboard.writeText(left)}>Copy Left</Button>
            <Button size="sm" variant="outline" onClick={() => setLeft('')}>Clear</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Textarea className="min-h-[280px] font-mono" value={right} onChange={(e) => setRight(e.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => navigator.clipboard.writeText(right)}>Copy Right</Button>
            <Button size="sm" onClick={download(mode === 'json2csv' ? 'csv' : 'json')}>Download {mode === 'json2csv' ? 'CSV' : 'JSON'}</Button>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

