import { SupabaseClient } from '@supabase/supabase-js'

export async function listProjectDocuments(
  supabase: SupabaseClient,
  projectId: string
) {
  const { data, error } = await supabase
    .from('project_documents')
    .select('*')
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProjectDocument(
  supabase: SupabaseClient,
  docId: string
) {
  const { data, error } = await supabase
    .from('project_documents')
    .select('*')
    .eq('id', docId)
    .single()

  if (error) throw error
  return data
}

export async function createProjectDocument(
  supabase: SupabaseClient,
  data: {
    project_id: string
    name: string
    file_path: string
    file_type: string
    file_size: number
    uploaded_by: string
    is_primary_rft?: boolean
    content_text?: string
    content_extracted?: boolean
  }
) {
  const { data: doc, error } = await supabase
    .from('project_documents')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return doc
}

export async function updatePrimaryRFT(
  supabase: SupabaseClient,
  projectId: string,
  docId: string
) {
  // Unset all primary RFTs for this project
  await supabase
    .from('project_documents')
    .update({ is_primary_rft: false })
    .eq('project_id', projectId)

  // Set this document as primary
  const { data, error } = await supabase
    .from('project_documents')
    .update({ is_primary_rft: true })
    .eq('id', docId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProjectDocument(
  supabase: SupabaseClient,
  docId: string
) {
  const { error } = await supabase
    .from('project_documents')
    .delete()
    .eq('id', docId)

  if (error) throw error
}
