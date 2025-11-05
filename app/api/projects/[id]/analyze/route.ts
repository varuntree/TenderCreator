import { NextRequest } from 'next/server'

import { analyzeRFTDocuments } from '@/libs/ai/analysis'
import { getProject,updateProjectStatus } from '@/libs/repositories/projects'
import { createWorkPackage } from '@/libs/repositories/work-packages'
import { createClient } from '@/libs/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params

  try {
    const supabase = await createClient()

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get project and verify ownership
    const project = await getProject(supabase, projectId)
    if (!project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Fetch project documents with content
    const { data: documents, error: docsError } = await supabase
      .from('project_documents')
      .select('id, name, content_text')
      .eq('project_id', projectId)

    if (docsError) {
      throw new Error(`Failed to fetch documents: ${docsError.message}`)
    }

    // Validate at least one document with text
    const rftTexts = documents
      ?.filter((doc) => doc.content_text && doc.content_text.trim().length > 0)
      .map((doc) => doc.content_text as string) || []

    if (rftTexts.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No documents with extracted text found. Please upload and extract text first.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create SSE stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (type: string, data: unknown) => {
          const message = `event: progress\ndata: ${JSON.stringify({ type, data })}\n\n`
          controller.enqueue(encoder.encode(message))
        }

        try {
          // Update status to analysis
          await updateProjectStatus(supabase, projectId, 'analysis')
          sendEvent('start', { message: 'Analyzing RFT documents...' })

          // Analyze documents
          let result = await analyzeRFTDocuments(
            projectId,
            rftTexts,
            project.name,
            project.instructions
          )

          // Retry once if JSON parse failed
          if (!result.success && result.error?.includes('JSON parse')) {
            sendEvent('retry', { message: 'Retrying analysis...' })
            result = await analyzeRFTDocuments(
              projectId,
              rftTexts,
              project.name,
              project.instructions + '\n\nCRITICAL: Return ONLY valid JSON. No text before or after.'
            )
          }

          if (!result.success) {
            sendEvent('error', { error: result.error })
            controller.enqueue(
              encoder.encode(
                `event: done\ndata: ${JSON.stringify({ success: false, error: result.error })}\n\n`
              )
            )
            controller.close()
            return
          }

          // Create work packages progressively
          if (result.documents) {
            for (let i = 0; i < result.documents.length; i++) {
              const doc = result.documents[i]
              const workPackage = await createWorkPackage(supabase, {
                project_id: projectId,
                document_type: doc.document_type,
                document_description: doc.description,
                requirements: doc.requirements,
                order: i,
                status: 'not_started',
              })

              sendEvent('document', workPackage)
            }

            // Update project status to in_progress
            await updateProjectStatus(supabase, projectId, 'in_progress')
            sendEvent('complete', { count: result.documents.length })
          }

          // Close stream
          controller.enqueue(
            encoder.encode(
              `event: done\ndata: ${JSON.stringify({ success: true })}\n\n`
            )
          )
          controller.close()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          sendEvent('error', { error: errorMessage })
          controller.enqueue(
            encoder.encode(
              `event: done\ndata: ${JSON.stringify({ success: false, error: errorMessage })}\n\n`
            )
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
