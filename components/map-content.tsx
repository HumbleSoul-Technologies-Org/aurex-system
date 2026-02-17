'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { sampleProperties } from '@/app/lib/sample-data'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export default function MapContent() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (!mapContainer.current || initialized.current) return

    // Calculate center coordinates for map
    const lats = sampleProperties
      .map((p) => p.location?.lat || 0)
      .filter((lat) => lat !== 0)
    const longs = sampleProperties
      .map((p) => p.location?.long || 0)
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
    sampleProperties.forEach((property) => {
      if (property.location?.lat && property.location?.long) {
        const marker = L.marker([
          property.location.lat,
          property.location.long,
        ]).addTo(map)

        const monthlyRevenue = property.price_per_unit * property.units_available

        const popupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 260px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${property.name}</h3>
            <p style="margin: 4px 0; font-size: 13px; color: #666;">${property.address}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #666;">${property.city}, ${property.country}</p>
            <div style="margin: 8px 0 0 0; padding-top: 8px; border-top: 1px solid #e0e0e0;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
                <div>
                  <p style="margin: 0; color: #999;"><strong>Units</strong></p>
                  <p style="margin: 4px 0 0 0; color: #333;">${property.units_available}</p>
                </div>
                <div>
                  <p style="margin: 0; color: #999;"><strong>Type</strong></p>
                  <p style="margin: 4px 0 0 0; color: #333;">${property.type}</p>
                </div>
                <div>
                  <p style="margin: 0; color: #999;"><strong>Monthly Income</strong></p>
                  <p style="margin: 4px 0 0 0; color: #333;">$${monthlyRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p style="margin: 0; color: #999;"><strong>Occupancy</strong></p>
                  <p style="margin: 4px 0 0 0; color: #333;">${property.occupancy}</p>
                </div>
              </div>
            </div>
          </div>
        `

        marker.bindPopup(popupContent)
      }
    })

    mapInstance.current = map
    initialized.current = true

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.off()
        mapInstance.current.remove()
        mapInstance.current = null
        initialized.current = false
      }
    }
  }, [])

  return (
    <div
      ref={mapContainer}
      style={{ width: '100%', height: '100%', zIndex: 0 }}
    />
  )
}
