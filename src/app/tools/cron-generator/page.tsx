"use client"
import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/tools/ToolLayout'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'

function cronToText(expr: string) {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return 'Invalid cron expression'
  return `At minute ${parts[0]}, hour ${parts[1]}, day-of-month ${parts[2]}, month ${parts[3]}, day-of-week ${parts[4]}`
}

export default function CronGeneratorPage() {
  const [m, setM] = useState('*')
  const [h, setH] = useState('*')
  const [dom, setDom] = useState('*')
  const [mon, setMon] = useState('*')
  const [dow, setDow] = useState('*')

  const expr = useMemo(() => `${m} ${h} ${dom} ${mon} ${dow}`.trim(), [m, h, dom, mon, dow])

  return (
    <ToolLayout title="Cron Expression Generator" description="Build cron expressions visually with a live explanation.">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Minute</label>
            <Input value={m} onChange={(e) => setM(e.target.value)} placeholder="*" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Hour</label>
            <Input value={h} onChange={(e) => setH(e.target.value)} placeholder="*" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Day of month</label>
            <Input value={dom} onChange={(e) => setDom(e.target.value)} placeholder="*" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Month</label>
            <Input value={mon} onChange={(e) => setMon(e.target.value)} placeholder="*" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Day of week</label>
            <Input value={dow} onChange={(e) => setDow(e.target.value)} placeholder="*" />
          </div>
          <div className="col-span-2">
            <Button onClick={() => { setM('0'); setH('0'); setDom('*'); setMon('*'); setDow('*') }}>Preset: Daily at 00:00</Button>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-md border p-3"><span className="font-mono">{expr}</span></div>
          <p className="text-sm text-muted-foreground">{cronToText(expr)}</p>
        </div>
      </div>
    </ToolLayout>
  )
}

