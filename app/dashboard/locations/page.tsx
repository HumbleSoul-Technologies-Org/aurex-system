import dynamic from 'next/dynamic'
import React from 'react'

import MapLoader from './MapLoader'

const locations = [
  { name: 'Cairo', country: 'Egypt' },
  { name: 'Lagos', country: 'Nigeria' },
  { name: 'Nairobi', country: 'Kenya' },
  { name: 'Johannesburg', country: 'South Africa' },
  { name: 'Accra', country: 'Ghana' },
  { name: 'Casablanca', country: 'Morocco' },
  { name: 'Dakar', country: 'Senegal' },
  { name: 'Addis Ababa', country: 'Ethiopia' },
  { name: 'Kampala', country: 'Uganda' },
  { name: 'Algiers', country: 'Algeria' },
]

export default function LocationsPage() {
  return (
    <div className="min-h-[70vh] p-4">
      <h1 className="text-2xl font-semibold mb-4">Property Locations — Africa</h1>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 lg:flex-[2] h-[60vh] rounded-lg overflow-hidden border border-border">
          <MapLoader />
        </div>

        <aside className="w-full lg:w-80 p-4 border border-border rounded-lg bg-card">
          <h2 className="font-medium mb-2">Locations</h2>
          <ul className="space-y-2 text-sm">
            {locations.map((loc) => (
              <li key={loc.name} className="flex items-start gap-2">
                <div className="w-2 h-2 mt-2 bg-primary rounded-full" />
                <div>
                  <div className="font-semibold">{loc.name}</div>
                  <div className="text-xs text-muted-foreground">{loc.country}</div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}
