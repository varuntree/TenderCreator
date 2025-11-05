'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Projects', href: '/projects' },
  { name: 'Settings', href: '/settings' },
  { name: 'Documents', href: '/settings/documents' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="w-64 border-r bg-white p-4">
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                'block rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100',
                pathname === item.href
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600'
              )}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
