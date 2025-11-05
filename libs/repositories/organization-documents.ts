import { SupabaseClient } from '@supabase/supabase-js'

export async function listOrganizationDocuments(
  supabase: SupabaseClient,
  orgId: string
) {
  const { data, error } = await supabase
    .from('organization_documents')
    .select('*')
    .eq('organization_id', orgId)
    .order('uploaded_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getOrganizationDocument(
  supabase: SupabaseClient,
  docId: string
) {
  const { data, error } = await supabase
    .from('organization_documents')
    .select('*')
    .eq('id', docId)
    .single()

  if (error) throw error
  return data
}

export async function createOrganizationDocument(
  supabase: SupabaseClient,
  data: {
    organization_id: string
    name: string
    file_path: string
    file_type: string
    file_size: number
    uploaded_by: string
    category?: string
    tags?: string[]
    content_text?: string
    content_extracted?: boolean
  }
) {
  const { data: doc, error } = await supabase
    .from('organization_documents')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return doc
}

export async function deleteOrganizationDocument(
  supabase: SupabaseClient,
  docId: string
) {
  const { error } = await supabase
    .from('organization_documents')
    .delete()
    .eq('id', docId)

  if (error) throw error
}
