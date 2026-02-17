'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { sampleTransactions, sampleTenants, getEnrichedTenants, sampleProperties } from '@/app/lib/sample-data'
import Link from 'next/link'
import {
  Plus,
  Filter,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
} from 'lucide-react'

export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState('rent-collection')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all')
  const allTenants = getEnrichedTenants()

  // Enrich transactions with tenant and property data
  const enrichedTransactions = sampleTransactions.map((transaction) => {
    const tenant = allTenants.find((t) => t.id === transaction.tenantId)
    const property = sampleProperties.find((p) => p.id === transaction.propertyId)
    return {
      ...transaction,
      tenantName: tenant?.name || 'Unknown Tenant',
      propertyName: property?.name || 'Unknown Property',
    }
  })

  // Calculate financial metrics
  const rentPayments = enrichedTransactions.filter((t) => t.type === 'rent')
  const completedPayments = rentPayments.filter((t) => t.status === 'completed')
  const pendingPayments = rentPayments.filter((t) => t.status === 'pending')
  
  const totalRevenue = completedPayments.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = enrichedTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalPending = pendingPayments.reduce((sum, t) => sum + t.amount, 0)

  // Filter payments by status
  const filteredPayments = rentPayments.filter((payment) => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus
    const matchesSearch = !searchQuery || 
      payment.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.propertyName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const expenseTransactions = enrichedTransactions
    .filter((t) => t.type === 'expense')
    .filter((expense) => !searchQuery || expense.description.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Finances</h1>
          <p className="text-muted-foreground">Manage rent collection, expenses, and financial reports</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
            ${totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">From rent payments</p>
        </Card>

        <Card className="border border-border p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Expenses</p>
          <p className="text-3xl font-bold text-foreground mb-2">
            ${totalExpenses.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Maintenance & other</p>
        </Card>

        <Card className="border border-border p-6">
          <p className="text-sm text-muted-foreground mb-2">Net Profit</p>
          <p className={`text-3xl font-bold mb-2 ${totalRevenue - totalExpenses > 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${(totalRevenue - totalExpenses).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Revenue minus expenses</p>
        </Card>

        <Card className="border border-border p-6">
          <p className="text-sm text-muted-foreground mb-2">Pending Payments</p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
            ${totalPending.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">{pendingPayments.length} payments</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="border-b border-border bg-transparent h-auto p-0 rounded-none">
            <TabsTrigger value="rent-collection" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Rent Collection
            </TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Expenses
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Reports
            </TabsTrigger>
          </TabsList>

          <Button size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Rent Collection Tab */}
        <TabsContent value="rent-collection" className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Input 
                placeholder="Filter by tenant or property..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="completed">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </div>

          <div className="space-y-3">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div>
                      {payment.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Clock className="w-6 h-6 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{payment.tenantName}</p>
                      <p className="text-sm text-muted-foreground">{payment.propertyName}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-foreground">${payment.amount.toLocaleString()}</p>
                    <p className={`text-xs font-semibold ${payment.status === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                      {payment.status === 'completed' ? 'Paid' : 'Pending'}
                    </p>
                  </div>

                  <Link href={`/dashboard/tenants/${payment.tenantId}`}>
                    <Button variant="ghost" size="sm" className="ml-4">
                      View
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border border-border rounded-lg bg-secondary/30">
                <p className="text-muted-foreground">No rent payments found</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="p-6 space-y-4">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Input 
                placeholder="Filter by description..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>

          <div className="space-y-3">
            {expenseTransactions.length > 0 ? (
              expenseTransactions.map((expense: any) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">{expense.propertyName}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-red-600 dark:text-red-400">-${expense.amount.toLocaleString()}</p>
                    <p className={`text-xs font-semibold ${expense.status === 'completed' ? 'text-green-600' : expense.status === 'pending' ? 'text-orange-600' : 'text-red-600'}`}>
                      {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border border-border rounded-lg bg-secondary/30">
                <p className="text-muted-foreground">No expenses found</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Financial Reports</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="border-border text-foreground h-auto py-6 flex-col items-start bg-transparent">
                  <FileText className="w-6 h-6 mb-2" />
                  <span className="font-semibold">P&L Statement</span>
                  <span className="text-xs text-muted-foreground">Profit & Loss</span>
                </Button>
                <Button variant="outline" className="border-border text-foreground h-auto py-6 flex-col items-start bg-transparent">
                  <DollarSign className="w-6 h-6 mb-2" />
                  <span className="font-semibold">Rent Roll</span>
                  <span className="text-xs text-muted-foreground">Current rent obligations</span>
                </Button>
                <Button variant="outline" className="border-border text-foreground h-auto py-6 flex-col items-start bg-transparent">
                  <Calendar className="w-6 h-6 mb-2" />
                  <span className="font-semibold">Expense Report</span>
                  <span className="text-xs text-muted-foreground">By category & date</span>
                </Button>
                <Button variant="outline" className="border-border text-foreground h-auto py-6 flex-col items-start bg-transparent">
                  <Download className="w-6 h-6 mb-2" />
                  <span className="font-semibold">Tax Preparation</span>
                  <span className="text-xs text-muted-foreground">Tax-ready export</span>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
