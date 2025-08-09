"use client"
import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/tools/ToolLayout'
import { Slider } from '../../components/ui/slider'
import { Switch } from '../../components/ui/switch'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

type GenOptions = { length: number; lower: boolean; upper: boolean; digits: boolean; symbols: boolean; excludeSimilar: boolean; excludeChars: string; ensureEachSet: boolean }

function buildAlphabet(opts: GenOptions): string[] {
  let lower = 'abcdefghijklmnopqrstuvwxyz'
  let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let digits = '0123456789'
  let symbols = '!@#$%^&*()_+-=[]{};:,./<>?'
  if (opts.excludeSimilar) {
    const similar = /[O0l1I|]/g
    lower = lower.replace(similar, '')
    upper = upper.replace(similar, '')
    digits = digits.replace(similar, '')
    symbols = symbols.replace(similar, '')
  }
  const remove = new RegExp('[' + opts.excludeChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ']', 'g')
  lower = lower.replace(remove, '')
  upper = upper.replace(remove, '')
  digits = digits.replace(remove, '')
  symbols = symbols.replace(remove, '')
  const sets = [opts.lower && lower, opts.upper && upper, opts.digits && digits, opts.symbols && symbols].filter(Boolean) as string[]
  return sets
}

function generate(opts: GenOptions) {
  const sets = buildAlphabet(opts)
  const all = sets.join('')
  if (!all) return ''
  const rand = (n: number) => {
    const g = (globalThis as unknown as { crypto?: Crypto })
    if (!g.crypto || typeof g.crypto.getRandomValues !== 'function') {
      throw new Error('Web Crypto is unavailable in this environment')
    }
    const cryptoRef = g.crypto!
    const buf = new Uint32Array(1)
    cryptoRef.getRandomValues(buf)
    const val = buf[0] ?? 0
    return val % n
  }
  const result: string[] = []
  if (opts.ensureEachSet) {
    for (const s of sets) result.push(s.charAt(rand(s.length)))
  }
  while (result.length < opts.length) result.push(all.charAt(rand(all.length)))
  // shuffle (TS-safe with explicit temps)
  for (let i = result.length - 1; i > 0; i--) {
    const j = rand(i + 1)
    const a = result[i] as string
    const b = result[j] as string
    result[i] = b
    result[j] = a
  }
  return result.slice(0, opts.length).join('')
}

function strengthBits(pw: string, opts: GenOptions) {
  const sets = buildAlphabet(opts)
  const size = sets.reduce((n, s) => n + s.length, 0)
  const bits = Math.log2(Math.max(1, size)) * pw.length
  return Math.round(bits)
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16)
  const [lower, setLower] = useState(true)
  const [upper, setUpper] = useState(true)
  const [digits, setDigits] = useState(true)
  const [symbols, setSymbols] = useState(false)
  const [excludeSimilar, setExcludeSimilar] = useState(false)
  const [ensureEachSet, setEnsureEachSet] = useState(true)
  const [excludeChars, setExcludeChars] = useState('')
  const [batch, setBatch] = useState(5)
  const [history, setHistory] = useState<string[]>([])

  const opts: GenOptions = { length, lower, upper, digits, symbols, excludeSimilar, excludeChars, ensureEachSet }
  const pw = useMemo(() => generate(opts), [opts.length, opts.lower, opts.upper, opts.digits, opts.symbols, opts.excludeSimilar, opts.excludeChars, opts.ensureEachSet])
  const bits = strengthBits(pw, opts)

  return (
    <ToolLayout title="Password Generator" description="Create strong, customizable passwords and copy them instantly.">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Length: {length}</label>
            <Slider min={6} max={128} value={[length]} onValueChange={(vals) => setLength(vals[0] ?? 16)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="inline-flex items-center gap-2 text-sm"><Switch checked={lower} onCheckedChange={setLower} /> Lowercase</label>
            <label className="inline-flex items-center gap-2 text-sm"><Switch checked={upper} onCheckedChange={setUpper} /> Uppercase</label>
            <label className="inline-flex items-center gap-2 text-sm"><Switch checked={digits} onCheckedChange={setDigits} /> Digits</label>
            <label className="inline-flex items-center gap-2 text-sm"><Switch checked={symbols} onCheckedChange={setSymbols} /> Symbols</label>
            <label className="inline-flex items-center gap-2 text-sm"><Switch checked={excludeSimilar} onCheckedChange={setExcludeSimilar} /> Exclude similar (0/O, 1/l)</label>
            <label className="inline-flex items-center gap-2 text-sm"><Switch checked={ensureEachSet} onCheckedChange={setEnsureEachSet} /> Include from each set</label>
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Exclude characters</label>
            <Input value={excludeChars} onChange={(e) => setExcludeChars(e.target.value)} placeholder="e.g. @#$%" />
          </div>
          <div className="rounded-md border p-3 font-mono">{pw}</div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 overflow-hidden rounded bg-input">
              <div className="h-2 bg-primary" style={{ width: `${Math.min(100, (bits / 128) * 100)}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">Entropy: {bits} bits</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigator.clipboard.writeText(pw)}>Copy</Button>
            <Button
              variant="outline"
              onClick={() => setHistory((h) => [pw, ...h].slice(0, 20))}
            >Save</Button>
          </div>
          <div className="grid grid-cols-2 items-end gap-2">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Batch generate</label>
              <Input type="number" min={1} max={50} value={batch} onChange={(e) => setBatch(Number(e.target.value))} />
            </div>
            <Button onClick={() => {
              const list = Array.from({ length: Math.min(50, Math.max(1, batch)) }, () => generate(opts))
              setHistory((h) => [...list, ...h].slice(0, 200))
            }}>Generate Batch</Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => downloadCsv(history)}>Export CSV</Button>
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(history.join('\n'))}>Copy All</Button>
            <Button variant="outline" onClick={() => setHistory([])}>Clear History</Button>
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium">History (session)</h3>
          <div className="space-y-2">
            {history.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border p-2 font-mono text-sm">
                <span className="truncate">{p}</span>
                <Button size="sm" onClick={() => navigator.clipboard.writeText(p)}>Copy</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}

function downloadCsv(list: string[]) {
  const rows = list.map((p, i) => `${i + 1},"${p.replaceAll('"', '""')}"`).join('\n')
  const header = 'index,password\n'
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'passwords.csv'; a.click(); URL.revokeObjectURL(url)
}

