'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { listProperties } from '@/lib/services/properties'
import { listTenants } from '@/lib/services/tenants'
import { useRouter } from 'next/navigation'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface MapContentProps {
  properties: any[]
  tenants: any[]
}

export default function MapContent({ properties, tenants }: MapContentProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!mapContainer.current) return

    // Clean up previous map instance
    if (mapInstance.current) {
      mapInstance.current.off()
      mapInstance.current.remove()
      mapInstance.current = null
    }

    // Calculate center coordinates for map
    const lats = properties
      .map((p) => p.location?.lat || 0)
      .filter((lat) => lat !== 0)
    const longs = properties
      .map((p) => p.location?.lng || 0)
      .filter((long) => long !== 0)

    const centerLat =
      lats.length > 0 ? lats.reduce((a, b) => a + b) / lats.length : 0
    const centerLong =
      longs.length > 0 ? longs.reduce((a, b) => a + b) / longs.length : 20

    // Initialize map
    const map = L.map(mapContainer.current, {
      center: [centerLat, centerLong],
      zoom: 5,
    })

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // Add markers for each property
    properties.forEach((property) => {
      if (property.location?.lat && property.location?.lng) {
        const marker = L.marker([
          property.location.lat,
          property.location.lng,
        ]).addTo(map)

        // Count tenants for this property
        const propertyTenants = tenants.filter(t => t.propertyId === property.id)
        const tenantCount = propertyTenants.length

        const popupContent = `
          <div onclick="window.location.href='/dashboard/properties/${property.id}'" style="cursor: pointer;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${property.name}</h3>
            <p style="margin: 4px 0; font-size: 13px; color: #666;">${property.city}, ${property.country}</p>
            <div style="margin: 8px 0 0 0; padding-top: 8px; border-top: 1px solid #e0e0e0;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
                <div>
                  <p style="margin: 0; color: #999;"><strong>Units</strong></p>
                  <p style="margin: 4px 0 0 0; color: #333;">${property.units_available}</p>
                </div>
                <div>
                  <p style="margin: 0; color: #999;"><strong>Tenants</strong></p>
                  <p style="margin: 4px 0 0 0; color: #333;">${tenantCount}</p>
                </div>
              </div>
            </div>
          </div>
        `

        marker.bindPopup(popupContent)
      }
    })

    mapInstance.current = map

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.off()
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [properties, tenants])

  return (
    <div
      ref={mapContainer}
      style={{ width: '100%', height: '100%', zIndex: 0 }}
    />
  )
}
