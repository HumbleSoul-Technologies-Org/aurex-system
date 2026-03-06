'use client'

import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin } from 'lucide-react'
import Link from 'next/link'
import { sampleProperties } from '@/app/lib/sample-data'

const MapContent = dynamic(() => import('@/components/map-content'), {
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-muted animate-pulse rounded-lg" />,
})

export default function MapPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Properties Map</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            View all your properties on an interactive map
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="border-border text-foreground bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="border border-border p-0 overflow-hidden h-[600px]">
            {sampleProperties.length > 0 ? (
              <MapContent />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Properties to Display</h3>
                  <p className="text-muted-foreground mb-4">Add properties to view them on the map</p>
                  <Link href="/dashboard/properties">
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      Add Property
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Properties List */}
        <div>
          <Card className="border border-border p-4 overflow-y-auto max-h-[600px]">
            <h2 className="text-lg font-bold text-foreground mb-4">Properties</h2>
            <div className="space-y-3">
              {sampleProperties.length > 0 ? (
                sampleProperties.map((property) => (
                  <div
                    key={property.id}
                    className="p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <p className="font-medium text-foreground text-sm">{property.name}</p>
                    <div className="flex items-start gap-2 mt-2">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        {property?.city}, {property?.country}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Units</p>
                        <p className="font-semibold text-foreground">{property.units_available}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Occupancy</p>
                        <p className="font-semibold text-foreground">{property.occupancy}%</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">No properties available</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
