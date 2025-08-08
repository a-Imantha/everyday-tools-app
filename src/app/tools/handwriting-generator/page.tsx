"use client"
import { useRef, useState } from 'react'
import { ToolLayout } from '../../components/tools/ToolLayout'
import { Textarea } from '../../components/ui/textarea'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'

export default function HandwritingGeneratorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [text, setText] = useState('Hello from Everyday Tools!')
  const [font, setFont] = useState('24px "Comic Sans MS", cursive')
  const [ink, setInk] = useState('#1f2937')
  const [paper, setPaper] = useState<'lined' | 'graph' | 'blank'>('lined')

  const render = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 900
    canvas.height = 1200

    // paper background
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (paper === 'lined') {
      ctx.strokeStyle = '#93c5fd'
      for (let y = 60; y < canvas.height; y += 40) {
        ctx.beginPath()
        ctx.moveTo(40, y)
        ctx.lineTo(canvas.width - 40, y)
        ctx.stroke()
      }
      ctx.strokeStyle = '#60a5fa'
      ctx.beginPath()
      ctx.moveTo(80, 0)
      ctx.lineTo(80, canvas.height)
      ctx.stroke()
    } else if (paper === 'graph') {
      ctx.strokeStyle = '#e5e7eb'
      for (let y = 40; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(canvas.width - 40, y); ctx.stroke()
      }
      for (let x = 40; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(x, canvas.height - 40); ctx.stroke()
      }
    }

    // handwriting
    ctx.fillStyle = ink
    ctx.font = font
    ctx.textBaseline = 'top'
    const words = text.split(' ')
    let x = 90
    let y = 50
    const lineHeight = 36
    for (const word of words) {
      const w = ctx.measureText(word + ' ').width
      if (x + w > canvas.width - 60) {
        x = 90
        y += lineHeight
      }
      ctx.fillText(word + ' ', x, y)
      x += w
    }
  }

  return (
    <ToolLayout
      title="Text to Handwriting"
      description="Render your text on a simulated paper with handwriting-like font."
      controls={
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-muted-foreground">Font CSS</label>
            <Input value={font} onChange={(e) => setFont(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Ink</label>
            <Input type="color" value={ink} onChange={(e) => setInk(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Paper</label>
            <select className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={paper} onChange={(e) => setPaper(e.target.value as 'lined' | 'graph' | 'blank')}>
              <option value="lined">Lined</option>
              <option value="graph">Graph</option>
              <option value="blank">Blank</option>
            </select>
          </div>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Textarea className="min-h-[300px]" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="space-y-3">
          <div className="rounded-md border p-2">
            <canvas ref={canvasRef} className="mx-auto block h-[600px] w-[450px] bg-white" />
          </div>
          <Button onClick={render}>Render Preview</Button>
        </div>
      </div>
    </ToolLayout>
  )
}

