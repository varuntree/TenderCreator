export const runtime = 'edge' // Bypass Vercel 10s timeout

import { NextRequest } from 'next/server'

import { generateDocumentContent, generateDocumentContentStream } from '@/libs/ai/content-generation'
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
  const supabase = await createClient()
  let workPackageId: string | null = null
  try {
    const { id } = await params
    workPackageId = id
    if (!workPackageId) {
      throw new Error('Work package ID is required')
    }
    const activeWorkPackageId = workPackageId

    // Verify auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if client wants streaming (Accept: text/event-stream)
    const acceptHeader = request.headers.get('accept') || ''
    const wantsStreaming = acceptHeader.includes('text/event-stream')

    // Get work package with project and content
    const { workPackage, project } = await getWorkPackageWithProject(supabase, activeWorkPackageId)
    const existingContent = await getWorkPackageContent(supabase, activeWorkPackageId)

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
    await updateWorkPackageStatus(supabase, activeWorkPackageId, 'in_progress')

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

    // STREAMING MODE: Stream content as it's generated
    if (wantsStreaming) {
      const encoder = new TextEncoder()
      let fullContent = ''

      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Stream chunks as they're generated
            for await (const chunk of generateDocumentContentStream(
              workPackage,
              context,
              existingContent.win_themes,
              project.instructions
            )) {
              fullContent += chunk

              // Send chunk as Server-Sent Event
              const data = JSON.stringify({ text: chunk })
              controller.enqueue(encoder.encode(`event: chunk\ndata: ${data}\n\n`))
            }

            // Save complete content to database
            await saveGeneratedContent(supabase, activeWorkPackageId, fullContent)
            await updateWorkPackageStatus(supabase, activeWorkPackageId, 'completed')

            // Send done event with full content
            const doneData = JSON.stringify({ fullContent })
            controller.enqueue(encoder.encode(`event: done\ndata: ${doneData}\n\n`))

            controller.close()
          } catch (error) {
            console.error('Streaming error:', error)
            const errorData = JSON.stringify({
              error: error instanceof Error ? error.message : 'Streaming failed',
            })
            controller.enqueue(encoder.encode(`event: error\ndata: ${errorData}\n\n`))
            await updateWorkPackageStatus(supabase, activeWorkPackageId, 'pending')
            controller.close()
          }
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // NON-STREAMING MODE (backwards compatibility): Generate all at once
    const content = await generateDocumentContent(
      workPackage,
      context,
      existingContent.win_themes,
      project.instructions
    )

    // Save to database
    await saveGeneratedContent(supabase, activeWorkPackageId, content)
    await updateWorkPackageStatus(supabase, activeWorkPackageId, 'completed')

    return Response.json({ success: true, content })
  } catch (error) {
    console.error('Content generation error:', error)
    if (workPackageId) {
      await updateWorkPackageStatus(supabase, workPackageId, 'pending').catch((statusError) => {
        console.error('Failed to revert status after generation error:', statusError)
      })
    }

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
