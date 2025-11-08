import { SupabaseClient } from '@supabase/supabase-js'

import { isValidUuid } from '@/libs/utils/is-uuid'

export async function getOrganization(supabase: SupabaseClient, orgId: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()

  if (error) throw error
  return data
}

export async function getOrganizationByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<{ id: string; name: string } | null> {
  if (!isValidUuid(userId)) {
    console.warn(
      '[organizations] Skipping lookup for non-UUID user id. Running in preview mode?',
      userId
    )
    return null
  }
  const { data, error } = await supabase
    .from('users')
    .select('organization_id, organizations(*)')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching organization by user ID:', error)
    return null
  }

  if (!data) return null

  const orgData = data?.organizations as unknown
  return orgData as {id: string; name: string} | null
}

export async function createOrganization(
  supabase: SupabaseClient,
  name: string,
  userId: string,
  userEmail?: string,
  userName?: string | null
) {
  if (!isValidUuid(userId)) {
    throw new Error('Cannot create organization for temporary sessions without a valid user id')
  }
  // Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name, settings: {} })
    .select()
    .single()

  if (orgError) throw orgError

  // Get user email if not provided
  if (!userEmail) {
    const { data: { user } } = await supabase.auth.getUser()
    userEmail = user?.email || ''
  }

  // Create user record as admin
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: userEmail,
      name: userName,
      organization_id: org.id,
      role: 'admin',
    })

  if (userError) throw userError

  return org
}

export async function updateOrganization(
  supabase: SupabaseClient,
  orgId: string,
  data: { name?: string; settings?: Record<string, unknown> }
) {
  const { data: updated, error } = await supabase
    .from('organizations')
    .update(data)
    .eq('id', orgId)
    .select()
    .single()

  if (error) throw error
  return updated
}

export async function deleteOrganization(
  supabase: SupabaseClient,
  orgId: string
) {
  // Delete organization (cascading deletes will handle related data via foreign keys)
  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', orgId)

  if (error) throw error
  return { success: true }
}
