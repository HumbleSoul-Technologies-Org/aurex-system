import { getCollection, insertIntoCollection, updateInCollection, findInCollection, removeFromCollection, generateId } from '@/lib/local-store'
import { getProperty, updateProperty } from '@/lib/services/properties'
import { apiRequest } from '@/lib/query-client'
import { notifyNewTenant } from '@/lib/services/notifications'
import { useAuth } from '../auth-context'

export interface NotificationChannelSettings {
  email: boolean
  sms: boolean
}

export interface NotificationPreferences {
  overdue: NotificationChannelSettings
  leaseEnd: NotificationChannelSettings
  maintenance: NotificationChannelSettings
  profileChanges: NotificationChannelSettings
  messages: NotificationChannelSettings
}

export interface MoveOutNotice {
  noticeDate?: string
  reason?: string
  forwardingAddress?: string
  additionalNotes?: string
  status?: 'draft' | 'submitted'
}

export interface TenantRecord {
  announcements: boolean
  messages: any
  id: string
  name: string
  email: string
  password?: string
  phone?: string
  tenantType?: 'residential' | 'commercial' | 'mixed'
  unit?: string
  propertyId?: string
  rentAmount?: number
  leaseType?: string
  leaseStartDate?: string
  leaseRenewDate?: string
  leaseEndDate?: string
  leaseTerms?: string
  emergencyContact?: string
  notes?: string
  preferredContactMethod?: 'email' | 'phone' | 'sms'
  applicationDate?: string
  moveInDate?: string
  dateOfBirth?: string
  employmentInfo?: string
  previousAddresses?: string[]
  coSigner?: string
  pets?: string
  vehicles?: string
  businessInfo?: string
  businessContacts?: string
  financialInfo?: string
  securityDeposit?: string
  status?: string
  image?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactEmail?: string
  notificationPreferences?: NotificationPreferences
  documentDelivery?: 'email' | 'in-app' | 'both'
  moveOutNotice?: MoveOutNotice
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
    tenantType: payload.tenantType ?? 'residential',
    unit: payload.unit,
    propertyId: payload.propertyId,
    rentAmount: payload.rentAmount ?? 0,
    leaseType: payload.leaseType ?? 'month-to-month',
    leaseStartDate: payload.leaseStartDate,
    leaseEndDate: payload.leaseEndDate,
    leaseTerms: payload.leaseTerms,
    preferredContactMethod: payload.preferredContactMethod,
    applicationDate: payload.applicationDate,
    moveInDate: payload.moveInDate,
    dateOfBirth: payload.dateOfBirth,
    employmentInfo: payload.employmentInfo,
    previousAddresses: payload.previousAddresses,
    coSigner: payload.coSigner,
    pets: payload.pets,
    vehicles: payload.vehicles,
    businessInfo: payload.businessInfo,
    businessContacts: payload.businessContacts,
    financialInfo: payload.financialInfo,
    securityDeposit: payload.securityDeposit,
    status: payload.status ?? 'due',
    image: payload.image,
    announcements: payload.announcements ?? true,
    messages: payload.messages ?? [],
    address: payload.address,
    city: payload.city,
    postalCode: payload.postalCode,
    country: payload.country,
    emergencyContactName: payload.emergencyContactName,
    emergencyContactPhone: payload.emergencyContactPhone,
    emergencyContactEmail: payload.emergencyContactEmail,
    notificationPreferences: payload.notificationPreferences,
    documentDelivery: payload.documentDelivery,
    moveOutNotice: payload.moveOutNotice,
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

export async function createTenantApi(
  payload: Partial<TenantRecord>,
  token?: string,
): Promise<TenantRecord> {
   
  const res = await apiRequest('POST', '/tenants/create', payload, token)
  const json = await res.json()
  return json.data as TenantRecord
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
