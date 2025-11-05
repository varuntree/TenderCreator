'use client'

import { useEffect, useState } from 'react'

import DocumentList from '@/components/document-list'
import FileUpload from '@/components/file-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function OrganizationDocumentsPage() {
  const [documents, setDocuments] = useState<{id: string; name: string; file_type: string; file_size: number; uploaded_at: string}[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/organizations/documents')
      const result = await response.json()

      if (result.success) {
        setDocuments(result.data)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/organizations/documents', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()
    if (result.success) {
      await loadDocuments()
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document?')) return

    await fetch(`/api/organizations/documents/${docId}`, {
      method: 'DELETE',
    })

    await loadDocuments()
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Organization Documents</h1>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Company Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload onUpload={handleUpload} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Library</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : documents.length === 0 ? (
              <p className="text-gray-500">No documents uploaded yet</p>
            ) : (
              <DocumentList documents={documents} onDelete={handleDelete} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
