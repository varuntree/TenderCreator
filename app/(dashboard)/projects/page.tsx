import Link from 'next/link'

import ProjectCard from '@/components/project-card'
import { Button } from '@/components/ui/button'
import { getOrganizationByUserId,listProjects } from '@/libs/repositories'
import { createClient } from '@/libs/supabase/server'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const org = await getOrganizationByUserId(supabase, user.id)

  // If no organization exists, show setup message
  if (!org) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
        <p className="text-gray-500 mb-4">
          Setting up your organization... Please refresh the page.
        </p>
        <p className="text-sm text-gray-400">
          If this persists, please contact support.
        </p>
      </div>
    )
  }

  const projects = await listProjects(supabase, org.id)

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link href="/projects/new">
          <Button>Create Project</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No projects yet</p>
          <Link href="/projects/new">
            <Button>Create your first project</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
