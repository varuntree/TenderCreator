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
  currentTab: 'requirements' | 'strategy' | 'edit' | 'export'
  onTabChange: (tab: string) => void
  completedSteps: string[]
  children: React.ReactNode
  className?: string
}

const stepOrder: WorkflowStepKey[] = ['requirements', 'strategy', 'edit', 'export']

const stepContent: Record<WorkflowStepKey, { title: string; description: string; order: number }> = {
  requirements: {
    title: 'Brief & documents uploaded',
    description: 'Source material has been analysed and the tender workspace is ready.',
    order: 1,
  },
  strategy: {
    title: 'Strategy generated',
    description: 'AI review completed. Your recommended approach is locked in.',
    order: 2,
  },
  edit: {
    title: 'Editor ready',
    description: 'Refine the generated draft with your team and capture feedback.',
    order: 3,
  },
  export: {
    title: 'Download pack',
    description: 'Export polished content and share the submission-ready files.',
    order: 4,
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

  const shouldCondense =
    completedSet.has('strategy') &&
    completedSet.has('edit') &&
    currentTab !== 'requirements' &&
    currentTab !== 'strategy'

  const visibleSteps = shouldCondense ? steps.filter(step => step.key === 'edit' || step.key === 'export') : steps

  return (
    <Tabs
      value={currentTab}
      onValueChange={onTabChange}
      className={cn('flex w-full flex-col', className)}
    >
      <div className="mb-8 space-y-3">
        {shouldCondense ? (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-2 text-sm text-emerald-800">
            <span className="inline-flex h-2.5 w-2.5 shrink-0 items-center justify-center">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span>Workspace prepared. Continue editing or export your completed draft.</span>
          </div>
        ) : null}

        <StepProgressIndicator steps={visibleSteps} />
      </div>

      {children}
    </Tabs>
  )
}
