'use client'

import { ArrowLeft, FileQuestion, MoreHorizontal, Plus } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { AnalysisTrigger } from '@/components/analysis-trigger'
import { EmptyState } from '@/components/empty-state'
import FileUpload from '@/components/file-upload'
import SimpleDocumentList from '@/components/simple-document-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { WorkPackageDashboard } from '@/components/work-package-dashboard'

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

const statusDisplayMap: Record<string, { label: string; tone: 'preparing' | 'analysis' | 'active' | 'archived' | 'default' }> = {
  setup: { label: 'Preparing', tone: 'preparing' },
  analysis: { label: 'Analyzing', tone: 'analysis' },
  in_progress: { label: 'In Progress', tone: 'active' },
  completed: { label: 'Completed', tone: 'default' },
  archived: { label: 'Archived', tone: 'archived' },
}

const navItems = [
  { key: 'overview', label: 'Overview', active: true },
  { key: 'qa', label: 'Q&A Workbooks', active: false },
  { key: 'inputs', label: 'Inputs', active: false },
]

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
    status?: string | null
    deadline?: string | null
    instructions?: string | null
    created_at?: string | null
  } | null>(null)
  const [documents, setDocuments] = useState<{id: string; name: string; file_type: string; file_size: number; uploaded_at: string; is_primary_rft?: boolean; download_url?: string | null}[]>([])
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const loadData = async () => {
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
  }

  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`/api/projects/${projectId}/documents`, {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()
    if (result.success) {
      await loadData()
    }
  }

  const statusDisplay = useMemo(() => {
    const statusKey = project?.status || 'setup'
    return statusDisplayMap[statusKey] || statusDisplayMap.setup
  }, [project?.status])

  const projectInitials = useMemo(() => getInitials(project?.name), [project?.name])
  const quickStats = useMemo(
    () => [
      { label: 'Client Name', value: project?.client_name || 'N/A' },
      { label: 'Start Date', value: formatDate(project?.created_at) },
      { label: 'Deadline', value: formatDate(project?.deadline) },
      { label: 'Time Left', value: 'N/A' },
      { label: 'Project Status', value: statusDisplay.label },
    ],
    [project?.client_name, project?.created_at, project?.deadline, statusDisplay.label]
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
          <div className="flex items-center gap-2 rounded-full bg-muted/60 p-1">
            {navItems.map(item => (
              <button
                key={item.key}
                type="button"
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  item.active ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
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
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    statusDisplay.tone === 'preparing'
                      ? 'border-violet-200 bg-violet-50 text-violet-700'
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
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                  <MoreHorizontal className="size-4" />
                </Button>
              </div>
              <div className="grid size-16 place-content-center rounded-full bg-primary/10 text-base font-semibold uppercase text-primary">
                {projectInitials}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-8">
        <Card className="rounded-3xl border bg-card shadow-sm">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl">Uploaded Documents</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and download the files originally provided for this project.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
              <Plus className="mr-2 size-4" />
              Add document
            </Button>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-muted px-6 py-10 text-sm text-muted-foreground">
                No documents uploaded yet.
              </div>
            ) : (
              <SimpleDocumentList documents={documents} />
            )}
          </CardContent>
        </Card>

        {project.status === 'setup' && (
          <div className="space-y-6">
            <FileUpload onUpload={handleUpload} />

            {documents.length > 0 && (
              <AnalysisTrigger
                projectId={projectId}
                projectStatus={project.status || 'setup'}
                onAnalysisComplete={loadData}
              />
            )}
          </div>
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
