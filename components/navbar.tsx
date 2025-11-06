'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import Breadcrumbs from '@/components/breadcrumbs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/libs/supabase/client'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<{email?: string} | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/signin')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
      <Breadcrumbs />

      {/* Right Section - User Avatar */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar>
              <AvatarFallback className="bg-emerald-600 text-white">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleSignOut}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
