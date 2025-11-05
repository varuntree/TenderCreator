'use client'

import { useState } from 'react'

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
  accept?: string
}

export default function FileUpload({ onUpload, accept = '.pdf,.docx,.txt' }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
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

  return (
    <div
      className={`relative rounded-lg border-2 border-dashed p-8 text-center ${
        dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleChange}
        accept={accept}
        disabled={uploading}
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="text-sm text-gray-600">
          {uploading ? (
            <p>Uploading and extracting text...</p>
          ) : (
            <>
              <p className="mb-2">Drag and drop file here or click to browse</p>
              <p className="text-xs text-gray-500">PDF, DOCX, TXT (max 50MB)</p>
            </>
          )}
        </div>
      </label>
    </div>
  )
}
