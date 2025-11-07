import { CheckCircle, Circle, CircleDashed } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'pending' | 'in_progress' | 'review' | 'completed'
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; variant: 'secondary' | 'default'; className: string }> = {
    pending: {
      label: 'Not Started',
      icon: Circle,
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
    },
    in_progress: {
      label: 'In Progress',
      icon: CircleDashed,
      variant: 'default' as const,
      className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle,
      variant: 'default' as const,
      className: 'bg-green-100 text-green-700 hover:bg-green-100',
    },
    // Legacy status mapping for backward compatibility
    not_started: {
      label: 'Not Started',
      icon: Circle,
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
    },
    review: {
      label: 'In Review',
      icon: CircleDashed,
      variant: 'default' as const,
      className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
    },
  }

  const statusConfig = config[status as string] || config.pending
  const { label, icon: Icon, variant, className: statusClassName } = statusConfig

  return (
    <Badge variant={variant} className={cn(statusClassName, className)}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  )
}
