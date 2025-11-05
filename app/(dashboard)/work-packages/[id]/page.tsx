import { ChevronLeft, FileText } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { StatusBadge } from '@/components/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getWorkPackageWithProject } from '@/libs/repositories/work-packages'
import { createClient as createServerClient } from '@/libs/supabase/server'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function WorkPackageDetailPage({ params }: PageProps) {
  const supabase = await createServerClient()
  const { id } = await params

  let workPackage
  let project

  try {
    const result = await getWorkPackageWithProject(supabase, id)
    workPackage = result.workPackage
    project = result.project
  } catch (error) {
    console.error('Error loading work package:', error)
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href={`/projects/${project.id}`}
          className="hover:text-foreground transition-colors"
        >
          {project.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{workPackage.document_type}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{workPackage.document_type}</h1>
          {workPackage.document_description && (
            <p className="text-muted-foreground mt-2">
              {workPackage.document_description}
            </p>
          )}
        </div>
        <Link href={`/projects/${project.id}`}>
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Button>
        </Link>
      </div>

      {/* Metadata Card */}
      <Card>
        <CardHeader>
          <CardTitle>Work Package Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Requirements</p>
              <Badge variant="outline" className="text-base">
                {workPackage.requirements.length} requirements
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <StatusBadge status={workPackage.status} />
            </div>
          </div>

          {workPackage.requirements.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Requirements List</p>
              <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                {workPackage.requirements.map((req) => (
                  <div key={req.id} className="p-3 space-y-1">
                    <div className="flex items-start gap-2">
                      <p className="flex-1 text-sm">{req.text}</p>
                      <Badge
                        variant={
                          req.priority === 'mandatory' ? 'default' : 'secondary'
                        }
                      >
                        {req.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{req.source}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Placeholder for Phase 4 */}
      <Card className="border-dashed">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-muted p-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Content Workflow Coming in Phase 4
              </h3>
              <p className="text-muted-foreground max-w-md">
                Requirements → Strategy → Generate → Edit → Export
              </p>
            </div>
            <Button disabled className="mt-4">
              Continue to Workflow →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
