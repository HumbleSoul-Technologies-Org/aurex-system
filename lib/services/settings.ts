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

// Tenant Portal Settings Interfaces
export interface NotificationPreferences {
  email: boolean
  sms: boolean
  inApp: boolean
  smsProvider?: string
  emailTemplate?: string
}

export interface PaymentMethod {
  type: string
  enabled: boolean
  processingFee: number
}

export interface PaymentProvider {
  name: string
  apiKey?: string
  config?: Record<string, any>
}

export interface PaymentSettings {
  enableAutopay: boolean
  autopayThreshold?: number
  acceptedMethods: PaymentMethod[]
  paymentProviders: PaymentProvider[]
}

export interface DocumentAccess {
  allowUploads: boolean
  maxFileSize?: number
  allowedFileTypes: string[]
  requireApproval: boolean
  retentionDays?: number
}

export interface PriorityLevel {
  name: string
  responseTime: number
}

export interface MaintenancePreferences {
  enableRequests: boolean
  requireTenantApproval?: boolean
  estimatedResponseTime?: number
  allowEmergencyAfterHours: boolean
  priorityLevels: PriorityLevel[]
}

export interface FeatureToggles {
  paymentPortal: boolean
  maintenanceRequests: boolean
  documentAccess: boolean
  messages: boolean
   
}

export interface DoNotDisturb {
  enabled: boolean
  startTime?: string
  endTime?: string
}

export interface CommunicationPreferences {
  preferredContactMethod: 'email' | 'sms' | 'in-app'
  languages: string[]
  timezone?: string
  doNotDisturb?: DoNotDisturb
}

export interface SecuritySettings {
  allowPasswordChange: boolean
  autoLogoutInactivityMinutes?: number
  allowAccountDeletion: boolean
  requirePasswordReset?: boolean
  passwordExpirationDays?: number
}

export interface TenantPortalSettings {
  notificationPreferences: any
  paymentSettings: any
  documentAccess: any
  maintenancePreferences: any 
  featureToggles:   any
  communicationPreferences: any
  securitySettings: any
}

const defaultTenantPortalSettings: TenantPortalSettings = {
  notificationPreferences: {
    email: true,
    sms: false,
    inApp: true,
    smsProvider: '',
    emailTemplate: ''
  },
  paymentSettings: {
    enableAutopay: false,
    autopayThreshold: 0,
    acceptedMethods: [
      { type: 'credit_card', enabled: false, processingFee: 2.9 },
      { type: 'bank_transfer', enabled: false, processingFee: 0.5 },
      { type: 'mpesa', enabled: false, processingFee: 0.5 },
      { type: 'mobile money', enabled: false, processingFee: 0.5 },
    ],
    paymentProviders: []
  },
  documentAccess: {
    allowUploads: true,
    maxFileSize: 10485760,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
    requireApproval: false,
    retentionDays: 365
  },
  maintenancePreferences: {
    enableRequests: true,
    requireTenantApproval: false,
    estimatedResponseTime: 48,
    allowEmergencyAfterHours: true,
    priorityLevels: [
      { name: 'Low', responseTime: 7 },
      { name: 'Medium', responseTime: 72 },
      { name: 'High', responseTime: 24 },
      { name: 'Emergency', responseTime: 2 }
    ]
  },
  featureToggles: {
    paymentPortal: true,
    maintenanceRequests: true,
    documentAccess: true,
    messages: true,
    
  },
  communicationPreferences: {
    preferredContactMethod: 'email',
    languages: ['en'],
    timezone: 'UTC',
    doNotDisturb: {
      enabled: false,
      startTime: '',
      endTime: ''
    }
  },
  securitySettings: {
    allowPasswordChange: true,
    autoLogoutInactivityMinutes: 30,
    allowAccountDeletion: false,
    requirePasswordReset: false,
    passwordExpirationDays: 90
  }
}

function ensureTenantPortalSettings(settings: SystemSettings): SystemSettings {
  const existing: Partial<TenantPortalSettings> =
    settings.tenantPortalSettings || {}

  const normalized: TenantPortalSettings = {
    notificationPreferences: {
      ...defaultTenantPortalSettings.notificationPreferences,
      ...existing.notificationPreferences,
    },
    paymentSettings: {
      ...defaultTenantPortalSettings.paymentSettings,
      ...existing.paymentSettings,
      acceptedMethods:
        existing.paymentSettings?.acceptedMethods ||
        defaultTenantPortalSettings.paymentSettings.acceptedMethods,
      paymentProviders:
        existing.paymentSettings?.paymentProviders ||
        defaultTenantPortalSettings.paymentSettings.paymentProviders,
    },
    documentAccess: {
      ...defaultTenantPortalSettings.documentAccess,
      ...existing.documentAccess,
    },
    maintenancePreferences: {
      ...defaultTenantPortalSettings.maintenancePreferences,
      ...existing.maintenancePreferences,
      priorityLevels:
        existing.maintenancePreferences?.priorityLevels ||
        defaultTenantPortalSettings.maintenancePreferences.priorityLevels,
    },
    featureToggles: {
      ...defaultTenantPortalSettings.featureToggles,
      ...existing.featureToggles,
    },
    communicationPreferences: {
      ...defaultTenantPortalSettings.communicationPreferences,
      ...existing.communicationPreferences,
      doNotDisturb: {
        ...defaultTenantPortalSettings.communicationPreferences.doNotDisturb,
        ...existing.communicationPreferences?.doNotDisturb,
      },
    },
    securitySettings: {
      ...defaultTenantPortalSettings.securitySettings,
      ...existing.securitySettings,
    },
  }

  return {
    ...settings,
    tenantPortalSettings: normalized,
  }
}

export function getSystemSettings(): SystemSettings | null {
  const settings = getCollection<SystemSettings>('system-settings')
  return settings.length > 0 ? ensureTenantPortalSettings(settings[0]) : null
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
      notificationPreferences: {
        email: true,
        sms: false,
        inApp: true,
        smsProvider: '',
        emailTemplate: ''
      },
      paymentSettings: {
        enableAutopay: false,
        autopayThreshold: 0,
        acceptedMethods: [
          { type: 'credit_card', enabled: true, processingFee: 2.9 },
          { type: 'bank_transfer', enabled: true, processingFee: 0.5 }
        ],
        paymentProviders: []
      },
      documentAccess: {
        allowUploads: true,
        maxFileSize: 10485760,
        allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
        requireApproval: false,
        retentionDays: 365
      },
      maintenancePreferences: {
        enableRequests: true,
        requireTenantApproval: false,
        estimatedResponseTime: 48,
        allowEmergencyAfterHours: true,
        priorityLevels: [
          { name: 'Low', responseTime: 7 },
          { name: 'Medium', responseTime: 72 },
          { name: 'High', responseTime: 24 },
          { name: 'Emergency', responseTime: 2 }
        ]
      },
      featureToggles: {
        paymentPortal: true,
        maintenanceRequests: true,
        documentAccess: true,
        messages: true,
        announcements: true,
        leaseInfo: true
      },
      communicationPreferences: {
        preferredContactMethod: 'email',
        languages: ['en'],
        timezone: 'UTC',
        doNotDisturb: {
          enabled: false,
          startTime: '',
          endTime: ''
        }
      },
      securitySettings: {
        allowPasswordChange: true,
        autoLogoutInactivityMinutes: 30,
        allowAccountDeletion: false,
        requirePasswordReset: false,
        passwordExpirationDays: 90
      }
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

// Tenant Portal Settings Helpers
export function getTenantPortalSettings(): TenantPortalSettings | null {
  const settings = getSystemSettings()
  return (settings?.tenantPortalSettings || null) as TenantPortalSettings | null
}

export function updateTenantPortalSettings(updates: Partial<TenantPortalSettings>): SystemSettings | null {
  const settings = getSystemSettings()
  if (!settings) return null

  const updated = {
    tenantPortalSettings: {
      ...settings.tenantPortalSettings,
      ...updates
    }
  }

  return updateSystemSettings(updated)
}

export function updateTenantPortalNotifications(updates: Partial<NotificationPreferences>): SystemSettings | null {
  const settings = getSystemSettings()
  if (!settings?.tenantPortalSettings) return null

  return updateTenantPortalSettings({
    notificationPreferences: {
      ...settings.tenantPortalSettings.notificationPreferences,
      ...updates
    }
  })
}

export function updatePaymentSettings(updates: Partial<PaymentSettings>): SystemSettings | null {
  const settings = getSystemSettings()
  if (!settings?.tenantPortalSettings) return null

  return updateTenantPortalSettings({
    paymentSettings: {
      ...settings.tenantPortalSettings.paymentSettings,
      ...updates
    }
  })
}

export function updateDocumentAccess(updates: Partial<DocumentAccess>): SystemSettings | null {
  const settings = getSystemSettings()
  if (!settings?.tenantPortalSettings) return null

  return updateTenantPortalSettings({
    documentAccess: {
      ...settings.tenantPortalSettings.documentAccess,
      ...updates
    }
  })
}

export function updateMaintenancePreferences(updates: Partial<MaintenancePreferences>): SystemSettings | null {
  const settings = getSystemSettings()
  if (!settings?.tenantPortalSettings) return null

  return updateTenantPortalSettings({
    maintenancePreferences: {
      ...settings.tenantPortalSettings.maintenancePreferences,
      ...updates
    }
  })
}

export function updateFeatureToggles(updates: Partial<FeatureToggles>): SystemSettings | null {
  const settings = getSystemSettings()
  if (!settings?.tenantPortalSettings) return null

  return updateTenantPortalSettings({
    featureToggles: {
      ...settings.tenantPortalSettings.featureToggles,
      ...updates
    }
  })
}

export function updateCommunicationPreferences(updates: Partial<CommunicationPreferences>): SystemSettings | null {
  const settings = getSystemSettings()
  if (!settings?.tenantPortalSettings) return null

  return updateTenantPortalSettings({
    communicationPreferences: {
      ...settings.tenantPortalSettings.communicationPreferences,
      ...updates
    }
  })
}

export function updateSecuritySettings(updates: Partial<SecuritySettings>): SystemSettings | null {
  const settings = getSystemSettings()
  if (!settings?.tenantPortalSettings) return null

  return updateTenantPortalSettings({
    securitySettings: {
      ...settings.tenantPortalSettings.securitySettings,
      ...updates
    }
  })
}