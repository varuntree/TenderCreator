import { NextRequest } from 'next/server'

import { extractTextFromFile } from '@/libs/ai/extraction'
import { apiError, apiSuccess, AuthContext,withAuth } from '@/libs/api-utils'
import {
  createProjectDocument,
  getProject,
  listProjectDocuments,
} from '@/libs/repositories'

async function handleGET(
  request: NextRequest,
  { supabase }: AuthContext,
  params: { params: { id: string } }
) {
  try {
    const projectId = params.params.id
    const documents = await listProjectDocuments(supabase, projectId)
    return apiSuccess(documents)
  } catch (error) {
    return apiError(error as Error)
  }
}

async function handlePOST(
  request: NextRequest,
  { user, supabase }: AuthContext,
  params: { params: { id: string } }
) {
  try {
    const projectId = params.params.id
    const formData = await request.formData()
    const file = formData.get('file') as File
    const isPrimary = formData.get('is_primary_rft') === 'true'

    if (!file) {
      return apiError('No file provided', 400)
    }

    // Get project to verify access
    const project = await getProject(supabase, projectId)

    // Upload to Supabase Storage
    const fileId = crypto.randomUUID()
    const filePath = `${project.organization_id}/projects/${projectId}/${fileId}/${file.name}`

    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Extract text via Gemini
    const contentText = await extractTextFromFile(
      fileBuffer,
      file.name,
      file.type
    )

    // Create document record
    const document = await createProjectDocument(supabase, {
      project_id: projectId,
      name: file.name,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: user.id,
      is_primary_rft: isPrimary,
      content_text: contentText,
      content_extracted: !!contentText,
    })

    return apiSuccess(document)
  } catch (error) {
    return apiError(error as Error)
  }
}

export const GET = withAuth(handleGET)
export const POST = withAuth(handlePOST)
