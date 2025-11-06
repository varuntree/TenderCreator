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
  const gradientFrom = `hsl(var(--folder-${colorVariant}-from))`
  const gradientTo = `hsl(var(--folder-${colorVariant}-to))`

  const hasMetadata = Boolean(project.client_name || project.deadline)

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block focus-visible:outline-none"
    >
      <article className="relative isolate flex h-full flex-col">
        {/* Drop shadow base */}
        <div className="pointer-events-none absolute inset-x-3 bottom-2 top-6 rounded-3xl bg-black/5 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

        <div
          className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/30 bg-white/40 p-6 pt-12 text-left shadow-sm ring-1 ring-black/5 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-[1.01] group-hover:shadow-2xl group-focus-visible:ring-2 group-focus-visible:ring-primary/60"
          style={{
            backgroundImage: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            clipPath: 'polygon(0 18%, 12% 0, 100% 0, 100% 100%, 0 100%)',
          }}
        >
          {/* Folder tab */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-8 top-0 flex h-10 items-center gap-2 rounded-t-xl border border-white/50 px-4 text-xs font-semibold uppercase tracking-wide text-foreground/70 shadow-[0_4px_12px_rgba(15,23,42,0.08)]"
            style={{
              backgroundImage: `linear-gradient(120deg, ${gradientFrom}, ${gradientTo})`,
              clipPath: 'polygon(0 100%, 0 25%, 12% 0, 85% 0, 100% 30%, 100% 100%)',
            }}
          >
            <Folder className="h-4 w-4 text-foreground/70" />
            <span>Project</span>
          </div>

          {/* Shine overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-0 -translate-x-full rotate-6 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </div>

          <div className="flex flex-1 flex-col justify-between gap-6 text-foreground">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                    Active Folder
                  </p>
                  <h3 className="text-xl font-semibold leading-tight text-foreground line-clamp-2">
                    {project.name}
                  </h3>
                </div>
                <Badge className="rounded-full border border-white/50 bg-white/70 px-4 py-1 text-xs font-medium uppercase tracking-wide text-foreground shadow-sm backdrop-blur">
                  {project.status}
                </Badge>
              </div>

              <div className="h-px w-full bg-white/50" />
            </div>

            <dl className="space-y-4 text-sm text-foreground/80">
              {project.client_name && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-foreground/60">Client</dt>
                  <dd className="text-base font-medium leading-tight">
                    {project.client_name}
                  </dd>
                </div>
              )}
              {project.deadline && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-foreground/60">Due</dt>
                  <dd className="text-base font-medium">
                    {new Date(project.deadline).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
            {!hasMetadata && (
              <p className="text-sm text-foreground/60">
                Add a client or due date to keep this folder organized.
              </p>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
