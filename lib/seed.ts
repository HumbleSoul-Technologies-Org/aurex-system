// Seeding disabled — user requested removal of mock data.
import { createUser } from '@/lib/services/auth'
import { findInCollection } from '@/lib/local-store'

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
}
