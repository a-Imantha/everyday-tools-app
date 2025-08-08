"use client"
import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/tools/ToolLayout'
import { Input } from '../../components/ui/input'

export default function TimezonePlannerPage() {
  const [zones, setZones] = useState<string[]>(['UTC', 'America/New_York', 'Europe/London'])
  const [time, setTime] = useState<string>('09:00')

  const results = useMemo(() => {
    const [hStr, mStr] = time.split(':')
    const h = Number(hStr ?? 0)
    const m = Number(mStr ?? 0)
    const base = new Date()
    base.setUTCHours(h, m, 0, 0)
    return zones.map((z) => ({
      zone: z,
      local: new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: z }).format(base),
    }))
  }, [zones, time])

  return (
    <ToolLayout title="Timezone Meeting Planner" description="Compare a chosen UTC time across multiple time zones.">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">UTC Time</label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Add Timezone (IANA)</label>
            <Input
              placeholder="e.g. Asia/Tokyo"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const v = (e.target as HTMLInputElement).value.trim()
                  if (v && !zones.includes(v)) setZones((z) => [...z, v])
                  ;(e.target as HTMLInputElement).value = ''
                }
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Time Zone</th>
                <th className="py-2">Local Time</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.zone} className="border-b last:border-0">
                  <td className="py-2 font-medium">{r.zone}</td>
                  <td className="py-2">{r.local}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolLayout>
  )
}

