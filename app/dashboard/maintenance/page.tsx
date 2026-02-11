'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { sampleMaintenanceRequests } from '@/app/lib/sample-data'
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
  unit: string
  tenant: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'requested' | 'assigned' | 'in-progress' | 'completed'
  createdDate: string
  assignedTo: string | null
  estimatedCost: number
}

export default function MaintenancePage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null)

  const requests = sampleMaintenanceRequests as MaintenanceRequest[]

  // Group requests by status
  const groupedRequests = {
    requested: requests.filter((r) => r.status === 'requested'),
    assigned: requests.filter((r) => r.status === 'assigned'),
    'in-progress': requests.filter((r) => r.status === 'in-progress'),
    completed: requests.filter((r) => r.status === 'completed'),
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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
      case 'requested':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'assigned':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'in-progress':
        return <Wrench className="w-4 h-4 text-purple-600" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return null
    }
  }

  const RequestCard = ({ request }: { request: MaintenanceRequest }) => (
    <Card className="border border-border p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm line-clamp-2">{request.description}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {request.property} - Unit {request.unit}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs font-semibold rounded capitalize ${getPriorityColor(request.priority)}`}>
            {request.priority}
          </span>
        </div>

        <div className="pt-2 border-t border-border space-y-2">
          {request.tenant && request.tenant !== 'Unknown' && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              {request.tenant}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <DollarSign className="w-3 h-3" />
            Est. ${request.estimatedCost}
          </div>
          {request.assignedTo && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="w-3 h-3" />
              {request.assignedTo}
            </div>
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
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Work Order
        </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Requested Column */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-bold text-foreground">Requested</h3>
              <span className="ml-auto px-2 py-1 bg-secondary text-foreground text-xs font-semibold rounded-full">
                {groupedRequests.requested.length}
              </span>
            </div>
            <div className="space-y-3">
              {groupedRequests.requested.map((request) => (
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

          {/* In Progress Column */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <Wrench className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-foreground">In Progress</h3>
              <span className="ml-auto px-2 py-1 bg-secondary text-foreground text-xs font-semibold rounded-full">
                {groupedRequests['in-progress'].length}
              </span>
            </div>
            <div className="space-y-3">
              {groupedRequests['in-progress'].map((request) => (
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Priority</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Assigned To</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Est. Cost</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b border-border hover:bg-secondary transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground text-sm">{request.description}</td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">{request.property}</td>
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
                    <td className="px-6 py-4 font-semibold text-foreground">${request.estimatedCost}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{request.createdDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
