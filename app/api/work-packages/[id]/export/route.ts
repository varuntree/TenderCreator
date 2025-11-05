export const runtime = 'nodejs' // Need docx library

import { NextRequest } from 'next/server'
import { createClient } from '@/libs/supabase/server'
import {
  getWorkPackageWithProject,
  updateWorkPackageStatus,
} from '@/libs/repositories/work-packages'
import {
  getWorkPackageContent,
  saveExportedFile,
} from '@/libs/repositories/work-package-content'
import { convertMarkdownToDocx } from '@/libs/utils/export-docx'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verify auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workPackageId = id

    // Get work package and content
    const { workPackage, project } = await getWorkPackageWithProject(supabase, workPackageId)
    const content = await getWorkPackageContent(supabase, workPackageId)

    if (!content || !content.content) {
      return Response.json(
        {
          error: 'No content to export',
        },
        { status: 400 }
      )
    }

    // Generate filename
    const filename = `${workPackage.document_type.replace(/\s+/g, '_')}_${project.name.replace(/\s+/g, '_')}.docx`

    // Convert markdown to Word document
    const blob = await convertMarkdownToDocx(content.content, {
      title: workPackage.document_type,
      author: user.email || undefined,
      date: new Date(),
    })

    // Upload to Supabase Storage
    const filePath = `${project.organization_id}/exports/${workPackageId}/${filename}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, blob, { upsert: true })

    if (uploadError) {
      throw uploadError
    }

    // Save export metadata
    await saveExportedFile(supabase, workPackageId, filePath)

    // Update status to completed
    await updateWorkPackageStatus(supabase, workPackageId, 'completed')

    // Get signed URL for download
    const { data: urlData } = await supabase.storage.from('documents').createSignedUrl(filePath, 3600) // 1 hour

    return Response.json({
      success: true,
      download_url: urlData?.signedUrl,
      filename,
    })
  } catch (error) {
    console.error('Export error:', error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Export failed',
      },
      { status: 500 }
    )
  }
}
