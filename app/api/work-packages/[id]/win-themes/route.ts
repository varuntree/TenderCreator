export const runtime = 'edge' // Bypass Vercel 10s timeout

import { NextRequest } from 'next/server'
import { createClient } from '@/libs/supabase/server'
import { getWorkPackageWithProject } from '@/libs/repositories/work-packages'
import { saveWinThemes } from '@/libs/repositories/work-package-content'
import { assembleProjectContext, validateContextSize } from '@/libs/ai/context-assembly'
import { generateWinThemes } from '@/libs/ai/content-generation'

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
    const winThemes = await generateWinThemes(
      workPackage,
      context.organizationDocs,
      context.rftDocs
    )

    // Save to database
    await saveWinThemes(supabase, workPackageId, winThemes)

    return Response.json({ success: true, win_themes: winThemes })
  } catch (error) {
    console.error('Win themes generation error:', error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Generation failed',
      },
      { status: 500 }
    )
  }
}
