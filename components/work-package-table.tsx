'use client'

import { Circle, CircleCheck, CircleDot } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { type DocumentProgress, GenerateDocumentsDialog } from '@/components/generate-documents-dialog'
import { GenerationAgentsPanel } from '@/components/generation-agents-panel'
import { Badge } from '@/components/ui/badge'
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { getDisplayWorkPackageStatus } from '@/libs/repositories/work-packages'
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
  hasGeneratedContent?: boolean
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
  const [drawerWorkPackage, setDrawerWorkPackage] = useState<WorkPackage | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Calculate pending documents count
  const pendingCount = workPackages.filter(
    (wp) => getDisplayWorkPackageStatus(wp) !== 'completed'
  ).length
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
  const detailMessage = isGenerating ? LOADING_MESSAGES[messageIndex] : 'Idle'
  const workPackageLabels = useMemo(() => {
    const map = new Map<string, string>()
    workPackages.forEach((wp) => {
      map.set(wp.id, wp.document_type)
    })
    return map
  }, [workPackages])

  const agentCards = useMemo(
    () =>
      currentRunIds.map((id) => ({
        id,
        label: workPackageLabels.get(id) ?? `Document ${id}`,
        state: generationProgress[id]?.state ?? 'queued',
      })),
    [currentRunIds, generationProgress, workPackageLabels]
  )

  const progressPercent = useMemo(() => {
    if (!isGenerating || currentRunTotal === 0) return 0
    const weights: Record<string, number> = {
      success: 1,
      error: 1,
      running: 0.65,
      queued: 0.35,
    }

    const aggregate = currentRunIds.reduce((acc, id) => {
      const state = generationProgress[id]?.state
      const weight = state ? weights[state] ?? 0 : 0
      return acc + weight
    }, 0)

    return Math.min(100, Math.round((aggregate / currentRunTotal) * 100))
  }, [currentRunIds, currentRunTotal, generationProgress, isGenerating])

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
    }, 4800)

    return () => window.clearInterval(interval)
  }, [isGenerating])

  useEffect(() => {
    if (!drawerWorkPackage) return
    const latest = workPackages.find((wp) => wp.id === drawerWorkPackage.id)
    if (latest && latest !== drawerWorkPackage) {
      setDrawerWorkPackage(latest)
    }
  }, [drawerWorkPackage, workPackages])

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

      if (result.executionMode === 'fallback_sequential') {
        toast.info('Gemini fallback engaged – documents generated sequentially for reliability.')
      }

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

  const openDrawer = (wp: WorkPackage) => {
    setDrawerWorkPackage(wp)
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setDrawerWorkPackage(null)
  }

  const handleDrawerAssignmentChange = (value: string) => {
    if (!drawerWorkPackage) return
    onAssignmentChange(drawerWorkPackage.id, value)
    setDrawerWorkPackage({
      ...drawerWorkPackage,
      assigned_to: value === 'unassigned' ? null : value,
    })
  }

  const drawerStatus = drawerWorkPackage
    ? getStatusDisplay(getDisplayWorkPackageStatus(drawerWorkPackage))
    : null

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
          status: getDisplayWorkPackageStatus(wp),
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

      {isGenerating && currentRunTotal > 0 && (
        <GenerationAgentsPanel
          progressPercent={progressPercent}
          totalDocs={currentRunTotal}
          completedDocs={completedThisRun}
          failedDocs={failedThisRun}
          message={headerMessage}
          detailMessage={detailMessage}
          className="animate-in fade-in slide-in-from-bottom-2"
          agents={agentCards}
        />
      )}

      {/* Work Packages Table */}
      <div className="hidden rounded-lg border bg-card md:block">
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
              const effectiveStatus = getDisplayWorkPackageStatus(wp)
              const statusDisplay = getStatusDisplay(effectiveStatus)
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
                        <TextShimmer className="text-sm font-semibold tracking-wide" duration={2.4}>
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

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {workPackages.map((wp) => {
          const effectiveStatus = getDisplayWorkPackageStatus(wp)
          const statusDisplay = getStatusDisplay(effectiveStatus)
          return (
            <article
              key={wp.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              data-testid="work-package-row"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">{wp.document_type}</p>
                  <p className="text-sm text-muted-foreground">{getUserName(wp.assigned_to)}</p>
                  <p className="text-xs text-muted-foreground">
                    {wp.requirements.length} requirements tracked
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs font-medium">
                  {statusDisplay.label}
                </Badge>
              </div>
              {wp.document_description ? (
                <p className="mt-3 text-sm text-slate-600">{wp.document_description}</p>
              ) : null}
              <div className="mt-4 flex flex-col gap-2">
                <Button size="lg" onClick={() => onOpen(wp.id)}>
                  Open workspace
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => openDrawer(wp)}
                  data-testid="work-package-view-details"
                >
                  View details
                </Button>
              </div>
            </article>
          )
        })}
      </div>

      <Sheet open={isDrawerOpen} onOpenChange={(open) => (open ? setIsDrawerOpen(true) : closeDrawer())}>
        <SheetContent
          side="bottom"
          className="h-[80vh] rounded-t-[32px] border-none bg-white p-6"
          data-testid="work-package-drawer"
        >
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" aria-hidden />
          {drawerWorkPackage ? (
            <div className="flex h-full flex-col overflow-hidden">
              <SheetHeader className="text-left">
                <SheetTitle className="text-2xl text-slate-900">
                  {drawerWorkPackage.document_type}
                </SheetTitle>
                <p className="text-sm text-muted-foreground">
                  {drawerWorkPackage.document_description || 'No description yet.'}
                </p>
              </SheetHeader>
              <div className="mt-4 flex-1 space-y-5 overflow-y-auto pr-1">
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Assignment
                  </span>
                  <Select
                    value={drawerWorkPackage.assigned_to || 'unassigned'}
                    onValueChange={handleDrawerAssignmentChange}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {getUserName(drawerWorkPackage.assigned_to)}
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
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </span>
                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    {drawerStatus ? (
                      <span className={drawerStatus.className}>{drawerStatus.label}</span>
                    ) : null}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Requirements
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {drawerWorkPackage.requirements.length} items
                    </span>
                  </div>
                  <ul className="mt-2 space-y-2">
                    {drawerWorkPackage.requirements.length === 0 ? (
                      <li className="rounded-xl border border-dashed border-slate-200 p-3 text-sm text-muted-foreground">
                        No requirements yet
                      </li>
                    ) : (
                      drawerWorkPackage.requirements.map((req) => (
                        <li key={req.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                          <p className="text-sm text-slate-900">{req.text}</p>
                          <p className="text-xs text-muted-foreground">
                            {req.priority} • {req.source}
                          </p>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
              <SheetFooter
                className="sticky-action-bar mt-6 rounded-t-2xl border-t border-slate-100 bg-white pt-4"
                data-testid="drawer-action-bar"
              >
                <Button
                  size="lg"
                  onClick={() => {
                    onOpen(drawerWorkPackage.id)
                    closeDrawer()
                  }}
                >
                  Continue in workspace
                </Button>
                <SheetClose asChild>
                  <Button variant="outline" size="lg">
                    Close drawer
                  </Button>
                </SheetClose>
              </SheetFooter>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
