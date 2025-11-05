import { NextResponse } from 'next/server'

import { getNextIncompleteWorkPackage } from '@/libs/repositories/work-packages'
import { createClient } from '@/libs/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params

    // Get next incomplete work package
    const workPackage = await getNextIncompleteWorkPackage(supabase, projectId)

    return NextResponse.json({
      work_package: workPackage
    })
  } catch (error) {
    console.error('Next work package error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch next work package'
    }, { status: 500 })
  }
}
