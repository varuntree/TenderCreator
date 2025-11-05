'use client'

import { useState } from 'react'

import { StatusBadge } from '@/components/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserSelect } from '@/components/user-select'

interface WorkPackage {
  id: string
  document_type: string
  requirements: Array<{
    id: string
    text: string
    priority: 'mandatory' | 'optional'
    source: string
  }>
  assigned_to: string | null
  status: 'not_started' | 'in_progress' | 'completed'
}

interface WorkPackageCardProps {
  workPackage: WorkPackage
  onAssignmentChange: (workPackageId: string, mockUserId: string) => Promise<void>
  onStatusChange: (workPackageId: string, status: string) => Promise<void>
  onOpen: (workPackageId: string) => void
}

export function WorkPackageCard({
  workPackage,
  onAssignmentChange,
  onStatusChange,
  onOpen,
}: WorkPackageCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  // For demo, always show first mock user if assigned
  const currentMockAssignment = workPackage.assigned_to ? 'mock_admin' : undefined

  const handleAssignmentChange = async (mockUserId: string) => {
    setIsUpdating(true)
    try {
      await onAssignmentChange(workPackage.id, mockUserId)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      await onStatusChange(workPackage.id, newStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{workPackage.document_type}</CardTitle>
          <Badge variant="outline" className="ml-2 shrink-0">
            {workPackage.requirements.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Assigned to:</span>
            <UserSelect
              workPackageId={workPackage.id}
              currentAssignment={currentMockAssignment}
              onAssignmentChange={handleAssignmentChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <StatusBadge status={workPackage.status} />
            <Select
              value={workPackage.status}
              onValueChange={handleStatusChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onOpen(workPackage.id)}
        >
          Open →
        </Button>
      </CardFooter>
    </Card>
  )
}
