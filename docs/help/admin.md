# Admin / Property Manager Guide

## Overview

This guide covers the primary workflows for an Admin or Property Manager: managing properties and units, inviting tenants and staff, handling finances and invoices, reconciling payments, and managing maintenance requests.

## Quick Links

- Properties: `/dashboard/properties`
- Tenants: `/dashboard/tenants`
- Finances: `/dashboard/finances`
- Maintenance: `/dashboard/maintenance`
- Documents: `/dashboard/documents`
- Settings: `/dashboard/settings`

## Add a Property

Where: `/dashboard/properties` → Add Property

Steps:

1. Click **Add Property**.
2. Enter the property name, full address, and contact info and other feilds,
3. Upload image (optional).
4. Configure units of the property ie some units might be of different prices than others.
5. Click **Save**.

Checklist

- Verify address and unit numbering.
- Add default rent and deposit values where applicable.

Image placeholder: `/public/help-assets/placeholder-200x120.svg`

## Add a Unit / Create Lease

Where: Property details → Units → Add Unit

Steps:

1. From the property, click **Units** → **Add Unit**.
2. Enter unit identifier, bedrooms, bathrooms, sq ft, and rent.
3. Optionally assign a tenant or leave unassigned.
4. Save and confirm the unit appears in listings.

Troubleshooting:

- If the unit doesn't appear, refresh the page and confirm you have the right permissions.

Image placeholder: `/public/help-assets/placeholder-200x120.svg`

## Invite Tenants

Where: `/dashboard/properties` → Invite

Steps:

1. Naviget to the Properties page and click on 'View Details' button a property you want to invite the tenant to.
2. You will then be navigated to the property's details page.
3. click the 'Genenrate Invite Link' Button
4. A dialogue will pop up, then fill in the unit you would like to assign to the tenant and then fill in their email address as well(optional)
5. When done, click the 'Generate Link' button te generate an invitation Link and send an invitation email to the tenant you intending to invite.
6. Copy the generated link and share it via message, email. whatsapp or any other prefered way.
7. When the tenant clicks the link, he/she will be redirected to a form to fill in their details then subit when done.
8. The created profile will then be saved and displayed in the 'Pending Approvals' page awaitibng for the adimn's approval.
9. When approved, the tenant will sucessfully be saved among the tenants and cleared out from the Pending Approvals page.

If invite email bounces:

- Resend the invite.
- Ensure your SMTP settings are correct (Settings → Communications).

Image placeholder: `/public/help-assets/placeholder-200x120.svg`

## Tenants

Where: `/dashboard/properties` → Invite

Steps:

1. Naviget to the Properties page and click on 'View Details' button a property you want to invite the tenant to.
2. You will then be navigated to the property's details page.
3. click the 'Genenrate Invite Link' Button
4. A dialogue will pop up, then fill in the unit you would like to assign to the tenant and then fill in their email address as well(optional)
5. When done, click the 'Generate Link' button te generate an invitation Link and send an invitation email to the tenant you intending to invite.
6. Copy the generated link and share it via message, email. whatsapp or any other prefered way.
7. When the tenant clicks the link, he/she will be redirected to a form to fill in their details then subit when done.
8. The created profile will then be saved and displayed in the 'Pending Approvals' page awaitibng for the adimn's approval.
9. When approved, the tenant will sucessfully be saved among the tenants and cleared out from the Pending Approvals page.

If invite email bounces:

- Resend the invite.
- Ensure your SMTP settings are correct (Settings → Communications).

Image placeholder: `/public/help-assets/placeholder-200x120.svg`

## Finances

Where: `/dashboard/fiances` → Finance
Sections:

- Rent Collection
- Expences
- KPI metric cards

A. Rent Payment:

- This feature allows the admin to manually record rent payments.
- The Admin can also export payment history for externanl use in CSV format.
- There are also filter sections ie search input to search paynment by tenant name or by status ie completed payments, pending payments and payments with balances
  NOTE: Rent payments can be done partially and this is supported by the balance tracking system ie when a payment is done

Steps:

1.  Navigate to the Finaces page.
2.  The Rent collection section will be active by default.
3.  For exporting payment history, clik the 'Export Payments' button to export all payment history in CSV format.
4.  For getting specific payment history, use the search input feild to saerch payment by tenant name or use the filter by status button to show paid and pending payments.
5.  For creation of payments, click the 'Record Payment' button to create a new payment.
6.  For balance payments, click the 'Record Payment' button then set feild 'Reason for Payment' to 'Balance Payment'

B. Expences

- This feature is for recording expences per property.
- It has various categories to help define the expence's primary objective.

Steps:

1.  Navigate to the Finances page.
2.  Click on the Expences tab.
3.  Click the 'Add Expence' button to create a new expence.
4.  Use the search input feild to search expence by category / description.
5.  You can as well export expence data for external use by clicking the 'Export Expences' button to export all expence history in CSV format

C. KPI Metric Cards

- These summerise analitics for easy reading

They include:

- Total Revnue : shows the total revenue generated from all the payments.
- Outstanding Balances: This shows the total amount of out-standing balances of tenants in all properties.
- Pending Payments: Shows the total number of payments with balances.
- Total Expence: Shows the total amount of expences.
- Net Profit: Shows the total amount of profits made by getting the difference between the total revenue generated and total expences

Image placeholder: `/public/help-assets/placeholder-200x120.svg`

## Manage Maintenance Requests

Where: `/dashboard/maintenance`

- This is the page where the tenats mantainance requests are pilled. When a tenant requests for a mantaianace, it will be displayed in the manataiance page with status 'Pending' to show that the Admin has noy yet processed it.
- When the admin processes the request, a new expence will be created and the manatainace request's status will change from 'Pending' to 'Approved'.
- When the mantainance is done, the Admin will then set the request status to complete

NOTE: Mantaiance data can also be exported for external use by simply clicking the 'Export CSV' button to export data in CSV format.

The Mantainance page also has KPI metric cards for a summerised analysis ie

- Total Requests: Shows the total number of requets from all tenants of all properties.
- Pending: Shows the total nuber of new requests / un approved mantainance requests.
- Approved: Shows the total nuber of approved mantainance requests.
- Total Cost: Shows the total cost amount of all manatiances requests..

Steps:

1.  Navigate to the Mantaiance page.
2.  For new requests (listed in the pending section), Click on the 'Approve' button to create their expences record and set their status to 'Approved'.
3.  For Approved requests, click the 'Complete' button in case they are confirmed as done.

Image placeholder: `/public/help-assets/placeholder-200x120.svg`

## Troubleshooting — Common Issues

- Missing tenant: ensure invite accepted and account verified.
- Currency/amount mismatch: verify Finance settings currency and refresh exchange rates.
- Email delivery issues: check SMTP configuration, retry sends, and review communications logs.

## Further Reading

- [System Architecture & Admin Overview](../COMPLETE_IMPLEMENTATION_SUMMARY.md)

## Visit History

Where: `/dashboard/admin/visits`

This page shows all the visits recorded from various properties by their security peronels/gaurds.

- [System Architecture & Admin Overview](../COMPLETE_IMPLEMENTATION_SUMMARY.md)
