import { NextRequest, NextResponse } from 'next/server'

import { updateWorkPackageAssignment } from '@/libs/repositories/work-packages'
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

    // Parse body (frontend sends mock user ID, we ignore it and use authenticated user)
    await request.json()

    // Update assignment with actual authenticated user ID
    const workPackage = await updateWorkPackageAssignment(
      supabase,
      id,
      user.id
    )

    return NextResponse.json({
      success: true,
      data: workPackage,
    })
  } catch (error) {
    console.error('Error updating assignment:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update assignment',
      },
      { status: 500 }
    )
  }
}
