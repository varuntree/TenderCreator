'use client'

import { ArrowLeft, FileQuestion, Plus } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { AnalysisTrigger } from '@/components/analysis-trigger'
import { DeleteProjectDialog } from '@/components/delete-project-dialog'
import { EditProjectDetailsDialog, type ProjectUpdatePayload } from '@/components/edit-project-details-dialog'
import { EmptyState } from '@/components/empty-state'
import FileUpload from '@/components/file-upload'
import { ProjectDocumentsTable } from '@/components/project-documents-table'
import { Button } from '@/components/ui/button'
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

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<{
    id: string
    name: string
    client_name?: string | null
    start_date?: string | null
    status?: string | null
    deadline?: string | null
    instructions?: string | null
    created_at?: string | null
    updated_at?: string | null
  } | null>(null)
  const [documents, setDocuments] = useState<{id: string; name: string; file_type: string; file_size: number; uploaded_at: string; is_primary_rft?: boolean; download_url?: string | null}[]>([])
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [projectRes, docsRes, packagesRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/documents`),
        fetch(`/api/projects/${projectId}/work-packages`),
      ])

      const projectData = await projectRes.json()
      const docsData = await docsRes.json()
      const packagesData = await packagesRes.json()

      if (projectData.success) setProject(projectData.data)
      if (docsData.success) setDocuments(docsData.data)
      if (packagesData.success) setWorkPackages(packagesData.data || [])
    } catch (error) {
      console.error('Error loading:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!project) {
      return
    }

    setBreadcrumbs([
      { label: 'Projects', href: '/projects' },
      { label: project.name || 'Untitled Project' },
    ])

    return () => {
      clearBreadcrumbs()
    }
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
      if (!result.success) {
        throw new Error(result.error ?? 'Unable to upload document')
      }

      toast.success('Document uploaded')
      await loadData()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload document'
      console.error('Document upload failed:', error)
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
      if (!result.success) {
        throw new Error(result.error ?? 'Unable to save pasted document')
      }

      toast.success('Text saved as project document')
      await loadData()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save pasted document'
      console.error('Pasted document upload failed:', error)
      toast.error(message)
      throw error instanceof Error ? error : new Error(message)
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    const confirmed = window.confirm('Delete this document? This action cannot be undone.')
    if (!confirmed) return

    try {
      const response = await fetch(`/api/projects/${projectId}/documents/${docId}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error ?? 'Unable to delete document')
      }

      toast.success('Document deleted')
      await loadData()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete document'
      console.error('Document delete failed:', error)
      toast.error(message)
    }
  }

  const handleSetPrimaryDocument = async (docId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/documents/${docId}/primary`, {
        method: 'POST',
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error ?? 'Unable to set primary RFT')
      }

      toast.success('Primary RFT updated')
      await loadData()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update primary RFT'
      console.error('Primary document update failed:', error)
      toast.error(message)
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
      if (!result.success) {
        throw new Error(result.error ?? 'Unable to update project details')
      }

      setProject(result.data)
      toast.success('Project details updated')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update project details'
      console.error('Project update failed:', error)
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

  const quickStats = useMemo(
    () => [
      { label: 'Client Name', value: project?.client_name || 'N/A' },
      { label: 'Start Date', value: formatDate(project?.start_date ?? project?.created_at) },
      { label: 'Deadline', value: formatDate(project?.deadline) },
      { label: 'Time Left', value: timeLeft },
      { label: 'Project Status', value: statusDisplay.label },
    ],
    [project?.client_name, project?.start_date, project?.created_at, project?.deadline, statusDisplay.label, timeLeft]
  )

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading project..." />
      </div>
    )
  }
  if (!project) return <div>Project not found</div>

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to all projects
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <EditProjectDetailsDialog
              project={project}
              onSubmit={handleProjectUpdate}
              trigger={
                <Button variant="outline" size="sm">
                  Edit project details
                </Button>
              }
            />
            <DeleteProjectDialog projectId={projectId} projectName={project.name} />
          </div>
        </div>

        <section className="rounded-3xl border bg-card shadow-sm">
          <div className="flex flex-col gap-8 p-8 md:flex-row md:items-start md:justify-between">
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold leading-tight">{project.name}</h1>
                <p className="text-sm text-muted-foreground max-w-2xl">
                  Configure your tender workspace by uploading core documents and sharing the context your team needs.
                </p>
              </div>

              <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-5">
                {quickStats.map(stat => (
                  <div key={stat.label} className="rounded-2xl border border-muted bg-muted/40 px-4 py-4 shadow-inner">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {stat.label}
                    </dt>
                    <dd className="mt-2 text-sm font-medium text-foreground">{stat.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Summary</h2>
                <p className="text-sm text-muted-foreground max-w-3xl">
                  {project.instructions ||
                    'Provide a summary of your project, outlining its purpose, goals, and key highlights. This helps teammates understand the opportunity at a glance.'}
                </p>
              </div>
            </div>

            <div className="flex w-full max-w-[220px] flex-col items-end gap-4 self-stretch">
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
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
                </span>
                {project?.updated_at ? (
                  <span className="text-xs text-muted-foreground">Updated {formatDate(project.updated_at)}</span>
                ) : null}
              </div>
              <div className="grid size-16 place-content-center rounded-full bg-primary/10 text-base font-semibold uppercase text-primary">
                {projectInitials}
              </div>
            </div>
          </div>

          <div className="space-y-6 border-t border-muted/60 px-8 py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Uploaded Documents</h2>
                <p className="text-sm text-muted-foreground">
                  Review the RFT files and supporting materials added to this project.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById(uploadInputId)?.click()}
                className="self-start"
              >
                <Plus className="mr-2 size-4" />
                Add document
              </Button>
            </div>

            <ProjectDocumentsTable
              documents={documents}
              onDelete={handleDeleteDocument}
              onSetPrimary={handleSetPrimaryDocument}
            />
          </div>
        </section>
      </div>

      <div className="space-y-8">
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
              <WorkPackageDashboard
                projectId={projectId}
                workPackages={workPackages}
                onUpdate={loadData}
                showBulkExport
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
