'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { FileText, Download, Filter, Calendar, TrendingUp } from 'lucide-react'
import { chartData, expenseBreakdown } from '@/app/lib/sample-data'

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('month')
  const [reportType, setReportType] = useState('income')

  const reportTypes = [
    { id: 'income', label: 'Income Report', icon: '📊' },
    { id: 'expense', label: 'Expense Report', icon: '📉' },
    { id: 'tax', label: 'Tax Preparation', icon: '📋' },
    { id: 'occupancy', label: 'Occupancy Report', icon: '📈' },
  ]

  const dateRanges = ['week', 'month', 'quarter', 'year']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground">Generate and download detailed reports for your properties</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
          >
            {reportTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Time Period</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
          >
            {dateRanges.map((range) => (
              <option key={range} value={range}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1 bg-primary hover:bg-primary/90 text-white">
            <Filter className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Apply</span>
          </Button>
          <Button variant="outline" className="flex-1 border-border bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Report Type Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {reportTypes.map((type) => (
          <Card
            key={type.id}
            onClick={() => setReportType(type.id)}
            className={`p-4 cursor-pointer transition-all ${
              reportType === type.id
                ? 'border-primary bg-primary/5 border-2'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="text-2xl mb-2">{type.icon}</div>
            <p className="text-sm font-medium text-foreground text-center">{type.label}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Revenue Trends</h3>
          <div className="w-full h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--primary)', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border border-border p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Expense Breakdown</h3>
          <div className="w-full h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '$127,500', change: '+12.5%' },
          { label: 'Total Expenses', value: '$42,300', change: '-3.2%' },
          { label: 'Net Income', value: '$85,200', change: '+18.7%' },
          { label: 'Occupancy Rate', value: '94%', change: '+2.1%' },
        ].map((stat) => (
          <Card key={stat.label} className="border border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-primary mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {stat.change}
            </p>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card className="border border-border p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Recent Reports</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Report Name</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden sm:table-cell">Period</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden md:table-cell">Generated</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Monthly Income Report', period: 'January 2024', generated: '2024-02-01' },
                { name: 'Tax Preparation Report', period: 'Q4 2023', generated: '2024-01-15' },
                { name: 'Occupancy Analysis', period: 'December 2023', generated: '2024-01-05' },
                { name: 'Expense Summary', period: 'November 2023', generated: '2023-12-20' },
              ].map((report, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-secondary">
                  <td className="py-3 px-2 text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="truncate">{report.name}</span>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">{report.period}</td>
                  <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">{report.generated}</td>
                  <td className="py-3 px-2 text-right">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      <Download className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
