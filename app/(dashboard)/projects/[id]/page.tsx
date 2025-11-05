'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AnalysisTrigger } from '@/components/analysis-trigger'
import { BulkExportButton } from '@/components/bulk-export-button'
import DocumentList from '@/components/document-list'
import FileUpload from '@/components/file-upload'
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
  const [documents, setDocuments] = useState<{id: string; name: string; file_type: string; file_size: number; uploaded_at: string; is_primary_rft?: boolean}[]>([])
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

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document?')) return

    await fetch(`/api/projects/${projectId}/documents/${docId}`, {
      method: 'DELETE',
    })

    await loadData()
  }

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

            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-gray-500">No documents uploaded yet</p>
                ) : (
                  <DocumentList documents={documents} onDelete={handleDelete} />
                )}
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Work Packages</h2>
                <p className="text-sm text-muted-foreground">
                  {workPackages.filter(wp => wp.status === 'completed').length} of {workPackages.length} completed
                </p>
              </div>

              {workPackages.filter(wp => wp.status === 'completed').length > 0 && (
                <BulkExportButton
                  projectId={projectId}
                  completedCount={workPackages.filter(wp => wp.status === 'completed').length}
                />
              )}
            </div>

            <WorkPackageDashboard
              projectId={projectId}
              workPackages={workPackages}
              onUpdate={loadData}
            />
          </>
        )}
      </div>
    </div>
  )
}
