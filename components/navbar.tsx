'use client'

import { Bell } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import Breadcrumbs from '@/components/breadcrumbs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/libs/supabase/client'

type PageMeta = {
  title: string
  description: string
  badgeLabel?: string
}

const PAGE_META: Array<{ match: (pathname: string) => boolean } & PageMeta> = [
  {
    match: (path) => path === '/' || path === '/projects',
    title: 'Projects',
    description: 'Track every tender and orchestrate document generation.',
  },
  {
    match: (path) => path.startsWith('/projects/'),
    title: 'Project Workspace',
    description: 'Review scope, run document agents, and monitor status.',
  },
  {
    match: (path) => path.startsWith('/work-packages/'),
    title: 'Document Workspace',
    description: 'Refine responses, assignments, and agent output.',
  },
  {
    match: (path) => path.startsWith('/settings/billing'),
    title: 'Billing',
    description: 'Manage subscription, usage, and credits.',
    badgeLabel: 'Plan',
  },
  {
    match: (path) => path.startsWith('/settings/team'),
    title: 'Team',
    description: 'Invite collaborators and manage access.',
  },
  {
    match: (path) => path.startsWith('/settings'),
    title: 'Company Settings',
    description: 'Configure your organisation profile and templates.',
  },
  {
    match: (path) => path.startsWith('/resources'),
    title: 'Resources',
    description: 'Guides, playbooks, and examples for winning tenders.',
  },
  {
    match: (path) => path.startsWith('/docs'),
    title: 'Documentation',
    description: 'API references and product walkthroughs.',
  },
]

const DEFAULT_META: PageMeta = {
  title: 'Workspace',
  description: 'Keep your tender creation flow aligned.',
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ email?: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const meta = useMemo(() => {
    const match = PAGE_META.find((entry) => entry.match(pathname))
    return match ?? DEFAULT_META
  }, [pathname])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/signin')
  }

  const userInitial = user?.email?.charAt(0).toUpperCase() ?? 'U'

  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-4">
        <Breadcrumbs />
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-slate-900">{meta.title}</h1>
            {meta.badgeLabel && (
              <Badge variant="outline" className="rounded-full border-emerald-200 text-sm text-emerald-700">
                {meta.badgeLabel}
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500">{meta.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          className="order-2 flex items-center gap-2 rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 lg:order-1"
        >
          <Bell className="h-4 w-4" />
          Updates
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="order-1 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-500 lg:order-2"
              aria-label="Account menu"
            >
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-transparent text-lg font-semibold text-white">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleSignOut}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
