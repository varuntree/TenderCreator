import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function apiSuccess<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  })
}

export function apiError(
  error: string | Error,
  status: number = 500
): NextResponse<ApiResponse> {
  const message = error instanceof Error ? error.message : error

  // Log detailed error for debugging
  if (error instanceof Error) {
    console.error('[API Error]', {
      message: error.message,
      stack: error.stack,
      status
    })
  } else {
    console.error('[API Error]', { error, status })
  }

  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  )
}

export interface AuthContext {
  user: {
    id: string
    email?: string
  }
  supabase: ReturnType<typeof createServerClient>
}

type AuthHandler = (
  request: NextRequest,
  context: AuthContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any
) => Promise<NextResponse>

export function withAuth(handler: AuthHandler) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (request: NextRequest, context?: any) => {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set() {
              // No-op in API routes
            },
            remove() {
              // No-op in API routes
            },
          },
        }
      )

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        console.error('Auth handler unauthorized:', error || 'No user session')
        return apiError('Unauthorized', 401)
      }

      // Next.js 15: params are now Promise objects, pass context as is
      return handler(request, { user, supabase }, context)
    } catch (error) {
      console.error('Auth handler error:', error)
      return apiError(error as Error)
    }
  }
}
