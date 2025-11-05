'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

interface BulkExportButtonProps {
  projectId: string
  completedCount: number
}

export function BulkExportButton({ projectId, completedCount }: BulkExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setShowProgress(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${projectId}/export`, {
        method: 'POST'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Export failed')
      }

      // Download ZIP file directly
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'export.zip'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setShowProgress(false)
    } catch (error) {
      console.error('Bulk export error:', error)
      setError(error instanceof Error ? error.message : 'Failed to export documents')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <Button
        onClick={handleExport}
        disabled={completedCount === 0 || isExporting}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export All Completed ({completedCount})
      </Button>

      <Dialog open={showProgress} onOpenChange={setShowProgress}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exporting Documents</DialogTitle>
          </DialogHeader>
          {error ? (
            <div className="py-4 text-red-600">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p>Exporting {completedCount} documents...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
