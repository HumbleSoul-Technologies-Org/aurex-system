# Schema Fields: MongoDB-Style JSON Schemas

## Overview
JSON schemas for all 10 forms in the tenant system (7 reusable components + 3 inline tenant portal forms) using MongoDB document structure conventions.

---

## PART 1: REUSABLE FORM COMPONENTS

### 1. Add Expense Form

```json
{
  "collectionName": "expenses",
  "schema": {
    "_id": { "type": "ObjectId", "required": true, "description": "Unique expense document ID" },
    "category": { "type": "String", "required": true, "enum": ["maintenance", "utilities", "insurance", "property-tax", "cleaning", "legal", "management", "other"], "description": "Expense category" },
    "amount": { "type": "Decimal128", "required": true, "description": "Expense amount" },
    "date": { "type": "Date", "required": true, "description": "ISO date format" },
    "expenseType": { "type": "String", "required": false, "enum": ["commercial", "residential", "both"], "description": "Expense type classification" },
    "propertyId": { "type": "ObjectId", "required": true, "ref": "properties", "description": "Reference to property" },
    "unit": { "type": "String", "required": false, "description": "Unit number (conditional if property has units)" },
    "paymentMethod": { "type": "String", "required": false, "enum": ["cash", "card", "bank_transfer", "check"], "description": "Payment method used" },
    "currency": { "type": "String", "required": false, "enum": ["USD", "EUR", "GBP", "CAD"], "default": "USD", "description": "Currency code" },
    "paymentSourceType": { "type": "String", "required": false, "enum": ["card", "bank", "other"], "description": "Payment source type" },
    "paymentSourceProvider": { "type": "String", "required": false, "description": "Payment provider (e.g., 'Stripe', 'Plaid')" },
    "paymentSourceLast4": { "type": "String", "required": false, "pattern": "^[0-9]{4}$", "description": "Last 4 digits of payment method" },
    "vendorName": { "type": "String", "required": false, "description": "Vendor/supplier name" },
    "invoiceNumber": { "type": "String", "required": false, "description": "Invoice reference number" },
    "dueDate": { "type": "Date", "required": false, "description": "Payment due date" },
    "requiresApproval": { "type": "Boolean", "required": false, "default": false, "description": "Whether approval is required" },
    "approvedBy": { "type": "String", "required": false, "description": "Name/ID of person who approved (conditional)" },
    "approvalDate": { "type": "Date", "required": false, "description": "Date of approval (conditional)" },
    "recurringFrequency": { "type": "String", "required": false, "enum": ["monthly", "weekly", "quarterly", "yearly"], "description": "Recurring frequency if applicable" },
    "autoPay": { "type": "Boolean", "required": false, "default": false, "description": "Enable automatic payment" },
    "notes": { "type": "String", "required": false, "description": "Additional notes" },
    "createdAt": { "type": "Date", "required": true, "default": "now()", "description": "Document creation timestamp" },
    "updatedAt": { "type": "Date", "required": true, "default": "now()", "description": "Document update timestamp" }
  }
}
```

### 2. Add Property Form

```json
{
  "collectionName": "properties",
  "schema": {
    "_id": { "type": "ObjectId", "required": true, "description": "Unique property document ID" },
    "name": { "type": "String", "required": true, "description": "Property name/title" },
    "address": { "type": "String", "required": true, "description": "Street address" },
    "city": { "type": "String", "required": true, "description": "City name" },
    "country": { "type": "String", "required": true, "description": "Country name" },
    "estate": { "type": "String", "required": false, "description": "Estate/complex name" },
    "category": { "type": "String", "required": true, "enum": ["residential", "commercial", "industrial", "mixed_use"], "description": "Property category" },
    "propertyType": { "type": "String", "required": true, "description": "Property type (varies by category)" },
    "geography": { "type": "String", "required": false, "enum": ["urban", "suburban", "rural"], "description": "Geographic classification" },
    "location": {
      "type": "Object",
      "required": false,
      "properties": {
        "lat": { "type": "Number", "required": false, "description": "Latitude coordinate" },
        "lng": { "type": "Number", "required": false, "description": "Longitude coordinate" }
      }
    },
    "units": { "type": "Int32", "required": true, "min": 1, "description": "Number of units" },
    "pricePerUnit": { "type": "Decimal128", "required": true, "description": "Price per unit" },
    "features": { "type": "String", "required": false, "description": "Property features description" },
    "specificationValues": { "type": "Object", "required": false, "description": "Type-specific fields (dynamic)" },
    "customSpecifications": { "type": "Array", "required": false, "description": "Custom specification pairs [{ title, value }]" },
    "zoning": { "type": "String", "required": false, "description": "Zoning classification" },
    "permittedUses": { "type": "String", "required": false, "description": "Permitted uses" },
    "annualPropertyTaxes": { "type": "Decimal128", "required": false, "description": "Annual property taxes" },
    "annualInsurance": { "type": "Decimal128", "required": false, "description": "Annual insurance cost" },
    "appraisedValue": { "type": "Decimal128", "required": false, "description": "Property appraised value" },
    "lastAppraisalDate": { "type": "Date", "required": false, "description": "Last appraisal date" },
    "noi": { "type": "Decimal128", "required": false, "description": "Net Operating Income" },
    "capRate": { "type": "Decimal128", "required": false, "description": "Capitalization rate (%)" },
    "imageUrl": { "type": "String", "required": false, "description": "Property image URL" },
    "description": { "type": "String", "required": false, "description": "Property description" },
    "createdAt": { "type": "Date", "required": true, "default": "now()", "description": "Document creation timestamp" },
    "updatedAt": { "type": "Date", "required": true, "default": "now()", "description": "Document update timestamp" }
  }
}
```

### 3. Tenant Form (Create/Edit)

```json
{
  "collectionName": "tenants",
  "schema": {
    "_id": { "type": "ObjectId", "required": true, "description": "Unique tenant document ID" },
    "name": { "type": "String", "required": true, "description": "Full name" },
    "email": { "type": "String", "required": true, "unique": true, "pattern": "email", "description": "Email address" },
    "phone": { "type": "String", "required": true, "pattern": "phone", "description": "Phone number" },
    "tenantType": { "type": "String", "required": true, "enum": ["residential", "commercial", "mixed"], "description": "Tenant type classification" },
    "preferredContactMethod": { "type": "String", "required": false, "enum": ["email", "phone", "sms"], "default": "email", "description": "Preferred contact method" },
    "applicationDate": { "type": "Date", "required": false, "description": "Application submission date" },
    "moveInDate": { "type": "Date", "required": false, "description": "Move-in date" },
    "password": { "type": "String", "required": false, "minLength": 8, "description": "Encrypted password hash" },
    "propertyId": { "type": "ObjectId", "required": true, "ref": "properties", "description": "Reference to property" },
    "unitNumber": { "type": "String", "required": true, "description": "Unit number (conditional on property)" },
    "leaseStartDate": { "type": "Date", "required": true, "description": "Lease start date" },
    "leaseRenewDate": { "type": "Date", "required": false, "description": "Lease renewal date" },
    "leaseEndDate": { "type": "Date", "required": true, "description": "Lease end date (auto-calculated)" },
    "leaseType": { "type": "String", "required": true, "enum": ["monthly", "3_months", "half_year", "full_year", "month-to-month"], "description": "Lease duration type" },
    "leaseTerms": { "type": "String", "required": false, "description": "Custom lease terms" },
    "monthlyRent": { "type": "Decimal128", "required": true, "description": "Monthly rent amount" },
    "emergencyContact": { "type": "String", "required": false, "description": "Emergency contact name/relation" },
    "notes": { "type": "String", "required": false, "description": "Additional notes" },
    "residentialInfo": { "type": "Object", "required": false, "description": "{ dateOfBirth, coSigner, employmentInfo, previousAddresses, pets, vehicles }" },
    "commercialInfo": { "type": "Object", "required": false, "description": "{ businessInfo, businessContacts, financialInfo, securityDeposit }" },
    "status": { "type": "String", "required": true, "enum": ["active", "inactive", "evicted"], "default": "active", "description": "Tenant status" },
    "createdAt": { "type": "Date", "required": true, "default": "now()", "description": "Document creation timestamp" },
    "updatedAt": { "type": "Date", "required": true, "default": "now()", "description": "Document update timestamp" }
  }
}
```

### 4. Invite Tenant Form

```json
{
  "collectionName": "tenants",
  "formName": "inviteTenantForm",
  "schema": {
    "name": { "type": "String", "required": true, "description": "Full name" },
    "email": { "type": "String", "required": true, "readOnly": true, "pattern": "email", "description": "Email address (pre-filled from invite)" },
    "phone": { "type": "String", "required": true, "pattern": "phone", "description": "Phone number" },
    "password": { "type": "String", "required": true, "minLength": 6, "description": "Password" },
    "confirmPassword": { "type": "String", "required": true, "minLength": 6, "description": "Password confirmation (must match password)" },
    "leaseStartDate": { "type": "Date", "required": true, "description": "Lease start date" },
    "leaseEndDate": { "type": "Date", "required": true, "description": "Lease end date" },
    "leaseType": { "type": "String", "required": true, "enum": ["monthly", "3mnths", "6mnths", "full year"], "description": "Lease type" },
    "emergencyContact": { "type": "String", "required": false, "description": "Emergency contact name" },
    "notes": { "type": "String", "required": false, "description": "Additional notes" }
  }
}
```

### 5. Send Announcement Form

```json
{
  "collectionName": "announcements",
  "schema": {
    "_id": { "type": "ObjectId", "required": true, "description": "Unique announcement document ID" },
    "title": { "type": "String", "required": true, "description": "Announcement title" },
    "announcementType": { "type": "String", "required": true, "enum": ["general", "policy", "maintenance", "commercial", "lease"], "description": "Announcement type" },
    "message": { "type": "String", "required": true, "minLength": 1, "description": "Announcement message content" },
    "recipients": { "type": "String", "required": true, "enum": ["all", "property", "custom", "managers"], "description": "Recipient filter type" },
    "tenantTypeFilter": { "type": "String", "required": false, "enum": ["all", "residential", "commercial", "mixed"], "description": "Filter by tenant type (conditional if recipients='all')" },
    "propertyId": { "type": "ObjectId", "required": false, "ref": "properties", "description": "Property ID (conditional if recipients='property')" },
    "propertyTypeFilter": { "type": "String", "required": false, "enum": ["all types", "residential", "commercial", "mixed_use", "industrial", "retail", "office"], "description": "Filter by property type (conditional if recipients='property')" },
    "tenantSelectionMode": { "type": "String", "required": false, "enum": ["all", "withDueDate", "custom"], "description": "Tenant selection mode (conditional if recipients='property')" },
    "tenantIds": { "type": "Array", "required": false, "items": { "type": "ObjectId" }, "description": "Selected tenant IDs (conditional if tenantSelectionMode='custom')" },
    "priority": { "type": "String", "required": true, "enum": ["low", "normal", "high", "urgent"], "description": "Announcement priority" },
    "scheduledDate": { "type": "Date", "required": false, "description": "Scheduled send date/time (if empty, sends immediately)" },
    "sentAt": { "type": "Date", "required": false, "description": "Actual send timestamp" },
    "status": { "type": "String", "required": true, "enum": ["draft", "scheduled", "sent"], "default": "draft", "description": "Announcement status" },
    "createdAt": { "type": "Date", "required": true, "default": "now()", "description": "Document creation timestamp" },
    "updatedAt": { "type": "Date", "required": true, "default": "now()", "description": "Document update timestamp" }
  }
}
```

### 6. Upload Document Form

```json
{
  "collectionName": "documents",
  "schema": {
    "_id": { "type": "ObjectId", "required": true, "description": "Unique document record ID" },
    "name": { "type": "String", "required": true, "description": "Document name" },
    "type": { "type": "String", "required": true, "enum": ["lease", "inspection", "insurance", "tax", "other"], "description": "Document type" },
    "propertyId": { "type": "ObjectId", "required": true, "ref": "properties", "description": "Reference to property" },
    "expiryDate": { "type": "Date", "required": false, "description": "Document expiry date" },
    "fileUrl": { "type": "String", "required": true, "description": "URL to uploaded file" },
    "fileName": { "type": "String", "required": true, "description": "Original file name" },
    "fileSize": { "type": "Int32", "required": true, "description": "File size in bytes" },
    "fileFormat": { "type": "String", "required": true, "enum": ["pdf", "doc", "docx", "jpg", "jpeg", "png"], "description": "File format extension" },
    "mimeType": { "type": "String", "required": true, "description": "MIME type of file" },
    "uploadedBy": { "type": "ObjectId", "required": true, "ref": "users", "description": "User who uploaded document" },
    "uploadedAt": { "type": "Date", "required": true, "default": "now()", "description": "Upload timestamp" },
    "tags": { "type": "Array", "items": { "type": "String" }, "required": false, "description": "Document tags for organization" }
  }
}
```

---

## PART 2: INLINE FORMS (Tenant Portal)

### 1. Make Payment Form

```json
{
  "collectionName": "payments",
  "formName": "makePaymentForm",
  "multiStep": true,
  "schema": {
    "_id": { "type": "ObjectId", "required": true, "description": "Unique payment document ID" },
    "tenantId": { "type": "ObjectId", "required": true, "ref": "tenants", "description": "Reference to tenant" },
    "propertyId": { "type": "ObjectId", "required": true, "ref": "properties", "description": "Reference to property" },
    "amount": { "type": "Decimal128", "required": true, "description": "Payment amount" },
    "method": { "type": "String", "required": true, "enum": ["bank-transfer", "credit-card", "debit-card"], "description": "Payment method" },
    "status": { "type": "String", "required": true, "enum": ["pending", "completed", "failed", "cancelled"], "default": "pending", "description": "Payment status" },
    "transactionId": { "type": "String", "required": false, "description": "Payment gateway transaction ID" },
    "paidAt": { "type": "Date", "required": false, "description": "Payment completion timestamp" },
    "createdAt": { "type": "Date", "required": true, "default": "now()", "description": "Payment creation timestamp" }
  }
}
```

### 2. Maintenance Request Form

```json
{
  "collectionName": "maintenanceRequests",
  "formName": "maintenanceForm",
  "schema": {
    "_id": { "type": "ObjectId", "required": true, "description": "Unique maintenance request ID" },
    "tenantId": { "type": "ObjectId", "required": true, "ref": "tenants", "description": "Reference to tenant" },
    "propertyId": { "type": "ObjectId", "required": true, "ref": "properties", "description": "Reference to property" },
    "unitNumber": { "type": "String", "required": true, "description": "Unit number where issue occurred" },
    "category": { "type": "String", "required": true, "enum": ["plumbing", "electrical", "hvac", "locks", "appliance", "structural", "pest", "other"], "description": "Issue category" },
    "description": { "type": "String", "required": true, "minLength": 1, "description": "Detailed issue description" },
    "location": { "type": "String", "required": false, "description": "Specific location within unit (e.g., 'Kitchen sink', 'Bedroom 2')" },
    "priority": { "type": "String", "required": false, "enum": ["low", "medium", "high", "critical"], "description": "Issue priority level" },
    "contactMethod": { "type": "String", "required": false, "enum": ["email", "phone"], "default": "email", "description": "Preferred contact method" },
    "urgency": { "type": "String", "required": false, "enum": ["normal", "high", "critical"], "description": "Issue urgency" },
    "status": { "type": "String", "required": true, "enum": ["pending", "assigned", "in-progress", "completed", "cancelled"], "default": "pending", "description": "Request status" },
    "assignedTo": { "type": "ObjectId", "required": false, "ref": "staff", "description": "Staff member assigned to request" },
    "attachments": { "type": "Array", "items": { "type": "String" }, "required": false, "description": "File URLs of attached images/documents" },
    "notes": { "type": "String", "required": false, "description": "Staff notes on the request" },
    "completedAt": { "type": "Date", "required": false, "description": "Request completion timestamp" },
    "createdAt": { "type": "Date", "required": true, "default": "now()", "description": "Request creation timestamp" },
    "updatedAt": { "type": "Date", "required": true, "default": "now()", "description": "Request update timestamp" }
  }
}
```

### 3. Contact Management Form

```json
{
  "collectionName": "messages",
  "formName": "contactForm",
  "schema": {
    "_id": { "type": "ObjectId", "required": true, "description": "Unique message document ID" },
    "tenantId": { "type": "ObjectId", "required": true, "ref": "tenants", "description": "Reference to tenant sender" },
    "selectedContactId": { "type": "ObjectId", "required": true, "ref": "contacts", "description": "Management contact recipient ID" },
    "message": { "type": "String", "required": true, "minLength": 1, "description": "Message content" },
    "subject": { "type": "String", "required": false, "description": "Message subject" },
    "messageType": { "type": "String", "required": false, "enum": ["inquiry", "complaint", "maintenance", "billing", "general"], "description": "Type of message" },
    "status": { "type": "String", "required": true, "enum": ["new", "read", "replied"], "default": "new", "description": "Message status" },
    "sentAt": { "type": "Date", "required": true, "default": "now()", "description": "Message send timestamp" },
    "readAt": { "type": "Date", "required": false, "description": "Message read timestamp" },
    "repliedAt": { "type": "Date", "required": false, "description": "Reply timestamp" },
    "replyMessage": { "type": "String", "required": false, "description": "Reply content if applicable" },
    "attachments": { "type": "Array", "items": { "type": "String" }, "required": false, "description": "File URLs if any attachments" }
  }
}
```

---

## DATA TYPE REFERENCE

| MongoDB Type | Description | Form Usage |
|---|---|---|
| **String** | Text data | Names, addresses, descriptions, notes |
| **Decimal128** | Precise decimal numbers | Amounts, prices, rent, financial values |
| **Int32** | 32-bit integer | Counts (units, quantity) |
| **Date** | ISO 8601 datetime | Dates, timestamps |
| **Boolean** | True/False | Flags (autoPay, requiresApproval) |
| **ObjectId** | Unique identifier | References to other collections |
| **Array** | Ordered list | Multiple values, nested arrays |
| **Object** | Nested document | Grouped related fields (location, residentialInfo) |

---

## SCHEMA PROPERTIES GLOSSARY

- **`required`** — Field must have value (true/false)
- **`unique`** — Field value must be unique across collection (email, username)
- **`enum`** — Field accepts only listed values
- **`default`** — Default value if not provided
- **`ref`** — References another MongoDB collection (foreign key)
- **`readOnly`** — Field cannot be modified by client
- **`pattern`** — Validation pattern type (email, phone, etc.)
- **`minLength` / `maxLength`** — String length constraints
- **`min` / `max`** — Numeric range constraints
- **`description`** — Field documentation

---

## COLLECTIONS SUMMARY

| Collection | Forms | Documents | Fields | Relationships |
|---|---|---|---|---|
| expenses | Add Expense | ~23 fields | Financial records | Properties → Expenses |
| properties | Add Property | ~26 fields | Properties | Properties → Tenants, Expenses, Documents |
| tenants | Tenant, Invite | ~27 fields | Tenant records | Tenants → Properties, Payments, Maintenance |
| announcements | Send Announcement | ~13 fields | Communications | Announcements → Tenants, Properties |
| documents | Upload Document | ~13 fields | File metadata | Documents → Properties |
| payments | Make Payment | ~8 fields | Payment records | Payments → Tenants, Properties |
| maintenanceRequests | Maintenance | ~16 fields | Work requests | Maintenance → Tenants, Properties |
| messages | Contact Form | ~12 fields | Communications | Messages → Tenants, Contacts |

**Total: 9 collections, ~138+ fields across 10 forms**
