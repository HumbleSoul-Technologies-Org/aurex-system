'use client'

import React from "react"

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  Wrench,
  MessageSquare,
  FileText,
  Settings,
  BarChart3,
  Home,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'

interface NavPage {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  category: 'core' | 'management' | 'analytics' | 'admin'
}

export default function SitemapPage() {
  const pages: NavPage[] = [
    {
      title: 'Dashboard',
      description: 'Main overview with key metrics and recent activity',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-6 h-6" />,
      category: 'core',
    },
    {
      title: 'Properties',
      description: 'Manage all rental properties with detailed information',
      href: '/dashboard/properties',
      icon: <Building2 className="w-6 h-6" />,
      category: 'management',
    },
    {
      title: 'Tenants',
      description: 'Track tenant information, contacts, and lease details',
      href: '/dashboard/tenants',
      icon: <Users className="w-6 h-6" />,
      category: 'management',
    },
    {
      title: 'Finances',
      description: 'Track rent collection, expenses, and financial reports',
      href: '/dashboard/finances',
      icon: <DollarSign className="w-6 h-6" />,
      category: 'management',
    },
    {
      title: 'Maintenance',
      description: 'Manage maintenance requests with Kanban board workflow',
      href: '/dashboard/maintenance',
      icon: <Wrench className="w-6 h-6" />,
      category: 'management',
    },
    {
      title: 'Communications',
      description: 'Send messages and announcements to tenants',
      href: '/dashboard/communications',
      icon: <MessageSquare className="w-6 h-6" />,
      category: 'management',
    },
    {
      title: 'Documents',
      description: 'Store and organize important property documents',
      href: '/dashboard/documents',
      icon: <FileText className="w-6 h-6" />,
      category: 'management',
    },
    {
      title: 'Analytics',
      description: 'Real-time analytics and performance metrics',
      href: '/dashboard/analytics',
      icon: <BarChart3 className="w-6 h-6" />,
      category: 'analytics',
    },
    {
      title: 'Tenant Portal',
      description: 'Manage tenant portal access and features',
      href: '/dashboard/tenant-portal',
      icon: <Home className="w-6 h-6" />,
      category: 'admin',
    },
    {
      title: 'Settings',
      description: 'Account settings, security, and preferences',
      href: '/dashboard/settings',
      icon: <Settings className="w-6 h-6" />,
      category: 'admin',
    },
    {
      title: 'Help & Support',
      description: 'Knowledge base, FAQs, and customer support',
      href: '/dashboard/help',
      icon: <HelpCircle className="w-6 h-6" />,
      category: 'admin',
    },
  ]

  const categories = {
    core: 'Core',
    management: 'Property Management',
    analytics: 'Analytics & Reports',
    admin: 'Administration',
  }

  const groupedPages = pages.reduce(
    (acc, page) => {
      if (!acc[page.category]) {
        acc[page.category] = []
      }
      acc[page.category].push(page)
      return acc
    },
    {} as Record<string, NavPage[]>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">PropManager</h1>
          <p className="text-lg text-muted-foreground mb-2">Complete Property Management System</p>
          <p className="text-muted-foreground">
            Explore all available pages and features in the application
          </p>
        </div>

        {/* Navigation */}
        {(Object.keys(groupedPages) as Array<keyof typeof categories>).map((category) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              {categories[category]}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedPages[category].map((page) => (
                <Link key={page.href} href={page.href}>
                  <Card className="border border-border p-6 hover:border-primary/50 hover:shadow-lg transition-all h-full cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="text-primary mt-1">{page.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg mb-2">{page.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{page.description}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary/80 px-0"
                        >
                          Visit
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Features Summary */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Pages', value: pages.length },
            { label: 'Categories', value: Object.keys(categories).length },
            { label: 'Mobile Optimized', value: '✓' },
            { label: 'Fully Responsive', value: '✓' },
          ].map((feature) => (
            <Card key={feature.label} className="border border-border p-6 text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">{feature.value}</p>
              <p className="text-sm text-muted-foreground">{feature.label}</p>
            </Card>
          ))}
        </div>

        {/* Quick Info */}
        <div className="mt-16 bg-primary/5 border border-primary/20 rounded-lg p-6 md:p-8">
          <h3 className="text-xl font-bold text-foreground mb-4">About PropManager</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Complete property management system with 12+ pages</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Fully responsive design for mobile, tablet, and desktop</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Pre-populated with realistic sample data</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Ready for backend integration and customization</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
