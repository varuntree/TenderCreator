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
    <nav className={cn('w-full py-2', className)} aria-label="Workflow progress">
      <ol className="grid w-full grid-cols-3 items-center gap-6">
        {steps.map(step => {
          const isComplete = step.status === 'complete'
          const isActive = step.status === 'active'
          const isUpcoming = step.status === 'upcoming'
          const barColor = isComplete
            ? 'bg-emerald-600'
            : isActive
              ? 'bg-emerald-500'
              : 'bg-slate-200'
          const textColor = isComplete
            ? 'text-emerald-700'
            : isActive
              ? 'text-emerald-600'
              : 'text-slate-400'

          return (
            <li key={step.key} aria-current={isActive ? 'step' : undefined}>
              <div className="flex w-full flex-col gap-2">
                <div className={cn('h-2 rounded-full transition-all duration-300', barColor)} />
                <p
                  className={cn(
                    'text-sm font-semibold tracking-tight',
                    textColor,
                    isUpcoming && 'font-medium'
                  )}
                >
                  <span className="mr-1">{step.order}.</span>
                  {step.title}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
