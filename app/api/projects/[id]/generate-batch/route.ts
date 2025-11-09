import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

import { generateBatch } from '@/libs/ai/content-generation'
import { assembleProjectContext, validateContextSize } from '@/libs/ai/context-assembly'
import { saveCombinedGeneration } from '@/libs/repositories/work-package-content'
import { getWorkPackage, updateWorkPackageStatus } from '@/libs/repositories/work-packages'
import { createClient } from '@/libs/supabase/server'

// Use Node runtime to access the full Node.js API surface (crypto, logging, etc.)
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

const MAX_BATCH_SIZE = 2

/**
 * Generate batch of work packages (2-3 docs per batch) in one request
 * POST /api/projects/[id]/generate-batch
 * Body: { workPackageIds: string[], instructions?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  let requestedWorkPackageIds: string[] = []
  try {
    const correlationId = randomUUID()
    const { id } = await params
    const projectId = id
    const body = await request.json()
    const { workPackageIds, instructions } = body

    requestedWorkPackageIds = Array.isArray(workPackageIds) ? workPackageIds : []

    if (!workPackageIds || !Array.isArray(workPackageIds) || workPackageIds.length === 0) {
      return NextResponse.json(
        { error: 'workPackageIds array is required' },
        { status: 400 }
      )
    }

    if (workPackageIds.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        {
          error: `Batch size too large. Select up to ${MAX_BATCH_SIZE} documents per run.`,
          suggestion: 'Run multiple batches of two documents to stay within the architecture limits.',
        },
        { status: 400 }
      )
    }

    // Limit batch size to prevent token overflow
    // Fetch all work packages
    const workPackages = []
    for (const wpId of workPackageIds) {
      const wp = await getWorkPackage(supabase, wpId)
      if (!wp) {
        return NextResponse.json(
          { error: `Work package ${wpId} not found` },
          { status: 404 }
        )
      }
      workPackages.push(wp)
    }

    // Mark all work packages as in progress before generation
    await Promise.all(
      workPackages.map((wp) =>
        updateWorkPackageStatus(supabase, wp.id, 'in_progress').catch((error) => {
          console.error('[API Batch] Failed to update status to in_progress:', wp.id, error)
        })
      )
    )

    // Assemble project context ONCE for all docs in batch
    const context = await assembleProjectContext(supabase, projectId)

    // Validate context size (64K token limit)
    // Note: Batch prompts are larger, so we need more headroom
    const validation = validateContextSize(context)
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.warning || 'Context exceeds token limit',
          tokenCount: validation.tokenEstimate,
          suggestion: 'Reduce organization documents or split into smaller batches',
        },
        { status: 400 }
      )
    }

    // Estimate total prompt size (rough)
    // Each work package adds ~500-1000 tokens to the prompt
    const estimatedBatchTokens = context.totalTokensEstimate + (workPackages.length * 1000)
    if (estimatedBatchTokens > 60000) {
      // 60K threshold for batch (leaving room for response)
      return NextResponse.json(
        {
          error: 'Batch would exceed token limit',
          tokenCount: estimatedBatchTokens,
          suggestion: 'Reduce batch size to 2 documents or reduce organization docs',
        },
        { status: 400 }
      )
    }

    // Generate batch
    console.log(`[API Batch][${correlationId}] Generating ${workPackages.length} documents`)
    const { executionMode, items } = await generateBatch(workPackages, context, instructions)
    console.log(`[API Batch][${correlationId}] Execution mode: ${executionMode}`)

    // Save all results to database atomically
    const savedResults = []
    for (const result of items) {
      if (!result.success || !result.bidAnalysis || !result.winThemes || !result.content) {
        const failureMessage = result.error || 'Generation failed'
        await updateWorkPackageStatus(supabase, result.workPackageId, 'pending').catch((error) => {
          console.error('[API Batch] Failed to revert status after AI failure:', result.workPackageId, error)
        })
        savedResults.push({
          workPackageId: result.workPackageId,
          success: false,
          error: failureMessage,
        })
        continue
      }

      try {
        // Use atomic save to avoid race conditions
        await saveCombinedGeneration(supabase, result.workPackageId, {
          bid_analysis: result.bidAnalysis,
          win_themes: result.winThemes,
          content: result.content,
        })
        await updateWorkPackageStatus(supabase, result.workPackageId, 'completed').catch((error) => {
          console.error('[API Batch] Failed to mark completed:', result.workPackageId, error)
        })
        savedResults.push({
          workPackageId: result.workPackageId,
          success: true,
        })
      } catch (saveError) {
        console.error('[API Batch] Failed to save:', result.workPackageId, saveError)
        await updateWorkPackageStatus(supabase, result.workPackageId, 'pending').catch((error) => {
          console.error('[API Batch] Failed to revert status:', result.workPackageId, error)
        })
        savedResults.push({
          workPackageId: result.workPackageId,
          success: false,
          error: saveError instanceof Error ? saveError.message : 'Failed to save to database',
        })
      }
    }

    console.log(`[API Batch][${correlationId}] Batch generation complete`)

    return NextResponse.json({
      success: true,
      executionMode,
      results: savedResults,
      totalGenerated: items.filter((item) => item.success).length,
      totalSaved: savedResults.filter((r) => r.success).length,
      correlationId,
    })
  } catch (error) {
    console.error('[API Batch] Batch generation failed:', error)
    const err = error as { isRateLimitError?: boolean; retryDelaySeconds?: number; message?: string }

    // Revert statuses back to pending if the batch failed completely
    await Promise.all(
      requestedWorkPackageIds.map((wpId: string) =>
        updateWorkPackageStatus(supabase, wpId, 'pending').catch((statusError) => {
          console.error('[API Batch] Failed to revert status after error:', wpId, statusError)
        })
      )
    )

    // Handle rate limit errors
    if (err.isRateLimitError) {
      return NextResponse.json(
        {
          error: err.message,
          isRateLimitError: true,
          retryDelaySeconds: err.retryDelaySeconds || 60,
        },
        { status: 429 }
      )
    }

    // Handle token limit errors
    if (err.message && err.message.includes('token limit')) {
      return NextResponse.json(
        {
          error: err.message,
          suggestion: 'Reduce batch size or organization documents',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: err.message || 'Batch generation failed' },
      { status: 500 }
    )
  }
}
