import { getCollection, insertIntoCollection, updateInCollection, removeFromCollection, generateId } from '@/lib/local-store'
import { notifyNewProperty } from '@/lib/services/notifications'
import { listTenants } from '@/lib/services/tenants'

export interface PropertyRecord {
  id: string
  name: string
  address: string
  city: string
  country: string
  units_available: number
  units: string[] // unit identifiers like LKU-1
  price_per_unit: number
  type?: string
  propertyType?: 'residential' | 'commercial' | 'mixed_use' | 'industrial' | 'retail' | 'office' | 'apartment' | 'house' | 'villa' | 'condo' | 'townhouse' | 'duplex' | 'mixed-use' | 'warehouse' | 'hotel' | 'restaurant' | 'shopping-center' | 'medical' | 'flex-space' | 'other'
  images?: string[]
  features?: string[]
  residentialFeatures?: string[]
  commercialFeatures?: string[]
  description?: string
  tenants?: string[] // tenant ids
  occupancy?: number
  monthlyRevenue?: number
  location?: {
    lat: number
    lng: number
  }
  zoning?: string
  permittedUses?: string[]
  loadingDocks?: string
  ceilingHeight?: string
  powerCapacity?: string
  environmentalReports?: string
  annualPropertyTaxes?: number
  annualInsurance?: number
  operatingExpenses?: number
  appraisedValue?: number
  lastAppraisalDate?: string
  noi?: number
  capRate?: number
  bedrooms?: number
  bathrooms?: number
  petPolicy?: string
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

export function listProperties(): PropertyRecord[] {
  return getCollection<PropertyRecord>('properties')
}

export function getProperty(id: string): PropertyRecord | null {
  return getCollection<PropertyRecord>('properties').find((p) => p.id === id) ?? null
}

export function getAvailablePropertiesWithUnits() {
  const properties = listProperties()
  const tenants = listTenants()
  
  return properties.map(property => {
    // Find tenants assigned to this property
    const propertyTenants = tenants.filter(tenant => tenant.propertyId === property.id)
    // Get occupied units
    const occupiedUnits = propertyTenants.map(tenant => tenant.unit).filter(Boolean)
    // Get available units
    const availableUnits = property.units.filter(unit => !occupiedUnits.includes(unit))
    
    return {
      ...property,
      availableUnits,
      hasAvailableUnits: availableUnits.length > 0
    }
  }).filter(property => property.hasAvailableUnits)
}

export function createProperty(payload: Partial<PropertyRecord>): PropertyRecord {
  const id = generateId('prop')
  const units_available = payload.units_available ?? 1
  const name = payload.name ?? 'Property'
  const city = payload.city ?? ''
  const country = payload.country ?? ''
  const units = generateUnitNumbers(name, city, country, units_available)

  const record: PropertyRecord = {
    id,
    name,
    address: payload.address ?? '',
    city,
    country,
    units_available,
    units,
    price_per_unit: payload.price_per_unit ?? 0,
    type: payload.type ?? payload.propertyType ?? 'apartment',
    propertyType: payload.propertyType ?? (payload.type as PropertyRecord['propertyType']) ?? 'residential',
    images: payload.images ?? [],
    features: payload.features ?? [],
    residentialFeatures: payload.residentialFeatures ?? [],
    commercialFeatures: payload.commercialFeatures ?? [],
    description: payload.description ?? '',
    tenants: [],
    location: payload.location,
    zoning: payload.zoning,
    permittedUses: payload.permittedUses,
    loadingDocks: payload.loadingDocks,
    ceilingHeight: payload.ceilingHeight,
    powerCapacity: payload.powerCapacity,
    environmentalReports: payload.environmentalReports,
    annualPropertyTaxes: payload.annualPropertyTaxes,
    annualInsurance: payload.annualInsurance,
    operatingExpenses: payload.operatingExpenses,
    appraisedValue: payload.appraisedValue,
    lastAppraisalDate: payload.lastAppraisalDate,
    noi: payload.noi,
    capRate: payload.capRate,
    bedrooms: payload.bedrooms,
    bathrooms: payload.bathrooms,
    petPolicy: payload.petPolicy,
  }
  insertIntoCollection('properties', record)

  // Notify about new property
  notifyNewProperty(record.name, record.id)

  return record
}

export function updateProperty(id: string, patch: Partial<PropertyRecord>): PropertyRecord | null {
  return updateInCollection<PropertyRecord>('properties', id, patch)
}

export function deleteProperty(id: string): boolean {
  return removeFromCollection('properties', id)
}
