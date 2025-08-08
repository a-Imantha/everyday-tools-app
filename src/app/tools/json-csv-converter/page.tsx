"use client"
import { useState } from 'react'
import { ToolLayout } from '../../components/tools/ToolLayout'
import { Textarea } from '../../components/ui/textarea'
import { Button } from '../../components/ui/button'

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

  const convert = () => {
    try {
      if (mode === 'json2csv') {
        const data = JSON.parse(left) as unknown
        const arr: Array<Record<string, unknown>> = Array.isArray(data) ? (data as Array<Record<string, unknown>>) : [data as Record<string, unknown>]
        setRight(jsonToCsv(arr))
      } else {
        const json = csvToJson(left)
        setRight(JSON.stringify(json, null, 2))
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setRight(`Error: ${msg}`)
    }
  }

  return (
    <ToolLayout title="JSON ⇄ CSV Converter" description="Convert between JSON and CSV formats in the browser.">
      <div className="mb-3 flex gap-2">
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={mode} onChange={(e) => setMode(e.target.value as 'json2csv' | 'csv2json')}>
          <option value="json2csv">JSON → CSV</option>
          <option value="csv2json">CSV → JSON</option>
        </select>
        <Button onClick={convert}>Convert</Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Textarea className="min-h-[300px] font-mono" value={left} onChange={(e) => setLeft(e.target.value)} placeholder={mode === 'json2csv' ? '[{"a":1}]' : 'a,b\n1,2'} />
        <Textarea className="min-h-[300px] font-mono" value={right} onChange={(e) => setRight(e.target.value)} />
      </div>
    </ToolLayout>
  )
}

