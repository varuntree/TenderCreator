import { NextResponse } from 'next/server'

import { createClient } from '@/libs/supabase/server'
import { createOrganization } from '@/libs/repositories/organizations'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Check if user exists in custom users table
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      // If user doesn't exist, create organization and user record
      if (!existingUser && !error) {
        try {
          // Create default organization with user's email as name
          const orgName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'My Organization'
          const userName = user.user_metadata?.full_name || null

          // createOrganization will create both org and user record
          await createOrganization(supabase, orgName, user.id, user.email!, userName)
        } catch (err) {
          console.error('Error creating organization for new user:', err)
          // Continue to redirect - projects page will handle missing org
        }
      }
    }
  }

  // Redirect to projects page after sign in
  return NextResponse.redirect(new URL('/projects', requestUrl.origin))
}
