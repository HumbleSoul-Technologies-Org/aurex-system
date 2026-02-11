'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AddPropertyForm from '@/components/forms/add-property-form'
import { sampleProperties } from '@/app/lib/sample-data'
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  ArrowRight,
  Home,
  MapPin,
  Users,
  DollarSign,
} from 'lucide-react'

export default function PropertiesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [showAddForm, setShowAddForm] = useState(false)

  const filteredProperties = sampleProperties.filter((prop) => {
    const matchesSearch =
      prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || prop.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleAddProperty = (data: any) => {
    console.log('New property:', data)
    // Here you would typically send data to backend
  }

  return (
    <div className="space-y-6">
      <AddPropertyForm 
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddProperty}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Properties</h1>
          <p className="text-muted-foreground">Manage and organize all your rental properties</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Toolbar */}
      <Card className="border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
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
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-background text-foreground' : 'text-muted-foreground'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-background text-foreground' : 'text-muted-foreground'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Link key={property.id} href={`/dashboard/properties/${property.id}`}>
              <Card className="border border-border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                {/* Property Image */}
                <div className="relative h-48 bg-secondary overflow-hidden">
                  <img
                    src={property.image || "/placeholder.svg"}
                    alt={property.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {property.occupancy}% Occupied
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{property.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" />
                        {property.city}, {property.state}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Units
                      </span>
                      <span className="font-semibold text-foreground">{property.units}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Monthly Revenue
                      </span>
                      <span className="font-semibold text-foreground">${property.monthlyRevenue.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button variant="outline" className="w-full border-border text-foreground group bg-transparent">
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card className="border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Property</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Location</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Units</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Occupancy</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Monthly Revenue</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="border-b border-border hover:bg-secondary transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground">{property.name}</td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {property.city}, {property.state}
                    </td>
                    <td className="px-6 py-4 text-foreground">{property.units}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${property.occupancy}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-foreground w-12 text-right">
                          {property.occupancy}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      ${property.monthlyRevenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                        {property.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/properties/${property.id}`}>
                        <Button size="sm" variant="outline" className="border-border bg-transparent">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <Card className="border border-border p-12 text-center">
          <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No properties found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
        </Card>
      )}
    </div>
  )
}
