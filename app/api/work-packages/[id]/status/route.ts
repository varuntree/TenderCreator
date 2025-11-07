import { NextRequest, NextResponse } from 'next/server'

import { updateWorkPackageStatus } from '@/libs/repositories/work-packages'
import { createClient as createServerClient } from '@/libs/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()
    const { id } = await params

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse body
    const body = await request.json()
    const { status } = body

    // Validate status (align with DB enum: pending, in_progress, review, completed)
    const validStatuses = ['pending', 'in_progress', 'review', 'completed']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status. Must be: pending, in_progress, review, or completed',
        },
        { status: 400 }
      )
    }

    // Update status
    const workPackage = await updateWorkPackageStatus(
      supabase,
      id,
      status
    )

    return NextResponse.json({
      success: true,
      data: workPackage,
    })
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update status',
      },
      { status: 500 }
    )
  }
}
