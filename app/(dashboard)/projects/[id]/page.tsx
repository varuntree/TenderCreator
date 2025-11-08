'use client'

import { ArrowLeft, FileQuestion, MoreHorizontal, Plus, Zap } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { AnalysisTrigger } from '@/components/analysis-trigger'
import { DeleteProjectDialog } from '@/components/delete-project-dialog'
import { EditProjectDetailsDialog, type ProjectUpdatePayload } from '@/components/edit-project-details-dialog'
import { EmptyState } from '@/components/empty-state'
import FileUpload from '@/components/file-upload'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { WorkPackageDashboard } from '@/components/work-package-dashboard'
import { clearBreadcrumbs, setBreadcrumbs } from '@/libs/utils/breadcrumbs'

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

type ProjectDocument = {
  id: string
  name: string
  file_type: string
  file_size: number
  uploaded_at: string
  is_primary_rft?: boolean
  download_url?: string | null
}

type ProjectDetails = {
  id: string
  name: string
  client_name?: string | null
  start_date?: string | null
  status?: string | null
  deadline?: string | null
  instructions?: string | null
  created_at?: string | null
  updated_at?: string | null
}

type ApiResponsePayload<T> = {
  success: boolean
  data: T
  error?: string
}

const parseApiResponse = async <T>(response: Response, fallbackError: string): Promise<T> => {
  const rawBody = await response.text()
  let payload: ApiResponsePayload<T> | null = null

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as ApiResponsePayload<T>
    } catch {
      payload = null
    }
  }

  if (!response.ok || !payload?.success) {
    const message = payload?.error ?? rawBody || fallbackError
    throw new Error(message)
  }

  return payload.data
}

const statusDisplayMap: Record<string, { label: string; tone: 'preparing' | 'analysis' | 'active' | 'archived' | 'default' }> = {
  setup: { label: 'Preparing', tone: 'preparing' },
  analysis: { label: 'Analyzing', tone: 'analysis' },
  in_progress: { label: 'In Progress', tone: 'active' },
  completed: { label: 'Completed', tone: 'default' },
  archived: { label: 'Archived', tone: 'archived' },
}

const formatDate = (value?: string | null) => {
  if (!value) return '--/--/--'
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value))
  } catch {
    return '--/--/--'
  }
}

const getInitials = (name?: string | null) => {
  if (!name) return 'TC'
  const parts = name.trim().split(/\s+/)
  if (!parts.length) return 'TC'
  const initials = parts
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
  return initials || 'TC'
}

const KANBAN_COLUMNS = [
  {
    id: 'not_started',
    title: 'Not Started',
    statuses: ['pending'],
    colorClass: 'bg-slate-50 border-slate-200',
    headerClass: 'bg-slate-100 text-slate-700',
    badgeClass: 'bg-slate-500',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    statuses: ['in_progress', 'review'],
    colorClass: 'bg-blue-50 border-blue-200',
    headerClass: 'bg-blue-100 text-blue-700',
    badgeClass: 'bg-blue-500',
  },
  {
    id: 'completed',
    title: 'Completed',
    statuses: ['completed'],
    colorClass: 'bg-green-50 border-green-200',
    headerClass: 'bg-green-100 text-green-700',
    badgeClass: 'bg-green-500',
  },
]

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<ProjectDetails | null>(null)
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [projectData, docsData, packagesData] = await Promise.all([
        fetch(`/api/projects/${projectId}`).then(res =>
          parseApiResponse<ProjectDetails>(res, 'Unable to load project')
        ),
        fetch(`/api/projects/${projectId}/documents`).then(res =>
          parseApiResponse<ProjectDocument[]>(res, 'Unable to load documents')
        ),
        fetch(`/api/projects/${projectId}/work-packages`).then(res =>
          parseApiResponse<WorkPackage[]>(res, 'Unable to load work packages')
        ),
      ])

      setProject(projectData)
      setDocuments(docsData ?? [])
      setWorkPackages(packagesData ?? [])
    } catch (error) {
      console.error('Error loading:', error)
      const message = error instanceof Error ? error.message : 'Failed to load project data'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!project) return
    setBreadcrumbs([
      { label: 'Projects', href: '/projects' },
      { label: project.name || 'Untitled Project' },
    ])
    return () => clearBreadcrumbs()
  }, [project])

  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await fetch(`/api/projects/${projectId}/documents`, {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()
      if (!result.success) throw new Error(result.error ?? 'Unable to upload document')
      toast.success('Document uploaded')
      await loadData()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload document'
      toast.error(message)
      throw error instanceof Error ? error : new Error(message)
    }
  }

  const handlePasteText = async ({ name, content }: { name: string; content: string }) => {
    const formData = new FormData()
    formData.append('name', name)
    formData.append('content_text', content)
    try {
      const response = await fetch(`/api/projects/${projectId}/documents`, {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()
      if (!result.success) throw new Error(result.error ?? 'Unable to save pasted document')
      toast.success('Text saved as document')
      await loadData()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save pasted document'
      toast.error(message)
      throw error instanceof Error ? error : new Error(message)
    }
  }

  const handleProjectUpdate = async (updates: ProjectUpdatePayload) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const result = await response.json()
      if (!result.success) throw new Error(result.error ?? 'Unable to update project details')
      setProject(result.data)
      toast.success('Project details updated')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update project details'
      toast.error(message)
      throw error instanceof Error ? error : new Error(message)
    }
  }

  const statusDisplay = useMemo(() => {
    const statusKey = project?.status || 'setup'
    return statusDisplayMap[statusKey] || statusDisplayMap.setup
  }, [project?.status])

  const projectInitials = useMemo(() => getInitials(project?.name), [project?.name])
  const uploadInputId = useMemo(() => `project-${projectId}-file-upload`, [projectId])
  const timeLeft = useMemo(() => {
    if (!project?.deadline) return 'N/A'
    try {
      const deadline = new Date(project.deadline)
      const diffMs = deadline.getTime() - Date.now()
      if (Number.isNaN(diffMs)) return 'N/A'
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      if (diffDays > 0) return `${diffDays} day${diffDays === 1 ? '' : 's'}`
      if (diffDays === 0) return 'Due today'
      return `${Math.abs(diffDays)} day${diffDays === -1 ? '' : 's'} past due`
    } catch {
      return 'N/A'
    }
  }, [project?.deadline])

  const kanbanData = useMemo(() => {
    return KANBAN_COLUMNS.map(column => ({
      ...column,
      packages: workPackages.filter(pkg => column.statuses.includes(pkg.status)),
    }))
  }, [workPackages])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading project..." />
      </div>
    )
  }
  if (!project) return <div>Project not found</div>

  return (
    <div className="flex gap-6">
      {/* LEFT SIDEBAR */}
      <aside className="w-[300px] shrink-0">
        <div className="sticky top-6 space-y-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to projects
          </Link>

          <Card className="rounded-3xl border-2 border-primary/20 shadow-md">
            <CardContent className="p-6 space-y-6">
              {/* Initials + Actions */}
              <div className="flex items-center justify-between">
                <div className="grid size-20 place-content-center rounded-full bg-primary/10 text-xl font-bold uppercase text-primary">
                  {projectInitials}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <EditProjectDetailsDialog
                      project={project}
                      onSubmit={handleProjectUpdate}
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Edit details
                        </DropdownMenuItem>
                      }
                    />
                    <DeleteProjectDialog
                      projectId={projectId}
                      projectName={project.name}
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                          Delete project
                        </DropdownMenuItem>
                      }
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Project name + status */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold leading-tight">{project.name}</h1>
                <Badge
                  variant="outline"
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusDisplay.tone === 'preparing'
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : statusDisplay.tone === 'analysis'
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : statusDisplay.tone === 'active'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : statusDisplay.tone === 'archived'
                            ? 'border-slate-200 bg-slate-100 text-slate-600'
                            : 'border-muted bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {statusDisplay.label}
                </Badge>
              </div>

              {/* Metadata */}
              <div className="space-y-4 border-t border-muted pt-4">
                <div className="space-y-1">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Client</dt>
                  <dd className="text-sm font-medium text-foreground">{project.client_name || 'N/A'}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Deadline</dt>
                  <dd className="text-sm font-medium text-foreground">{formatDate(project.deadline)}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Time Left</dt>
                  <dd className={`text-sm font-medium ${timeLeft.includes('past due') ? 'text-destructive' : 'text-foreground'}`}>
                    {timeLeft}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Start Date</dt>
                  <dd className="text-sm font-medium text-foreground">{formatDate(project.start_date ?? project.created_at)}</dd>
                </div>
              </div>

              {/* Compact Documents List */}
              {documents.length > 0 && (
                <div className="space-y-2 border-t border-muted pt-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Documents</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => document.getElementById(uploadInputId)?.click()}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {documents.slice(0, 5).map(doc => (
                      <div key={doc.id} className="text-xs text-muted-foreground truncate">
                        {doc.is_primary_rft && <span className="text-primary mr-1">★</span>}
                        {doc.name}
                      </div>
                    ))}
                    {documents.length > 5 && (
                      <div className="text-xs text-muted-foreground italic">
                        +{documents.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Summary */}
              {project.instructions && (
                <div className="space-y-2 border-t border-muted pt-4">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Summary</h2>
                  <p className="text-xs text-muted-foreground line-clamp-4">{project.instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* MAIN CONTENT - KANBAN */}
      <main className="flex-1 min-w-0 space-y-6 relative">
        {workPackages.length === 0 && (
          <FileUpload onUpload={handleUpload} onPasteText={handlePasteText} inputId={uploadInputId} />
        )}

        {project.status === 'setup' && documents.length > 0 && (
          <AnalysisTrigger
            projectId={projectId}
            projectStatus={project.status || 'setup'}
            onAnalysisComplete={loadData}
          />
        )}

        {project.status === 'in_progress' && (
          <>
            {workPackages.length === 0 ? (
              <EmptyState
                icon={FileQuestion}
                heading="Analysis pending"
                description="Click 'Analyze RFT' to identify submission documents."
              />
            ) : (
              <div className="space-y-4">
                {/* Floating Actions Menu - Top Right */}
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Zap className="mr-2 size-4" />
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>
                        <Plus className="mr-2 size-4" />
                        Add Custom Package
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Export Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Generate All
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Kanban Columns */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {kanbanData.map(column => (
                    <div key={column.id} className="flex flex-col">
                      <div className={`rounded-t-2xl border-x border-t px-4 py-3 ${column.headerClass}`}>
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold">{column.title}</h3>
                          <span className={`inline-flex h-6 min-w-[24px] items-center justify-center rounded-full px-2 text-xs font-semibold text-white ${column.badgeClass}`}>
                            {column.packages.length}
                          </span>
                        </div>
                      </div>
                      <div className={`flex-1 space-y-3 rounded-b-2xl border p-4 ${column.colorClass} min-h-[400px]`}>
                        {column.packages.length === 0 ? (
                          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            No packages
                          </div>
                        ) : (
                          column.packages.map(pkg => (
                            <div
                              key={pkg.id}
                              className="rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md"
                            >
                              <h4 className="text-sm font-semibold text-foreground mb-2">
                                {pkg.document_type}
                              </h4>
                              {pkg.document_description && (
                                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                  {pkg.document_description}
                                </p>
                              )}
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {pkg.requirements.length} requirement{pkg.requirements.length !== 1 ? 's' : ''}
                                </span>
                                {pkg.assigned_to && (
                                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                    {pkg.assigned_to}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Advanced Actions - Open by Default */}
                <details open className="rounded-2xl border bg-muted/10">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Advanced Actions</summary>
                  <div className="px-4 pb-4">
                    <WorkPackageDashboard
                      projectId={projectId}
                      workPackages={workPackages}
                      onUpdate={loadData}
                      showBulkExport
                    />
                  </div>
                </details>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
