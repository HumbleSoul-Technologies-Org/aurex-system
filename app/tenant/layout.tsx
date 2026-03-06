'use client'

import React, { Suspense, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  CreditCard,
  Wrench,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { notifications, currentTenant } from '@/app/lib/tenant-data'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}

function TenantLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const pathname = usePathname()

  const { user: authUser, isAuthenticated, isLoading } = useAuth()

  React.useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;
    
    if (!isAuthenticated) {
      // Not authenticated -> send to login
      window.location.href = '/auth/login'
      return
    }
    if (authUser?.role !== 'tenant') {
      window.location.href = '/auth/login'
    }
  }, [isAuthenticated, isLoading, authUser])

  const unreadNotifications = notifications.filter((n) => !n.read).length

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/tenant',
      icon: <Home className="w-4 h-4" />,
    },
    {
      label: 'Payment History',
      href: '/tenant/payments',
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      label: 'Make Payment',
      href: '/tenant/make-payment',
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      label: 'Report Maintenance',
      href: '/tenant/maintenance',
      icon: <Wrench className="w-4 h-4" />,
    },
    {
      label: 'Contact Management',
      href: '/tenant/contact',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      label: 'Messages',
      href: '/tenant/messages',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      label: 'Settings',
      href: '/tenant/settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 md:px-6 h-16">
          {/* Left: Menu Button + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-foreground" />
              )}
            </button>
            <Link href="/tenant" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PT</span>
              </div>
              <span className="hidden sm:inline font-bold text-foreground">Tenant Portal</span>
            </Link>
          </div>

          {/* Right: Notifications + Dark Mode + Profile */}
          <div className="flex items-center gap-2">
            {/* Notifications Bell */}
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-foreground" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-foreground" />
              )}
            </button>

            {/* Profile Menu */}
            <button className="flex items-center gap-2 px-2 py-1 hover:bg-secondary rounded-lg transition-colors">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">SA</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-foreground">{currentTenant?.name || 'Tenant'}</p>
                <p className="text-xs text-muted-foreground">Unit {currentTenant?.unit || 'N/A'}</p>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-64 border-r border-border bg-secondary">
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-foreground hover:bg-background'
                  }`}
                >
                  {item.icon}
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge className="bg-red-500 text-white text-xs">{item.badge}</Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-border text-foreground bg-transparent"
              asChild
            >
              <Link href="/">
                <LogOut className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </aside>

        {/* Mobile Menu - Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 z-30 bg-background border-r border-border">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-foreground hover:bg-secondary'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-red-500 text-white text-xs">{item.badge}</Badge>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Notifications Sidebar - Right */}
      {notificationsOpen && (
        <div className="fixed right-0 top-16 h-[calc(100vh-64px)] z-40 w-full sm:w-96 bg-background border-l border-border shadow-lg overflow-y-auto">
          <div className="p-4 border-b border-border sticky top-0 bg-background">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground">Notifications</h2>
              <button
                onClick={() => setNotificationsOpen(false)}
                className="p-1 hover:bg-secondary rounded-lg"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-2 p-4">
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                No notifications
              </p>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.actionUrl}
                  onClick={() => setNotificationsOpen(false)}
                >
                  <Card
                    className={`p-3 cursor-pointer hover:bg-secondary transition-colors border ${
                      notif.read ? 'border-border' : 'border-primary bg-primary/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {!notif.read && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {notif.title}
                          </p>
                          <Badge className="text-xs whitespace-nowrap">
                            {notif.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notif.date).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay for notifications */}
      {notificationsOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setNotificationsOpen(false)}
        />
      )}
    </div>
  )
}

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TenantLayoutContent>{children}</TenantLayoutContent>
    </Suspense>
  )
}
