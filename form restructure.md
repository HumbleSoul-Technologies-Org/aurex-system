# Form Step-by-Step Wizard Conversion Plan

## Goal
Convert existing large modal forms into intuitive step-by-step wizards with linear next/back navigation, progress indicators, and disabled overlay-close behavior to prevent accidental data loss and improve UX for data-heavy operations.

## TL;DR
Transform 5 modal forms into guided wizards with progressive field grouping, disabled escape/backdrop close, explicit next/back buttons, progress tracking, and form state preservation. Prioritize Add Tenant and Add Property first; deploy validation, conditional fields, and step summaries.

## Form-Specific Step Breakdowns

### 1. Add Tenant Form (Current: 11 fields)
**Step 1: Personal Information**
- Name, Email, Phone
- Helper text: "Basic contact details"
- Validation: email format, phone format

**Step 2: Property & Unit Assignment**
- Property dropdown (from available properties)
- Unit number selection
- Helper text: "Select where this tenant will live"

**Step 3: Lease Details**
- Lease Start Date (calendar picker)
- Lease Type (dropdown: monthly, 6-month, yearly, custom)
- Monthly Rent (currency input)
- Helper text: "Payment and lease terms"

**Step 4: Additional Information**
- Password (auto-generated or custom input)
- Emergency Contact (name)
- Notes (textarea)
- Helper text: "Final preparations"

**Step 5: Review & Confirm**
- Summary of all entered data
- Read-only display of each field grouped by step
- Clear submit button with confirmation text

### 2. Add Property Form (Current: 11 fields)
**Step 1: Basic Information**
- Property Name, Address, City, Country
- Helper text: "Location and identification"
- Validation: required fields

**Step 2: Property Type & Size**
- Property Type (dropdown: apartment, house, commercial, mixed-use)
- Units count (number input)
- Price Per Unit (currency)
- Helper text: "Configuration and pricing"

**Step 3: Location & Geography**
- Geographic area/region (text)
- Latitude, Longitude (number inputs with map preview)
- Helper text: "Precise location for mapping"

**Step 4: Features & Description**
- Features (textarea: amenities, parking, etc.)
- Description (textarea: general info)
- Property image upload with preview
- Helper text: "Details tenants will see"

**Step 5: Review & Confirm**
- Summary display grouped by step
- Image preview
- Clear submit button

### 3. Add Expense Form (Current: 8 fields)
**Step 1: Basic Details**
- Category (dropdown: maintenance, utilities, repairs, etc.)
- Amount (currency input)
- Date (calendar picker, defaults to today)
- Helper text: "What and when"

**Step 2: Property Assignment**
- Property (dropdown from available properties)
- Unit (conditional on multi-unit properties)
- Helper text: "Which property is this for"

**Step 3: Additional Information**
- Description (textarea)
- Payment Method (dropdown: check, card, cash, transfer)
- Receipt URL/file upload
- Helper text: "Supporting details"

**Step 4: Review & Confirm**
- Summary of expense details
- Running total display
- Clear submit button

### 4. Send Announcement Form (Current: Estimated 6-8 fields)
**Step 1: Announcement Basics**
- Title (text input)
- Message type (multi-select: maintenance alert, payment reminder, general info, emergency)
- Helper text: "What are you announcing"

**Step 2: Target Audience**
- Recipient filter (all tenants, specific property, specific unit, by lease type)
- Include empty units (checkbox)
- Helper text: "Who receives this"

**Step 3: Content**
- Message body (rich textarea)
- Optional image/attachment upload
- Helper text: "Full announcement text"

**Step 4: Delivery Settings**
- Delivery channels (multi-select: in-app, email, SMS)
- Schedule now or later
- Helper text: "How and when to send"

**Step 5: Review & Confirm**
- Summary of announcement
- Preview of message
- Recipient count
- Clear submit button

### 5. Upload Document Form (Current: Estimated 4-6 fields)
**Step 1: Document Details**
- Document Type (dropdown: lease, invoice, maintenance report, notice, other)
- Document Name (text)
- Description (textarea)
- Helper text: "What document is this"

**Step 2: File Upload**
- File picker (drag-drop or click to upload)
- File type restrictions, size limits
- Progress indicator during upload
- Helper text: "Select your file"

**Step 3: Assignment**
- Property (dropdown)
- Optional Unit (conditional)
- Assign to Tenant (optional checkbox + picker)
- Helper text: "Where does this live"

**Step 4: Visibility & Sharing**
- Visibility (radio: private, property, unit, tenant-specific)
- Optional sharing with specific users
- Helper text: "Who can see this document"

**Step 5: Review & Confirm**
- Summary of document and settings
- File preview if applicable
- Clear upload button

## Implementation Steps

### Phase 1: Infrastructure & Components

1. **Create Wizard Base Component**
   - File: `components/ui/wizard.tsx` (or `components/wizard/`)
   - Props: `currentStep`, `totalSteps`, `onNext`, `onBack`, `onSubmit`, `canProceed`
   - Features: step counter, progress bar, next/back buttons
   - Mobile-responsive layout (full-width on small screens)

2. **Create Step Container Component**
   - File: `components/wizard/step-container.tsx`
   - Props: `title`, `description`, `children`
   - Consistent formatting for each step

3. **Create Review Step Template**
   - File: `components/wizard/review-step.tsx`
   - Props: `data`, `categories` (groups of fields)
   - Displays data in read-only sections grouped by original steps

4. **Disable Overlay Close**
   - Update modal backdrop to not trigger close
   - Disable ESC key dismissal (or show confirmation dialog)
   - Show warning if trying to leave with unsaved data

### Phase 2: Form Conversion (Priority Order)

5. **Convert Add Tenant Form**
   - File: `components/forms/add-tenant-form-wizard.tsx` (or replace existing)
   - Create 5-step structure as detailed above
   - Preserve current validation logic per step
   - Add progress indicator and step navigation

6. **Convert Add Property Form**
   - File: `components/forms/add-property-form-wizard.tsx`
   - Create 5-step structure as detailed above
   - Handle conditional fields (units visibility on commercial property type)
   - Preserve image upload functionality

7. **Convert Add Expense Form**
   - File: `components/forms/add-expense-form-wizard.tsx`
   - Create 4-step structure as detailed above
   - Handle conditional unit selection

8. **Convert Send Announcement Form**
   - File: `components/forms/send-announcement-form-wizard.tsx`
   - Create 5-step structure as detailed above
   - Handle multi-select and filter logic

9. **Convert Upload Document Form**
   - File: `components/forms/upload-document-form-wizard.tsx`
   - Create 5-step structure as detailed above
   - Handle file upload with progress

### Phase 3: UX & State Management

10. **Form State Management**
    - Use React hooks (useState) or context for preserving state across steps
    - Pattern: single state object with all form fields
    - Option: use React Context for large forms to avoid prop drilling
    - Auto-save to local state after each step validation

11. **Validation per Step**
    - Validate only current step before allowing next
    - Show inline error messages below fields
    - Disable "Next" button if validation fails
    - Clear errors when user corrects input

12. **Progress & Feedback**
    - Add step indicator: "Step 2 of 5"
    - Visual progress bar showing completed steps
    - Subtle animations when moving between steps (fade/slide)

### Phase 4: Integration & Polish

13. **Update Modal Containers**
    - Find all places that open these forms
    - Update to use new wizard versions
    - Test in context of the app

14. **Add Confirmation Dialogs**
    - Show confirmation before submitting
    - Display summary of data being submitted
    - Cancel/Confirm options

15. **Error Handling**
    - Preserve form state if submission fails
    - Show error message with option to retry or go back to specific step
    - Log errors for debugging

## Relevant Files

### UI Components (New to Create)
- `components/ui/wizard.tsx` — Base wizard container with progress
- `components/wizard/step-container.tsx` — Individual step wrapper
- `components/wizard/review-step.tsx` — Review/summary step template
- `components/wizard/progress-indicator.tsx` — Visual progress tracking

### Form Components (To Convert)
- `components/forms/add-tenant-form.tsx` — Currently single-page modal
- `components/forms/add-property-form.tsx` — Currently single-page modal
- `components/forms/add-expense-form.tsx` — Currently single-page modal
- `components/forms/send-announcement-form.tsx` — Currently single-page modal
- `components/forms/upload-document-form.tsx` — Currently single-page modal

## Verification Checklist

1. Each wizard form shows step progress and current step count.
2. Back button returns to prior step without losing data.
3. Forward button validates current step before advancing.
4. Overlay click no longer closes the modal.
5. ESC key does not dismiss the wizard unexpectedly.
6. Submit only occurs on the final step.
7. Summary/review step shows grouped data read-only.
8. Existing modal behavior is preserved for close buttons.
9. Mobile UX is responsive and easy to navigate.
10. All converted forms still submit valid payloads to the backend.

## UX Improvements

- Prevent accidental dismissal by disabling backdrop close.
- Use concise helper text for each step.
- Keep each step short and focused.
- Provide a clear visual sense of progress.
- Preserve entered information while users navigate back and forth.
