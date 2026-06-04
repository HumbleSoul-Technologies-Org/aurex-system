import {
  getCollection,
  insertIntoCollection,
  findInCollection,
  setValue,
  getValue,
  generateId,
  removeFromCollection,
  updateInCollection,
} from '@/lib/local-store'
import { listTenants } from '@/lib/services/tenants'
import { getStoredUser } from '@/lib/token-manager'

const SESSION_KEY = 'propman:session'

export interface UserRecord {
  id: string
  email: string
  name: string
  role?: string
  password?: string // plain-text for prototype
}

export function generatePassword(len = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export async function createUser(payload: { email: string; name: string; role?: string; password?: string }) {
  const existing = findInCollection<UserRecord>('users', (u) => u.email === payload.email)
  if (existing) throw new Error('User with this email already exists')

  const password = payload.password || generatePassword()
  const user: UserRecord = {
    id: generateId('user'),
    email: payload.email,
    name: payload.name,
    role: payload.role || 'tenant',
    password,
  }
  insertIntoCollection('users', user)
  return { user, password }
}

export async function authenticate(identifier: string, password: string) {
  // First try users
  let user = findInCollection<UserRecord>('users', (u) => u.email === identifier)
  if (user && user.password === password) {
    setValue(SESSION_KEY, { userId: user.id, type: 'user', ts: Date.now() })
    return user
  }

  // Then try tenants by email, name, or phone
  const tenants = listTenants()
  const tenant = tenants.find(t => 
    (t.email === identifier || t.name === identifier || t.phone === identifier) && t.password === password
  )
  if (tenant) {
    // Return as UserRecord for compatibility
    const tenantUser: UserRecord = {
      id: tenant.id,
      email: tenant.email || '',
      name: tenant.name,
      role: 'tenant',
      password: tenant.password,
    }
    setValue(SESSION_KEY, { userId: tenant.id, type: 'tenant', ts: Date.now() })
    return tenantUser
  }

  throw new Error('Invalid credentials')
}

export async function signOut() {
  setValue(SESSION_KEY, null)
}

export function getCurrentUser(): UserRecord | null {
  const session = getValue<{ userId: string; type?: string }>(SESSION_KEY)
  if (!session?.userId) {
    // Fallback: check tokenManager stored user (for backend auth)
    try {
      const stored = getStoredUser();
      if (stored) {
        return {
          id: stored.data?.user?.id || stored.id,
          email: stored.data?.user?.email || stored.email,
          name: `${stored.data?.user?.firstName || stored.firstName || ''} ${stored.data?.user?.lastName || stored.lastName || ''}`.trim(),
          role: stored.data?.user?.role || stored.role || 'tenant',
          password: stored.password,
        }
      }
    } catch (e) {
      // ignore parsing errors
    }
    return null
  }
  if (session.type === 'tenant') {
    const tenant = listTenants().find(t => t.id === session.userId)
    if (tenant) {
      return {
        id: tenant.id,
        email: tenant.email || '',
        name: tenant.name,
        role: 'tenant',
        password: tenant.password,
      }
    }
  } else {
    const user = findInCollection<UserRecord>('users', (u) => u.id === session.userId)
    return user
  }
  return null
}

export function getUserById(id: string): UserRecord | null {
  return findInCollection<UserRecord>('users', (u) => u.id === id)
}

export function listUsers() {
  return getCollection<UserRecord>('users')
}

export function updateUser(id: string, patch: Partial<UserRecord>): UserRecord | null {
  return updateInCollection<UserRecord>('users', id, patch)
}

export function deleteUser(id: string): boolean {
  return removeFromCollection('users', id)
}
