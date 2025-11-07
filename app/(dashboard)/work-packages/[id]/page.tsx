'use client'

import { useCallback, useEffect, useState } from 'react'

import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { TabsContent } from '@/components/ui/tabs'
import { EditorScreen } from '@/components/workflow-steps/editor-screen'
import { ExportScreen } from '@/components/workflow-steps/export-screen'
import { StrategyGenerationScreen } from '@/components/workflow-steps/strategy-generation-screen'
import { WorkflowTabs } from '@/components/workflow-steps/workflow-tabs'
import { WorkPackageContent } from '@/libs/repositories/work-package-content'
import { WorkPackage } from '@/libs/repositories/work-packages'
import { clearBreadcrumbs, setBreadcrumbs } from '@/libs/utils/breadcrumbs'

interface WorkPackagePageProps {
  params: Promise<{
    id: string
  }>
}

export default function WorkPackagePage({ params }: WorkPackagePageProps) {
  const [workPackageId, setWorkPackageId] = useState<string | null>(null)
  const [workPackage, setWorkPackage] = useState<WorkPackage | null>(null)
  const [project, setProject] = useState<{ id: string; name: string } | null>(null)
  const [content, setContent] = useState<WorkPackageContent | null>(null)
  const [contentLoaded, setContentLoaded] = useState(false)
  const [currentTab, setCurrentTab] = useState<'strategy' | 'edit' | 'export'>('strategy')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(p => setWorkPackageId(p.id))
  }, [params])

  const loadData = useCallback(async () => {
    if (!workPackageId) return

    try {
      // Load work package
      const wpRes = await fetch(`/api/work-packages/${workPackageId}`)
      const wpData = await wpRes.json()
      setWorkPackage(wpData)

      // Load project (from work package)
      const projRes = await fetch(`/api/projects/${wpData.project_id}`)
      if (!projRes.ok) {
        throw new Error('Failed to load project')
      }
      const projData = await projRes.json()
      if (projData?.success && projData.data) {
        setProject(projData.data)
      } else {
        throw new Error(projData?.error || 'Failed to load project')
      }

      // Load content (may not exist yet)
      setContentLoaded(false)
      try {
        const contentRes = await fetch(`/api/work-packages/${workPackageId}/content`)
        if (contentRes.ok) {
          const contentData = await contentRes.json()
          setContent(contentData)

          // Determine current tab based on progress
          if (contentData.content) {
            setCurrentTab('edit')
          } else {
            setCurrentTab('strategy')
          }
        } else if (contentRes.status === 404) {
          setContent(null)
          setCurrentTab('strategy')
        }
      } catch {
        // Content doesn't exist yet
        setContent(null)
      } finally {
        setContentLoaded(true)
      }

      setLoading(false)
    } catch {
      setLoading(false)
    }
  }, [workPackageId])

  useEffect(() => {
    if (workPackageId) {
      loadData()
    }
  }, [workPackageId, loadData])

  useEffect(() => {
    if (!project || !workPackage) {
      return
    }

    setBreadcrumbs([
      { label: 'Projects', href: '/projects' },
      { label: project.name || 'Untitled Project', href: `/projects/${project.id}` },
      { label: workPackage.document_type || 'Document' },
    ])

    return () => {
      clearBreadcrumbs()
    }
  }, [project, workPackage])

  const getCompletedSteps = () => {
    const steps: string[] = []
    // Mark strategy complete if win themes OR content exists
    if (content?.win_themes && content.win_themes.length > 0) {
      steps.push('strategy')
    }
    // Mark edit complete if content exists
    if (content?.content) {
      steps.push('strategy', 'edit')
    }
    // Mark export complete if status is completed
    if (workPackage?.status === 'completed') {
      steps.push('export')
    }
    return steps
  }

  if (loading || !workPackageId || !workPackage || !project) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading work package..." />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full flex-1 flex-col overflow-hidden">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col px-8 pb-10 pt-6">
        <WorkflowTabs
        currentTab={currentTab}
        onTabChange={(tab: string) => setCurrentTab(tab as typeof currentTab)}
        completedSteps={getCompletedSteps()}
        className="flex flex-1 flex-col min-h-0"
      >
        <TabsContent value="strategy" className="flex flex-1 flex-col min-h-0 overflow-auto px-2">
          <StrategyGenerationScreen
            workPackageId={workPackageId}
            workPackage={workPackage}
            initialContent={content}
            contentLoaded={contentLoaded}
            onContinue={() => setCurrentTab('edit')}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="edit" className="flex flex-1 flex-col min-h-0">
          <EditorScreen
            workPackageId={workPackageId}
            initialContent={content?.content || ''}
            onContinue={() => setCurrentTab('export')}
            onBack={() => setCurrentTab('strategy')}
          />
        </TabsContent>

        <TabsContent value="export" className="flex flex-1 flex-col min-h-0 overflow-auto px-2">
          <ExportScreen
            workPackageId={workPackageId}
            workPackage={workPackage}
            projectId={project.id}
          />
        </TabsContent>
        </WorkflowTabs>
      </div>
    </div>
  )
}
