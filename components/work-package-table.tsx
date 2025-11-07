'use client'

import { Circle, CircleCheck, CircleDot } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { type DocumentProgress, GenerateDocumentsDialog } from '@/components/generate-documents-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/loading-spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { parallelGenerateDocuments } from '@/libs/utils/parallel-generation'

interface WorkPackage {
  id: string
  document_type: string
  document_description: string | null
  project_id: string
  requirements: Array<{
    id: string
    text: string
    priority: 'mandatory' | 'optional'
    source: string
  }>
  assigned_to: string | null
  status: 'pending' | 'in_progress' | 'review' | 'completed'
}

interface WorkPackageTableProps {
  workPackages: WorkPackage[]
  onAssignmentChange: (workPackageId: string, mockUserId: string) => void
  onStatusChange: (workPackageId: string, status: string) => void
  onOpen: (workPackageId: string) => void
  onRefresh?: () => void
}

const mockUsers = [
  { id: 'admin', name: 'Admin' },
  { id: 'writer_a', name: 'Writer A' },
  { id: 'writer_b', name: 'Writer B' },
]

const LOADING_MESSAGES = [
  'Generating documents...',
  'Extracting requirements...',
  'Mapping compliance points...',
  'Drafting responses...',
  'Refining win themes...',
  'Polishing narratives...',
] as const

export function WorkPackageTable({
  workPackages,
  onAssignmentChange,
  onStatusChange,
  onOpen,
  onRefresh,
}: WorkPackageTableProps) {
  void onStatusChange
  const [generatingIds, setGeneratingIds] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [generationProgress, setGenerationProgress] = useState<Record<string, DocumentProgress>>({})
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [currentRunIds, setCurrentRunIds] = useState<string[]>([])

  // Calculate pending documents count
  const pendingCount = workPackages.filter(wp => wp.status !== 'completed').length
  const allCompleted = pendingCount === 0
  const currentRunTotal = currentRunIds.length
  const completedThisRun = currentRunIds.filter(
    (id) => generationProgress[id]?.state === 'success'
  ).length
  const failedThisRun = currentRunIds.filter(
    (id) => generationProgress[id]?.state === 'error'
  ).length
  const headerMessage = allCompleted
    ? `All ${workPackages.length} documents completed`
    : isGenerating && currentRunTotal > 0
      ? `Generating ${completedThisRun}/${currentRunTotal} documents${failedThisRun ? ` (${failedThisRun} failed)` : ''}`
      : `${pendingCount} of ${workPackages.length} documents pending`

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CircleCheck,
          label: 'Completed',
          className: 'text-green-600',
        }
      case 'in_progress':
        return {
          icon: CircleDot,
          label: 'In Progress',
          className: 'text-amber-600',
        }
      case 'review':
        return {
          icon: CircleDot,
          label: 'In Review',
          className: 'text-blue-600',
        }
      default:
        return {
          icon: Circle,
          label: 'Not Started',
          className: 'text-gray-600',
        }
    }
  }

  useEffect(() => {
    if (!isGenerating) {
      setMessageIndex(0)
      return
    }

    const interval = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 3000)

    return () => window.clearInterval(interval)
  }, [isGenerating])

  const getUserName = (userId: string | null) => {
    if (!userId || userId === 'unassigned') return 'Unassigned'
    const user = mockUsers.find((u) => u.id === userId)
    return user?.name || 'Unassigned'
  }

  const handleDialogSubmit = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) return

    if (workPackages.length === 0) {
      toast.error('No work packages available')
      return
    }

    const projectId = workPackages[0]?.project_id
    if (!projectId) {
      toast.error('No project ID found')
      return
    }

    // Close dialog immediately so generation happens in the background
    setIsDialogOpen(false)
    setIsGenerating(true)
    setDialogError(null)
    setGeneratingIds(selectedIds)
    setCurrentRunIds(selectedIds)
    setGenerationProgress((prev) => {
      const next = { ...prev }
      selectedIds.forEach((id) => {
        next[id] = { state: 'queued' }
      })
      return next
    })

    toast.info(`Starting generation for ${selectedIds.length} documents...`)

    try {
      const result = await parallelGenerateDocuments({
        projectId,
        workPackageIds: selectedIds,
        onProgress: (update) => {
          setGenerationProgress((prev) => ({
            ...prev,
            [update.workPackageId]: {
              state: update.state,
              message: update.message,
            },
          }))
        },
      })

      if (result.failed.length > 0) {
        setDialogError('Some documents failed to generate. Please review progress and retry the failed items.')
        toast.error(
          `Generated ${result.succeeded.length} of ${selectedIds.length} documents. ${result.failed.length} failed.`
        )
      } else {
        toast.success(`Generated ${result.succeeded.length} documents successfully.`)
        setIsDialogOpen(false)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate documents'
      setDialogError(message)
      toast.error(message)
    } finally {
      setIsGenerating(false)
      setGeneratingIds([])
      setCurrentRunIds([])
      if (onRefresh) {
        await onRefresh()
      }
    }
  }

  return (
    <div className="space-y-4">
      <GenerateDocumentsDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setDialogError(null)
          }
        }}
        workPackages={workPackages.map((wp) => ({
          id: wp.id,
          document_type: wp.document_type,
          requirementsCount: wp.requirements.length,
          status: wp.status,
        }))}
        isRunning={isGenerating}
        progress={generationProgress}
        onSubmit={handleDialogSubmit}
        errorMessage={dialogError}
      />
      {/* Generate All Button */}
      <div className="flex items-center justify-between">
        <div className={`text-sm ${isGenerating ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
          {headerMessage}
        </div>
        <Button
          onClick={() => {
            if (allCompleted) {
              toast.info('All documents are already generated')
              return
            }
            setIsDialogOpen(true)
          }}
          disabled={allCompleted || isGenerating}
          size="lg"
          className="gap-2"
        >
          {isGenerating && <Spinner size="sm" className="text-muted-foreground" />}
          {allCompleted
            ? "All Documents Generated"
            : `Generate All Documents (${pendingCount})`
          }
        </Button>
      </div>

      {/* Work Packages Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Type</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workPackages.map((wp) => {
              const isDocGenerating = generatingIds.includes(wp.id)
              const statusDisplay = getStatusDisplay(wp.status)
              const StatusIcon = statusDisplay.icon

              return (
                <TableRow key={wp.id} className="bg-muted/20 hover:bg-muted/40 transition-colors">
                  <TableCell className="font-medium">{wp.document_type}</TableCell>
                  <TableCell>
                    <Select
                      value={wp.assigned_to || 'unassigned'}
                      onValueChange={(value) => onAssignmentChange(wp.id, value)}
                      disabled={isDocGenerating}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue>
                          {getUserName(wp.assigned_to)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {mockUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {isDocGenerating ? (
                      <div className="flex items-center gap-2 text-primary">
                        <Spinner size="sm" />
                        <TextShimmer className="text-sm font-semibold tracking-wide" duration={1.2}>
                          {LOADING_MESSAGES[messageIndex]}
                        </TextShimmer>
                      </div>
                    ) : (
                      <div className={`flex items-center gap-2 ${statusDisplay.className}`}>
                        <StatusIcon className="h-5 w-5" />
                        <span className="font-medium">{statusDisplay.label}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => onOpen(wp.id)}
                      disabled={isDocGenerating}
                    >
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
