'use client'

import { cn } from '@/lib/utils'

export type WorkflowStepKey = 'strategy' | 'edit' | 'export'

export type WorkflowStepStatus = 'complete' | 'active' | 'upcoming'

export interface WorkflowProgressStep {
  key: WorkflowStepKey
  order: number
  title: string
  description?: string
  status: WorkflowStepStatus
}

interface StepProgressIndicatorProps {
  steps: WorkflowProgressStep[]
  className?: string
}

export function StepProgressIndicator({ steps, className }: StepProgressIndicatorProps) {
  if (!steps?.length) return null

  return (
    <nav className={cn('w-full py-4', className)} aria-label="Workflow progress">
      <ol className="flex items-start gap-2">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          const isActive = step.status === 'active'
          const isComplete = step.status === 'complete'

          return (
            <li
              key={step.key}
              className={cn('flex-1 flex flex-col', isLast && 'flex-none w-auto')}
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Progress bar */}
              {!isLast && (
                <div
                  className={cn(
                    'h-2.5 rounded-full transition-all duration-300 w-full',
                    isComplete || isActive ? 'bg-emerald-500' : 'bg-gray-200'
                  )}
                />
              )}

              {/* Step label */}
              <p
                className={cn(
                  'text-sm font-medium transition-colors mt-3 whitespace-nowrap',
                  isComplete || isActive ? 'text-gray-900' : 'text-gray-400'
                )}
              >
                {step.order}. {step.title}
              </p>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
