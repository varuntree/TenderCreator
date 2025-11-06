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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{workPackage.document_type}</h2>
          <p className="text-muted-foreground">{workPackage.document_description}</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {workPackage.requirements.length} Requirements
        </Badge>
      </div>

      {mandatoryReqs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Mandatory Requirements</h3>
          <div className="space-y-2">
            {mandatoryReqs.map(req => (
              <Card key={req.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="destructive">Mandatory</Badge>
                    <div className="flex-1">
                      <p className="text-sm">{req.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">Source: {req.source}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {optionalReqs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Optional Requirements</h3>
          <div className="space-y-2">
            {optionalReqs.map(req => (
              <Card key={req.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Badge>Optional</Badge>
                    <div className="flex-1">
                      <p className="text-sm">{req.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">Source: {req.source}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" asChild>
          <Link href={`/projects/${projectId}`}>
            <ChevronLeft className="mr-2 size-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Button onClick={onContinue}>
          Continue
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  )
}
