'use client'

import { AlertCircle, CheckCircle, Info, Sparkles, XCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils'

interface BidRecommendationCardProps {
  recommendation: 'bid' | 'no-bid'
  reasoning?: string
  strengths: string[]
  concerns: string[]
  isGenerating?: boolean
  onRegenerate?: () => void
  className?: string
}

export function BidRecommendationCard({
  recommendation,
  // reasoning, // Currently not displayed in UI
  strengths,
  concerns,
  isGenerating = false,
  onRegenerate,
  className,
}: BidRecommendationCardProps) {
  if (isGenerating) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="p-12">
          <LoadingSpinner size="md" text="Analyzing bid decision factors..." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">2.3</h3>
            <span className="text-muted-foreground">|</span>
            <h3 className="text-lg font-semibold">Bid Decision Recommendation</h3>
          </div>
          {onRegenerate && (
            <Button variant="outline" size="sm" onClick={onRegenerate} className="shrink-0">
              <Sparkles className="size-4 mr-2" />
              Regenerate Recommendation
            </Button>
          )}
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-2 text-sm bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 text-blue-800 dark:text-blue-300 mb-6">
          <Info className="size-4 mt-0.5 shrink-0" />
          <p>
            Review the AI recommendation and key factors before making your final bid decision.
          </p>
        </div>

        {/* AI Recommendation Section */}
        <div className="mb-6">
          <h4 className="text-base font-semibold mb-3">AI Recommendation</h4>

          {/* Recommendation Badge/Alert */}
          <div
            className={cn(
              'rounded-lg p-4 border-2 flex items-start gap-3',
              recommendation === 'bid' && 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
              recommendation === 'no-bid' && 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
            )}
          >
            {recommendation === 'bid' ? (
              <CheckCircle className="size-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="size-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <Badge
                variant={recommendation === 'bid' ? 'default' : 'destructive'}
                className="mb-2 text-sm px-3 py-1"
              >
                {recommendation === 'bid' ? 'Recommended to Bid' : 'Not Recommended to Bid'}
              </Badge>
              <p
                className={cn(
                  'text-sm font-medium',
                  recommendation === 'bid' && 'text-green-800 dark:text-green-300',
                  recommendation === 'no-bid' && 'text-red-800 dark:text-red-300'
                )}
              >
                Analysis Complete - {recommendation === 'bid' ? 'BID' : 'NO-BID'}
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Strengths */}
          <div>
            <h4 className="text-base font-semibold mb-3">Key Strengths</h4>
            <div className="space-y-2">
              {strengths.length === 0 ? (
                <p className="text-sm text-muted-foreground">No strengths identified</p>
              ) : (
                strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="size-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <p className="text-foreground">{strength}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Key Concerns */}
          <div>
            <h4 className="text-base font-semibold mb-3">Key Concerns</h4>
            <div className="space-y-2">
              {concerns.length === 0 ? (
                <p className="text-sm text-muted-foreground">No concerns identified</p>
              ) : (
                concerns.map((concern, index) => (
                  <div
                    key={index}
                    className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-3"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="size-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800 dark:text-red-300">{concern}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Mock data generator for MVP
export function getMockBidRecommendation(): {
  recommendation: 'bid' | 'no-bid'
  reasoning: string
  strengths: string[]
  concerns: string[]
} {
  return {
    recommendation: 'no-bid',
    reasoning: 'Based on assessment criteria, limited customer relationship and compliance gaps present significant risks.',
    strengths: [
      'Atomic Technology Services has 16 years of established operations (since 2008) as a leading Australian MSP with comprehensive technology solutions including cloud services, cybersecurity, and Linux system administration that directly align with DIRD\'s requirements.',
      'This company has national presence with headquarters in Melbourne and regional offices in Sydney, Brisbane, Adelaide, and Perth, providing local support across Australia\'s major cities where DIRD has significant office locations and staff concentrations.',
      'Atomic Technology Services supports over 800 clients across Australia and New Zealand, demonstrating scale and experience managing large client portfolios, which indicates capability to handle DIRD\'s complex multi-location requirements across 45 offices.',
    ],
    concerns: [
      'The company profile lacks critical mandatory compliance information including security certifications (ISO 27001, SOC 2 Type II), financial capacity details (annual revenue $50M+, net assets $10M+), and security clearance capabilities required for government work, creating significant pass/fail compliance risks.',
      'With a calculated score of 0.42 on a 0.0-10 scale, Atomic Technology Services appears to have substantial capability gaps or competitive disadvantages that could significantly impact their ability to win this AUD 45-60 million contract against stronger competitors.',
      'The profile provides no information about 24/7 SOC capabilities, government governance, or staff numbers (requiring 100+ staff in Australia), which are mandatory requirements that could result in immediate disqualification if not addressed in the formal tender submission.',
    ],
  }
}
