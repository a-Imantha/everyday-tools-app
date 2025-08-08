"use client"
import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/tools/ToolLayout'
import { Textarea } from '../../components/ui/textarea'
import { Slider } from '../../components/ui/slider'
import { Input } from '../../components/ui/input'

function applyBionic(text: string, boldPercent: number) {
  return text
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token)) return token
      const cutoff = Math.max(1, Math.ceil(token.length * boldPercent))
      return `<b>${token.slice(0, cutoff)}</b>${token.slice(cutoff)}`
    })
    .join('')
}

export default function BionicReadingPage() {
  const [text, setText] = useState('Paste or type text here...')
  const [boldness, setBoldness] = useState<number>(0.5)
  const [fontFamily, setFontFamily] = useState('system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial')

  const html = useMemo(() => applyBionic(text, boldness), [text, boldness])

  return (
    <ToolLayout
      title="Bionic Reading"
      description="Emphasize the first part of words to guide the eye and improve reading speed."
      controls={
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Boldness</label>
            <Slider value={[boldness]} min={0.1} max={0.9} step={0.05} onValueChange={(vals) => setBoldness(vals[0] ?? 0.5)} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-muted-foreground">Font Family</label>
            <Input value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} />
          </div>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Textarea className="min-h-[300px]" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="min-h-[300px] rounded-md border p-4" style={{ fontFamily }}>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </ToolLayout>
  )
}

