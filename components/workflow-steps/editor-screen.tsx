'use client'

import { ChevronLeft,ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { ContentEditor } from './content-editor'

interface EditorScreenProps {
  workPackageId: string
  initialContent: string
  onContinue: () => void
  onBack: () => void
}

export function EditorScreen({
  workPackageId,
  initialContent,
  onContinue,
  onBack,
}: EditorScreenProps) {
  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden">
      <div className="flex flex-shrink-0 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Edit Document</h2>
          <p className="text-muted-foreground">Refine and customize your content</p>
        </div>
        <Button onClick={onContinue}>
          Continue to Export
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>

      <ContentEditor
        workPackageId={workPackageId}
        initialContent={initialContent}
      />

      <div className="flex flex-shrink-0 justify-start pt-4">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 size-4" />
          Back to Generate
        </Button>
      </div>
    </div>
  )
}
