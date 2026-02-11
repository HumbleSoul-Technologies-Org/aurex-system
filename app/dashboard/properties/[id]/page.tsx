'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { sampleProperties, sampleTenants } from '@/app/lib/sample-data'
import {
  ArrowLeft,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Settings,
  Edit,
  MoreVertical,
  Home,
  Calendar,
} from 'lucide-react'

interface PropertyDetailPageProps {
  params: {
    id: string
  }
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const property = sampleProperties.find((p) => p.id === params.id)
  const propertyTenants = sampleTenants.filter((t) => t.propertyId === params.id)
  const [activeTab, setActiveTab] = useState('overview')

  if (!property) {
    return (
      <div className="space-y-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard/properties" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </Link>
        </Button>
        <Card className="border border-border p-12 text-center">
          <p className="text-muted-foreground">Property not found</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/properties" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </Button>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit Property
        </Button>
      </div>

      {/* Property Hero */}
      <Card className="border border-border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* Image */}
          <div className="md:col-span-1">
            <img
              src={property.image || "/placeholder.svg"}
              alt={property.name}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>

          {/* Info */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">{property.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{property.address}, {property.city}, {property.state} {property.zip}</span>
              </div>
              <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-semibold">
                Active Property
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Units</p>
                <p className="text-2xl font-bold text-foreground">{property.units}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Occupancy</p>
                <p className="text-2xl font-bold text-foreground">{property.occupancy}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${property.monthlyRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="border border-border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="border-b border-border rounded-none p-0 h-auto bg-transparent">
            <TabsTrigger
              value="overview"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Home className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="units"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Users className="w-4 h-4 mr-2" />
              Units & Tenants
            </TabsTrigger>
            <TabsTrigger
              value="financials"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Financials
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <FileText className="w-4 h-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-6 py-3 text-foreground data-[state=active]:bg-transparent"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Property Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Property Type</p>
                  <p className="font-semibold text-foreground capitalize">{property.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Units</p>
                  <p className="font-semibold text-foreground">{property.units}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Address</p>
                  <p className="font-semibold text-foreground">{property.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ZIP Code</p>
                  <p className="font-semibold text-foreground">{property.zip}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Performance</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-foreground mb-2">{property.occupancy}%</p>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${property.occupancy}%` }}
                    />
                  </div>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Occupied Units</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.ceil((property.occupancy / 100) * property.units)}
                  </p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Vacant Units</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {Math.floor(((100 - property.occupancy) / 100) * property.units)}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Units & Tenants Tab */}
          <TabsContent value="units" className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Tenants</h3>
                <Button size="sm">Add Tenant</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Unit</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Tenant</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Rent</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propertyTenants.map((tenant) => (
                      <tr key={tenant.id} className="border-b border-border hover:bg-secondary">
                        <td className="px-4 py-3 font-semibold text-foreground">{tenant.unit}</td>
                        <td className="px-4 py-3 text-foreground">{tenant.name}</td>
                        <td className="px-4 py-3 text-foreground">${tenant.rentAmount}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                            {tenant.status === 'current' ? 'Current' : 'Moving Out'}
                          </span>
                        </td>
                        <td className={`px-4 py-3 font-semibold ${tenant.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${tenant.balance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials" className="p-6">
            <div className="grid grid-cols-3 gap-6 mb-8">
              <Card className="border border-border p-4">
                <p className="text-sm text-muted-foreground mb-2">Annual Revenue</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${(property.monthlyRevenue * 12).toLocaleString()}
                </p>
              </Card>
              <Card className="border border-border p-4">
                <p className="text-sm text-muted-foreground mb-2">Average Rent</p>
                <p className="text-2xl font-bold text-foreground">
                  ${Math.round(property.monthlyRevenue / property.units)}
                </p>
              </Card>
              <Card className="border border-border p-4">
                <p className="text-sm text-muted-foreground mb-2">Total Rent Roll</p>
                <p className="text-2xl font-bold text-foreground">
                  ${property.monthlyRevenue.toLocaleString()}
                </p>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="p-6">
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
              <Button>Upload Document</Button>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4">Property Settings</h3>
                <Button variant="outline">Edit Property Details</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
