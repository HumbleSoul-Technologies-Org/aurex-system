import { getCollection, insertIntoCollection, updateInCollection, findInCollection, removeFromCollection, generateId } from '@/lib/local-store'
import { getProperty, updateProperty } from '@/lib/services/properties'
import { notifyNewTenant } from '@/lib/services/notifications'

export interface TenantRecord {
  id: string
  name: string
  email: string
  password?: string
  phone?: string
  unit?: string
  propertyId?: string
  rentAmount?: number
  lease_type?: string
  lease_start?: string
  status?: string
  image?: string
}

export function listTenants(): TenantRecord[] {
  return getCollection<TenantRecord>('tenants')
}

export function getTenant(id: string): TenantRecord | null {
  return listTenants().find((t) => t.id === id) ?? null
}

export function createTenant(payload: Partial<TenantRecord>): TenantRecord {
  const tenant: TenantRecord = {
    id: generateId('tenant'),
    name: payload.name ?? 'New Tenant',
    email: payload.email ?? '',
    password: payload.password,
    phone: payload.phone,
    unit: payload.unit,
    propertyId: payload.propertyId,
    rentAmount: payload.rentAmount ?? 0,
    lease_type: payload.lease_type ?? 'month-to-month',
    lease_start: payload.lease_start,
    status: payload.status ?? 'due',
    image: payload.image,
  }
  insertIntoCollection('tenants', tenant)

  // also add tenant id to property's tenant list for easier lookup
  if (tenant.propertyId) {
    const prop = getProperty(tenant.propertyId)
    if (prop) {
      const updatedTenants = prop.tenants ? [...prop.tenants, tenant.id] : [tenant.id]
      updateProperty(prop.id, { tenants: updatedTenants })

      // Notify about new tenant
      notifyNewTenant(tenant.name, prop.name, tenant.id)
    }
  }

  return tenant
}

export function updateTenant(id: string, patch: Partial<TenantRecord>): TenantRecord | null {
  return updateInCollection<TenantRecord>('tenants', id, patch)
}

export function deleteTenant(id: string): boolean {
  const tenant = getTenant(id)
  if (!tenant) return false

  // remove tenant from property's tenant list if present
  if (tenant.propertyId) {
    const prop = getProperty(tenant.propertyId)
    if (prop) {
      const updatedTenants = (prop.tenants || []).filter((tid) => tid !== id)
      updateProperty(prop.id, { tenants: updatedTenants })
    }
  }

  return removeFromCollection('tenants', id)
}
export function findTenantByEmail(email: string): TenantRecord | null {
  return findInCollection<TenantRecord>('tenants', (t) => t.email === email)
}
