# M-Pesa Payment Gateway Integration Guide

## Overview

M-Pesa has been successfully integrated into the property management system as a payment option for tenants. This integration allows tenants to make rent and balance payments directly through M-Pesa using the Daraja API.

---

## Architecture

### Frontend (ten-site)

#### Key Files Modified/Created

1. **`app/tenant/make-payment/page.tsx`** - Tenant Payment Portal
   - Already includes M-Pesa as a payment method option
   - Shows phone number input when M-Pesa is selected
   - Branches submission logic:
     - If M-Pesa: calls `createMpesaPayment()`
     - Otherwise: calls existing `createManualPayment()`
   - Success screen shows M-Pesa-specific messaging

2. **`lib/services/payments.ts`** - Payment Service
   - `createMpesaPayment()` function sends payment request to `/payments/mpesa/initiate`
   - Maintains existing `createManualPayment()` for admin manual recording
   - Both functions update payment records and trigger notifications

### Backend (ten-server)

#### New Files Created

1. **`services/mpesaService.js`** - M-Pesa Service Module
   - `getAccessToken()` - OAuth token generation from Daraja
   - `initiateStkPush()` - Sends STK Push prompt to user's phone
   - `queryTransactionStatus()` - Query payment status (optional)
   - `processCallback()` - Parse M-Pesa callback responses

#### Files Modified

1. **`controllers/paymentControllers.js`** - Payment Controller
   - Added `initiateMpesaPayment()` handler
   - Added `confirmMpesaCallback()` handler for webhook

2. **`routes/paymentRoutes.js`** - Payment Routes
   - `POST /payments/mpesa/initiate` - Authenticated (admin/tenant)
   - `POST /payments/mpesa/callback` - Public webhook endpoint

---

## Payment Flow

### 1. Tenant Initiates Payment

```
Tenant Portal → Select M-Pesa + Phone Number → Submit
```

Request to `/payments/mpesa/initiate`:

```json
{
  "tenantId": "tenant-id",
  "propertyId": "property-id",
  "amount": 50000,
  "phoneNumber": "254712345678",
  "leaseType": "monthly",
  "reasonForPayment": "rentPayment",
  "monthlyRent": 50000,
  "paidBy": "tenant"
}
```

### 2. Backend Initiates STK Push

- Validates tenant and M-Pesa configuration
- Retrieves M-Pesa credentials from admin settings (`apiSettings.finance.paymentMethods`)
- Gets OAuth token from Daraja
- Sends STK Push to tenant's phone
- Creates pending payment record with `checkoutRequestID`

### 3. Tenant Confirms Payment on Phone

- M-Pesa prompt appears on tenant's phone
- Tenant enters M-Pesa PIN
- M-Pesa processes the transaction

### 4. M-Pesa Sends Callback

- M-Pesa sends webhook to `/payments/mpesa/callback`
- Callback includes:
  - Transaction confirmation
  - Receipt number
  - Amount
  - Phone number
  - Transaction timestamp

### 5. Backend Processes Callback

- Finds pending payment using `checkoutRequestID`
- Updates payment status to `"complete"` or `"failed"`
- Stores M-Pesa receipt number and transaction details
- Updates tenant status if applicable
- Dispatches payment confirmation notification
- Invalidates relevant Redis caches

### 6. Tenant Sees Success

- Dashboard shows payment received
- Payment history updates
- Confirmation email sent

---

## Configuration

### Admin Setup

Admins configure M-Pesa in Dashboard → Settings → Payment Methods:

```
Payment Method: M-Pesa
Status: Enabled
Shortcode: 174379 (business code)
Consumer Key: <your_daraja_key>
Consumer Secret: <your_daraja_secret>
Passkey: <your_lipa_na_mpesa_passkey>
Environment: sandbox or production
```

These settings are stored in `AdminSettings.apiSettings.finance.paymentMethods` with secrets encrypted.

### Environment Variables

Backend needs:

```env
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
API_URL=https://yourdomain.com  # or http://localhost:5454 for dev
```

---

## Database Schema

### Payment Record (M-Pesa)

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  propertyId: ObjectId,
  amount: Number,
  paymentMethod: "mpesa",
  status: "pending" | "complete" | "failed",
  reasonForPayment: "rentPayment" | "balancePayment",
  leaseType: String,
  monthlyRent: Number,
  paidBy: String,
  notes: String,
  transId: String,           // M-Pesa receipt number
  paidOn: Date,              // Transaction timestamp
  createdAt: Date,
  updatedAt: Date,
  metadata: {
    checkoutRequestID: String,
    reference: String,
    phoneNumber: String,
    environment: "sandbox" | "production",
    mpesaReceiptNumber: String,
    resultCode: String,
    callbackProcessedAt: Date
  }
}
```

---

## Error Handling

### Common Errors

1. **MPESA_NOT_CONFIGURED**
   - M-Pesa not set up in admin settings
   - Admin must configure M-Pesa in Settings

2. **STK_PUSH_FAILED**
   - Daraja API error
   - Check Consumer Key/Secret
   - Verify shortcode is active

3. **INVALID_PHONE_NUMBER**
   - Phone format incorrect
   - Should include country code: 254712345678

4. **MPESA_ENVIRONMENT_MISMATCH**
   - Production credentials used in sandbox or vice versa
   - Verify environment setting matches credentials

---

## Testing

### Sandbox Testing (Daraja Sandbox)

1. Use test credentials from Daraja portal
2. Use sandbox phone numbers provided by Safaricom
3. Callback will be simulated

### Production Setup

1. Get production credentials from Safaricom
2. Update environment to "production"
3. Configure callback URL to your production domain
4. Whitelist callback URL with M-Pesa

---

## Security Considerations

1. **Secrets Encryption**
   - M-Pesa secrets (Consumer Key, Secret, Passkey) are encrypted in database
   - Never log or expose these values
   - Use environment variables for deployment

2. **Callback Verification**
   - Callback endpoint is public but validates checkoutRequestID
   - Ensure only valid payments are updated
   - Consider adding IP whitelisting for M-Pesa callbacks

3. **Phone Number Validation**
   - Validate phone format before sending to Daraja
   - Support international format (254XXXXXXXXX)

4. **Rate Limiting**
   - `/payments/mpesa/initiate` uses `paymentLimiter` middleware
   - Prevents abuse of STK Push requests

---

## Frontend Implementation Details

### Tenant Payment Page Flow

```
1. Amount Step → Select amount and reason
2. Method Step → Select M-Pesa, enter phone
3. Confirm Step → Review payment details
4. Success Step → "STK Push sent, complete on your phone"
```

### Key Components

- Payment method selection with icons
- Phone number input field (appears when M-Pesa selected)
- Success message differs for M-Pesa (awaiting confirmation)
- Payment history updates via `paymentsUpdated` event

### State Management

```typescript
const [method, setMethod] = useState("bank_transfer");
const [phoneNumber, setPhoneNumber] = useState("");
const [processing, setProcessing] = useState(false);
const [savedPayment, setSavedPayment] = useState<RentPayment | null>(null);
```

---

## Backend Implementation Details

### M-Pesa Service (`mpesaService.js`)

**getAccessToken()**

- Calls Daraja OAuth endpoint
- Returns access token valid for ~1 hour
- Used for all subsequent API calls

**initiateStkPush()**

- Generates timestamp and password hash
- Sends STK Push request to Daraja
- Returns checkoutRequestID for tracking
- Response includes customer message

**processCallback()**

- Extracts transaction data from callback body
- Maps M-Pesa fields to application fields
- Returns formatted transaction object
- Determines success/failure status

### Payment Controller

**initiateMpesaPayment()**

- Validates request parameters
- Retrieves property settings and M-Pesa config
- Gets OAuth token
- Initiates STK Push
- Creates pending payment record
- Returns payment object and customer message

**confirmMpesaCallback()**

- Receives M-Pesa callback webhook
- Processes callback to extract transaction details
- Updates payment record with receipt number
- Updates tenant status based on payment
- Sends payment confirmation notification
- Returns success to M-Pesa

---

## Troubleshooting

### STK Push not appearing on phone

- Verify phone number format (254XXXXXXXXX)
- Check M-Pesa configuration is correct
- Ensure Consumer Key/Secret are valid
- Confirm shortcode is active in sandbox/production

### Callback not being received

- Check callback URL is publicly accessible
- Verify firewall allows M-Pesa IP addresses
- Check backend logs for webhook attempts
- Confirm URL is configured in M-Pesa portal

### Payment stuck in "pending"

- Check backend logs for callback errors
- Verify callback was received but processing failed
- Manually check M-Pesa receipt in admin
- Contact support for callback retry

### Tenant receives "M-Pesa not configured"

- Admin must visit Settings → Payment Methods
- Add M-Pesa payment method
- Fill in all required fields
- Enable the method
- Save settings

---

## Future Enhancements

1. **Auto-retry logic** - Automatically retry failed transactions
2. **Payment status polling** - Query M-Pesa for pending transactions
3. **Bulk payments** - Allow multiple payment methods in one transaction
4. **Refund handling** - Process M-Pesa refunds for overpayments
5. **SMS notifications** - Send SMS to tenants on successful payment
6. **Payment link** - Generate M-Pesa payment links for invoices
7. **Recurring payments** - Set up monthly automated M-Pesa payments

---

## Support

For questions or issues:

1. Check application logs in `/logs` directory
2. Review M-Pesa callback payloads in `Payment.metadata`
3. Verify Daraja credentials in admin settings
4. Contact Safaricom M-Pesa support for API issues
