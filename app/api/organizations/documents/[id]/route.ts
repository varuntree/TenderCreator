import { NextRequest } from 'next/server'

import { apiError, apiSuccess, AuthContext,withAuth } from '@/libs/api-utils'
import {
  deleteOrganizationDocument,
  getOrganizationDocument,
} from '@/libs/repositories'

async function handleDELETE(
  request: NextRequest,
  { supabase }: AuthContext,
  params: { params: { id: string } }
) {
  try {
    const docId = params.params.id

    // Get document to get file path
    const doc = await getOrganizationDocument(supabase, docId)

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([doc.file_path])

    if (storageError) throw storageError

    // Delete from database
    await deleteOrganizationDocument(supabase, docId)

    return apiSuccess({ message: 'Document deleted' })
  } catch (error) {
    return apiError(error as Error)
  }
}

export const DELETE = withAuth(handleDELETE)
