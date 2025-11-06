'use client'

import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
  accept?: string
}

type UploadTab = 'upload' | 'paste'

export default function FileUpload({ onUpload, accept = '.pdf,.docx,.txt' }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [activeTab, setActiveTab] = useState<UploadTab>('upload')
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFile = async (file: File) => {
    try {
      setUploading(true)
      await onUpload(file)
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0])
    }
  }

  const openFileDialog = () => {
    if (!uploading) {
      inputRef.current?.click()
    }
  }

  return (
    <section className="rounded-3xl border bg-card shadow-sm">
      <div className="flex gap-2 border-b px-6 pt-4">
        {(
          [
            { key: 'upload', label: 'File Upload', disabled: false },
            { key: 'paste', label: 'Paste Text', disabled: true },
          ] as Array<{ key: UploadTab; label: string; disabled: boolean }>
        ).map(tab => (
          <button
            key={tab.key}
            type="button"
            disabled={tab.disabled}
            onClick={() => !tab.disabled && setActiveTab(tab.key)}
            className={cn(
              'relative -mb-px rounded-t-2xl px-4 py-2 text-sm font-semibold transition',
              tab.key === activeTab
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
              tab.disabled && 'cursor-not-allowed opacity-60'
            )}
          >
            {tab.label}
            {tab.disabled && <span className="ml-2 text-xs font-medium text-muted-foreground">Soon</span>}
          </button>
        ))}
      </div>

      <div className="space-y-6 px-6 py-8">
        <input
          type="file"
          id="file-upload"
          ref={inputRef}
          className="hidden"
          onChange={handleChange}
          accept={accept}
          disabled={uploading}
        />

        <div
          role="button"
          tabIndex={0}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openFileDialog()
            }
          }}
          className={cn(
            'relative w-full rounded-2xl border-2 border-dashed px-6 py-10 text-left transition',
            dragActive ? 'border-emerald-400 bg-emerald-50' : 'border-muted'
          )}
          onClick={openFileDialog}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="md" text="Uploading file..." />
            </div>
          ) : (
            <div className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-medium text-foreground">Drag and drop your files here</p>
                <p className="text-xs text-muted-foreground">
                  Limit 512 MB per file. We accept pdf, doc, docx, txt, msg, odt, odp, csv, ppt and xls files.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={event => {
                  event.preventDefault()
                  event.stopPropagation()
                  openFileDialog()
                }}
                className="shrink-0"
              >
                Browse Files
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-dashed border-muted px-4 py-3 text-xs text-muted-foreground">
          Summaries will use uploaded files to extract requirements and build your work packages. Paste Text coming soon.
        </div>
      </div>
    </section>
  )
}
