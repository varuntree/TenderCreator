import { SupabaseClient } from '@supabase/supabase-js'

export type WorkPackageStatus = 'pending' | 'in_progress' | 'review' | 'completed'

// TypeScript interfaces
export interface Requirement {
  id: string
  text: string
  priority: 'mandatory' | 'optional'
  source: string
}

export interface WorkPackage {
  id: string
  project_id: string
  document_type: string
  document_description: string | null
  requirements: Requirement[]
  assigned_to: string | null
  status: WorkPackageStatus
  order: number
  created_at: string
  updated_at: string
}

export interface CreateWorkPackageData {
  project_id: string
  document_type: string
  document_description?: string | null
  requirements?: Requirement[]
  order?: number
  status?: WorkPackageStatus
}

export interface UpdateWorkPackageData {
  document_type?: string
  document_description?: string | null
  requirements?: Requirement[]
  status?: WorkPackageStatus
  assigned_to?: string | null
}

/**
 * Create a work package with requirements
 */
export async function createWorkPackage(
  supabase: SupabaseClient,
  data: CreateWorkPackageData
): Promise<WorkPackage> {
  const { data: workPackage, error } = await supabase
    .from('work_packages')
    .insert({
      project_id: data.project_id,
      document_type: data.document_type,
      document_description: data.document_description || null,
      requirements: data.requirements || [],
      order: data.order || 0,
      status: data.status || 'pending',
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create work package: ${error.message}`)
  }

  return workPackage
}

/**
 * List all work packages for a project
 */
export async function listWorkPackages(
  supabase: SupabaseClient,
  projectId: string
): Promise<WorkPackage[]> {
  const { data: workPackages, error } = await supabase
    .from('work_packages')
    .select(`
      *,
      assigned_user:users!work_packages_assigned_to_fkey(id, email, name)
    `)
    .eq('project_id', projectId)
    .order('order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to list work packages: ${error.message}`)
  }

  return workPackages || []
}

/**
 * Get a single work package by id
 */
export async function getWorkPackage(
  supabase: SupabaseClient,
  id: string
): Promise<WorkPackage> {
  const { data: workPackage, error } = await supabase
    .from('work_packages')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to get work package: ${error.message}`)
  }

  return workPackage
}

/**
 * Update a work package
 */
export async function updateWorkPackage(
  supabase: SupabaseClient,
  id: string,
  data: UpdateWorkPackageData
): Promise<WorkPackage> {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  }

  if (data.document_type !== undefined) updateData.document_type = data.document_type
  if (data.document_description !== undefined) updateData.document_description = data.document_description
  if (data.requirements !== undefined) updateData.requirements = data.requirements
  if (data.status !== undefined) updateData.status = data.status
  if (data.assigned_to !== undefined) updateData.assigned_to = data.assigned_to

  const { data: workPackage, error } = await supabase
    .from('work_packages')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update work package: ${error.message}`)
  }

  return workPackage
}

/**
 * Delete a work package
 */
export async function deleteWorkPackage(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('work_packages')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete work package: ${error.message}`)
  }
}

/**
 * Update work package assignment
 */
export async function updateWorkPackageAssignment(
  supabase: SupabaseClient,
  workPackageId: string,
  userId: string
): Promise<WorkPackage> {
  const { data: workPackage, error } = await supabase
    .from('work_packages')
    .update({
      assigned_to: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', workPackageId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update work package assignment: ${error.message}`)
  }

  return workPackage
}

/**
 * Update work package status
 */
export async function updateWorkPackageStatus(
  supabase: SupabaseClient,
  workPackageId: string,
  status: WorkPackageStatus
): Promise<WorkPackage> {
  const { data: workPackage, error } = await supabase
    .from('work_packages')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', workPackageId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update work package status: ${error.message}`)
  }

  return workPackage
}

/**
 * Get work package with project info
 */
export async function getWorkPackageWithProject(
  supabase: SupabaseClient,
  workPackageId: string
): Promise<{ workPackage: WorkPackage; project: any }> {
  const { data: workPackage, error } = await supabase
    .from('work_packages')
    .select(`
      *,
      project:projects(*)
    `)
    .eq('id', workPackageId)
    .single()

  if (error) {
    throw new Error(`Failed to get work package with project: ${error.message}`)
  }

  return {
    workPackage: workPackage,
    project: workPackage.project,
  }
}

/**
 * Get all completed work packages for a project
 * Used for bulk export
 */
export async function listCompletedWorkPackages(
  supabase: SupabaseClient,
  projectId: string
): Promise<WorkPackage[]> {
  const { data, error } = await supabase
    .from('work_packages')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'completed')
    .order('order', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Get next incomplete work package for workflow navigation
 * Returns first work package with status='pending'
 * Returns null if all complete
 */
export async function getNextIncompleteWorkPackage(
  supabase: SupabaseClient,
  projectId: string
): Promise<WorkPackage | null> {
  const { data, error } = await supabase
    .from('work_packages')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'pending')
    .order('order', { ascending: true })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data || null
}
