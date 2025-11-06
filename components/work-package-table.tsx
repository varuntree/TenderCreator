'use client'

import { Circle, CircleCheck, CircleDot, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
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
import { bulkGenerateDocuments } from '@/libs/utils/bulk-generation'

interface WorkPackage {
  id: string
  document_type: string
  document_description: string | null
  requirements: Array<{
    id: string
    text: string
    priority: 'mandatory' | 'optional'
    source: string
  }>
  assigned_to: string | null
  status: 'pending' | 'in_progress' | 'completed'
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
  onStatusChange: _onStatusChange,
  onOpen,
  onRefresh,
}: WorkPackageTableProps) {
  const [generatingIds, setGeneratingIds] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)

  // Calculate pending documents count
  const pendingCount = workPackages.filter(wp => wp.status !== 'completed').length
  const allCompleted = pendingCount === 0

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

  const handleGenerateAll = async () => {
    // Get pending work packages
    const pendingWorkPackages = workPackages.filter(wp => wp.status !== 'completed')

    if (pendingWorkPackages.length === 0) {
      toast.info('All documents are already generated')
      return
    }

    // Confirm action
    const confirmed = window.confirm(
      `Generate all ${pendingWorkPackages.length} pending documents? This may take several minutes.`
    )

    if (!confirmed) return

    // Set loading state
    setIsGenerating(true)
    setGeneratingIds(pendingWorkPackages.map(wp => wp.id))

    // Show initial toast
    toast.info(`Starting generation of ${pendingWorkPackages.length} documents...`)

    try {
      // Call bulk generation
      const result = await bulkGenerateDocuments(pendingWorkPackages, (progress) => {
        // Update generating IDs based on progress
        const stillGenerating = progress
          .filter(p => p.status !== 'completed' && p.status !== 'error')
          .map(p => p.workPackageId)

        setGeneratingIds(stillGenerating)
      })

      // Show results
      const totalAttempted = result.succeeded.length + result.failed.length
      const successMessage = `Generated ${result.succeeded.length} of ${totalAttempted} documents successfully`

      if (result.failed.length > 0) {
        toast.error(`${successMessage}. ${result.failed.length} failed.`)
        console.error('[Bulk Generation] Failed documents:', result.failed)
      } else {
        toast.success(successMessage)
      }

      // Refresh work packages
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error('[Bulk Generation] Error:', error)
      toast.error('Failed to generate documents. Please try again.')
    } finally {
      // Clear loading state
      setIsGenerating(false)
      setGeneratingIds([])
    }
  }

  return (
    <div className="space-y-4">
      {/* Generate All Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {allCompleted ? (
            <span>All {workPackages.length} documents completed</span>
          ) : (
            <span>{pendingCount} of {workPackages.length} documents pending</span>
          )}
        </div>
        <Button
          onClick={handleGenerateAll}
          disabled={allCompleted || isGenerating}
          size="lg"
          className="gap-2"
        >
          {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
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
                        <Loader2 className="h-4 w-4 animate-spin" />
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
