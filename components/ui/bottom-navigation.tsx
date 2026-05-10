'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { Badge } from '@/components/ui/badge'

interface BottomNavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}

interface BottomNavigationProps {
  items: BottomNavItem[]
}

export function BottomNavigation({ items }: BottomNavigationProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-20 items-stretch">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 px-2 py-2 transition-colors relative ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <Badge 
                    className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs font-bold rounded-full"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium text-center line-clamp-1">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
