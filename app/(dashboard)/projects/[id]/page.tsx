'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import DocumentList from '@/components/document-list'
import FileUpload from '@/components/file-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<{id: string; name: string; client_name?: string} | null>(null)
  const [documents, setDocuments] = useState<{id: string; name: string; file_type: string; file_size: number; uploaded_at: string; is_primary_rft?: boolean}[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      const [projectRes, docsRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/documents`),
      ])

      const projectData = await projectRes.json()
      const docsData = await docsRes.json()

      if (projectData.success) setProject(projectData.data)
      if (docsData.success) setDocuments(docsData.data)
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

        <Button disabled className="w-full">
          Analyze RFT (Coming in Phase 2)
        </Button>
      </div>
    </div>
  )
}
