"use client"
import { Button } from '../ui/button'

export function DownloadButton({ filename, getData }: { filename: string; getData: () => Promise<Blob | string> }) {
  const onClick = async () => {
    const data = await getData()
    let blob: Blob
    if (typeof data === 'string') {
      blob = new Blob([data], { type: 'text/plain' })
    } else {
      blob = data
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return <Button onClick={onClick}>Download</Button>
}

