'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AddTenantForm from '@/components/forms/add-tenant-form'
import { sampleTenants } from '@/app/lib/sample-data'
import {
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  ArrowRight,
  MoreVertical,
  Eye,
} from 'lucide-react'

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'current' | 'past-due' | 'moving-out'>('all')
  const [showAddForm, setShowAddForm] = useState(false)

  const filteredTenants = sampleTenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesStatus = true
    if (filterStatus === 'current') {
      matchesStatus = tenant.status === 'current'
    } else if (filterStatus === 'past-due') {
      matchesStatus = tenant.balance > 0
    } else if (filterStatus === 'moving-out') {
      matchesStatus = tenant.status === 'moving-out'
    }

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (tenant: typeof sampleTenants[0]) => {
    if (tenant.status === 'moving-out') return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
    if (tenant.balance > 0) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
  }

  const getStatusLabel = (tenant: typeof sampleTenants[0]) => {
    if (tenant.status === 'moving-out') return 'Moving Out'
    if (tenant.balance > 0) return 'Past Due'
    return 'Current'
  }

  const handleAddTenant = (data: any) => {
    console.log('New tenant:', data)
  }

  return (
    <div className="space-y-6">
      <AddTenantForm 
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddTenant}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Tenants</h1>
          <p className="text-muted-foreground">Manage tenant information, leases, and communications</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Tenant
        </Button>
      </div>

      {/* Toolbar */}
      <Card className="border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tenants by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
            >
              <option value="all">All Status</option>
              <option value="current">Current</option>
              <option value="past-due">Past Due</option>
              <option value="moving-out">Moving Out</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tenants Table */}
      <Card className="border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Tenant</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Property/Unit</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Contact</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Rent</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Balance</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Lease End</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="border-b border-border hover:bg-secondary transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{tenant.name}</td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">
                    Unit {tenant.unit}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${tenant.email}`}>{tenant.email}</a>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${tenant.phone}`}>{tenant.phone}</a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">${tenant.rentAmount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(tenant)}`}>
                      {getStatusLabel(tenant)}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-semibold ${tenant.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {tenant.balance > 0 ? (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        ${tenant.balance}
                      </div>
                    ) : (
                      <span>$0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(tenant.leaseEnd).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/tenants/${tenant.id}`}>
                      <Button size="sm" variant="outline" className="border-border bg-transparent">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Empty State */}
      {filteredTenants.length === 0 && (
        <Card className="border border-border p-12 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No tenants found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
        </Card>
      )}
    </div>
  )
}
