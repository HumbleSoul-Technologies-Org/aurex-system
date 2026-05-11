## Plan: Tenant Invite-Onboarding Form

TL;DR - Build a dedicated tenant signup form that only invited tenants can access via admin-generated links. The form should be based on the admin dashboard tenant creation form, but simplified, prefilled by invite metadata, and restricted to invite token validation.

**Steps**
1. Add tenant invite model and helper services.
   - Create `lib/services/tenant-invites.ts`.
   - Define an invite record: `id`, `token`, `propertyId`, `unitNumber?`, `email?`, `createdBy`, `createdAt`, `expiresAt?`, `status` (`pending|accepted|revoked`), and `notes?`.
   - Implement `createTenantInvite`, `getTenantInviteByToken`, `validateTenantInvite`, `acceptTenantInvite`, and `revokeTenantInvite`.
2. Generate invite links from the admin property page.
   - Add an invite section to `app/dashboard/properties/[id]/page.tsx` near the tenant controls.
   - Add a button `Create Invite Link` or `Generate Tenant Invite`.
   - Open a dialog that optionally lets the admin choose a tenant unit and/or expected email.
   - Create the invite record and display a link such as `/auth/invite?token=<token>`.
   - Provide a `Copy` action for easy sharing.
3. Create the tenant invite onboarding page.
   - Add a new route `app/auth/invite/page.tsx`.
   - Use a client-side page that reads `token` from the query string.
   - Validate the token on mount using the invite service.
   - If invalid, show an error message and a link to contact management.
4. Build the invite-only tenant form from the admin form.
   - Create `components/forms/invite-tenant-form.tsx` based on `components/forms/add-tenant-form.tsx`.
   - Remove admin-only fields: property selector and unit selection may be readonly or prefilled.
   - Include required fields for tenant self-registration: `name`, `email`, `phone`, `password`, `leaseStartDate`, `leaseType`, `emergencyContact`, and optional notes.
   - If the invite includes a preassigned `unitNumber`, show that readonly on the form.
   - If the invite includes `propertyId`, show the property name/address as a readonly summary.
   - Optionally allow tenant to select their own unit only if the invite was created without a unit number.
5. Wire invite signup to tenant creation.
   - In `app/auth/invite/page.tsx`, submit the invite form and call `createTenant` with the invite's `propertyId`, `unitNumber`, and tenant-provided data.
   - Mark the invite as `accepted` after successful signup.
   - Create a tenant session using the existing `auth.ts` tenant login flow.
   - Redirect the new tenant to their tenant dashboard or tenant portal page.
6. Add guard behavior and reuse.
   - Ensure regular `/auth/signup` remains available for managers or general signups if desired.
   - Make `/auth/invite` only accessible with a valid token; invalid or expired tokens should render a friendly fallback.
   - Keep the admin tenant creation form unchanged; create a separate tenant-facing form endpoint.
7. Optional enhancement: invite management view.
   - Add an `Invite Links` tile in `app/dashboard/tenant-portal/page.tsx` or property detail page.
   - Show active invites, status, created date, and revoke actions.

**Relevant files**
- `components/forms/add-tenant-form.tsx` — base form to adapt
- `app/dashboard/properties/[id]/page.tsx` — admin property detail where invite action is added
- `app/auth/signup/page.tsx` — existing signup flow to reference
- `app/auth/invite/page.tsx` — new tenant invite onboarding page
- `lib/services/tenants.ts` — tenant creation helper
- `lib/services/auth.ts` — tenant session and login helper
- `lib/services/tenant-invites.ts` — new invite service
- `app/lib/tenant-data.ts` — existing tenant session helper

**Verification**
1. Admin generates an invite link for a specific property.
2. Visiting `/auth/invite?token=<token>` shows the tenant invite form and property context.
3. Completing the form creates a tenant record linked to the invited property.
4. The invite is marked accepted and cannot be reused.
5. Invalid or revoked tokens display a clear error.

**Decisions**
- Build a separate tenant invite route instead of reusing the general signup page.
- Use a dedicated invite token model to keep property-only signup secure and one-time.
- Keep the form visually based on the admin tenant form, but only show tenant-facing fields.

**Further Considerations**
1. If you want email delivery later, the invite model can store `email` and `sentAt` and integrate with email sending.
2. If the property has multiple units, the invite should optionally lock the tenant to a specific unit.
3. If admins need bulk invites later, the invite service can support batch generation.
