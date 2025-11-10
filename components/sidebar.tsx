'use client'

import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Building2,
  ChevronLeft,
  CreditCard,
  FileQuestion,
  FolderKanban,
  Plus,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { CreateProjectDialog } from '@/components/create-project-dialog'
import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type NavItem = {
  id: string
  name: string
  href: string
  icon: LucideIcon
  match?: (pathname: string) => boolean
}

const navItems: NavItem[] = [
  {
    id: 'projects',
    name: 'Projects',
    href: '/projects',
    icon: FolderKanban,
    match: (pathname) => pathname === '/projects' || pathname === '/',
  },
  {
    id: 'company',
    name: 'Company',
    href: '/settings',
    icon: Building2,
    match: (pathname) => pathname === '/settings' || pathname.startsWith('/settings/documents'),
  },
  {
    id: 'team',
    name: 'Team',
    href: '/settings/team',
    icon: Users,
    match: (pathname) => pathname === '/settings/team',
  },
  {
    id: 'billing',
    name: 'Billing',
    href: '/settings/billing',
    icon: CreditCard,
    match: (pathname) => pathname === '/settings/billing',
  },
  { id: 'resources', name: 'Useful Resources', href: '/resources', icon: BookOpen },
  { id: 'docs', name: 'Documentation', href: '/docs', icon: FileQuestion },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const collapsed = localStorage.getItem('sidebarCollapsed') === 'true'
    setIsCollapsed(collapsed)
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', String(newState))
  }

  const isActive = (item: NavItem) => {
    // Use custom match function if provided
    if (item.match) {
      return item.match(pathname)
    }
    // Fallback to exact match for items without custom match
    return pathname === item.href
  }

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-[var(--dashboard-border)] bg-white transition-all duration-300 rounded-tr-[40px] rounded-br-[40px]',
        isCollapsed ? 'w-20 px-3 py-4' : 'w-72 px-6 py-6'
      )}
    >
      {/* Logo Section */}
      <div className={cn('flex w-full', isCollapsed ? 'justify-end' : 'justify-center')}>
        <Logo collapsed={isCollapsed} />
      </div>

      {/* Create New Tender Button */}
      <div className={cn('mt-6 w-full', isCollapsed && 'flex justify-center')}>
        <CreateProjectDialog
          trigger={
            isCollapsed ? (
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center text-[var(--dashboard-primary)] transition-colors hover:text-[var(--dashboard-primary-hover)]"
                aria-label="Create new tender"
              >
                <Plus className="h-5 w-5" />
              </button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="w-full rounded-2xl border-2 border-[var(--dashboard-primary)] bg-white px-4 py-5 text-base font-semibold text-emerald-700 shadow-none hover:bg-[var(--dashboard-primary-light)]"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--dashboard-primary)] text-[var(--dashboard-primary)]">
                    <Plus className="h-4 w-4" />
                  </span>
                  <span>Create new tender</span>
                </span>
              </Button>
            )
          }
        />
      </div>

      {/* Navigation Items */}
      <nav className="mt-6 flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.id}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                'flex items-center gap-4 rounded-2xl px-4 py-3 text-base font-medium transition-all duration-200',
                active
                  ? 'bg-gray-100 text-gray-900 shadow-inner'
                  : 'text-gray-400 hover:text-gray-900',
                isCollapsed && 'justify-center px-0'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-2xl border border-transparent text-lg transition-all',
                  active
                    ? 'border-gray-300 bg-white text-[var(--dashboard-primary)]'
                    : 'text-gray-400'
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              {!isCollapsed && (
                <span className={cn(active ? 'text-[var(--dashboard-text-primary)]' : 'text-inherit')}>{item.name}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <div className="mt-8 flex w-full justify-end">
        <button
          type="button"
          onClick={toggleCollapse}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[var(--dashboard-primary)] text-[var(--dashboard-primary)] transition-colors hover:bg-[var(--dashboard-primary-light)]'
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={cn('h-5 w-5 transition-transform duration-300', isCollapsed && 'rotate-180')}
          />
        </button>
      </div>
    </aside>
  )
}
