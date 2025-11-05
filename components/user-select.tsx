'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface UserSelectProps {
  workPackageId: string
  currentAssignment?: string
  onAssignmentChange: (mockUserId: string) => void
}

const MOCK_USERS = [
  { id: 'mock_admin', name: 'Admin', avatar: 'A' },
  { id: 'mock_writer_a', name: 'Writer A', avatar: 'WA' },
  { id: 'mock_writer_b', name: 'Writer B', avatar: 'WB' },
]

export function UserSelect({
  currentAssignment,
  onAssignmentChange,
}: UserSelectProps) {
  return (
    <Select value={currentAssignment || ''} onValueChange={onAssignmentChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Unassigned" />
      </SelectTrigger>
      <SelectContent>
        {MOCK_USERS.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">
                {user.avatar}
              </div>
              {user.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
