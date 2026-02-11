'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DollarSign,
  FileText,
  MessageSquare,
  Wrench,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Copy,
  Users,
  Link as LinkIcon,
} from 'lucide-react'

export default function TenantPortalPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Tenant Portal</h1>
        <p className="text-muted-foreground">Manage tenant access and portal features</p>
      </div>

      {/* Portal Info */}
      <Card className="border border-border p-4 md:p-6 bg-primary/5">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-foreground mb-2">Portal Link</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value="https://propmanager.app/tenant-portal/abc123def456"
                readOnly
                className="flex-1 border-border bg-background text-foreground text-sm"
              />
              <Button className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
                <Copy className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Share this link with your tenants to access the portal. They can pay rent, submit requests, and view documents.
          </p>
        </div>
      </Card>

      {/* Portal Features */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Available Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: DollarSign,
              title: 'Rent Payment',
              description: 'Pay rent online with multiple payment options',
              enabled: true,
            },
            {
              icon: MessageSquare,
              title: 'Messaging',
              description: 'Communicate directly with property managers',
              enabled: true,
            },
            {
              icon: Wrench,
              title: 'Maintenance Requests',
              description: 'Submit and track maintenance issues',
              enabled: true,
            },
            {
              icon: FileText,
              title: 'Documents',
              description: 'Access lease and important documents',
              enabled: true,
            },
          ].map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className={`border p-4 ${
                  feature.enabled
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border opacity-50'
                }`}
              >
                <Icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold text-foreground text-sm md:text-base">{feature.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-2">{feature.description}</p>
                <div className="mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={feature.enabled}
                      readOnly
                      className="w-4 h-4"
                    />
                    <span className="text-xs font-medium text-foreground">
                      {feature.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Active Tenants */}
      <Card className="border border-border p-4 md:p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Tenant Portal Access</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Tenant Name</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden sm:table-cell">
                  Property
                </th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden md:table-cell">
                  Status
                </th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden lg:table-cell">
                  Last Active
                </th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'John Smith', property: 'Sunset Apartments', status: 'Active', lastActive: '2 hours ago' },
                { name: 'Sarah Johnson', property: 'Downtown Office', status: 'Active', lastActive: '1 day ago' },
                { name: 'Michael Brown', property: 'Beachside Villa', status: 'Pending', lastActive: 'Never' },
                { name: 'Emily Davis', property: 'Mountain Lodge', status: 'Active', lastActive: '3 days ago' },
                { name: 'David Wilson', property: 'Urban Lofts', status: 'Active', lastActive: '5 hours ago' },
              ].map((tenant, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-secondary">
                  <td className="py-3 px-2 text-foreground font-medium">{tenant.name}</td>
                  <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">{tenant.property}</td>
                  <td className="py-3 px-2 hidden md:table-cell">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      tenant.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground hidden lg:table-cell text-xs">{tenant.lastActive}</td>
                  <td className="py-3 px-2 text-right">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Portal Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tenants', value: '12', icon: Users },
          { label: 'Active Portals', value: '10', icon: CheckCircle },
          { label: 'Pending Access', value: '2', icon: Clock },
          { label: 'Payment Success Rate', value: '98%', icon: DollarSign },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border border-border p-4">
              <Icon className="w-6 h-6 text-primary mb-2" />
              <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">{stat.value}</p>
            </Card>
          )
        })}
      </div>

      {/* Invitations */}
      <Card className="border border-border p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-bold text-foreground">Send Invitations</h3>
          <Button className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Send New</span>
          </Button>
        </div>

        <div className="space-y-3">
          {[
            { tenant: 'Robert Taylor', email: 'robert@email.com', date: '2024-02-05', status: 'Sent' },
            { tenant: 'Lisa Anderson', email: 'lisa@email.com', date: '2024-02-03', status: 'Accepted' },
            { tenant: 'James Martin', email: 'james@email.com', date: '2024-02-01', status: 'Pending' },
          ].map((invitation, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-secondary rounded-lg"
            >
              <div className="mb-3 sm:mb-0">
                <p className="font-medium text-foreground text-sm md:text-base">{invitation.tenant}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{invitation.email}</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-xs text-muted-foreground">{invitation.date}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  invitation.status === 'Accepted'
                    ? 'bg-green-100 text-green-800'
                    : invitation.status === 'Sent'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {invitation.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
