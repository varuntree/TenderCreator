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
    title: 'Strategy & Planning',
    description: 'Review requirements, assess bid decision, and develop win strategy.',
    order: 1,
  },
  edit: {
    title: 'Editor',
    description: 'Refine generated content with AI assistance and team feedback.',
    order: 2,
  },
  export: {
    title: 'Export',
    description: 'Download submission-ready files and complete the tender package.',
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
      <div className="mb-8 space-y-3">
        <StepProgressIndicator steps={steps} />
      </div>

      {children}
    </Tabs>
  )
}
