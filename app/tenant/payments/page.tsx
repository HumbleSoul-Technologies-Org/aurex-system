 'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Filter, MoreHorizontal, Printer, Share2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { currentTenant } from '@/app/lib/tenant-data'
import { listPayments } from '@/lib/services/payments'
import { listProperties } from '@/lib/services/properties'

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])

  useEffect(() => {
    setPayments(listPayments())
    setProperties(listProperties())

    const onPaymentsUpdated = () => setPayments(listPayments())
    if (typeof window !== 'undefined') window.addEventListener('paymentsUpdated', onPaymentsUpdated)
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('paymentsUpdated', onPaymentsUpdated)
    }
  }, [])

  const tenantPayments = payments.filter(p => !currentTenant || p.tenantId === currentTenant.id)
  const totalPaid = tenantPayments
    .filter((p) => p.status === 'completed' || p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0)

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
            ${currentTenant?.rentAmount ?? currentTenant?.monthlyRent ?? 0}
          </p>
        </Card>

        <Card className="border border-border p-4 md:p-6">
          <p className="text-xs md:text-sm text-muted-foreground mb-2">
            Payments Made
          </p>
          <p className="text-2xl md:text-3xl font-bold text-foreground">
            {tenantPayments.filter((p) => p.status === 'completed' || p.status === 'paid').length}
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
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-foreground">Date</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-foreground">Trans ID</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-foreground">Amount</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-foreground">Status</th>
                <th className="hidden sm:table-cell px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-foreground">Method</th>
                <th className="hidden md:table-cell px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-foreground">Property</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-foreground">Unit</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tenantPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-secondary transition-colors">
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-foreground">
                    {payment.date ? new Date(payment.date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm font-mono text-foreground">{payment.transId || payment.id}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm font-semibold text-foreground">${(payment.amount || 0).toFixed(2)}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <Badge className={payment.status === 'completed' || payment.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}>
                      {(payment.status === 'completed' || payment.status === 'paid') ? 'Paid' : (payment.status || 'Pending')}
                    </Badge>
                  </td>
                  <td className="hidden sm:table-cell px-4 md:px-6 py-3 md:py-4 text-sm text-muted-foreground">{payment.method || '—'}</td>
                  <td className="hidden md:table-cell px-4 md:px-6 py-3 md:py-4 text-sm text-muted-foreground">{properties.find(p => p.id === payment.propertyId)?.name || '—'}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-muted-foreground">{payment.unit || '—'}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          if (typeof window === 'undefined') return
                          const w = window.open('', '_blank')
                          if (!w) return
                          w.document.write(`<html><head><title>Payment ${payment.transId || payment.id}</title></head><body><pre>${JSON.stringify(payment, null, 2)}</pre></body></html>`)
                          w.document.close()
                          w.print()
                        }}>
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={async () => {
                          try {
                            const text = `Payment ${payment.transId || payment.id}: $${(payment.amount||0).toFixed(2)}`
                            if (navigator.share) {
                              await navigator.share({ title: 'Payment', text, url: window.location.href })
                            } else if (navigator.clipboard) {
                              await navigator.clipboard.writeText(text)
                              // small feedback
                              // eslint-disable-next-line no-alert
                              alert('Payment details copied to clipboard')
                            } else {
                              // fallback
                              // eslint-disable-next-line no-alert
                              alert(text)
                            }
                          } catch (e) {
                            // eslint-disable-next-line no-console
                            console.error('Share failed', e)
                          }
                        }}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
