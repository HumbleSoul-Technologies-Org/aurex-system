import { insertIntoCollection, getCollection, updateInCollection, generateId, removeFromCollection } from '@/lib/local-store'
import { SystemSettings } from '@/lib/local-store'

export interface CompanyInfo {
  name?: string
  address?: string
  phone?: string
  email?: string
  logoUrl?: string
  licenseNumber?: string
}

export interface PropertyLeaseTerms {
  duration: string
  renewal: string
  noticePeriod: string
}

export interface PropertyFinancialRules {
  securityDeposit: string
  lateFee: string
  gracePeriod: string
}

export interface PropertyTypeDefaults {
  requiredFields: string[]
  optionalFields: string[]
  defaultLeaseTerms: PropertyLeaseTerms
  financialRules: PropertyFinancialRules
  validationRules: Record<string, any>
}

export interface TenantTypeConfiguration {
  requiredFields: string[]
  optionalFields?: string[]
  validationRules: Record<string, any>
  defaultSettings: {
    preferredContactMethod: 'email' | 'phone' | 'sms'
    applicationFee: number
    screeningRequirements?: string[]
  }
}

export interface NotificationTemplate {
  subject: string
  body: string
  channels: Array<'email' | 'sms' | 'in_app' | 'portal'>
}

export interface NotificationSchedule {
  enabled: boolean
  timing: string
  conditions: string[]
}

export interface NotificationsConfig {
  templates: Record<string, NotificationTemplate>
  schedules: Record<string, NotificationSchedule>
}

export interface TenantPortalSettings {
  portalUrl: string
  enabledFeatures: Record<string, boolean>
  invitationExpirationDays: number
  allowDocumentUploads: boolean
}

export function getSystemSettings(): SystemSettings | null {
  const settings = getCollection<SystemSettings>('system-settings')
  return settings.length > 0 ? settings[0] : null
}

export function createDefaultSystemSettings(): SystemSettings {
  const defaultSettings: SystemSettings = {
    id: generateId('settings'),
    version: '2.0.0',
    propertyTypeDefaults: {
      residential: {
        requiredFields: ['name', 'address', 'city', 'country', 'units_available', 'price_per_unit'],
        optionalFields: ['bedrooms', 'bathrooms', 'petPolicy', 'residentialFeatures', 'description'],
        defaultLeaseTerms: {
          duration: '12 months',
          renewal: 'automatic',
          noticePeriod: '30 days'
        },
        financialRules: {
          securityDeposit: 'one month rent',
          lateFee: '50',
          gracePeriod: '5 days'
        },
        validationRules: {
          minRent: 500,
          maxRent: 10000
        }
      },
      commercial: {
        requiredFields: ['name', 'address', 'city', 'country', 'units_available', 'price_per_unit', 'propertyType'],
        optionalFields: ['zoning', 'permittedUses', 'loadingDocks', 'ceilingHeight', 'powerCapacity', 'commercialFeatures', 'annualPropertyTaxes', 'annualInsurance', 'appraisedValue', 'noi', 'capRate'],
        defaultLeaseTerms: {
          duration: '36 months',
          renewal: 'negotiated',
          noticePeriod: '90 days'
        },
        financialRules: {
          securityDeposit: 'two months rent',
          lateFee: '100',
          gracePeriod: '10 days'
        },
        validationRules: {
          minRent: 1000,
          maxRent: 50000
        }
      },
      mixed_use: {
        requiredFields: ['name', 'address', 'city', 'country', 'units_available', 'price_per_unit', 'propertyType'],
        optionalFields: ['zoning', 'permittedUses', 'residentialFeatures', 'commercialFeatures', 'annualPropertyTaxes', 'annualInsurance'],
        defaultLeaseTerms: {
          duration: '24 months',
          renewal: 'negotiated',
          noticePeriod: '60 days'
        },
        financialRules: {
          securityDeposit: 'one and half months rent',
          lateFee: '75',
          gracePeriod: '7 days'
        },
        validationRules: {
          minRent: 750,
          maxRent: 25000
        }
      }
    },
    tenantTypeConfigurations: {
      residential: {
        requiredFields: ['name', 'email', 'phone', 'leaseStartDate', 'monthlyRent'],
        validationRules: {
          minAge: 18,
          maxOccupants: 6,
          creditCheck: 'required'
        },
        defaultSettings: {
          preferredContactMethod: 'email',
          applicationFee: 50
        }
      },
      commercial: {
        requiredFields: ['name', 'email', 'phone', 'businessInfo', 'leaseStartDate', 'monthlyRent'],
        validationRules: {
          businessLicense: 'required',
          financialStatements: 'required',
          references: 'required'
        },
        defaultSettings: {
          preferredContactMethod: 'email',
          applicationFee: 100
        }
      },
      mixed: {
        requiredFields: ['name', 'email', 'phone', 'leaseStartDate', 'monthlyRent'],
        validationRules: {
          minAge: 18,
          businessLicense: 'optional',
          creditCheck: 'required'
        },
        defaultSettings: {
          preferredContactMethod: 'email',
          applicationFee: 75
        }
      }
    },
    complianceSettings: {
      default: {
        commercialRequirements: ['business_license', 'insurance_certificate', 'financial_statements'],
        residentialRequirements: ['identification', 'income_verification', 'rental_history'],
        reportingRequirements: {
          frequency: 'monthly',
          includeFinancials: true,
          includeOccupancy: true
        }
      }
    },
    notifications: {
      templates: {
        rentReminder: {
          subject: 'Rent payment reminder',
          body: 'Your rent payment is due soon. Please pay on time to avoid late fees.',
          channels: ['email', 'in_app']
        },
        maintenanceRequest: {
          subject: 'Maintenance request received',
          body: 'Your maintenance request has been received and will be reviewed shortly.',
          channels: ['email', 'in_app']
        }
      },
      schedules: {
        dailySummary: {
          enabled: true,
          timing: '08:00',
          conditions: ['overdue', 'pending_requests']
        },
        monthlyStatement: {
          enabled: true,
          timing: '01:00',
          conditions: ['payment_history']
        }
      }
    },
    tenantPortalSettings: {
      portalUrl: 'https://tenant-portal.example.com',
      enabledFeatures: {
        'rent-payment': true,
        messaging: true,
        maintenance: true,
        documents: true
      },
      invitationExpirationDays: 30,
      allowDocumentUploads: true
    },
    companyInfo: {
      name: 'Tenant Manager',
      address: '123 Main St',
      phone: '+1 (555) 123-4567',
      email: 'support@tenantmanager.com',
      logoUrl: '',
      licenseNumber: ''
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastMigrationDate: new Date().toISOString()
  }

  return insertIntoCollection('system-settings', defaultSettings)
}

export function updateSystemSettings(updates: Partial<SystemSettings>): SystemSettings | null {
  const settings = getSystemSettings()
  if (!settings) return null

  return updateInCollection('system-settings', settings.id, updates)
}

export function deleteSystemSettings(id: string): boolean {
  return removeFromCollection('system-settings', id)
}

export function getPropertyTypeConfig(propertyType: string): any {
  const settings = getSystemSettings()
  return settings?.propertyTypeDefaults[propertyType] || settings?.propertyTypeDefaults.residential
}

export function getTenantTypeConfig(tenantType: string): any {
  const settings = getSystemSettings()
  return settings?.tenantTypeConfigurations[tenantType] || settings?.tenantTypeConfigurations.residential
}

export function initializeSystemSettings(): SystemSettings {
  let settings = getSystemSettings()
  if (!settings) {
    settings = createDefaultSystemSettings()
  }
  return settings
}