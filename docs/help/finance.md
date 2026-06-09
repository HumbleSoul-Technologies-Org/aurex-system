# Finance & Payments

## Overview

This document explains invoicing, payment methods, reconciliation, refunds, and how exchange rates are handled in the tenant portal.

## Quick Links

- Invoices & Charges: `/dashboard/finances`
- Tenant payments: `/tenant/finances`
- Finance settings: `/dashboard/settings#finance`

## Supported Payment Methods

- Credit / Debit cards (via configured payment gateway)
- ACH / bank transfers (where enabled)
- Digital wallets (provider dependent)

## Creating and Sending Invoices

Where: `/dashboard/finances` → New Invoice

Steps:

1. Select tenant or unit.
2. Add line items with description, quantity, and unit price.
3. Set due date and optional reminder schedule.
4. Preview and send the invoice — a PDF/email is generated and sent to the tenant.

Image placeholder: `/public/help-assets/admin-invoice-01.png`

## Paying an Invoice (Tenant)

Where: `/tenant/finances`

Steps:

1. Open the outstanding invoice.
2. Click **Pay**, choose a saved payment method or add a new one.
3. Confirm amount and complete the transaction.
4. Receipt will be emailed and saved in Documents.

Image placeholder: `/public/help-assets/tenant-pay-invoice-01.png`

## Exchange Rates & Currencies

- The system stores a default currency in Finance settings and uses exchange rates for display conversion in the tenant portal.
- Rates are refreshed automatically on a schedule; Admins can also manually refresh rates via Help → Refresh Exchange Rates.
- If your amounts are stored in a currency other than the system base (USD), contact support for migration guidance.

## Reconciliation

- Import bank statements and match transactions to invoices (Reconciliation view).
- Mark transactions as cleared once matched.

## Refunds and Disputes

- Refunds are issued from the Payments / Transactions view. Locate the payment and choose **Refund**.
- For disputes or chargebacks, contact the payment gateway provider and support immediately.

## Troubleshooting

- Card declined: verify card details and sufficient funds; try alternative payment method.
- Incorrect currency display: check Finance settings and refresh exchange rates.
