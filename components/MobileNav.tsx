'use client'

/**
 * Mobile navigation component for Maestro
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Camera, Home, BarChart3, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: Home
  },
  {
    href: '/capture',
    label: 'Capture',
    icon: Camera
  },
  {
    href: '/meals',
    label: 'Meals',
    icon: Calendar
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: BarChart3
  }
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[60px] py-2 px-1 rounded-lg transition-colors',
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium leading-none">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}