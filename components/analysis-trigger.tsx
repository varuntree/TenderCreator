'use client'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { StreamingProgress } from './streaming-progress'

interface AnalysisTriggerProps {
  projectId: string
  projectStatus: string
  onAnalysisComplete: () => void
}

interface Document {
  id: string
  document_type: string
  requirements: unknown[]
}

export function AnalysisTrigger({
  projectId,
  projectStatus,
  onAnalysisComplete,
}: AnalysisTriggerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])

  const handleAnalyze = async () => {
    setIsAnalyzing(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/analyze`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Analysis failed')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response stream')
      }

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('event: progress')) {
            const dataLine = line.split('\n').find((l) => l.startsWith('data: '))
            if (dataLine) {
              const data = JSON.parse(dataLine.slice(6))
              if (data.type === 'document') {
                setDocuments((prev) => [...prev, data.data])
              } else if (data.type === 'complete') {
                toast.success(`Found ${data.data.count} documents`)
              } else if (data.type === 'error') {
                toast.error(data.data.error)
              }
            }
          } else if (line.startsWith('event: done')) {
            const dataLine = line.split('\n').find((l) => l.startsWith('data: '))
            if (dataLine) {
              const data = JSON.parse(dataLine.slice(6))
              if (data.success) {
                setTimeout(() => {
                  onAnalysisComplete()
                }, 500)
              }
            }
          }
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to analyze RFT'
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const isDisabled = projectStatus !== 'setup' || isAnalyzing

  return (
    <>
      <StreamingProgress isAnalyzing={isAnalyzing} documents={documents} />

      <Button
        onClick={handleAnalyze}
        disabled={isDisabled}
        size="lg"
        className="w-full sm:w-auto"
      >
        {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Analyze RFT
      </Button>
    </>
  )
}
