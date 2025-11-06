'use client'

import { Check, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'

export type WorkflowStepKey = 'requirements' | 'strategy' | 'edit' | 'export'

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

const statusStyles: Record<WorkflowStepStatus, string> = {
  complete: 'border-emerald-500 bg-emerald-50 text-emerald-700',
  active:
    'border-emerald-500 bg-emerald-100 text-emerald-800 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]',
  upcoming: 'border-border bg-background text-muted-foreground',
}

const statusBadgeStyles: Record<WorkflowStepStatus, string> = {
  complete: 'bg-emerald-50 text-emerald-700',
  active: 'bg-emerald-100 text-emerald-800',
  upcoming: 'bg-muted text-muted-foreground',
}

const statusBadgeLabel: Record<WorkflowStepStatus, string> = {
  complete: 'Completed',
  active: 'In progress',
  upcoming: 'Pending',
}

export function StepProgressIndicator({ steps, className }: StepProgressIndicatorProps) {
  if (!steps?.length) return null

  return (
    <nav
      className={cn(
        'rounded-3xl border border-border/60 bg-background/80 px-6 py-5 shadow-sm backdrop-blur',
        className
      )}
      aria-label="Workflow progress"
    >
      <ol className="relative flex flex-col gap-6 md:flex-row md:gap-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          const previous = steps[index - 1]
          const previousIsComplete =
            previous && (previous.status === 'complete' || previous.status === 'active')

          return (
            <li
              key={step.key}
              className={cn('relative md:flex-1 md:px-4', isLast ? 'md:pr-0' : 'md:pr-4')}
              aria-current={step.status === 'active' ? 'step' : undefined}
            >
              {index > 0 ? (
                <span
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute left-[-16px] top-5 hidden h-0.5 md:block',
                    previousIsComplete ? 'bg-emerald-500/80' : 'bg-border'
                  )}
                  style={{ width: 'calc(100% + 32px)' }}
                />
              ) : null}

              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                    statusStyles[step.status]
                  )}
                  aria-hidden
                >
                  {step.status === 'complete' ? (
                    <Check className="h-5 w-5" strokeWidth={2.4} />
                  ) : step.status === 'active' ? (
                    <Sparkles className="h-5 w-5 animate-[pulse_1.8s_ease-in-out_infinite]" strokeWidth={2.4} />
                  ) : (
                    <span>{step.order}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Step {step.order}
                    </p>
                    <p className="text-sm font-semibold text-foreground">{step.title}</p>
                    {step.description ? (
                      <p className="text-xs leading-relaxed text-muted-foreground/90">
                        {step.description}
                      </p>
                    ) : null}
                  </div>

                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors',
                      statusBadgeStyles[step.status]
                    )}
                  >
                    {step.status === 'complete' ? (
                      <Check className="h-3 w-3" strokeWidth={2.6} />
                    ) : step.status === 'active' ? (
                      <span className="flex h-1.5 w-1.5 items-center justify-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                    ) : null}
                    {statusBadgeLabel[step.status]}
                  </span>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
