import { SupabaseClient } from '@supabase/supabase-js'
import { BidAnalysis } from '@/libs/ai/bid-analysis'

export interface WorkPackageContent {
  id: string
  work_package_id: string
  win_themes: string[]
  key_messages: string[]
  bid_analysis: BidAnalysis | null
  content: string // HTML/Markdown
  content_version: number
  exported_file_path: string | null
  exported_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateWorkPackageContentData {
  work_package_id: string
  win_themes?: string[]
  key_messages?: string[]
  bid_analysis?: BidAnalysis | null
  content?: string
}

export interface UpdateWorkPackageContentData {
  win_themes?: string[]
  key_messages?: string[]
  bid_analysis?: BidAnalysis | null
  content?: string
  exported_file_path?: string | null
  exported_at?: string | null
}

/**
 * Get work package content by work package ID
 */
export async function getWorkPackageContent(
  supabase: SupabaseClient,
  workPackageId: string
): Promise<WorkPackageContent | null> {
  const { data, error } = await supabase
    .from('work_package_content')
    .select('*')
    .eq('work_package_id', workPackageId)
    .single()

  if (error) {
    // Return null if not found (first time generation)
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get work package content: ${error.message}`)
  }

  return data
}

/**
 * Create work package content record
 */
export async function createWorkPackageContent(
  supabase: SupabaseClient,
  data: CreateWorkPackageContentData
): Promise<WorkPackageContent> {
  const { data: content, error } = await supabase
    .from('work_package_content')
    .insert({
      work_package_id: data.work_package_id,
      win_themes: data.win_themes || [],
      key_messages: data.key_messages || [],
      content: data.content || '',
      content_version: 1,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create work package content: ${error.message}`)
  }

  return content
}

/**
 * Update work package content
 */
export async function updateWorkPackageContent(
  supabase: SupabaseClient,
  id: string,
  data: UpdateWorkPackageContentData
): Promise<WorkPackageContent> {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  }

  if (data.win_themes !== undefined) updateData.win_themes = data.win_themes
  if (data.key_messages !== undefined) updateData.key_messages = data.key_messages
  if (data.bid_analysis !== undefined) updateData.bid_analysis = data.bid_analysis
  if (data.content !== undefined) {
    updateData.content = data.content
  }
  if (data.exported_file_path !== undefined) updateData.exported_file_path = data.exported_file_path
  if (data.exported_at !== undefined) updateData.exported_at = data.exported_at

  const { data: content, error } = await supabase
    .from('work_package_content')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update work package content: ${error.message}`)
  }

  // Increment version after successful content update
  if (data.content !== undefined && content) {
    const currentVersion = content.content_version || 0
    const { error: versionError } = await supabase
      .from('work_package_content')
      .update({ content_version: currentVersion + 1 })
      .eq('id', id)

    if (!versionError) {
      content.content_version = currentVersion + 1
    }
  }

  return content
}

/**
 * Save win themes for work package
 * Uses upsert pattern to handle race conditions
 */
export async function saveWinThemes(
  supabase: SupabaseClient,
  workPackageId: string,
  themes: string[]
): Promise<WorkPackageContent> {
  if (!workPackageId) {
    throw new Error('Work package ID is required')
  }

  if (!Array.isArray(themes)) {
    throw new Error('Themes must be an array')
  }

  // Check if content record exists
  const existing = await getWorkPackageContent(supabase, workPackageId)

  if (existing) {
    // Update existing
    console.log(`[saveWinThemes] Updating existing content record ${existing.id}`)
    return await updateWorkPackageContent(supabase, existing.id, { win_themes: themes })
  } else {
    // Create new
    console.log(`[saveWinThemes] Creating new content record for work package ${workPackageId}`)
    return await createWorkPackageContent(supabase, {
      work_package_id: workPackageId,
      win_themes: themes,
    })
  }
}

/**
 * Save generated content for work package
 */
export async function saveGeneratedContent(
  supabase: SupabaseClient,
  workPackageId: string,
  content: string
): Promise<WorkPackageContent> {
  const existing = await getWorkPackageContent(supabase, workPackageId)

  if (!existing) {
    throw new Error('Work package content not found - win themes must be generated first')
  }

  return await updateWorkPackageContent(supabase, existing.id, { content })
}

/**
 * Save exported file metadata
 */
export async function saveExportedFile(
  supabase: SupabaseClient,
  workPackageId: string,
  filePath: string
): Promise<WorkPackageContent> {
  const existing = await getWorkPackageContent(supabase, workPackageId)

  if (!existing) {
    throw new Error('Work package content not found - cannot save export metadata')
  }

  return await updateWorkPackageContent(supabase, existing.id, {
    exported_file_path: filePath,
    exported_at: new Date().toISOString(),
  })
}

/**
 * Save bid analysis for work package
 * Uses upsert pattern to handle race conditions
 */
export async function saveBidAnalysis(
  supabase: SupabaseClient,
  workPackageId: string,
  analysis: BidAnalysis
): Promise<WorkPackageContent> {
  if (!workPackageId) {
    throw new Error('Work package ID is required')
  }

  if (!analysis) {
    throw new Error('Bid analysis is required')
  }

  // Check if content record exists
  const existing = await getWorkPackageContent(supabase, workPackageId)

  if (existing) {
    // Update existing
    console.log(`[saveBidAnalysis] Updating existing content record ${existing.id}`)
    return await updateWorkPackageContent(supabase, existing.id, { bid_analysis: analysis })
  } else {
    // Create new
    console.log(`[saveBidAnalysis] Creating new content record for work package ${workPackageId}`)
    return await createWorkPackageContent(supabase, {
      work_package_id: workPackageId,
      bid_analysis: analysis,
    })
  }
}
