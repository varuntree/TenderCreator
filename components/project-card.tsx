import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    client_name?: string
    deadline?: string
    status: string
  }
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="h-full transition-shadow hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <Badge variant="outline">{project.status}</Badge>
          </div>
          {project.client_name && (
            <CardDescription>{project.client_name}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {project.deadline && (
            <p className="text-sm text-gray-500">
              Due: {new Date(project.deadline).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
