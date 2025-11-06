'use client'

import { useEffect, useMemo, useState } from 'react'

import {
  ProcessLoaderOverlay,
  type ProcessLoaderStep,
} from '@/components/process-loader-overlay'

interface StreamingProgressProps {
  isAnalyzing: boolean
  documents: Array<{ id: string }>
}

export function StreamingProgress({ isAnalyzing, documents }: StreamingProgressProps) {
  const steps: ProcessLoaderStep[] = useMemo(
    () => [
      {
        id: 'prep',
        label: 'Securing tender workspace',
      },
      {
        id: 'ingest',
        label: 'Parsing uploaded documents',
      },
      {
        id: 'requirements',
        label: 'Mapping submission requirements',
      },
      {
        id: 'outputs',
        label: 'Drafting your deliverable plan',
      },
    ],
    []
  )

  const [syntheticStep, setSyntheticStep] = useState(0)

  useEffect(() => {
    if (!isAnalyzing) {
      setSyntheticStep(0)
      return
    }

    const timers = steps.map((_, index) =>
      setTimeout(() => {
        setSyntheticStep(index)
      }, index * 2600)
    )

    return () => timers.forEach((timer) => clearTimeout(timer))
  }, [isAnalyzing, steps])

  const documentDrivenStep = useMemo(() => {
    if (!documents?.length) return 0
    if (documents.length > 6) return 3
    if (documents.length > 3) return 2
    if (documents.length > 0) return 1
    return 0
  }, [documents])

  const activeStep = Math.max(syntheticStep, documentDrivenStep)

  return (
    <ProcessLoaderOverlay
      isVisible={isAnalyzing}
      title="Now analysing the tender documents"
      subtitle="We’re reviewing every clause before suggesting what to create."
      steps={steps}
      activeStep={activeStep}
      iconLabel="TC"
    />
  )
}
