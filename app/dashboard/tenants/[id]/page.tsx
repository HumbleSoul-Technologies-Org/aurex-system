'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { sampleTenants, sampleTransactions } from '@/app/lib/sample-data'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileText,
  MessageSquare,
  AlertCircle,
  Calendar,
  Edit,
  Send,
} from 'lucide-react'

interface TenantDetailPageProps {
  params: {
    id: string
  }
}

export default function TenantDetailPage({ params }: TenantDetailPageProps) {
  const tenant = sampleTenants.find((t) => t.id === params.id)
  const [activeTab, setActiveTab] = useState('overview')

  if (!tenant) {
    return (
      <div className="space-y-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard/tenants" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Tenants
          </Link>
        </Button>
        <Card className="border border-border p-12 text-center">
          <p className="text-muted-foreground">Tenant not found</p>
        </Card>
      </div>
    )
  }

  const tenantPayments = sampleTransactions.filter(
    (t) => t.type === 'payment' && t.tenant === tenant.name
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/tenants" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </Button>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit Tenant
        </Button>
      </div>

      {/* Tenant Info Card */}
      <Card className="border border-border p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Tenant Details */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4">{tenant.name}</h1>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${tenant.email}`} className="hover:text-foreground">
                  {tenant.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <a href={`tel:${tenant.phone}`} className="hover:text-foreground">
                  {tenant.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Status & Balance */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Lease Status</p>
              <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-semibold inline-block">
                {tenant.status === 'current' ? 'Current' : 'Moving Out'}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Account Balance</p>
              <p className={`text-2xl font-bold ${tenant.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${tenant.balance}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="border border-border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="border-b border-border rounded-none p-0 h-auto bg-transparent">
            <TabsTrigger
              value="overview"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <FileText className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <FileText className="w-4 h-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Unit</p>
                <p className="text-lg font-semibold text-foreground">{tenant.unit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Monthly Rent</p>
                <p className="text-lg font-semibold text-foreground">${tenant.rentAmount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Lease Start</p>
                <p className="text-lg font-semibold text-foreground">
                  {new Date(tenant.leaseStart).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Lease End</p>
                <p className="text-lg font-semibold text-foreground">
                  {new Date(tenant.leaseEnd).toLocaleDateString()}
                </p>
              </div>
            </div>

            {tenant.balance > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-200">Payment Overdue</p>
                  <p className="text-sm text-red-800 dark:text-red-300">
                    This tenant has an outstanding balance of ${tenant.balance}. Consider sending a payment reminder.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">Payment History</h3>
                <Button size="sm">Record Payment</Button>
              </div>
              <div className="space-y-3">
                {tenantPayments.length > 0 ? (
                  tenantPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-foreground">Rent Payment</p>
                        <p className="text-sm text-muted-foreground">{payment.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-400">+${payment.amount}</p>
                        <p className="text-xs text-muted-foreground capitalize">{payment.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No payment history</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="p-6">
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No documents uploaded</p>
              <Button>Upload Document</Button>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Tenant Messages</h3>
                <Button size="sm">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No messages yet</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
