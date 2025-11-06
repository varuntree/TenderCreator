export const runtime = 'edge' // Bypass Vercel 10s timeout

import { NextRequest } from 'next/server'

import { generateDocumentContent } from '@/libs/ai/content-generation'
import { assembleProjectContext, validateContextSize } from '@/libs/ai/context-assembly'
import {
  getWorkPackageContent,
  saveGeneratedContent,
} from '@/libs/repositories/work-package-content'
import { getWorkPackageWithProject, updateWorkPackageStatus } from '@/libs/repositories/work-packages'
import { createClient } from '@/libs/supabase/server'

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

    // Get work package with project and content
    const { workPackage, project } = await getWorkPackageWithProject(supabase, workPackageId)
    const existingContent = await getWorkPackageContent(supabase, workPackageId)

    if (
      !existingContent ||
      !existingContent.win_themes ||
      existingContent.win_themes.length === 0
    ) {
      return Response.json(
        {
          error: 'Win themes must be generated first',
        },
        { status: 400 }
      )
    }

    // Update status to in_progress
    await updateWorkPackageStatus(supabase, workPackageId, 'in_progress')

    // Assemble context
    const context = await assembleProjectContext(supabase, project.id)

    // Validate context size
    const validation = validateContextSize(context)
    if (!validation.valid) {
      return Response.json(
        {
          error: 'Context too large',
          tokenEstimate: validation.tokenEstimate,
        },
        { status: 400 }
      )
    }

    // Generate content
    const content = await generateDocumentContent(
      workPackage,
      context,
      existingContent.win_themes,
      project.instructions
    )

    // Save to database
    await saveGeneratedContent(supabase, workPackageId, content)

    return Response.json({ success: true, content })
  } catch (error) {
    console.error('Content generation error:', error)

    // Check if this is a rate limit error
    const isRateLimitError = (error as { isRateLimitError?: boolean }).isRateLimitError || false
    const retryDelaySeconds = (error as { retryDelaySeconds?: number | null }).retryDelaySeconds || null

    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Generation failed',
        isRateLimitError,
        retryDelaySeconds,
      },
      { status: isRateLimitError ? 429 : 500 }
    )
  }
}
