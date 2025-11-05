import { NextResponse } from 'next/server'

import { createBulkExportZip } from '@/libs/utils/bulk-export'
import { getProject } from '@/libs/repositories/projects'
import { getWorkPackageContent } from '@/libs/repositories/work-package-content'
import { listCompletedWorkPackages } from '@/libs/repositories/work-packages'
import { createClient } from '@/libs/supabase/server'

export const runtime = 'nodejs' // Need docx library

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params

    // Get project
    const project = await getProject(supabase, projectId)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get all completed work packages
    const workPackages = await listCompletedWorkPackages(supabase, projectId)

    if (workPackages.length === 0) {
      return NextResponse.json({
        error: 'No completed work packages to export'
      }, { status: 400 })
    }

    // Fetch content for all work packages
    const contents = await Promise.all(
      workPackages.map(wp => getWorkPackageContent(supabase, wp.id))
    )

    // Filter out null contents
    const validContents = contents.filter(c => c !== null)

    if (validContents.length === 0) {
      return NextResponse.json({
        error: 'No content found for completed work packages'
      }, { status: 400 })
    }

    console.log(`[Bulk Export] Exporting ${validContents.length} documents for project ${projectId}`)

    // Create ZIP file
    const zipBlob = await createBulkExportZip(workPackages, validContents, project)

    // Generate ZIP filename
    const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const projectName = project.name.replace(/[^a-zA-Z0-9]/g, '_')
    const zipFilename = `${projectName}_TenderDocuments_${date}.zip`

    console.log(`[Bulk Export] Success: ${validContents.length} documents exported`)

    // Return ZIP file directly instead of uploading to storage
    // (documents bucket doesn't support application/zip MIME type)
    return new NextResponse(zipBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFilename}"`,
      },
    })
  } catch (error) {
    console.error('[Bulk Export] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Export failed'
    }, { status: 500 })
  }
}
