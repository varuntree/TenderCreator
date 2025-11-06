// export const runtime = 'edge' // Bypass Vercel 10s timeout - DISABLED for debugging

import { NextRequest } from 'next/server'

import { generateBidAnalysis } from '@/libs/ai/bid-analysis'
import { assembleProjectContext, validateContextSize } from '@/libs/ai/context-assembly'
import { saveBidAnalysis } from '@/libs/repositories/work-package-content'
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

    // Generate bid analysis
    console.log(`[Bid Analysis] Generating for work package ${workPackageId}...`)
    const analysis = await generateBidAnalysis(workPackage, {
      name: project.name,
      clientName: project.client_name,
      organizationDocs: context.organizationDocs,
      rftDocs: context.rftDocs,
    })
    console.log(`[Bid Analysis] Generated with score: ${analysis.totalScore}%, recommendation: ${analysis.recommendation}`)

    // Save to database
    await saveBidAnalysis(supabase, workPackageId, analysis)
    console.log(`[Bid Analysis] Saved to database`)

    return Response.json({ success: true, analysis })
  } catch (error) {
    console.error('Bid analysis generation error:', error)

    // Check if this is a rate limit error
    const isRateLimitError = (error as { isRateLimitError?: boolean }).isRateLimitError || false
    const retryDelaySeconds = (error as { retryDelaySeconds?: number | null }).retryDelaySeconds || null

    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Bid analysis generation failed',
        isRateLimitError,
        retryDelaySeconds,
      },
      { status: isRateLimitError ? 429 : 500 }
    )
  }
}
