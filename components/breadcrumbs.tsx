'use client'

import { Home } from 'lucide-react'
import { usePathname } from 'next/navigation'

// Route to display name mapping
const getPageName = (pathname: string): string => {
  if (pathname === '/projects' || pathname === '/') return 'Projects'
  if (pathname.startsWith('/projects/')) return 'Project Workspace'
  if (pathname === '/settings') return 'Settings'
  if (pathname === '/settings/documents') return 'Documents'
  if (pathname === '/settings/team') return 'Team'
  if (pathname === '/settings/billing') return 'Billing'
  if (pathname === '/resources') return 'Resources'
  if (pathname === '/docs') return 'Documentation'
  return 'Projects'
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  const pageName = getPageName(pathname)

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
      <Home className="h-5 w-5" />
      <span>{pageName}</span>
    </div>
  )
}
