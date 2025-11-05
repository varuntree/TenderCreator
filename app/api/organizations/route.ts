import { NextRequest } from 'next/server'

import { apiError, apiSuccess, AuthContext,withAuth } from '@/libs/api-utils'
import {
  createOrganization,
  getOrganizationByUserId,
} from '@/libs/repositories'

async function handleGET(request: NextRequest, { user, supabase }: AuthContext) {
  try {
    // Try to get user's organization
    let org = await getOrganizationByUserId(supabase, user.id).catch(() => null)

    // If no org exists, create one (first sign-in)
    if (!org) {
      const email = user.email || user.id
      const orgName = `${email.split('@')[0]}'s Organization`
      org = await createOrganization(supabase, orgName, user.id)
    }

    return apiSuccess(org)
  } catch (error) {
    return apiError(error as Error)
  }
}

export const GET = withAuth(handleGET)
