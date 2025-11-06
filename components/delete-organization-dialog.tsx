'use client'

import { AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/loading-spinner'
import { Organization } from '@/types/organization'

interface DeleteOrganizationDialogProps {
  organization: Organization
  open: boolean
  onClose: () => void
}

export default function DeleteOrganizationDialog({
  organization,
  open,
  onClose,
}: DeleteOrganizationDialogProps) {
  const router = useRouter()
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isConfirmed = confirmText === organization.name

  const handleDelete = async () => {
    if (!isConfirmed) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/organizations', {
        method: 'DELETE',
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete organization')
      }

      // Redirect to sign-in after successful deletion
      router.push('/signin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Organization
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p className="font-semibold text-red-900">
              This action cannot be undone. All projects, documents, and data will
              be permanently deleted.
            </p>

            <div className="space-y-2">
              <Label htmlFor="confirm-delete">
                Type <span className="font-mono font-bold">{organization.name}</span> to
                confirm
              </Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Enter organization name"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2 text-destructive-foreground" />
                Deleting...
              </>
            ) : (
              'Delete Organization'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
