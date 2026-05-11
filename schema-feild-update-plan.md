# Schema Field Update Plan

## Goal
Transform the property management system from residential-only to a unified platform supporting both residential and commercial properties through schema enhancements, conditional form fields, and type-aware business logic.

## Steps

1. **Schema Foundation - Add Type Classification**
   - Add `tenantType` field to `TenantRecord` with values: `residential` | `commercial` | `mixed`
   - Add `propertyType` field to `PropertyRecord` with values: `residential` | `commercial` | `mixed_use` | `industrial` | `retail` | `office`
   - Add `expenseType` field to transaction types with values: `residential` | `commercial` | `both`
   - Update all existing records with default values during migration

2. **Tenant Schema Extensions**
   - Add residential fields: `dateOfBirth`, `employmentInfo`, `previousAddresses`, `coSigner`, `pets`, `vehicles`
   - Add commercial fields: `businessInfo`, `businessContacts`, `financialInfo`, `leaseTerms` (commercial), `securityDeposit` (enhanced)
   - Add common fields: `leaseTerms` (unified), `preferredContactMethod`, `applicationDate`, `moveInDate`

3. **Property Schema Extensions**
   - Add commercial fields: `zoning`, `permittedUses`, `loadingDocks`, `ceilingHeight`, `powerCapacity`, `environmentalReports`
   - Add operating expenses tracking: `annualPropertyTaxes`, `annualInsurance`, `operatingExpenses`
   - Add market data: `appraisedValue`, `lastAppraisalDate`, `noi`, `capRate`
   - Add type-specific features: `commercialFeatures`, `residentialFeatures`

4. **Expense Schema Extensions**
   - Add commercial allocation: `tripleNetAllocation`, `capitalizable`, `depreciationSchedule`
   - Add vendor tracking: `vendorId`, `vendorName`, `invoiceNumber`, `dueDate`
   - Add approval workflow: `requiresApproval`, `approvedBy`, `approvalDate`
   - Add recurring expense support: `recurring` object with frequency and auto-pay

5. **Rent Collection Schema Extensions**
   - Add payment structures: `paymentType`, `commercialPaymentDetails`, `residentialPaymentDetails`
   - Add commercial lease terms: `baseRent`, `additionalRent`, `percentageRent`, `escalation`
   - Add payment plans: `paymentPlan` object with installments and frequency
   - Add auto-payment settings: `autoPay` configuration

6. **Settings Schema Creation**
   - Create comprehensive `SystemSettings` interface
   - Add property type configurations with default settings per type
   - Add tenant type configurations with required/optional fields
   - Add financial settings with type-specific rules
   - Add compliance settings for different property types

7. **Add Tenant Form Modifications**
   - Add tenant type selector at form top
   - Implement conditional rendering for residential vs commercial fields
   - Add dynamic lease term selection based on tenant type
   - Add commercial-specific fields (business info, operating expenses, use clauses)
   - Update validation rules for different tenant types

8. **Add Property Form Modifications**
   - Enhance property type selector with more granular options
   - Add conditional commercial fields (zoning, loading docks, power capacity)
   - Add conditional residential fields (bedrooms, bathrooms, pet policy)
   - Add operating expenses section with prominence for commercial
   - Add market data section for commercial properties

9. **Add Expense Form Modifications**
   - Add dynamic category options based on property type
   - Add commercial-specific fields (triple net allocation, capitalizable expenses)
   - Add vendor information tracking
   - Add recurring expense configuration
   - Add approval workflow fields

10. **Send Announcement Form Modifications**
    - Add announcement type selector with commercial options
    - Add business type and lease type filtering for commercial tenants
    - Add communication channel selection
    - Add commercial context questions
    - Add property type targeting options

## Relevant files
- `lib/services/tenants.ts` — Extend `TenantRecord` interface with type classification and conditional fields
- `lib/services/properties.ts` — Extend `PropertyRecord` interface with commercial/residential features
- `app/lib/transactions-client.ts` — Extend `Transaction` types with commercial expense tracking
- `lib/services/payments.ts` — Extend `PaymentRecord` with commercial payment structures
- `components/forms/add-tenant-form.tsx` — Add tenant type selection and conditional fields
- `components/forms/add-property-form.tsx` — Add property type logic and conditional sections
- `components/forms/add-expense-form.tsx` — Add commercial expense categories and vendor tracking
- `components/forms/send-announcement-form.tsx` — Add commercial communication options

## Verification
1. **Schema Validation** — Ensure all new fields have proper TypeScript types and default values
2. **Data Migration** — Test migration of existing records with new schema fields
3. **Form Rendering** — Verify conditional fields show/hide correctly based on type selection
4. **Business Logic** — Test calculations and validations work for both residential and commercial contexts
5. **Data Integrity** — Ensure existing data remains accessible and new data saves correctly
6. **User Experience** — Test form usability with different property and tenant types
7. **Performance** — Verify no performance degradation with additional conditional logic

## Decisions
- **Progressive Enhancement** — Add new fields as optional to maintain backward compatibility
- **Type Safety** — Use discriminated unions for type-specific fields to ensure compile-time safety
- **Conditional Rendering** — Use React state to show/hide fields based on type selection
- **Default Values** — Provide sensible defaults for existing records during migration
- **Validation Rules** — Different validation logic for residential vs commercial contexts
- **UI Consistency** — Maintain consistent styling and layout across all form variations

## Further Considerations
1. **Data Migration Strategy** — How to handle existing data when adding required type fields
2. **Training Requirements** — User training needed for new commercial-specific features
3. **Integration Testing** — End-to-end testing of commercial workflows
4. **Performance Impact** — Monitor for any performance issues with conditional rendering
5. **Regulatory Compliance** — Ensure commercial features meet legal requirements for different jurisdictions
6. **Scalability** — Plan for adding new property types (e.g., industrial, hospitality) in the future
