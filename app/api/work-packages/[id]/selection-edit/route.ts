export const runtime = 'edge'

import { NextRequest } from 'next/server'

import { runSelectionEdit } from '@/libs/ai/content-generation'
import { getWorkPackageWithProject } from '@/libs/repositories/work-packages'
import { createClient } from '@/libs/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const instruction = typeof body.instruction === 'string' ? body.instruction.trim() : ''
    const selectedText = typeof body.selected_text === 'string' ? body.selected_text.trim() : ''
    const fullDocument = typeof body.full_document === 'string' ? body.full_document : ''

    if (!instruction) {
      return Response.json({ error: 'Instruction is required.' }, { status: 400 })
    }
    if (!selectedText) {
      return Response.json({ error: 'Selected text is required.' }, { status: 400 })
    }
    if (!fullDocument) {
      return Response.json({ error: 'Full document content is required.' }, { status: 400 })
    }

    const { workPackage, project } = await getWorkPackageWithProject(supabase, id)

    const modifiedText = await runSelectionEdit({
      instruction,
      selectedText,
      fullDocument,
      documentType: workPackage.document_type,
      projectName: project.name,
    })

    return Response.json({ success: true, modified_text: modifiedText })
  } catch (error) {
    console.error('[selection-edit] Failed:', error)
    const maybeRateLimit = error as { isRateLimitError?: unknown; retryDelaySeconds?: unknown } | null
    const isRateLimit =
      !!maybeRateLimit &&
      typeof maybeRateLimit === 'object' &&
      typeof maybeRateLimit.isRateLimitError === 'boolean' &&
      maybeRateLimit.isRateLimitError
    if (isRateLimit) {
      const retryDelay =
        typeof maybeRateLimit?.retryDelaySeconds === 'number'
          ? maybeRateLimit.retryDelaySeconds
          : null
      const retryMessage =
        retryDelay && retryDelay > 0
          ? `Gemini rate limit reached. Please wait ${retryDelay} seconds and try again.`
          : 'Gemini rate limit reached. Please try again shortly.'
      return Response.json(
        {
          error: retryMessage,
          retry_after_seconds: retryDelay ?? null,
        },
        { status: 429 }
      )
    }
    const message = error instanceof Error ? error.message : 'Selection edit failed.'
    return Response.json({ error: message }, { status: 500 })
  }
}
