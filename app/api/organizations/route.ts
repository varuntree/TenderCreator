import { NextRequest } from 'next/server'

import { apiError, apiSuccess, AuthContext, withAuth } from '@/libs/api-utils'
import {
  createOrganization,
  deleteOrganization,
  getOrganizationByUserId,
  updateOrganization,
} from '@/libs/repositories'
import { isValidUuid } from '@/libs/utils/is-uuid'

async function handleGET(request: NextRequest, { user, supabase }: AuthContext) {
  try {
    // Try to get user's organization
    let org = await getOrganizationByUserId(supabase, user.id).catch(() => null)

    // If no org exists, create one (first sign-in)
    if (!org) {
      if (!isValidUuid(user.id)) {
        return apiSuccess({
          id: 'preview-org',
          name: 'Preview Organization',
        })
      }
      const email = user.email || user.id
      const orgName = `${email.split('@')[0]}'s Organization`
      org = await createOrganization(supabase, orgName, user.id)
    }

    return apiSuccess(org)
  } catch (error) {
    return apiError(error as Error)
  }
}

async function handlePUT(request: NextRequest, { user, supabase }: AuthContext) {
  try {
    const body = await request.json()
    const { name, settings } = body

    // Get user's organization
    const org = await getOrganizationByUserId(supabase, user.id)
    if (!org) return apiError('Organization not found', 404)

    // Update organization
    const updated = await updateOrganization(supabase, org.id, {
      name,
      settings,
    })

    return apiSuccess(updated)
  } catch (error) {
    return apiError(error as Error)
  }
}

async function handleDELETE(request: NextRequest, { user, supabase }: AuthContext) {
  try {
    // Get user's organization
    const org = await getOrganizationByUserId(supabase, user.id)
    if (!org) return apiError('Organization not found', 404)

    // Delete organization
    await deleteOrganization(supabase, org.id)

    return apiSuccess({ message: 'Organization deleted successfully' })
  } catch (error) {
    return apiError(error as Error)
  }
}

export const GET = withAuth(handleGET)
export const PUT = withAuth(handlePUT)
export const DELETE = withAuth(handleDELETE)
