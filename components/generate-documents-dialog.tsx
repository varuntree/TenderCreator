'use client'

import { useEffect, useMemo, useState } from 'react'

import { StatusBadge } from '@/components/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

type WorkPackageStatus = 'pending' | 'in_progress' | 'review' | 'completed'
type ProgressState = 'idle' | 'queued' | 'running' | 'success' | 'error'

export type DocumentProgress = {
  state: ProgressState
  message?: string
}

export interface GenerateDocumentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workPackages: Array<{
    id: string
    document_type: string
    requirementsCount: number
    status: WorkPackageStatus
  }>
  isRunning: boolean
  progress?: Record<string, DocumentProgress>
  onSubmit: (selectedIds: string[]) => Promise<void> | void
  errorMessage?: string | null
}

export function GenerateDocumentsDialog({
  open,
  onOpenChange,
  workPackages,
  isRunning,
  progress,
  onSubmit,
  errorMessage,
}: GenerateDocumentsDialogProps) {
  const selectableWorkPackages = useMemo(
    () => workPackages.filter((wp) => wp.status !== 'completed'),
    [workPackages]
  )
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Auto-select all eligible work packages when opening
  useEffect(() => {
    if (!open) {
      setSelected(new Set())
      return
    }

    setSelected(new Set(selectableWorkPackages.map((wp) => wp.id)))
  }, [open, selectableWorkPackages])

  const toggleSelection = (id: string, disabled?: boolean) => {
    if (disabled || isRunning) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectedCount = selected.size
  const allDisabled = selectableWorkPackages.length === 0

  const getPrimaryCtaLabel = () => {
    if (selectedCount === 0) {
      return 'Select documents to generate'
    }

    if (selectedCount === 1) {
      return 'Generate selected document'
    }

    return `Generate ${selectedCount} documents`
  }

  const handleSubmit = async () => {
    if (selectedCount === 0 || isRunning) {
      return
    }
    await onSubmit(Array.from(selected))
  }

  const renderProgressBadge = (wpId: string) => {
    const state = progress?.[wpId]

    switch (state?.state) {
      case 'queued':
        return <Badge variant="outline">Queued</Badge>
      case 'running':
        return <Badge className="bg-primary/10 text-primary">Generating…</Badge>
      case 'success':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-700" title={state.message}>
            {state.message ?? 'Failed'}
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 p-0">
        <DialogHeader className="space-y-2 border-b px-6 py-4 text-left">
          <DialogTitle>Generate documents</DialogTitle>
          <DialogDescription>
            Select which work packages to generate. We recommend batching 2-3 at a time for
            faster, more reliable output.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-6 py-4">
          {errorMessage && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          {workPackages.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
              No work packages available yet. Analyze your RFT or add custom documents first.
            </div>
          ) : (
            <ScrollArea className="max-h-[380px] pr-4">
              <div className="space-y-3">
                {workPackages.map((wp) => {
                  const isCompleted = wp.status === 'completed'
                  const disabled = isCompleted || isRunning
                  const isChecked = !isCompleted && selected.has(wp.id)
                  const progressBadge = renderProgressBadge(wp.id)

                  return (
                    <div
                      key={wp.id}
                      role="button"
                      tabIndex={disabled ? -1 : 0}
                      aria-pressed={isChecked}
                      onClick={() => toggleSelection(wp.id, disabled)}
                      onKeyDown={(event) => {
                        if (disabled) return
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          toggleSelection(wp.id)
                        }
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2',
                        disabled && 'cursor-not-allowed opacity-60',
                        isChecked && !disabled && 'border-primary bg-primary/5'
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleSelection(wp.id, disabled)}
                        disabled={disabled}
                      />
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{wp.document_type}</p>
                          <StatusBadge status={isCompleted ? 'completed' : wp.status} />
                          {progressBadge}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {wp.requirementsCount} requirement{wp.requirementsCount === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <span>
              {selectedCount === 0
                ? 'Select at least one document to generate.'
                : `${selectedCount} document${selectedCount === 1 ? '' : 's'} selected.`}
            </span>
            {isRunning && (
              <span className="text-xs text-muted-foreground">
                Generation keeps running even if you close this dialog. Reopen anytime to monitor progress.
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedCount === 0 || isRunning || allDisabled}
              className="min-w-[220px]"
            >
              {getPrimaryCtaLabel()}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
