'use client'

import { Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/loading-spinner'
import { Textarea } from '@/components/ui/textarea'

interface Requirement {
  id: string
  text: string
  priority: 'mandatory' | 'optional'
  source: string
}

interface AddDocumentDialogProps {
  projectId: string
  onDocumentAdded: () => void
}

export function AddDocumentDialog({
  projectId,
  onDocumentAdded,
}: AddDocumentDialogProps) {
  const [open, setOpen] = useState(false)
  const [documentType, setDocumentType] = useState('')
  const [description, setDescription] = useState('')
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [workPackageId, setWorkPackageId] = useState<string | null>(null)

  const handleSearchRequirements = async () => {
    if (!documentType.trim()) {
      toast.error('Please enter a document type')
      return
    }

    setIsSearching(true)

    try {
      // Create empty work package first
      const createRes = await fetch('/api/work-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          document_type: documentType,
          description: description || null,
          requirements: [],
        }),
      })

      if (!createRes.ok) {
        throw new Error('Failed to create work package')
      }

      const workPackage = await createRes.json()
      setWorkPackageId(workPackage.id)

      // Extract requirements
      const extractRes = await fetch(
        `/api/work-packages/${workPackage.id}/extract-requirements`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      if (!extractRes.ok) {
        throw new Error('Failed to extract requirements')
      }

      const { requirements: foundReqs } = await extractRes.json()
      setRequirements(foundReqs)

      if (foundReqs.length === 0) {
        toast.info('No requirements found. You can add this document with empty requirements.')
      } else {
        toast.success(`Found ${foundReqs.length} requirements`)
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to search requirements'
      )
    } finally {
      setIsSearching(false)
    }
  }

  const handleSave = async () => {
    if (!workPackageId) {
      toast.error('No work package created')
      return
    }

    setIsCreating(true)

    try {
      // Update work package with requirements
      const res = await fetch(`/api/work-packages/${workPackageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save work package')
      }

      toast.success('Document added successfully')
      setOpen(false)
      onDocumentAdded()
      handleReset()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save document'
      )
    } finally {
      setIsCreating(false)
    }
  }

  const handleReset = () => {
    setDocumentType('')
    setDescription('')
    setRequirements([])
    setWorkPackageId(null)
  }

  const handleRemoveRequirement = (id: string) => {
    setRequirements((prev) => prev.filter((req) => req.id !== id))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Custom Document</DialogTitle>
          <DialogDescription>
            Enter a document type and we&apos;ll search the RFT for relevant requirements.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type *</Label>
            <Input
              id="document-type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              placeholder="e.g., Safety Plan, Insurance Certificates"
              disabled={!!workPackageId}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this document"
              rows={2}
              disabled={!!workPackageId}
            />
          </div>

          {!workPackageId && (
            <Button
              onClick={handleSearchRequirements}
              disabled={isSearching || !documentType.trim()}
              className="w-full"
            >
              {isSearching ? (
                <>
                  <Spinner size="sm" className="mr-2 text-primary-foreground" />
                  Searching...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Search for Requirements
                </>
              )}
            </Button>
          )}

          {requirements.length > 0 && (
            <div className="space-y-2">
              <Label>Found Requirements ({requirements.length})</Label>
              <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 flex items-start gap-2 hover:bg-muted/50"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start gap-2">
                        <p className="flex-1 text-sm">{req.text}</p>
                        <Badge
                          variant={
                            req.priority === 'mandatory' ? 'default' : 'secondary'
                          }
                        >
                          {req.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{req.source}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveRequirement(req.id)}
                      className="h-7 w-7"
                    >
                      <Plus className="h-3 w-3 rotate-45" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!workPackageId || isCreating}
          >
            {isCreating && <Spinner size="sm" className="mr-2 text-primary-foreground" />}
            Add Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
