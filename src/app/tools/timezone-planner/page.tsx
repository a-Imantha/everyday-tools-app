"use client"
import { useEffect, useMemo, useState } from 'react'
import { ToolLayout } from '../../components/tools/ToolLayout'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'

type Participant = { id: string; zone: string; name?: string; start: number; end: number }

export default function TimezonePlannerPage() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [zoneInput, setZoneInput] = useState('America/New_York')
  const [nameInput, setNameInput] = useState('Alice')
  const [start, setStart] = useState(9)
  const [end, setEnd] = useState(17)
  const [durationMin, setDurationMin] = useState(30)
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10))

  useEffect(() => {
    if (participants.length === 0) {
      setParticipants([
        { id: cryptoRandom(), zone: 'UTC', name: 'You', start: 9, end: 17 },
        { id: cryptoRandom(), zone: 'America/New_York', name: 'Alice', start: 9, end: 17 },
        { id: cryptoRandom(), zone: 'Europe/London', name: 'Bob', start: 9, end: 17 },
      ])
    }
  }, [participants.length])

  const suggestions = useMemo(() => suggestMeetings(participants, date, durationMin), [participants, date, durationMin])

  return (
    <ToolLayout title="Timezone Meeting Planner" description="Find overlapping working hours across time zones and export an invite.">
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-muted-foreground">Timezone</label>
            <Input value={zoneInput} onChange={(e) => setZoneInput(e.target.value)} placeholder="e.g. Asia/Tokyo" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Name</label>
            <Input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Optional" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Work start (hour)</label>
            <Input type="number" min={0} max={23} value={start} onChange={(e) => setStart(Number(e.target.value))} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Work end (hour)</label>
            <Input type="number" min={0} max={23} value={end} onChange={(e) => setEnd(Number(e.target.value))} />
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => {
                if (!zoneInput) return
                setParticipants((p) => [...p, { id: cryptoRandom(), zone: zoneInput, name: nameInput || undefined, start, end }])
                setNameInput('')
              }}
            >
              Add participant
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-md border p-2 text-sm">
              <span className="font-medium">{p.name || 'Participant'}</span>
              <span className="text-muted-foreground">{p.zone}</span>
              <span className="ml-auto text-muted-foreground">{p.start}:00–{p.end}:00</span>
              <Button size="sm" variant="outline" onClick={() => setParticipants((all) => all.filter((x) => x.id !== p.id))}>Remove</Button>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Meeting date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Duration (minutes)</label>
            <Input type="number" min={15} step={15} value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Suggested times (top 5)</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {suggestions.slice(0, 5).map((s, idx) => (
              <div key={idx} className="rounded-md border p-3 text-sm">
                <div className="mb-2 font-medium">{s.label}</div>
                <ul className="space-y-1">
                  {s.lines.map((ln, i) => (<li key={i}>{ln}</li>))}
                </ul>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={() => copyText(s.copy)}>Copy</Button>
                  <Button size="sm" variant="outline" onClick={() => exportICS(s)}>Export .ics</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}

function suggestMeetings(participants: Participant[], date: string, durationMin: number) {
  if (participants.length === 0) return [] as Array<{ label: string; copy: string; lines: string[]; start: Date; end: Date }>
  const organizerTz: string = participants[0]?.zone ?? 'UTC'
  const baseDay = new Date(`${date}T00:00:00`)

  const candidates: Array<{ start: Date; end: Date; score: number }> = []
  for (let hour = 6; hour <= 20; hour++) {
    const start = zonedDate(baseDay, organizerTz, hour, 0)
    const end = new Date(start.getTime() + durationMin * 60000)
    let score = 0
    for (const p of participants) {
      const localStart = convertDate(start, p.zone)
      const h = localStart.getHours()
      const ok = h >= p.start && h + durationMin / 60 <= p.end
      score += ok ? 1 : 0
    }
    candidates.push({ start, end, score })
  }
  candidates.sort((a, b) => b.score - a.score)
  return candidates.slice(0, 10).map((c) => formatSuggestion(c.start, c.end, participants))
}

function formatSuggestion(start: Date, end: Date, participants: Participant[]) {
  const lines = participants.map((p) => `${p.name || 'Participant'}: ${fmt(start, p.zone)} – ${fmt(end, p.zone)} (${p.zone})`)
  return {
    label: `${fmt(start, participants[0]?.zone || 'UTC')} – ${fmt(end, participants[0]?.zone || 'UTC')} (${participants[0]?.zone || 'UTC'})`,
    copy: lines.join('\n'),
    lines,
    start,
    end,
  }
}

function fmt(d: Date, tz: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: tz }).format(d)
}

function convertDate(d: Date, tz: string) {
  return new Date(new Intl.DateTimeFormat('en-US', { timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d).replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})/, '$3-$1-$2T$4:$5:00'))
}

function zonedDate(base: Date, tz: string, hour: number, minute: number) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(base)
  const year = Number(parts.find((p) => p.type === 'year')?.value)
  const month = Number(parts.find((p) => p.type === 'month')?.value)
  const day = Number(parts.find((p) => p.type === 'day')?.value)
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
  return new Date(iso)
}

function exportICS(s: { start: Date; end: Date }) {
  const uid = cryptoRandom()
  const dt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Everyday Tools//Timezone Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dt(new Date())}`,
    `DTSTART:${dt(s.start)}`,
    `DTEND:${dt(s.end)}`,
    'SUMMARY:Meeting',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'meeting.ics'; a.click(); URL.revokeObjectURL(url)
}

function copyText(t: string) { navigator.clipboard.writeText(t) }

function cryptoRandom() { return Math.random().toString(36).slice(2) }

