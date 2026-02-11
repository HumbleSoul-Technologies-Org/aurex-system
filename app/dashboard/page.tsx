'use client'

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Home,
  DollarSign,
  AlertCircle,
  Wrench,
  TrendingUp,
  ArrowRight,
  Users,
} from 'lucide-react'
import { chartData, expenseBreakdown, occupancyData, sampleProperties, sampleTenants, sampleTransactions } from '@/app/lib/sample-data'

export default function DashboardPage() {
  // Calculate metrics
  const totalProperties = sampleProperties.length
  const totalUnits = sampleProperties.reduce((sum, p) => sum + p.units, 0)
  const totalMonthlyRevenue = sampleProperties.reduce((sum, p) => sum + p.monthlyRevenue, 0)
  const averageOccupancy =
    Math.round(
      (sampleProperties.reduce((sum, p) => sum + p.occupancy, 0) / sampleProperties.length) * 100
    ) / 100
  const pendingPayments = sampleTenants.filter((t) => t.balance > 0).length
  const openMaintenanceRequests = 3
  const ytdProfit = 185000

  const recentActivity = sampleTransactions.slice(0, 6)

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Welcome back</h1>
        <p className="text-sm md:text-base text-muted-foreground">Here's what's happening with your properties today</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {/* Total Properties */}
        <Card className="border border-border p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Total Properties</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{totalProperties}</p>
              <p className="text-xs text-muted-foreground mt-2">{totalUnits} units total</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
          </div>
        </Card>

        {/* Occupancy Rate */}
        <Card className="border border-border p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Occupancy Rate</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{averageOccupancy}%</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">+2.5% from last month</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        {/* Monthly Revenue */}
        <Card className="border border-border p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Monthly Revenue</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                ${(totalMonthlyRevenue / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">+5.2% growth</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        {/* Pending Payments */}
        <Card className="border border-border p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Pending Payments</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{pendingPayments}</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">$5,450 total overdue</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>

        {/* Open Maintenance */}
        <Card className="border border-border p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Open Maintenance</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{openMaintenanceRequests}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">2 urgent</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Wrench className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>

        {/* YTD Profit */}
        <Card className="border border-border p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">YTD Profit</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                ${(ytdProfit / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">+12.8% increase</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2">
          <Card className="border border-border p-4 md:p-6">
            <h2 className="text-base md:text-lg font-bold text-foreground mb-4 md:mb-6">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  dot={{ fill: 'var(--primary)', r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="var(--destructive)"
                  dot={{ fill: 'var(--destructive)', r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Expense Breakdown */}
        <div>
          <Card className="border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-6">Expense Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Occupancy & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy by Property */}
        <div className="lg:col-span-2">
          <Card className="border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-6">Occupancy by Property</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="property" stroke="var(--muted-foreground)" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar dataKey="occupancy" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="border border-border p-6 h-full">
            <h2 className="text-lg font-bold text-foreground mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white justify-start">
                <Building2 className="w-4 h-4 mr-2" />
                Add Property
              </Button>
              <Button variant="outline" className="w-full border-border text-foreground justify-start bg-transparent">
                <DollarSign className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
              <Button variant="outline" className="w-full border-border text-foreground justify-start bg-transparent">
                <Wrench className="w-4 h-4 mr-2" />
                Create Work Order
              </Button>
              <Button variant="outline" className="w-full border-border text-foreground justify-start bg-transparent">
                <Users className="w-4 h-4 mr-2" />
                Add Tenant
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
          <Button variant="outline" className="border-border text-primary bg-transparent">
            View all <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {activity.type === 'payment' ? `Payment from ${activity.tenant}` : `Expense: ${activity.description}`}
                </p>
                <p className="text-sm text-muted-foreground">{activity.property}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold ${activity.type === 'payment' ? 'text-green-600' : 'text-red-600'}`}>
                  {activity.type === 'payment' ? '+' : '-'}${activity.amount}
                </p>
                <p className="text-xs text-muted-foreground">{activity.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
