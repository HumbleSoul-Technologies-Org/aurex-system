'use client'

import { useState } from 'react'
import { use } from 'react'
import Image from 'next/image'
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
  Home,
} from 'lucide-react'

interface PropertyDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = use(params)
  const property:any = sampleProperties.find((p:any) => p.id === id)
  const propertyTenants = sampleTenants.filter((t) => t.propertyId === id)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Income Calculations
  const totalMonthlyIncome = propertyTenants.reduce((sum, tenant) => sum + tenant.rentAmount, 0)
  const totalAnnualIncome = totalMonthlyIncome * 12
  const occupiedUnits = propertyTenants.length
  const averageIncomePerUnit = occupiedUnits > 0 ? Math.round(totalMonthlyIncome / occupiedUnits) : 0
  const potentialMonthlyIncome = property?.price_per_unit ? property.price_per_unit * property?.units_available : 0
  const occupancyPercentage = property?.units_available > 0 ? Math.round((occupiedUnits / property.units_available) * 100) : 0
  const incomeUtilization = potentialMonthlyIncome > 0 ? Math.round((totalMonthlyIncome / potentialMonthlyIncome) * 100) : 0

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
          {/* Image Gallery */}
          <div className="md:col-span-1 space-y-3">
            {/* Main Image */}
            <div className="relative h-64 bg-secondary overflow-hidden rounded-lg">
              <img
                src={property.images?.[selectedImageIndex] || "/placeholder.svg"}
                alt={property.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {property.images && property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {property?.images.map((image:any, index:number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${property.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">{property.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{property.address}, {property.city}, {property.country}</span>
              </div>
              <div className="flex gap-2">
                <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-semibold">
                  Active Property
                </div>
                <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-semibold capitalize">
                  {property.type}
                </div>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-5 gap-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Available Units</p>
                <p className="text-2xl font-bold text-foreground">{property.units_available}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tenants</p>
                <p className="text-2xl font-bold text-foreground">{propertyTenants.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Occupancy</p>
                <p className="text-2xl font-bold text-foreground">{occupancyPercentage}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Monthly Income</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${totalMonthlyIncome.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Annual Income</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${(totalAnnualIncome / 1000).toFixed(1)}k
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
                  <p className="text-sm text-muted-foreground mb-1">Available Units</p>
                  <p className="font-semibold text-foreground">{property.units_available}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Address</p>
                  <p className="font-semibold text-foreground">{property.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">City</p>
                  <p className="font-semibold text-foreground">{property.city}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Country</p>
                  <p className="font-semibold text-foreground">{property.country}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Square Meters</p>
                  <p className="font-semibold text-foreground">{property.sq_mtrs}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Features & Details</h3>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Geography</p>
                  <p className="font-semibold text-foreground">{property.geography}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Occupancy Status</p>
                  <p className="font-semibold text-foreground">{property.occupancy}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-3">Property Features</p>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feature:any, index:number) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Rental Details</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Price Per Unit</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${property.price_per_unit.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Tenants</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {propertyTenants.length}
                  </p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Occupancy</p>
                  <p className="text-2xl font-bold text-foreground">
                    {property.occupancy}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Units & Tenants Tab */}
          <TabsContent value="units" className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Tenants ({propertyTenants.length})</h3>
                <Button size="sm">Add Tenant</Button>
              </div>
              {propertyTenants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Unit</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Avatar</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Tenant</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Monthly Rent</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Lease Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertyTenants.map((tenant) => (
                        <tr key={tenant.id} className="border-b border-border hover:bg-secondary">
                          <td className="px-4 py-3 font-semibold text-foreground">{tenant.unit}</td>
                          <td className="px-4 py-3">
                            <Image
                              src={tenant.image}
                              alt={tenant.name}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            <Link href={`/dashboard/tenants/${tenant.id}`} className="font-semibold text-blue-600 hover:underline">
                              {tenant.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3 font-semibold text-foreground">${tenant.rentAmount.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              tenant.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                              tenant.status === 'due' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                              tenant.status === 'moving out' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                              'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            }`}>
                              {tenant.status === 'paid' ? 'Paid' : tenant.status === 'due' ? 'Due' : tenant.status.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-foreground capitalize">{tenant.lease_type}</td>
                          <td className="px-4 py-3">
                            <Link href={`/dashboard/tenants/${tenant.id}`} className="text-blue-600 hover:text-blue-700 text-sm">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Card className="border border-border p-8 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">No tenants in this property</p>
                  <Button size="sm">Add First Tenant</Button>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials" className="p-6">
            {/* Income Summary */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-foreground mb-4">Income Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border border-border p-4">
                  <p className="text-sm text-muted-foreground mb-2">Monthly Income</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${totalMonthlyIncome.toLocaleString()}
                  </p>
                </Card>
                <Card className="border border-border p-4">
                  <p className="text-sm text-muted-foreground mb-2">Annual Income</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${totalAnnualIncome.toLocaleString()}
                  </p>
                </Card>
                <Card className="border border-border p-4">
                  <p className="text-sm text-muted-foreground mb-2">Occupied Units</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {occupiedUnits}/{property?.units_available}
                  </p>
                </Card>
                <Card className="border border-border p-4">
                  <p className="text-sm text-muted-foreground mb-2">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {occupancyPercentage}%
                  </p>
                </Card>
              </div>
            </div>

            {/* Potential vs Actual */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-foreground mb-4">Revenue Potential</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border border-border p-4">
                  <p className="text-sm text-muted-foreground mb-2">Potential Monthly</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${potentialMonthlyIncome.toLocaleString()}
                  </p>
                </Card>
                <Card className="border border-border p-4">
                  <p className="text-sm text-muted-foreground mb-2">Current Monthly</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${totalMonthlyIncome.toLocaleString()}
                  </p>
                </Card>
                <Card className="border border-border p-4">
                  <p className="text-sm text-muted-foreground mb-2">Lost Revenue</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    ${(potentialMonthlyIncome - totalMonthlyIncome).toLocaleString()}
                  </p>
                </Card>
                <Card className="border border-border p-4">
                  <p className="text-sm text-muted-foreground mb-2">Utilization</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {incomeUtilization}%
                  </p>
                </Card>
              </div>
            </div>

            {/* Unit Details */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-foreground mb-4">Unit Income Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="border border-border p-4">
                  <p className="text-sm text-muted-foreground mb-2">Price per Unit</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${property?.price_per_unit.toLocaleString()}
                  </p>
                </Card>
                <Card className="border border-border p-4">
                  <p className="text-sm text-muted-foreground mb-2">Average Income per Unit</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${averageIncomePerUnit.toLocaleString()}
                  </p>
                </Card>
                <Card className="border border-border p-4">
                  <p className="text-sm text-muted-foreground mb-2">Total Units Available</p>
                  <p className="text-2xl font-bold text-foreground">
                    {property?.units_available}
                  </p>
                </Card>
              </div>
            </div>
            
            {/* Tenant Monthly Rent Breakdown */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Tenant Monthly Rent Breakdown</h3>
              {propertyTenants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Unit</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Tenant</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Monthly Rent</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Annual Income</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Lease Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertyTenants.map((tenant) => (
                        <tr key={tenant.id} className="border-b border-border hover:bg-secondary">
                          <td className="px-4 py-3 font-semibold text-foreground">{tenant.unit}</td>
                          <td className="px-4 py-3 text-foreground">{tenant.name}</td>
                          <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">${tenant.rentAmount.toLocaleString()}</td>
                          <td className="px-4 py-3 font-semibold text-foreground">${(tenant.rentAmount * 12).toLocaleString()}</td>
                          <td className="px-4 py-3 text-foreground capitalize">{tenant.lease_type}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-border bg-secondary">
                        <td colSpan={2} className="px-4 py-3 font-bold text-foreground">TOTAL</td>
                        <td className="px-4 py-3 font-bold text-green-600 dark:text-green-400">${totalMonthlyIncome.toLocaleString()}</td>
                        <td className="px-4 py-3 font-bold text-green-600 dark:text-green-400">${totalAnnualIncome.toLocaleString()}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <Card className="border border-border p-8 text-center">
                  <p className="text-muted-foreground">No tenants to display</p>
                </Card>
              )}
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
