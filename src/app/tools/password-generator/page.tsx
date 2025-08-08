"use client"
import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/tools/ToolLayout'
import { Slider } from '../../components/ui/slider'
import { Switch } from '../../components/ui/switch'
import { Button } from '../../components/ui/button'

function generate(opts: { length: number; lower: boolean; upper: boolean; digits: boolean; symbols: boolean }) {
  const sets = [
    opts.lower && 'abcdefghijklmnopqrstuvwxyz',
    opts.upper && 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    opts.digits && '0123456789',
    opts.symbols && '!@#$%^&*()_+-=[]{};:,./<>?'
  ].filter(Boolean) as string[]
  const all = sets.join('')
  if (!all) return ''
  let out = ''
  for (let i = 0; i < opts.length; i++) out += all[Math.floor(Math.random() * all.length)]
  return out
}

function strength(pw: string) {
  let score = 0
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16)
  const [lower, setLower] = useState(true)
  const [upper, setUpper] = useState(true)
  const [digits, setDigits] = useState(true)
  const [symbols, setSymbols] = useState(false)
  const [history, setHistory] = useState<string[]>([])

  const pw = useMemo(() => generate({ length, lower, upper, digits, symbols }), [length, lower, upper, digits, symbols])
  const meter = strength(pw)

  return (
    <ToolLayout title="Password Generator" description="Create strong, customizable passwords and copy them instantly.">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Length: {length}</label>
            <Slider min={6} max={64} value={[length]} onValueChange={(vals) => setLength(vals[0] ?? 16)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="inline-flex items-center gap-2 text-sm"><Switch checked={lower} onCheckedChange={setLower} /> Lowercase</label>
            <label className="inline-flex items-center gap-2 text-sm"><Switch checked={upper} onCheckedChange={setUpper} /> Uppercase</label>
            <label className="inline-flex items-center gap-2 text-sm"><Switch checked={digits} onCheckedChange={setDigits} /> Digits</label>
            <label className="inline-flex items-center gap-2 text-sm"><Switch checked={symbols} onCheckedChange={setSymbols} /> Symbols</label>
          </div>
          <div className="rounded-md border p-3 font-mono">{pw}</div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 overflow-hidden rounded bg-input">
              <div className="h-2 bg-primary" style={{ width: `${(meter / 5) * 100}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">Strength: {meter}/5</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigator.clipboard.writeText(pw)}>Copy</Button>
            <Button
              variant="outline"
              onClick={() => setHistory((h) => [pw, ...h].slice(0, 20))}
            >Save</Button>
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

