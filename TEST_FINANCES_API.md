# Testing Tenant Finances API Save

This guide explains how to verify that the tenant finances settings (payment method and auto-pay) are being saved to the database through the API.

## What We're Testing

The tenant settings page now includes a **Finances** tab where tenants can:

1. Select from admin-configured payment methods
2. Enter a payment method reference (e.g., card last 4 digits)
3. Enable/configure auto-pay

When the tenant clicks "Save Finances Settings", the frontend sends an API request to persist:

- `paymentMethod` (provider, label, externalId)
- `autoPay` (enabled, scheduleType, dayOfMonth, nextRunDate, status, retryAttempts, lastError)

## Prerequisites

1. Backend server running at `http://localhost:3001` (or specify custom URL)
2. At least one tenant in the system
3. Node.js available in terminal

## How to Get a Tenant ID

### Option A: From Admin Panel

1. Go to admin dashboard
2. Navigate to a property with tenants
3. Click on a tenant
4. Copy the ID from the URL or details panel

### Option B: From Database

```bash
# Using MongoDB CLI
db.tenants.findOne({}, { _id: 1, name: 1 })
```

### Option C: Check API Directly

```bash
curl http://localhost:3001/tenants
# Look for tenant _id in the response
```

## Running the Test

### Basic Test

```bash
cd c:\Users\bb466\ten-site
node test-finances-api.mjs <tenantId>
```

### Test with Custom Backend URL

```bash
node test-finances-api.mjs <tenantId> http://your-server:port
```

### Example

```bash
node test-finances-api.mjs 507f1f77bcf86cd799439011 http://localhost:3001
```

## Expected Output

✅ **Success** - All three steps complete successfully:

```
🧪 Testing Tenant Finances API Save
   API URL: http://localhost:3001
   Tenant ID: 507f1f77bcf86cd799439011

📡 Step 1: Fetching initial tenant data...
✅ Fetched tenant: John Doe
   Current paymentMethod: { ... }
   Current autoPay: { ... }

📡 Step 2: Updating tenant with test finances settings...
✅ Updated tenant successfully
   New paymentMethod: { ... }
   New autoPay: { ... }

📡 Step 3: Verifying changes persisted...
✅ Fetched tenant again for verification
   Verified paymentMethod: { ... }
   Verified autoPay: { ... }

🔍 Step 4: Validating changes...
✅ All changes verified! Finances settings saved correctly.

🎉 SUCCESS: Tenant finances settings are being persisted to the database.
```

❌ **Failure** - Common issues and solutions:

| Error                         | Cause                   | Solution                                    |
| ----------------------------- | ----------------------- | ------------------------------------------- |
| `Failed to fetch tenant: 404` | Tenant ID not found     | Verify tenant exists and ID is correct      |
| `Failed to fetch tenant: 401` | Authentication required | Ensure backend doesn't require auth headers |
| `ECONNREFUSED`                | Backend not running     | Start the backend server                    |
| `Validation failed`           | Fields not persisting   | Check backend schema accepts fields         |

## Manual Testing in Browser

### Step 1: Navigate to Tenant Settings

1. Log in as tenant
2. Go to Settings page
3. Click on "Finances" tab

### Step 2: Make Changes

1. Select a payment method from the list
2. Enter a payment reference
3. Enable auto-pay
4. Set a schedule
5. Click "Save Finances Settings"

### Step 3: Verify Persistence

1. **Browser DevTools Network Tab**:
   - Watch the PUT request to `/tenants/{id}/update`
   - Confirm response includes updated `paymentMethod` and `autoPay`
   - Status should be 200

2. **Refresh Page**:
   - Refresh the browser
   - Navigate back to Settings > Finances
   - Verify values are still there

3. **Backend Check**:
   - Query the database directly
   - Verify `paymentMethod` and `autoPay` fields exist in tenant document

## Implementation Details

### Frontend Flow

```
TenantSettingsPage (app/tenant/settings/page.tsx)
  ↓
  [User changes payment method or auto-pay]
  ↓
  [Click "Save Finances Settings"]
  ↓
  handleSave("finances", { paymentMethod, autoPay })
  ↓
  updateTenantApi(tenant.id, patch)
  ↓
  PUT /tenants/{id}/update { paymentMethod, autoPay }
```

### State Structure

- **paymentMethod**: `{ provider: string, label: string, externalId: string }`
- **autoPay**: `{ enabled: boolean, scheduleType: string, dayOfMonth: number, nextRunDate: string, status: string, retryAttempts: number, lastError: string }`

### TypeScript Interfaces

All types are defined in `lib/services/tenants.ts`:

- `PaymentMethod` interface
- `AutoPaySettings` interface
- Both included in `TenantRecord` interface

### Backend Schema

The backend should have tenant schema supporting:

```javascript
paymentMethod: {
  provider: String,
  label: String,
  externalId: String
},
autoPay: {
  enabled: Boolean,
  scheduleType: String,
  dayOfMonth: Number,
  nextRunDate: String,
  status: String,
  retryAttempts: Number,
  lastError: String
}
```

## Troubleshooting

### Settings show correct values in UI but don't persist

1. Check browser console for errors
2. Check backend logs for API errors
3. Verify backend schema includes the fields
4. Check database connection is active

### API returns 200 but fields aren't saved

1. Verify backend is actually updating the database
2. Check if there's a middleware that's filtering fields
3. Verify tenant ID is correct in database

### Changes appear but disappear on refresh

1. Check if local store is being cleared
2. Verify query client cache is being properly updated
3. Check if there's a race condition between local and API state

## Next Steps

After confirming the API saves correctly, verify:

1. ✅ Settings persist after page refresh
2. ✅ Settings persist after logout/login
3. ✅ Admin can view tenant's selected payment method
4. ✅ Auto-pay triggers correctly when enabled
5. ✅ Payment method changes are reflected in actual payments
