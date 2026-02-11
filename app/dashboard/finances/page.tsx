'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AddExpenseForm from '@/components/forms/add-expense-form'
import { sampleTransactions, sampleTenants } from '@/app/lib/sample-data'
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
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')

  // Calculate financial metrics
  const totalRevenue = sampleTransactions
    .filter((t) => t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = sampleTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const overdueTenants = sampleTenants.filter((t) => t.balance > 0)
  const totalOverdue = overdueTenants.reduce((sum, t) => sum + t.balance, 0)

  // Rent collection data
  const rentPayments = sampleTransactions.filter((t) => t.type === 'payment')
  const filteredPayments = rentPayments.filter((payment) => {
    if (filterStatus === 'paid') return payment.status === 'completed'
    if (filterStatus === 'pending') return payment.status === 'pending'
    if (filterStatus === 'overdue') return payment.status === 'pending' // Simulating overdue
    return true
  })

  const handleAddExpense = (data: any) => {
    console.log('New expense:', data)
  }

  return (
    <div className="space-y-6">
      <AddExpenseForm 
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onSubmit={handleAddExpense}
      />
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
          <p className="text-sm text-muted-foreground mb-2">Overdue Payments</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
            ${totalOverdue.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">{overdueTenants.length} tenants</p>
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
              value="expenses"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Expenses
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Eye className="w-4 h-4 mr-2" />
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
              <Input placeholder="Filter by tenant..." />
            </div>
            <select className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </div>

          <div className="space-y-3">
            {filteredPayments.map((payment) => (
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
                    <p className="font-semibold text-foreground">{payment.tenant}</p>
                    <p className="text-sm text-muted-foreground">{payment.property}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-foreground">${payment.amount}</p>
                  <p className={`text-xs font-semibold ${payment.status === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                    {payment.status === 'completed' ? 'Paid' : 'Pending'}
                  </p>
                </div>

                <Button variant="ghost" size="sm" className="ml-4">
                  View
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="p-6 space-y-4">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Input placeholder="Filter by description..." />
            </div>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>

          <div className="space-y-3">
            {sampleTransactions
              .filter((t) => t.type === 'expense')
              .map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">{expense.property}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-red-600 dark:text-red-400">-${expense.amount}</p>
                    <p className="text-xs text-muted-foreground">{expense.date}</p>
                  </div>
                </div>
              ))}
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
