# Server Schema Structures

## MongoDB Schema Plan for Property Management

**Goal**
Design MongoDB collections and field schemas for tenants, properties, transactions/expenses, payments, announcements, documents, and settings, with support for both residential and commercial records and clear reference relationships.

---

## 1. `tenants` Collection

### Schema
- `_id: ObjectId`
- `tenantType: 'residential' | 'commercial' | 'mixed'`
- `name: string`
- `email: string`
- `phone: string`
- `password: string`
- `status: 'active' | 'pending' | 'paused' | 'terminated' | 'delinquent'`
- `propertyId: ObjectId` (ref `properties`)
- `unit: string`
- `leaseStartDate: ISODate`
- `leaseEndDate?: ISODate`
- `leaseType: string`
- `moveInDate?: ISODate`
- `applicationDate?: ISODate`
- `rentAmount: number`
- `securityDeposit?: { amount: number; type: string; status: string; guarantor?: { name: string; phone: string } }`
- `preferredContactMethod?: 'email' | 'sms' | 'phone'`

### Residential fields
- `dateOfBirth?: ISODate`
- `employmentInfo?: { employer: string; jobTitle: string; annualIncome: number; employmentStatus: string }`
- `previousAddresses?: Array<{ address: string; city: string; state: string; postalCode: string; fromDate: ISODate; toDate: ISODate }>`
- `coSigner?: { name: string; relationship: string; phone: string; email: string }`
- `pets?: Array<{ type: string; breed: string; weight: number; serviceAnimal: boolean }>`
- `vehicles?: Array<{ make: string; model: string; year: number; licensePlate: string; color: string }>`

### Commercial fields
- `businessInfo?: { businessName: string; businessType: string; taxId: string; businessLicense: string; incorporationDate: ISODate; industry: string; website?: string }`
- `businessContacts?: Array<{ name: string; title: string; phone: string; email: string; isPrimary: boolean }>`
- `financialInfo?: { creditScore?: number; bankReferences: Array<{ bankName: string; accountType: string; contactName: string; contactPhone: string }>; tradeReferences: Array<{ companyName: string; contactName: string; contactPhone: string; accountBalance: number }> }`
- `leaseTerms?: { term: number; termUnit: 'months'|'years'; renewalOptions: string; escalationClause?: string; useClause?: string; operatingExpenses?: 'triple_net'|'modified_gross'|'full_service' }`

### Shared fields
- `emergencyContact?: { name: string; email: string; phone: string }`
- `notificationPreferences?: { overdue: { email: boolean; sms: boolean }; leaseEnd: { email: boolean; sms: boolean }; maintenance: { email: boolean; sms: boolean }; messages: { email: boolean; sms: boolean } }`
- `documentDelivery?: 'email' | 'in_app' | 'both'`
- `moveOutNotice?: { noticeDate: ISODate; reason: string; forwardingAddress: string; additionalNotes: string; status: 'draft' | 'submitted' }`
- `createdAt: ISODate`
- `updatedAt: ISODate`

### Indexes
- `email`
- `propertyId`
- `tenantType`
- `status`

---

## 2. `properties` Collection

### Schema
- `_id: ObjectId`
- `name: string`
- `address: string`
- `city: string`
- `state?: string`
- `country: string`
- `postalCode?: string`
- `propertyType: 'residential' | 'commercial' | 'mixed_use' | 'industrial' | 'retail' | 'office'`
- `subType?: string`
- `unitsAvailable: number`
- `units: Array<{ unitId: string; type: 'residential'|'commercial'|'mixed'; sizeSqFt?: number; status: 'available'|'occupied'|'offline' }>`
- `pricePerUnit: number`
- `images?: string[]`
- `features?: string[]`
- `description?: string`
- `zoning?: string`
- `permittedUses?: string[]`
- `loadingDocks?: number`
- `ceilingHeight?: number`
- `powerCapacity?: string`
- `parkingSpaces?: number`
- `amenities?: string[]`
- `petPolicy?: { allowed: boolean; restrictions?: string; fees?: { deposit: number; monthly: number } }`
- `location?: { lat: number; lng: number }`
- `annualPropertyTaxes?: number`
- `annualInsurance?: number`
- `operatingExpenses?: { realEstateTaxes: number; insurance: number; maintenance: number; utilities?: number; managementFee?: number }`
- `marketData?: { appraisedValue: number; lastAppraisalDate: ISODate; noi: number; capRate: number; occupancyRate: number }`
- `ownerInfo?: { name: string; contact: string; ownershipPercent: number }`
- `managerInfo?: { name: string; email: string; phone: string }`
- `createdAt: ISODate`
- `updatedAt: ISODate`

### Relationships
- `tenantIds?: ObjectId[]` optional denormalized list to speed tenant lookup
- `propertyId` referenced from `tenants`, `transactions`, `documents`, `maintenance`

### Indexes
- `propertyType`
- `city`
- `location`

---

## 3. `transactions` Collection

This can cover rent payments, expenses, and general financial records.

### Schema
- `_id: ObjectId`
- `transactionId: string`
- `tenantId?: ObjectId` (ref `tenants`)
- `propertyId?: ObjectId` (ref `properties`)
- `unit?: string`
- `amount: number`
- `currency: string`
- `type: 'rent' | 'expense' | 'security_deposit' | 'late_fee' | 'other'`
- `category?: string`
- `description?: string`
- `status: 'completed' | 'pending' | 'failed' | 'reversed'`
- `paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'check' | 'offline'`
- `date: ISODate`
- `receiptReference?: string`
- `paymentSource?: { type: 'card'|'bank'; last4?: string; provider?: string }`
- `scheduledDate?: ISODate`
- `processedDate?: ISODate`
- `reversed?: boolean`
- `appliedTo?: string[]`
- `notes?: string`

### Commercial-specific fields
- `commercialPaymentDetails?: { baseRent: number; additionalRent: number; percentageRent?: number; escalation: number }`
- `expenseType?: 'residential' | 'commercial' | 'both'`
- `tripleNetAllocation?: 'tenant' | 'landlord' | 'shared'`
- `capitalizable?: boolean`
- `depreciationSchedule?: { method: string; usefulLife: number; salvageValue?: number }`

### Recurring / plan fields
- `paymentPlan?: { totalAmount: number; installments: number; frequency: 'weekly'|'monthly'|'quarterly'; nextPaymentDate: ISODate }`
- `autoPay?: { enabled: boolean; method: 'ach'|'credit_card'; last4: string; nextPaymentDate: ISODate }`

### Indexes
- `tenantId`
- `propertyId`
- `type`
- `date`
- `status`

---

## 4. `payments` Collection

If you need a dedicated payment history separate from transactions.

### Schema
- `_id: ObjectId`
- `tenantId: ObjectId`
- `propertyId?: ObjectId`
- `unit?: string`
- `amount: number`
- `currency: string`
- `method: string`
- `status: 'pending' | 'completed' | 'failed'`
- `date: ISODate`
- `receiptReference?: string`
- `notes?: string`
- `createdAt: ISODate`
- `updatedAt: ISODate`

### Relationship
- Optional reference: `transactionId: ObjectId`

---

## 5. `announcements` Collection

### Schema
- `_id: ObjectId`
- `title: string`
- `message: string`
- `announcementType: 'general' | 'maintenance' | 'payment_reminder' | 'policy' | 'emergency' | 'commercial'`
- `recipients: 'all' | 'property' | 'custom' | 'managers'`
- `propertyId?: ObjectId`
- `tenantSelectionMode?: 'all' | 'withDueDate' | 'custom'`
- `tenantIds?: ObjectId[]`
- `priority: 'low' | 'normal' | 'high' | 'urgent'`
- `channels: Array<'email' | 'sms' | 'in_app' | 'portal'>`
- `scheduledDate?: ISODate`
- `sentAt?: ISODate`
- `createdBy?: ObjectId`
- `status: 'draft' | 'scheduled' | 'sent' | 'failed'`
- `createdAt: ISODate`
- `updatedAt: ISODate`

### Indexes
- `propertyId`
- `status`
- `scheduledDate`

---

## 6. `documents` Collection

### Schema
- `_id: ObjectId`
- `title: string`
- `type: 'lease' | 'invoice' | 'maintenance_report' | 'notice' | 'other'`
- `description?: string`
- `fileUrl: string`
- `fileName: string`
- `fileType: string`
- `fileSize?: number`
- `propertyId?: ObjectId`
- `unit?: string`
- `tenantId?: ObjectId`
- `visibility: 'private' | 'property' | 'unit' | 'tenant-specific'`
- `shareWith?: ObjectId[]`
- `createdBy?: ObjectId`
- `createdAt: ISODate`
- `updatedAt: ISODate`

---

## 7. `settings` Collection

### Schema
- `_id: ObjectId`
- `companyInfo: { name: string; address: string; phone: string; email: string; logoUrl?: string; licenseNumber?: string }`
- `propertyTypeDefaults: Array<{ propertyType: string; defaultLeaseTerm: number; rentDueDate: number; lateFeePolicy: { gracePeriod: number; feeAmount: number; feeType: 'fixed' | 'percentage' }; securityDeposit: { amount: number; type: string; months: number } }>`
- `tenantTypeConfigs: Array<{ tenantType: string; requiredFields: string[]; optionalFields: string[]; screeningRequirements: string[] }>`
- `financial: { defaultCurrency: string; taxRate: number; lateFeePolicy: { gracePeriodDays: number; feeAmount: number; maxLateFees: number }; paymentMethods: Array<{ type: string; enabled: boolean; processingFee?: number }> }`
- `compliance: { fairHousing: boolean; adaCompliance: boolean; dataRetention: { documents: number; financial: number; communications: number }; requiredDisclosures: string[] }`
- `notifications: { templates: Record<string, { subject: string; body: string; channels: Array<'email' | 'sms' | 'in_app'> }>; schedules: Record<string, { enabled: boolean; timing: string; conditions: string[] }> }`
- `createdAt: ISODate`
- `updatedAt: ISODate`

---

## Relationships & Data Modeling Rules

### Core References
- `tenants.propertyId -> properties._id`
- `transactions.tenantId -> tenants._id`
- `transactions.propertyId -> properties._id`
- `payments.tenantId -> tenants._id`
- `announcements.propertyId -> properties._id`
- `announcements.tenantIds -> tenants._id`
- `documents.propertyId -> properties._id`
- `documents.tenantId -> tenants._id`

### Embedding vs Referencing
- Use **references** for major entities: tenants, properties, transactions, announcements, documents
- Use **embedded subdocuments** for nested object groups like employmentInfo, pets, units, marketData, paymentSource, and settings

### Suggested Relationship Patterns
- Store `properties.units` array with unit details and status, not tenant data.
- Keep `tenants.propertyId` + `unit` on tenant records.
- Use `transactions` for both rent and expense records, keyed by `type` and `category`.
- Store `announcements` recipient criteria plus explicit `tenantIds` for custom sends.
- Let `documents` link optionally to property and tenant.

---

## Implementation Notes

1. Use MongoDB ObjectId references consistently so lookups can be performed with aggregation.
2. Create indexes on foreign keys (`propertyId`, `tenantId`), status values, and type fields.
3. Keep optional commercial fields nullable to preserve residential compatibility.
4. Use discriminated shapes in application code based on `tenantType` and `propertyType`.
5. Use a single `settings` document as the configuration source rather than multiple small collections.

---

## Recommended Collections
- `tenants`
- `properties`
- `transactions`
- `payments` (optional if transactions are centralized)
- `announcements`
- `documents`
- `settings`

This structure supports a flexible MongoDB implementation for both residential and commercial real estate management while preserving clean relationships and schema clarity.
