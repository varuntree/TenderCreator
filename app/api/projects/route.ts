import { NextRequest } from 'next/server'

import { apiError, apiSuccess, AuthContext,withAuth } from '@/libs/api-utils'
import {
  createProject,
  getOrganizationByUserId,
  listProjects,
} from '@/libs/repositories'

async function handleGET(request: NextRequest, { user, supabase }: AuthContext) {
  try {
    const org = await getOrganizationByUserId(supabase, user.id)
    if (!org) return apiError('Organization not found', 404)
    const projects = await listProjects(supabase, org.id)
    return apiSuccess(projects)
  } catch (error) {
    return apiError(error as Error)
  }
}

async function handlePOST(request: NextRequest, { user, supabase }: AuthContext) {
  try {
    const body = await request.json()
    const { name, client_name, deadline, instructions } = body

    if (!name) {
      return apiError('Project name is required', 400)
    }

    const org = await getOrganizationByUserId(supabase, user.id)
    if (!org) return apiError('Organization not found', 404)

    const project = await createProject(supabase, {
      organization_id: org.id,
      name,
      client_name,
      deadline,
      instructions,
      created_by: user.id,
      status: 'draft',
    })

    return apiSuccess(project)
  } catch (error) {
    return apiError(error as Error)
  }
}

export const GET = withAuth(handleGET)
export const POST = withAuth(handlePOST)
