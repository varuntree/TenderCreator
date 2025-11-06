'use client'

import FileUpload from '@/components/file-upload'
import SimpleDocumentList from '@/components/simple-document-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Document {
  id: string
  name: string
  file_type: string
  file_size: number
  uploaded_at: string
  is_primary_rft?: boolean
}

interface ProjectDocumentUploaderProps {
  documents: Document[]
  onUpload: (file: File) => Promise<void>
  onDelete?: (id: string) => void
  onAnalyze?: () => void
  projectStatus?: string
}

export default function ProjectDocumentUploader({
  documents,
  onUpload,
  onDelete: _onDelete,
  onAnalyze,
  projectStatus,
}: ProjectDocumentUploaderProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Panel: Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload RFT Documents</CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload the Request for Tender (RFT) documents to analyze
            </p>
          </CardHeader>
          <CardContent>
            <FileUpload onUpload={onUpload} />
          </CardContent>
        </Card>

        {/* Right Panel: Document List */}
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
            <p className="text-sm text-muted-foreground">
              Review the files uploaded for this project
            </p>
          </CardHeader>
          <CardContent>
            <SimpleDocumentList documents={documents} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom: Generate Button */}
      {documents.length > 0 && onAnalyze && projectStatus === 'setup' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Ready to Analyze</h3>
                <p className="text-sm text-muted-foreground">
                  Click below to analyze the RFT documents and identify required submission documents
                </p>
              </div>
              <Button onClick={onAnalyze} size="lg" className="min-w-[200px]">
                Analyze RFT Documents
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
