'use client'

import { Tabs } from '@/components/ui/tabs'
import { StepProgressIndicator } from '@/components/workflow-steps/step-progress-indicator'
import { cn } from '@/lib/utils'

interface WorkflowTabsProps {
  currentTab: 'requirements' | 'strategy' | 'edit' | 'export'
  onTabChange: (tab: string) => void
  completedSteps: string[]
  children: React.ReactNode
  className?: string
}

export function WorkflowTabs({
  currentTab,
  onTabChange,
  completedSteps,
  children,
  className,
}: WorkflowTabsProps) {
  // Map workflow tabs to 5-step progress indicator
  const steps = [
    { id: 1, label: 'New Tender' },
    { id: 2, label: 'Tender Planning' },
    { id: 3, label: 'Tender Outline' },
    { id: 4, label: 'Tender Content' },
    { id: 5, label: 'Tender Export' },
  ]

  // Map current tab to step number
  const getCurrentStep = () => {
    switch (currentTab) {
      case 'requirements':
        return 1
      case 'strategy':
        return 2
      case 'edit':
        return 4
      case 'export':
        return 5
      default:
        return 1
    }
  }

  // Map completed tabs to step numbers
  const getCompletedSteps = () => {
    const stepMap: Record<string, number> = {
      requirements: 1,
      strategy: 2,
      edit: 4,
      export: 5,
    }
    return completedSteps.map(tab => stepMap[tab]).filter(Boolean)
  }

  return (
    <Tabs
      value={currentTab}
      onValueChange={onTabChange}
      className={cn('w-full flex flex-col', className)}
    >
      {/* Step Progress Indicator */}
      <div className="mb-8">
        <StepProgressIndicator
          currentStep={getCurrentStep()}
          completedSteps={getCompletedSteps()}
          steps={steps}
        />
      </div>

      {/* Tab Content */}
      {children}
    </Tabs>
  )
}
