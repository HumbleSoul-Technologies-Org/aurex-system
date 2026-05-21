import { getCollection, insertIntoCollection, updateInCollection, removeFromCollection, generateId } from '@/lib/local-store'
import { notifyNewProperty } from '@/lib/services/notifications'
import { listTenants, TenantRecord } from '@/lib/services/tenants'
import { getCategoryForType } from '@/lib/constants/property-types'
import { apiRequest, queryClient } from '../query-client'
import { useAuth } from '../auth-context'
import { use } from 'react'

export interface PropertySpecification {
  title: string
  value: string
}

export interface PropertyRecord {
  id: string
  _id?: string
  name: string
  address: string
  city: string
  country: string
  category?: string
  units_available: number
  units: string[] // unit identifiers like LKU-1
  price_per_unit: number
  type?: string
  propertyType?: 'residential' | 'commercial' | 'mixed_use' | 'industrial' | 'retail' | 'office' | 'apartment' | 'house' | 'villa' | 'condo' | 'townhouse' | 'duplex' | 'mixed-use' | 'warehouse' | 'hotel' | 'restaurant' | 'shopping-center' | 'medical' | 'flex-space' | 'other'
  geography?: string
  images?: {url: string,public_id: string}[]
  features?: string[]
  specifications?: PropertySpecification[]
  description?: string
  tenants?: string[] | TenantRecord[] // tenant ids or populated tenant objects
  occupancy?: number
  monthlyRevenue?: number
  location?: {
    lat: number
    lng: number
  }
  zoning?: string
  permittedUses?: string[]
  annualPropertyTaxes?: number
  annualInsurance?: number
  appraisedValue?: number
  lastAppraisalDate?: string
  noi?: number
  capRate?: number
  estate?: string
}

function makePrefix(name: string, city: string, country: string) {
  const a = (name || 'X').trim()[0] || 'X'
  const b = (city || 'X').trim()[0] || 'X'
  const c = (country || 'X').trim()[0] || 'X'
  return `${String(a).toUpperCase()}${String(b).toUpperCase()}${String(c).toUpperCase()}`
}

export function generateUnitNumbers(name: string, city: string, country: string, count: number) {
  const prefix = makePrefix(name, city, country)
  const units: string[] = []
  for (let i = 1; i <= count; i++) {
    units.push(`${prefix}-${i}`)
  }
  return units
}

export function normalizePropertyRecord(property: any): PropertyRecord {
  const normalized = {
    ...property,
    id: property.id || property._id || '',
  } as PropertyRecord

  if (Array.isArray(normalized.tenants)) {
    normalized.tenants = normalized.tenants.map((tenant: any) => ({
      ...tenant,
      id: tenant.id || tenant._id,
    }))
  }

  return normalized
}

export function listProperties(): PropertyRecord[] {
  return getCollection<PropertyRecord>('properties').map(normalizePropertyRecord)
}

export function getProperty(id: string): PropertyRecord | null {
  return (
    getCollection<PropertyRecord>('properties').find((p) => p.id === id || p._id === id) ??
    null
  )
}

export function getAvailablePropertiesWithUnits() {
  const properties = listProperties();
  const tenants = listTenants();

  return properties.map((property) => {
    const units = Array.isArray(property.units) && property.units.length > 0
      ? property.units
      : generateUnitNumbers(
          property.name ?? '',
          property.city ?? '',
          property.country ?? '',
          (property as any).units_available ?? (property as any).unitsAvailable ?? (property.units?.length ?? 1),
        );

    // Find tenants assigned to this property
    const propertyTenants = tenants.filter((tenant) => tenant.propertyId === property._id);
    // Get occupied units (be defensive about tenant unit field names)
    const occupiedUnits = propertyTenants
      .map((tenant) => (tenant as any).unit ?? (tenant as any).unitNumber ?? (tenant as any).unit_no)
      .filter(Boolean);

    // Get available units
    const availableUnits = units.filter((unit) => !occupiedUnits.includes(unit));

    return {
      ...property,
      units,
      availableUnits,
      hasAvailableUnits: availableUnits.length > 0,
    };
  });
}

export async function createProperty(payload: Partial<PropertyRecord>, token?: any,user?: any): Promise<PropertyRecord> {
  
  const id = generateId('prop')
  const units_available = payload.units_available ?? 1
  const name = payload.name ?? 'Property'
  const city = payload.city ?? ''
  const country = payload.country ?? ''
  const units = generateUnitNumbers(name, city, country, units_available)

  const payLoad= {
   
    name,
    address: payload.address ?? '',
    city,
    country,
    category:
      payload.category ??
      getCategoryForType(payload.propertyType ?? (payload.type as string)) ??
      'residential',
    estate: payload.estate,
    units_available,
    units,
    price_per_unit: payload.price_per_unit ?? 0,
    propertyType: payload.propertyType ?? (payload.type as PropertyRecord['propertyType']) ?? 'residential',
    geography: payload.geography,
    images: payload.images ?? [],
    features: payload.features ?? [],
    specifications: payload.specifications ?? [],
    description: payload.description ?? '',
    tenants: [],
    location: payload.location,
    zoning: payload.zoning,
    permittedUses: payload.permittedUses,
    annualPropertyTaxes: payload.annualPropertyTaxes,
    annualInsurance: payload.annualInsurance,
    appraisedValue: payload.appraisedValue,
    lastAppraisalDate: payload.lastAppraisalDate,
    noi: payload.noi,
    capRate: payload.capRate,
  }

  const res = await apiRequest('POST', `/property/create/${user?._id || user?.id}`, payLoad)

  const data = await res.json()

  const newProperty = {
    ...data.property,
    id: data.property._id
  }
  
  

  insertIntoCollection('properties', newProperty)
  queryClient.setQueryData<PropertyRecord[]>(["properties"], (current) =>
    current ? [newProperty, ...current] : listProperties(),
  )
  queryClient.invalidateQueries({ queryKey: ["properties"], exact: false })

  // Notify about new property
  notifyNewProperty(newProperty.name, newProperty.id)

  return newProperty
}

export async function updateProperty(id: string, patch: Partial<PropertyRecord>): Promise<PropertyRecord | null> {
  const existingProperty = getProperty(id)
  const finalPatch: Partial<PropertyRecord> = { ...patch }

  if (
    patch.units_available !== undefined &&
    patch.units === undefined
  ) {
    const name = patch.name ?? existingProperty?.name ?? ''
    const city = patch.city ?? existingProperty?.city ?? ''
    const country = patch.country ?? existingProperty?.country ?? ''
    finalPatch.units = generateUnitNumbers(
      name,
      city,
      country,
      patch.units_available,
    )
  }

  const res = await apiRequest('PUT', `/property/${id}/update`, finalPatch)
  if (!res.ok) {
    console.error('Failed to update property', await res.text())
    return null
  }

  const updated = updateInCollection<PropertyRecord>('properties', id, finalPatch)
  if (updated) {
    queryClient.setQueryData<PropertyRecord[]>(["properties"], (current) =>
      current
        ? current.map((property) =>
            property.id === updated.id ? { ...property, ...updated } : property,
          )
        : [updated],
    )
    queryClient.invalidateQueries({ queryKey: ["properties"], exact: false })
  }

  return updated

}

export async function deleteProperty(id: string,adminPassword:string): Promise<boolean> {
  // return removeFromCollection('properties', id)
  const res = await apiRequest('DELETE', `/property/${id}/delete`, { password: adminPassword })
  if (!res.ok) {
      console.error('Failed to update property', await res.text());
    return false;
  }

  removeFromCollection('properties', id)
  queryClient.setQueryData<PropertyRecord[]>(["properties"], (current) =>
    current ? current.filter((property) => property.id !== id) : [],
  )
  return true
}
