import { NextRequest } from 'next/server'

import { extractTextFromFile } from '@/libs/ai/extraction'
import { apiError, apiSuccess, AuthContext,withAuth } from '@/libs/api-utils'
import {
  createOrganizationDocument,
  getOrganizationByUserId,
  listOrganizationDocuments,
} from '@/libs/repositories'

async function handleGET(request: NextRequest, { user, supabase }: AuthContext) {
  try {
    const org = await getOrganizationByUserId(supabase, user.id)
    if (!org) return apiError('Organization not found', 404)
    const documents = await listOrganizationDocuments(supabase, org.id)
    return apiSuccess(documents)
  } catch (error) {
    return apiError(error as Error)
  }
}

async function handlePOST(request: NextRequest, { user, supabase }: AuthContext) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string | null
    const tags = formData.get('tags') as string | null

    if (!file) {
      return apiError('No file provided', 400)
    }

    // Get user's organization
    const org = await getOrganizationByUserId(supabase, user.id)
    if (!org) return apiError('Organization not found', 404)

    // Upload to Supabase Storage
    const fileId = crypto.randomUUID()
    const filePath = `${org.id}/org-documents/${fileId}/${file.name}`

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
    const document = await createOrganizationDocument(supabase, {
      organization_id: org.id,
      name: file.name,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: user.id,
      category: category || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()) : undefined,
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
