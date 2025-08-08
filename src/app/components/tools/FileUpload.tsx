"use client"
import { useCallback, useState } from 'react'
import { cn } from '../../lib/utils'

export function FileUpload({ onFiles }: { onFiles: (files: File[]) => void }) {
  const [isDragging, setIsDragging] = useState(false)

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const files = Array.from(e.dataTransfer.files)
      if (files.length) onFiles(files)
    },
    [onFiles]
  )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={cn(
        'flex h-40 w-full cursor-pointer items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground',
        isDragging && 'border-primary bg-primary/5'
      )}
    >
      Drag & drop files here or click to select
      <input
        className="hidden"
        type="file"
        multiple
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : []
          if (files.length) onFiles(files)
        }}
      />
    </div>
  )
}

