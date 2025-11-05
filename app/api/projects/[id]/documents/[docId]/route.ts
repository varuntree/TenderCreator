import { NextRequest } from 'next/server'

import { apiError, apiSuccess, AuthContext,withAuth } from '@/libs/api-utils'
import {
  deleteProjectDocument,
  getProjectDocument,
} from '@/libs/repositories'

async function handleDELETE(
  request: NextRequest,
  { supabase }: AuthContext,
  params: { params: { id: string; docId: string } }
) {
  try {
    const docId = params.params.docId

    // Get document to get file path
    const doc = await getProjectDocument(supabase, docId)

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([doc.file_path])

    if (storageError) throw storageError

    // Delete from database
    await deleteProjectDocument(supabase, docId)

    return apiSuccess({ message: 'Document deleted' })
  } catch (error) {
    return apiError(error as Error)
  }
}

export const DELETE = withAuth(handleDELETE)
