import { ChevronLeft,ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { WorkPackage } from '@/libs/repositories/work-packages'

interface RequirementsViewProps {
  workPackage: WorkPackage
  projectId: string
  onContinue: () => void
}

export function RequirementsView({ workPackage, projectId, onContinue }: RequirementsViewProps) {
  const mandatoryReqs = workPackage.requirements.filter(r => r.priority === 'mandatory')
  const optionalReqs = workPackage.requirements.filter(r => r.priority === 'optional')

  return (
    <div className="space-y-8">
      {/* Header Section - Improved */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{workPackage.document_type}</h2>
          {workPackage.document_description && (
            <p className="text-base text-muted-foreground">{workPackage.document_description}</p>
          )}
        </div>
        <Badge variant="outline" className="text-base px-5 py-2 shrink-0 border-primary text-primary">
          {workPackage.requirements.length} Requirements
        </Badge>
      </div>

      {/* Mandatory Requirements - Improved Spacing */}
      {mandatoryReqs.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Mandatory Requirements</h3>
          <div className="space-y-3">
            {mandatoryReqs.map(req => (
              <Card key={req.id} className="border-l-4 border-l-destructive">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Badge variant="destructive" className="shrink-0 px-3 py-1">
                      Mandatory
                    </Badge>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm leading-relaxed">{req.text}</p>
                      <p className="text-xs text-muted-foreground/80">
                        Source: {req.source}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Optional Requirements - Improved Spacing */}
      {optionalReqs.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Optional Requirements</h3>
          <div className="space-y-3">
            {optionalReqs.map(req => (
              <Card key={req.id} className="border-l-4 border-l-muted">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Badge variant="secondary" className="shrink-0 px-3 py-1">
                      Optional
                    </Badge>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm leading-relaxed">{req.text}</p>
                      <p className="text-xs text-muted-foreground/80">
                        Source: {req.source}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {mandatoryReqs.length === 0 && optionalReqs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No requirements have been identified for this work package.</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons - Improved Spacing */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" size="lg" asChild>
          <Link href={`/projects/${projectId}`}>
            <ChevronLeft className="mr-2 size-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Button size="lg" onClick={onContinue}>
          Continue
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  )
}
