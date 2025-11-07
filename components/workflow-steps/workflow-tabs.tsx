'use client'

import { Tabs } from '@/components/ui/tabs'
import {
  StepProgressIndicator,
  type WorkflowProgressStep,
  type WorkflowStepKey,
  type WorkflowStepStatus,
} from '@/components/workflow-steps/step-progress-indicator'
import { cn } from '@/lib/utils'

interface WorkflowTabsProps {
  currentTab: 'strategy' | 'edit' | 'export'
  onTabChange: (tab: string) => void
  completedSteps: string[]
  children: React.ReactNode
  className?: string
}

const stepOrder: WorkflowStepKey[] = ['strategy', 'edit', 'export']

const stepContent: Record<WorkflowStepKey, { title: string; description: string; order: number }> = {
  strategy: {
    title: 'Tender Planning',
    description: 'Review requirements, evaluate bid readiness, and confirm win themes.',
    order: 1,
  },
  edit: {
    title: 'Tender Content',
    description: 'Generate and refine the document content with AI assistance.',
    order: 2,
  },
  export: {
    title: 'Tender Export',
    description: 'Finalize formatting and export submission-ready files.',
    order: 3,
  },
}

export function WorkflowTabs({
  currentTab,
  onTabChange,
  completedSteps,
  children,
  className,
}: WorkflowTabsProps) {
  const completedSet = new Set<WorkflowStepKey>(
    completedSteps.filter((step): step is WorkflowStepKey => stepOrder.includes(step as WorkflowStepKey)) as WorkflowStepKey[]
  )

  const computeStatus = (key: WorkflowStepKey): WorkflowStepStatus => {
    if (currentTab === key) {
      return 'active'
    }
    return completedSet.has(key) ? 'complete' : 'upcoming'
  }

  const steps: WorkflowProgressStep[] = stepOrder.map(key => ({
    key,
    title: stepContent[key].title,
    description: stepContent[key].description,
    order: stepContent[key].order,
    status: computeStatus(key),
  }))

  return (
    <Tabs
      value={currentTab}
      onValueChange={onTabChange}
      className={cn('flex w-full flex-col', className)}
    >
      <div className="mb-6 space-y-3">
        <StepProgressIndicator steps={steps} />
      </div>

      {children}
    </Tabs>
  )
}
