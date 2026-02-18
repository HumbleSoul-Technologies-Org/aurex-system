"use client"

import React from 'react'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const locations = [
  { name: 'Cairo', country: 'Egypt', coords: [30.0444, 31.2357] },
  { name: 'Lagos', country: 'Nigeria', coords: [6.5244, 3.3792] },
  { name: 'Nairobi', country: 'Kenya', coords: [-1.2921, 36.8219] },
  { name: 'Johannesburg', country: 'South Africa', coords: [-26.2041, 28.0473] },
  { name: 'Accra', country: 'Ghana', coords: [5.6037, -0.1870] },
  { name: 'Casablanca', country: 'Morocco', coords: [33.5731, -7.5898] },
  { name: 'Dakar', country: 'Senegal', coords: [14.6937, -17.4441] },
  { name: 'Addis Ababa', country: 'Ethiopia', coords: [8.9806, 38.7578] },
  { name: 'Kampala', country: 'Uganda', coords: [0.3476, 32.5825] },
  { name: 'Algiers', country: 'Algeria', coords: [36.7538, 3.0588] },
]

export default function MapClient() {
  return (
    <MapContainer center={[6.0, 20.0]} zoom={3} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc) => (
        <Marker key={loc.name} position={loc.coords as [number, number]}>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{loc.name}</div>
              <div className="text-muted-foreground">{loc.country}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
