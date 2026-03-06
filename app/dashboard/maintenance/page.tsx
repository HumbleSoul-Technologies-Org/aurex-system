'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { sampleMaintenanceRequests, getEnrichedTenants, sampleProperties, sampleTransactions } from '@/app/lib/sample-data'
import { createTransaction } from '@/app/lib/transactions-client'
import Link from 'next/link'
import {
  Plus,
  Wrench,
  AlertCircle,
  Clock,
  CheckCircle,
  User,
  DollarSign,
  Calendar,
  ChevronRight,
} from 'lucide-react'

interface MaintenanceRequest {
  id: string
  property: string
  propertyId: string
  unit: string
  tenantName: string
  tenantId: string
  description: string
  priority: 'high' | 'medium' | 'low' | 'critical'
  status: 'pending' | 'assigned' | 'completed'
  createdDate: string
  completedDate: string | null
  assignedTo: string | null
  cost: number | null
  transactionId: string | null
}

export default function MaintenancePage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const allTenants = getEnrichedTenants()

  const initialRequests: MaintenanceRequest[] = sampleMaintenanceRequests.map((req: any) => {
    const tenant = allTenants.find((t) => t.id === req.tenantId)
    const property = sampleProperties.find((p) => p.id === req.property)
    const transaction = sampleTransactions.find((t) => t.maintenanceId === req.id)

    return {
      id: req.id,
      property: property?.name || req.property,
      propertyId: req.property,
      unit: req.unit,
      tenantName: tenant?.name || 'Unknown Tenant',
      tenantId: req.tenantId,
      description: req.description,
      priority: req.priority,
      status: req.status,
      createdDate: req.createdAt,
      completedDate: req.completedAt,
      assignedTo: req.assignedTo || null,
      cost: typeof req.cost === 'number' ? req.cost : null,
      transactionId: transaction?.id || null,
    }
  })

  const [requests, setRequests] = useState<MaintenanceRequest[]>(initialRequests)

  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [expenseForm, setExpenseForm] = useState({ maintenanceId: '', expense: '', expenseType: '', description: '', tenantId: '', price: '', paymentMethod: '', companyAssigned: '' })

  const openExpenseDialog = (requestId: string) => {
    const req = requests.find((r) => r.id === requestId)
    setSelectedRequestId(requestId)
    setExpenseForm({
      maintenanceId: req?.id || requestId,
      expense: req?.description || '',
      expenseType: '',
      description: `Maintenance: ${req?.description || ''}`,
      tenantId: req?.tenantId || '',
      price: req?.cost !== null && req?.cost !== undefined ? String(req.cost) : '',
      paymentMethod: '',
      companyAssigned: req?.assignedTo || '',
    })
    setExpenseDialogOpen(true)
  }

  const handleExpenseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setExpenseForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleExpenseSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!selectedRequestId) return
    const price = parseFloat(expenseForm.price || '0') || 0

    setRequests((prev) => prev.map((r) => {
      if (r.id !== selectedRequestId) return r
      return { ...r, cost: price, assignedTo: expenseForm.companyAssigned || r.assignedTo, status: 'assigned' }
    }))

    // Record as a transaction
    try {
      await createTransaction({
        tenantId: expenseForm.tenantId || undefined,
        propertyId: expenseForm.maintenanceId || undefined,
        amount: price,
        type: 'expense',
        description: expenseForm.description || 'Maintenance expense',
        status: 'completed',
      })
    } catch (err) {
      // ignore for now
    }

    setExpenseForm({ maintenanceId: '', expense: '', expenseType: '', description: '', tenantId: '', price: '', paymentMethod: '', companyAssigned: '' })
    setSelectedRequestId(null)
    setExpenseDialogOpen(false)
  }

  // Group requests by status
  const groupedRequests = {
    pending: requests.filter((r) => r.status === 'pending'),
    assigned: requests.filter((r) => r.status === 'assigned'),
    completed: requests.filter((r) => r.status === 'completed'),
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-300'
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      default:
        return ''
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'assigned':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return null
    }
  }

  const RequestCard = ({ request }: { request: MaintenanceRequest }) => (
    <Card className="border relative border-border p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm line-clamp-2">{request.description}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {request.property} - Unit {request.unit}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs font-semibold rounded capitalize whitespace-nowrap ${getPriorityColor(request.priority)}`}>
            {request.priority}
          </span>
        </div>

        <div className="pt-2 border-t border-border space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="w-3 h-3 flex-shrink-0" />
            <Link href={`/dashboard/tenants/${request.tenantId}`} className="text-blue-600 dark:text-blue-400 hover:underline">
              {request.tenantName}
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <DollarSign className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Cost: </span>
            {request.cost !== null && request.cost !== undefined ? (
              <span className="font-semibold text-foreground">${request.cost.toLocaleString()}</span>
            ) : (
              <span className="font-semibold text-foreground">—</span>
            )}
          </div>
          {request.assignedTo && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="w-3 h-3 flex-shrink-0" />
              {request.assignedTo}
            </div>
          )}
          {request.completedDate && (
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              Completed: {new Date(request.completedDate).toLocaleDateString()}
            </div>
          )}
          {request.status === 'pending' && (
            <Button
              variant="ghost"
              className="mt-2 bg-primary hover:bg-primary/90 text-white w-full"
              onClick={() => openExpenseDialog(request.id)}
            >
              Approve Maintenance
            </Button>
          )}
        </div>
      </div>

      

    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Maintenance</h1>
          <p className="text-muted-foreground">Track and manage work orders and maintenance requests</p>
        </div>
        
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Requests</p>
              <p className="text-2xl font-bold text-foreground">{requests.length}</p>
            </div>
            <Wrench className="w-8 h-8 text-primary/60" />
          </div>
        </Card>
        <Card className="border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{groupedRequests.pending.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600/60" />
          </div>
        </Card>
        <Card className="border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Assigned</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{groupedRequests.assigned.length}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600/60" />
          </div>
        </Card>
        <Card className="border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
              <p className="text-2xl font-bold text-foreground">${requests.reduce((sum, r) => sum + (r.cost || 0), 0).toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-primary/60" />
          </div>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'kanban' ? 'default' : 'outline'}
          onClick={() => setViewMode('kanban')}
          className={viewMode === 'kanban' ? 'bg-primary hover:bg-primary/90' : 'border-border'}
        >
          Kanban Board
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          onClick={() => setViewMode('list')}
          className={viewMode === 'list' ? 'bg-primary hover:bg-primary/90' : 'border-border'}
        >
          List View
        </Button>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-bold text-foreground">Pending</h3>
              <span className="ml-auto px-2 py-1 bg-secondary text-foreground text-xs font-semibold rounded-full">
                {groupedRequests.pending.length}
              </span>
            </div>
            <div className="space-y-3 relative">
              {groupedRequests.pending.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
              
            </div>
          </div>

          {/* Assigned Column */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-foreground">Assigned</h3>
              <span className="ml-auto px-2 py-1 bg-secondary text-foreground text-xs font-semibold rounded-full">
                {groupedRequests.assigned.length}
              </span>
            </div>
            <div className="space-y-3">
              {groupedRequests.assigned.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </div>

          {/* Completed Column */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-foreground">Completed</h3>
              <span className="ml-auto px-2 py-1 bg-secondary text-foreground text-xs font-semibold rounded-full">
                {groupedRequests.completed.length}
              </span>
            </div>
            <div className="space-y-3">
              {groupedRequests.completed.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card className="border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Property</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Tenant</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Priority</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Assigned To</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Cost</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Created</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b border-border hover:bg-secondary transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground text-sm">{request.description}</td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">{request.property}</td>
                    <td className="px-6 py-4 text-sm">
                      <Link href={`/dashboard/tenants/${request.tenantId}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {request.tenantName}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded capitalize ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span className="text-sm font-medium text-foreground capitalize">
                          {request.status.replace('-', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {request.assignedTo || '-'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">{request.cost !== null && request.cost !== undefined ? `$${request.cost.toLocaleString()}` : '—'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(request.createdDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Expense Dialog */}
      <Dialog open={expenseDialogOpen} onOpenChange={(open) => { if(!open){ setSelectedRequestId(null); setExpenseForm({ maintenanceId: '', expense: '', expenseType: '', description: '', tenantId: '', price: '', paymentMethod: '', companyAssigned: '' }) } setExpenseDialogOpen(open) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Expense</DialogTitle>
            <DialogDescription>Approve maintenance and record expense details.</DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => { handleExpenseSubmit(e) }} className="p-2">
            <div className="space-y-4 py-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Expense</label>
                <Input name="expense" value={expenseForm.expense} onChange={handleExpenseChange} placeholder="Expense title" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Expense Type</label>
                <select name="expenseType" value={expenseForm.expenseType} onChange={handleExpenseChange} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground">
                  <option value="">Select Type</option>
                  <option value="repair">Repair</option>
                  <option value="replacement">Replacement</option>
                  <option value="labor">Labor</option>
                  <option value="materials">Materials</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <Textarea name="description" value={expenseForm.description} onChange={handleExpenseChange} placeholder="Details about the expense" className="h-24" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tenant</label>
                <select name="tenantId" value={expenseForm.tenantId} onChange={handleExpenseChange} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground">
                  <option value="">Select Tenant</option>
                  {allTenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Price</label>
                  <Input type="number" name="price" value={expenseForm.price} onChange={handleExpenseChange} placeholder="0" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Company Assigned</label>
                  <Input name="companyAssigned" value={expenseForm.companyAssigned} onChange={handleExpenseChange} placeholder="Company name" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Payment Method</label>
                <select name="paymentMethod" value={expenseForm.paymentMethod} onChange={handleExpenseChange} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground">
                  <option value="">Select Method</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => { setExpenseDialogOpen(false); setSelectedRequestId(null); setExpenseForm({ maintenanceId: '', expense: '', expenseType: '', description: '', tenantId: '', price: '', paymentMethod: '', companyAssigned: '' }) }}>Cancel</Button>
                <Button type="submit">Approve</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
