// Seeding disabled — user requested removal of mock data.
import { createUser } from '@/lib/services/auth'
import { findInCollection } from '@/lib/local-store'
import { createProperty } from '@/lib/services/properties'

export function ensureSeed() {
  // Create admin user if not exists
  try {
    const existingAdmin = findInCollection('users', (u: any) => u.email === 'admin@example.com')
    if (!existingAdmin) {
      createUser({
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        password: 'adminpass'
      })
    }
  } catch (e) {
    // Ignore errors during seeding
  }

  // Add sample properties if none exist
  try {
    const existingProperties = findInCollection('properties', () => true)
    if (!existingProperties) {
      // Add some sample properties with locations
      createProperty({
        name: 'Sunset Apartments',
        address: '123 Main St',
        city: 'Nairobi',
        country: 'Kenya',
        units_available: 10,
        price_per_unit: 500,
        type: 'apartment',
        features: ['Parking', 'Security'],
        description: 'Modern apartments in the city center',
        location: { lat: -1.2864, lng: 36.8172 }
      })

      createProperty({
        name: 'Ocean View Villas',
        address: '456 Beach Rd',
        city: 'Mombasa',
        country: 'Kenya',
        units_available: 5,
        price_per_unit: 800,
        type: 'villa',
        features: ['Ocean View', 'Pool'],
        description: 'Luxury villas with ocean views',
        location: { lat: -4.0435, lng: 39.6682 }
      })

      createProperty({
        name: 'Mountain Retreat',
        address: '789 Hill St',
        city: 'Eldoret',
        country: 'Kenya',
        units_available: 8,
        price_per_unit: 300,
        type: 'house',
        features: ['Garden', 'Mountain View'],
        description: 'Peaceful houses in the mountains',
        location: { lat: 0.5143, lng: 35.2698 }
      })
    }
  } catch (e) {
    // Ignore errors during seeding
  }
}
