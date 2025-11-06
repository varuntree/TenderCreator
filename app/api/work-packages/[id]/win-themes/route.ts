// export const runtime = 'edge' // Bypass Vercel 10s timeout - DISABLED for debugging

import { NextRequest } from 'next/server'

import { generateWinThemes } from '@/libs/ai/content-generation'
import { assembleProjectContext, validateContextSize } from '@/libs/ai/context-assembly'
import { saveWinThemes } from '@/libs/repositories/work-package-content'
import { getWorkPackageWithProject } from '@/libs/repositories/work-packages'
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

    // Get work package with project
    const { workPackage, project } = await getWorkPackageWithProject(supabase, workPackageId)

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

    // Generate win themes
    console.log(`[Win Themes] Generating for work package ${workPackageId}...`)
    const winThemes = await generateWinThemes(
      workPackage,
      context.organizationDocs,
      context.rftDocs
    )
    console.log(`[Win Themes] Generated ${winThemes.length} themes`)

    // Save to database
    await saveWinThemes(supabase, workPackageId, winThemes)
    console.log(`[Win Themes] Saved to database`)

    return Response.json({ success: true, win_themes: winThemes })
  } catch (error) {
    console.error('Win themes generation error:', error)

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
