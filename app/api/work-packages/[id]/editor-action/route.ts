export const runtime = 'edge' // Fast AI actions

import { NextRequest } from 'next/server'
import { createClient } from '@/libs/supabase/server'
import { getWorkPackageWithProject } from '@/libs/repositories/work-packages'
import { assembleProjectContext } from '@/libs/ai/context-assembly'
import { executeEditorAction } from '@/libs/ai/content-generation'

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

    const body = await request.json()
    const { action, selected_text, full_document, custom_instruction } = body

    // Validate action
    const validActions = [
      'expand',
      'shorten',
      'add_evidence',
      'rephrase',
      'check_compliance',
      'custom',
    ]
    if (!validActions.includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 })
    }

    const workPackageId = id

    // Get work package for requirements and context
    const { workPackage, project } = await getWorkPackageWithProject(supabase, workPackageId)

    // For actions needing org docs or requirements
    let context: any = {}
    if (action === 'expand' || action === 'add_evidence') {
      const projectContext = await assembleProjectContext(supabase, project.id)
      context.orgDocs = projectContext.organizationDocs
    }
    if (action === 'check_compliance') {
      context.requirements = workPackage.requirements
    }
    if (action === 'custom') {
      context.customInstruction = custom_instruction
    }

    // Execute action
    const modifiedText = await executeEditorAction(action, selected_text, full_document, context)

    return Response.json({ success: true, modified_text: modifiedText })
  } catch (error) {
    console.error('Editor action error:', error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Action failed',
      },
      { status: 500 }
    )
  }
}
