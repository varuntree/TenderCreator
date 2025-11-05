import { SupabaseClient } from '@supabase/supabase-js'

export async function listProjects(supabase: SupabaseClient, orgId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProject(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) throw error
  return data
}

export async function createProject(
  supabase: SupabaseClient,
  data: {
    organization_id: string
    name: string
    client_name?: string
    deadline?: string
    instructions?: string
    created_by: string
    status?: 'draft' | 'active' | 'completed' | 'archived'
  }
) {
  const { data: project, error } = await supabase
    .from('projects')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return project
}

export async function updateProject(
  supabase: SupabaseClient,
  projectId: string,
  data: {
    name?: string
    client_name?: string
    deadline?: string
    instructions?: string
    status?: 'draft' | 'active' | 'completed' | 'archived'
  }
) {
  const { data: updated, error } = await supabase
    .from('projects')
    .update(data)
    .eq('id', projectId)
    .select()
    .single()

  if (error) throw error
  return updated
}

export async function deleteProject(supabase: SupabaseClient, projectId: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) throw error
}
