'use client'

import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

interface Step {
  id: number
  label: string
}

interface StepProgressIndicatorProps {
  currentStep: number
  completedSteps: number[]
  steps: Step[]
  className?: string
}

export function StepProgressIndicator({
  currentStep,
  completedSteps,
  steps,
  className,
}: StepProgressIndicatorProps) {
  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId)
  const isStepActive = (stepId: number) => stepId === currentStep
  const isStepUpcoming = (stepId: number) => stepId > currentStep && !isStepCompleted(stepId)

  return (
    <nav
      className={cn('w-full', className)}
      aria-label="Progress"
      role="navigation"
    >
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = isStepCompleted(step.id)
          const isActive = isStepActive(step.id)
          const isUpcoming = isStepUpcoming(step.id)
          const isLast = index === steps.length - 1

          return (
            <li key={step.id} className="flex items-center flex-1 group" aria-current={isActive ? 'step' : undefined}>
              <div className="flex flex-col items-center flex-1">
                {/* Step Circle */}
                <div className="relative flex items-center">
                  <div
                    className={cn(
                      'flex items-center justify-center w-9 h-9 rounded-full border-2 text-sm font-bold transition-all',
                      (isCompleted || isActive) && 'bg-primary border-primary text-primary-foreground',
                      isUpcoming && 'bg-muted border-border text-muted-foreground'
                    )}
                    aria-label={`Step ${step.id}: ${step.label}`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div
                      className={cn(
                        'absolute left-full w-full h-0.5 transition-all',
                        isCompleted ? 'bg-primary' : 'bg-border',
                      )}
                      style={{
                        width: 'calc(100vw / var(--step-count) - 36px)',
                        marginLeft: '4px'
                      }}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'text-xs font-medium transition-colors',
                      (isCompleted || isActive) && 'text-primary',
                      isUpcoming && 'text-muted-foreground'
                    )}
                  >
                    {step.id}. {step.label}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <style jsx>{`
        :global(:root) {
          --step-count: ${steps.length};
        }
      `}</style>
    </nav>
  )
}
