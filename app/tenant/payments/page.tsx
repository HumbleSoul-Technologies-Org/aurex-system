'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Filter } from 'lucide-react'
import Link from 'next/link'
import { paymentHistory, currentTenant } from '@/app/lib/tenant-data'

export default function PaymentHistoryPage() {
  const totalPaid = paymentHistory
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Payment History
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          View and manage all your rental payments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <Card className="border border-border p-4 md:p-6">
          <p className="text-xs md:text-sm text-muted-foreground mb-2">
            Total Paid (YTD)
          </p>
          <p className="text-2xl md:text-3xl font-bold text-foreground">
            ${totalPaid.toLocaleString()}
          </p>
        </Card>

        <Card className="border border-border p-4 md:p-6">
          <p className="text-xs md:text-sm text-muted-foreground mb-2">
            Monthly Rent
          </p>
          <p className="text-2xl md:text-3xl font-bold text-foreground">
            ${currentTenant.monthlyRent}
          </p>
        </Card>

        <Card className="border border-border p-4 md:p-6">
          <p className="text-xs md:text-sm text-muted-foreground mb-2">
            Payments Made
          </p>
          <p className="text-2xl md:text-3xl font-bold text-foreground">
            {paymentHistory.filter((p) => p.status === 'paid').length}
          </p>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-border gap-2 text-foreground bg-transparent"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-border gap-2 text-foreground flex-1 sm:flex-none bg-transparent"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-white flex-1 sm:flex-none"
          >
            <Link href="/tenant/make-payment">Make Payment</Link>
          </Button>
        </div>
      </div>

      {/* Payment History Table */}
      <Card className="border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary border-b border-border">
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-foreground">
                  Date
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-foreground">
                  Amount
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="hidden sm:table-cell px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-foreground">
                  Method
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paymentHistory.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-secondary transition-colors"
                >
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-foreground">
                    {payment.date
                      ? new Date(payment.date).toLocaleDateString()
                      : new Date(payment.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm font-semibold text-foreground">
                    ${payment.amount}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <Badge
                      className={
                        payment.status === 'paid'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }
                    >
                      {payment.status === 'paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </td>
                  <td className="hidden sm:table-cell px-4 md:px-6 py-3 md:py-4 text-sm text-muted-foreground">
                    {payment.method || '—'}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/90"
                    >
                      View
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
