'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const tabs = [
  { href: '/settings', label: 'Company Profile' },
  { href: '/settings/documents', label: 'Company Documents' },
]

export function CompanySettingsTabs() {
  const pathname = usePathname()

  return (
    <div className="flex flex-wrap gap-3 rounded-2xl border border-muted/60 bg-muted/30 p-1">
      {tabs.map(tab => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex items-center rounded-xl px-4 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
