'use client'

import { Info } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export interface AssessmentCriterion {
  id: string
  name: string
  description: string
  score: number // 0-5
  weight: number // as decimal (0.167 = 16.7%)
  weightedScore: number
}

interface AssessmentParametersTableProps {
  criteria: AssessmentCriterion[]
  totalScore: number
  incumbentStatus?: string
  onIncumbentStatusChange?: (status: string) => void
  className?: string
}

export function AssessmentParametersTable({
  criteria,
  totalScore,
  incumbentStatus = 'unknown',
  onIncumbentStatusChange,
  className,
}: AssessmentParametersTableProps) {
  const formatPercentage = (decimal: number) => `${(decimal * 100).toFixed(1)}%`
  const formatScore = (score: number) => `${score} / 5`

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              2.2 <span className="text-muted-foreground">|</span> Assessment Parameters
            </h3>
            <div className="flex items-start gap-2 text-sm bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 text-blue-800 dark:text-blue-300">
              <Info className="size-4 mt-0.5 shrink-0" />
              <p>
                Adjust the individual metrics below to calculate overall scores.
                Each criterion uses specific metrics rather than direct scoring.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="ml-4 shrink-0 text-lg px-4 py-2">
            Total Score: <span className="font-bold ml-1">{totalScore}%</span>
          </Badge>
        </div>

        {/* Incumbent Status */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Incumbent Status</label>
          <Select value={incumbentStatus} onValueChange={onIncumbentStatusChange}>
            <SelectTrigger className="w-[250px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unknown">Unknown Incumbent</SelectItem>
              <SelectItem value="known">Known Incumbent</SelectItem>
              <SelectItem value="we-are">We Are Incumbent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assessment Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Criteria</TableHead>
                <TableHead className="font-semibold w-[120px]">Score (1-5)</TableHead>
                <TableHead className="font-semibold w-[100px]">Weight</TableHead>
                <TableHead className="font-semibold w-[140px]">Weighted Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {criteria.map((criterion) => (
                <TableRow key={criterion.id}>
                  <TableCell className="py-4">
                    <div>
                      <p className="font-semibold text-sm">{criterion.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{criterion.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          criterion.score === 0 && 'bg-gray-400',
                          criterion.score > 0 && criterion.score <= 2 && 'bg-red-500',
                          criterion.score > 2 && criterion.score <= 3.5 && 'bg-yellow-500',
                          criterion.score > 3.5 && 'bg-green-500'
                        )}
                      />
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {formatScore(criterion.score)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-sm">
                    {formatPercentage(criterion.weight)}
                  </TableCell>
                  <TableCell className="py-4 text-sm font-medium">
                    {criterion.weightedScore.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// Mock data generator for MVP
export function getMockAssessmentCriteria(): AssessmentCriterion[] {
  return [
    {
      id: '1',
      name: 'Customer Relationship',
      description: 'Existing relationship, past performance, access to decision makers',
      score: 0,
      weight: 0.167,
      weightedScore: 0,
    },
    {
      id: '2',
      name: 'Strategic Alignment',
      description: 'Alignment with business strategy, market priorities, growth objectives',
      score: 5,
      weight: 0.167,
      weightedScore: 0.17,
    },
    {
      id: '3',
      name: 'Competitive Positioning',
      description: 'Competitive landscape, differentiating strengths, prime vs sub positioning',
      score: 2.5,
      weight: 0.167,
      weightedScore: 0.08,
    },
    {
      id: '4',
      name: 'Solution Capability',
      description: 'Requirements coverage, expertise availability, similar experience',
      score: 2.5,
      weight: 0.167,
      weightedScore: 0.08,
    },
    {
      id: '5',
      name: 'Resource Availability',
      description: 'Staff availability, project size fit, external resource needs',
      score: 1.7,
      weight: 0.167,
      weightedScore: 0.06,
    },
    {
      id: '6',
      name: 'Profitability Potential',
      description: 'Profit margin expectations, payment terms, future opportunities',
      score: 2.5,
      weight: 0.167,
      weightedScore: 0.08,
    },
  ]
}
