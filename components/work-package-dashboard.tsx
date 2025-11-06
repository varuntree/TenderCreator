'use client'

import { FileQuestion } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { AddDocumentDialog } from '@/components/add-document-dialog'
import { BulkExportButton } from '@/components/bulk-export-button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { WorkPackageTable } from '@/components/work-package-table'

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

interface WorkPackageDashboardProps {
  projectId: string
  workPackages: WorkPackage[]
  onUpdate: () => void
  showBulkExport?: boolean
}

export function WorkPackageDashboard({
  projectId,
  workPackages,
  onUpdate,
  showBulkExport = false,
}: WorkPackageDashboardProps) {
  const router = useRouter()

  const completedCount = workPackages.filter(
    (wp) => wp.status === 'completed'
  ).length
  const totalCount = workPackages.length

  const handleAssignmentChange = async (
    workPackageId: string,
    mockUserId: string
  ) => {
    try {
      const response = await fetch(`/api/work-packages/${workPackageId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: mockUserId }),
      })

      if (!response.ok) {
        throw new Error('Failed to update assignment')
      }

      toast.success('Assignment updated')
      onUpdate()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update assignment'
      )
    }
  }

  const handleStatusChange = async (workPackageId: string, status: string) => {
    try {
      const response = await fetch(`/api/work-packages/${workPackageId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      toast.success('Status updated')
      onUpdate()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update status'
      )
    }
  }

  const handleOpen = (workPackageId: string) => {
    router.push(`/work-packages/${workPackageId}`)
  }

  if (workPackages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Alert className="max-w-md">
          <FileQuestion className="h-4 w-4" />
          <AlertTitle>No work packages yet</AlertTitle>
          <AlertDescription>
            Analyze your RFT documents to identify required submission documents,
            or add a custom document to get started.
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <AddDocumentDialog projectId={projectId} onDocumentAdded={onUpdate} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Work Packages</h2>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {totalCount} completed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AddDocumentDialog projectId={projectId} onDocumentAdded={onUpdate} />
          {showBulkExport && completedCount > 0 && (
            <BulkExportButton
              projectId={projectId}
              completedCount={completedCount}
            />
          )}
        </div>
      </div>

      <WorkPackageTable
        workPackages={workPackages}
        onAssignmentChange={handleAssignmentChange}
        onStatusChange={handleStatusChange}
        onOpen={handleOpen}
        onRefresh={onUpdate}
      />
    </div>
  )
}
