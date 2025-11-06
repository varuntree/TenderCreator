'use client'

import { Check, Lock } from 'lucide-react'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  const tabs = [
    { id: 'requirements', label: 'Requirements' },
    { id: 'strategy', label: 'Strategy & Generate' },
    { id: 'edit', label: 'Edit' },
    { id: 'export', label: 'Export' },
  ]

  const isTabAccessible = (tabId: string) => {
    if (tabId === 'requirements') return true
    return completedSteps.includes(tabId) || currentTab === tabId
  }

  return (
    <Tabs
      value={currentTab}
      onValueChange={onTabChange}
      className={cn('w-full flex flex-col', className)}
    >
      <TabsList className="w-full flex-shrink-0">
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={!isTabAccessible(tab.id)}
            className="flex-1"
          >
            {completedSteps.includes(tab.id) ? (
              <Check className="mr-1 size-4" />
            ) : !isTabAccessible(tab.id) ? (
              <Lock className="mr-1 size-4" />
            ) : null}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  )
}
