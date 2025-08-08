"use client"
import { useState } from 'react'
import { ToolLayout } from '../../components/tools/ToolLayout'
import { FileUpload } from '../../components/tools/FileUpload'

export default function ExifRemoverPage() {
  const [files, setFiles] = useState<File[]>([])

  // Simple client-only EXIF strip by re-encoding via canvas (lossy for JPEG)
  async function stripExif(file: File): Promise<Blob> {
    const img = document.createElement('img')
    img.src = URL.createObjectURL(file)
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    return await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92))
  }

  return (
    <ToolLayout title="EXIF Metadata Remover" description="Remove metadata by re-encoding images in the browser.">
      <div className="space-y-4">
        <FileUpload onFiles={setFiles} />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {files.map((f, i) => (
            <div key={i} className="rounded-md border p-2 text-center text-xs">
              <p className="truncate">{f.name}</p>
              <button
                className="mt-2 rounded-md border px-2 py-1 text-xs hover:bg-accent"
                onClick={async () => {
                  const cleaned = await stripExif(f)
                  const url = URL.createObjectURL(cleaned)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = f.name.replace(/\.(\w+)$/, '_cleaned.$1')
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >
                Download cleaned
              </button>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}

