'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Wrench,
  AlertCircle,
  Clock,
  CheckCircle,
  Plus,
  Filter,
} from 'lucide-react'
import Link from 'next/link'
import { maintenanceRequests } from '@/app/lib/tenant-data'

export default function MaintenancePage() {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'plumbing',
    priority: 'medium',
  })

  const filteredRequests =
    filter === 'all'
      ? maintenanceRequests
      : maintenanceRequests.filter((r) => r.status === filter)

  const statusCounts = {
    pending: maintenanceRequests.filter((r) => r.status === 'pending').length,
    assigned: maintenanceRequests.filter((r) => r.status === 'assigned').length,
    'in-progress': maintenanceRequests.filter(
      (r) => r.status === 'in-progress'
    ).length,
    resolved: maintenanceRequests.filter((r) => r.status === 'resolved').length,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'assigned':
        return <Wrench className="w-4 h-4 text-blue-600" />
      case 'in-progress':
        return <Clock className="w-4 h-4 text-orange-600" />
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'in-progress':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Maintenance Requests
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Track and manage maintenance issues
          </p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-white gap-2 h-10 md:h-auto"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Request</span>
          <span className="sm:hidden">Report Issue</span>
        </Button>
      </div>

      {/* New Request Form */}
      {showForm && (
        <Card className="border border-border p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6">
            Report New Maintenance Issue
          </h2>

          <div className="space-y-4 md:space-y-6">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Issue Title
              </label>
              <input
                type="text"
                placeholder="e.g., Leaky kitchen faucet"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 md:py-3 border border-border rounded-lg bg-background text-foreground text-sm md:text-base"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Description
              </label>
              <textarea
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 md:py-3 border border-border rounded-lg bg-background text-foreground text-sm md:text-base"
                rows={4}
              />
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 md:py-3 border border-border rounded-lg bg-background text-foreground text-sm md:text-base"
                >
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="hvac">HVAC</option>
                  <option value="locks">Locks & Security</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-4 py-2 md:py-3 border border-border rounded-lg bg-background text-foreground text-sm md:text-base"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="border-border text-foreground flex-1"
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-white flex-1"
                onClick={() => {
                  if (formData.title.trim()) {
                    setShowForm(false)
                    setFormData({
                      title: '',
                      description: '',
                      category: 'plumbing',
                      priority: 'medium',
                    })
                  }
                }}
              >
                Submit Request
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Pending', value: statusCounts.pending, color: 'bg-yellow-100 dark:bg-yellow-900/30' },
          { label: 'Assigned', value: statusCounts.assigned, color: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'In Progress', value: statusCounts['in-progress'], color: 'bg-orange-100 dark:bg-orange-900/30' },
          { label: 'Resolved', value: statusCounts.resolved, color: 'bg-green-100 dark:bg-green-900/30' },
        ].map((item) => (
          <Card key={item.label} className={`border border-border p-3 md:p-4 ${item.color}`}>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">
              {item.label}
            </p>
            <p className="text-2xl md:text-3xl font-bold text-foreground">
              {item.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: 'all', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'assigned', label: 'Assigned' },
          { value: 'in-progress', label: 'In Progress' },
          { value: 'resolved', label: 'Resolved' },
        ].map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.value)}
            className={`whitespace-nowrap text-xs md:text-sm ${
              filter === f.value
                ? 'bg-primary text-white'
                : 'border-border text-foreground'
            }`}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Maintenance Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <Card className="border border-border p-8 text-center">
            <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No maintenance requests found</p>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="border border-border p-4 md:p-6 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Left Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    {getStatusIcon(request.status)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-sm md:text-base truncate">
                        {request.title}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">
                        {request.description}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                      {request.category}
                    </Badge>
                    <Badge
                      className={
                        request.priority === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }
                    >
                      {request.priority} priority
                    </Badge>
                  </div>
                </div>

                {/* Right Content */}
                <div className="flex flex-col items-end gap-2 text-xs md:text-sm">
                  <p className="text-muted-foreground">
                    {new Date(request.date).toLocaleDateString()}
                  </p>
                  {request.resolvedDate && (
                    <p className="text-green-600">
                      Resolved:{' '}
                      {new Date(request.resolvedDate).toLocaleDateString()}
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/90"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
