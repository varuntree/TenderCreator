import { Folder } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'

interface FolderProjectCardProps {
  project: {
    id: string
    name: string
    client_name?: string
    deadline?: string
    status: string
  }
  colorIndex: number
}

const COLOR_VARIANTS = ['blue', 'green', 'purple', 'orange', 'pink']

export default function FolderProjectCard({ project, colorIndex }: FolderProjectCardProps) {
  const colorVariant = COLOR_VARIANTS[colorIndex % COLOR_VARIANTS.length]

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group relative h-full transition-all duration-300 ease-in-out hover:scale-105 hover:-translate-y-1 hover:shadow-xl">
        {/* Shine effect on hover */}
        <div className="absolute inset-0 overflow-hidden rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 translate-x-[-200%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-[200%]" />
        </div>

        {/* Folder container */}
        <div className="relative h-full">
          {/* Folder tab */}
          <div
            className="relative h-7 flex items-center justify-center px-3"
            style={{
              clipPath: 'polygon(0% 100%, 0% 25%, 8% 0%, 45% 0%, 52% 25%, 100% 25%, 100% 100%)',
              background: `linear-gradient(135deg, hsl(var(--folder-${colorVariant}-from)), hsl(var(--folder-${colorVariant}-to)))`,
            }}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Folder className="h-3.5 w-3.5 flex-shrink-0 text-foreground/60" />
              <h3 className="truncate text-xs font-semibold text-foreground">
                {project.name}
              </h3>
            </div>
          </div>

          {/* Folder body */}
          <div
            className="relative rounded-b-md p-4 h-[calc(100%-1.75rem)]"
            style={{
              background: `linear-gradient(135deg, hsl(var(--folder-${colorVariant}-from)), hsl(var(--folder-${colorVariant}-to)))`,
            }}
          >
            <div className="flex h-full flex-col justify-between space-y-2">
              {/* Status badge */}
              <div className="flex justify-end">
                <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
                  {project.status}
                </Badge>
              </div>

              {/* Metadata */}
              <div className="space-y-1.5 text-xs text-foreground/70">
                {project.client_name && (
                  <div className="flex items-start gap-1.5">
                    <span className="font-medium">Client:</span>
                    <span className="truncate">{project.client_name}</span>
                  </div>
                )}
                {project.deadline && (
                  <div className="flex items-start gap-1.5">
                    <span className="font-medium">Due:</span>
                    <span>{new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
