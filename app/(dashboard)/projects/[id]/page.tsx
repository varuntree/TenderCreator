'use client'

import { FileQuestion } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AnalysisTrigger } from '@/components/analysis-trigger'
import { EmptyState } from '@/components/empty-state'
import FileUpload from '@/components/file-upload'
import SimpleDocumentList from '@/components/simple-document-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<{id: string; name: string; client_name?: string; status?: string} | null>(null)
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

  // Removed unused handleDelete function

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project?')) return

    await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
    })

    router.push('/projects')
  }

  if (loading) return <div>Loading...</div>
  if (!project) return <div>Project not found</div>

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          {project.client_name && (
            <p className="text-gray-600">{project.client_name}</p>
          )}
        </div>
        <Button variant="destructive" onClick={handleDeleteProject}>
          Delete Project
        </Button>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
            <p className="text-sm text-muted-foreground">
              Review and download the files originally provided for this project.
            </p>
          </CardHeader>
          <CardContent>
            <SimpleDocumentList documents={documents} />
          </CardContent>
        </Card>

        {project.status === 'setup' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Upload RFT Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload onUpload={handleUpload} />
              </CardContent>
            </Card>

            {documents.length > 0 && (
              <AnalysisTrigger
                projectId={projectId}
                projectStatus={project.status || 'setup'}
                onAnalysisComplete={loadData}
              />
            )}
          </>
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
