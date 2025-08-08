"use client"
import { useState } from 'react'
import { ToolLayout } from '../../components/tools/ToolLayout'
import { FileUpload } from '../../components/tools/FileUpload'
import { Textarea } from '../../components/ui/textarea'
import { Button } from '../../components/ui/button'

export default function ImageBase64Page() {
  const [file, setFile] = useState<File | null>(null)
  const [base64, setBase64] = useState('')

  const onFiles = (files: File[]) => {
    const f = files[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = () => setBase64(String(reader.result))
    reader.readAsDataURL(f)
  }

  return (
    <ToolLayout title="Image to Base64" description="Convert images to Base64 data URLs in your browser.">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <FileUpload onFiles={onFiles} />
          {file ? <img src={URL.createObjectURL(file)} alt="preview" className="max-h-64 rounded-md border" /> : null}
        </div>
        <div className="space-y-3">
          <Textarea className="min-h-[300px] font-mono" value={base64} onChange={(e) => setBase64(e.target.value)} />
          <div className="flex gap-2">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(base64)
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}

