'use client'

import { ChevronDown, ChevronRight, Plus,Trash2 } from 'lucide-react'
import React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { AddDocumentDialog } from './add-document-dialog'
import { RequirementEditor } from './requirement-editor'

interface Requirement {
  id: string
  text: string
  priority: 'mandatory' | 'optional'
  source: string
}

interface WorkPackage {
  id: string
  document_type: string
  document_description: string | null
  requirements: Requirement[]
  assigned_to: string | null
  status: 'pending' | 'in_progress' | 'review' | 'completed'
}

interface DocumentRequirementsMatrixProps {
  projectId: string
  workPackages: WorkPackage[]
  onUpdate: () => void
}

export function DocumentRequirementsMatrix({
  projectId,
  workPackages,
  onUpdate,
}: DocumentRequirementsMatrixProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null)

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleUpdateRequirement = async (
    workPackageId: string,
    updatedRequirement: Requirement
  ) => {
    const workPackage = workPackages.find((wp) => wp.id === workPackageId)
    if (!workPackage) return

    const updatedRequirements = workPackage.requirements.map((req) =>
      req.id === updatedRequirement.id ? updatedRequirement : req
    )

    try {
      const res = await fetch(`/api/work-packages/${workPackageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements: updatedRequirements }),
      })

      if (!res.ok) throw new Error('Failed to update requirement')

      toast.success('Requirement updated')
      onUpdate()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update requirement'
      )
    }
  }

  const handleDeleteRequirement = async (
    workPackageId: string,
    requirementId: string
  ) => {
    const workPackage = workPackages.find((wp) => wp.id === workPackageId)
    if (!workPackage) return

    const updatedRequirements = workPackage.requirements.filter(
      (req) => req.id !== requirementId
    )

    try {
      const res = await fetch(`/api/work-packages/${workPackageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements: updatedRequirements }),
      })

      if (!res.ok) throw new Error('Failed to delete requirement')

      toast.success('Requirement deleted')
      onUpdate()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete requirement'
      )
    }
  }

  const handleAddRequirement = async (workPackageId: string) => {
    const workPackage = workPackages.find((wp) => wp.id === workPackageId)
    if (!workPackage) return

    const newRequirement: Requirement = {
      id: uuidv4(),
      text: 'New requirement',
      priority: 'mandatory',
      source: 'Manual addition',
    }

    const updatedRequirements = [...workPackage.requirements, newRequirement]

    try {
      const res = await fetch(`/api/work-packages/${workPackageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements: updatedRequirements }),
      })

      if (!res.ok) throw new Error('Failed to add requirement')

      toast.success('Requirement added')
      onUpdate()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to add requirement'
      )
    }
  }

  const handleDeleteWorkPackage = async () => {
    if (!packageToDelete) return

    try {
      const res = await fetch(`/api/work-packages/${packageToDelete}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete work package')

      toast.success('Document deleted')
      onUpdate()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete document'
      )
    } finally {
      setDeleteDialogOpen(false)
      setPackageToDelete(null)
    }
  }

  if (workPackages.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">
          No documents identified yet. Add documents manually.
        </p>
        <AddDocumentDialog projectId={projectId} onDocumentAdded={onUpdate} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Document Requirements Matrix</h3>
        <AddDocumentDialog projectId={projectId} onDocumentAdded={onUpdate} />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Requirements</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workPackages.map((wp) => {
              const isExpanded = expandedRows.has(wp.id)
              return (
                <React.Fragment key={wp.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleRow(wp.id)}
                  >
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      {wp.document_type}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {wp.requirements.length} requirements
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {wp.assigned_to || 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          wp.status === 'completed'
                            ? 'default'
                            : wp.status === 'in_progress'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {wp.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPackageToDelete(wp.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-muted/20 p-0">
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-sm">
                              Requirements ({wp.requirements.length})
                            </h4>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddRequirement(wp.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Requirement
                            </Button>
                          </div>
                          <div className="border rounded-lg bg-card">
                            {wp.requirements.length === 0 ? (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                No requirements yet
                              </div>
                            ) : (
                              wp.requirements.map((req) => (
                                <RequirementEditor
                                  key={req.id}
                                  requirement={req}
                                  onUpdate={(updated) =>
                                    handleUpdateRequirement(wp.id, updated)
                                  }
                                  onDelete={() =>
                                    handleDeleteRequirement(wp.id, req.id)
                                  }
                                />
                              ))
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorkPackage}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
