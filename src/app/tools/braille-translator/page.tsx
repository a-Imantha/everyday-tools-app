"use client"
import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/tools/ToolLayout'
import { Textarea } from '../../components/ui/textarea'

const map: Record<string, string> = {
  a: '⠁', b: '⠃', c: '⠉', d: '⠙', e: '⠑', f: '⠋', g: '⠛', h: '⠓', i: '⠊', j: '⠚',
  k: '⠅', l: '⠇', m: '⠍', n: '⠝', o: '⠕', p: '⠏', q: '⠟', r: '⠗', s: '⠎', t: '⠞',
  u: '⠥', v: '⠧', w: '⠺', x: '⠭', y: '⠽', z: '⠵', ' ': ' ', '.': '⠲', ',': '⠂'
}

export default function BrailleTranslatorPage() {
  const [text, setText] = useState('Hello')
  const braille = useMemo(() => text.split('').map((ch) => map[ch.toLowerCase()] ?? ch).join(''), [text])

  return (
    <ToolLayout title="Braille Translator" description="Convert plain text to Unicode Braille.">
      <div className="grid gap-4 lg:grid-cols-2">
        <Textarea className="min-h-[240px]" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="min-h-[240px] rounded-md border p-4 text-3xl leading-relaxed">{braille}</div>
      </div>
    </ToolLayout>
  )
}

