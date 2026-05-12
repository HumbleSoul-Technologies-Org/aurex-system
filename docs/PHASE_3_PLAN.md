# Phase 3: Admin User Management - PLAN & IMPLEMENTATION

## Overview

Build complete admin user management system with invite functionality, role assignment, and user CRUD operations connected to the backend API.

## Phase 3 Objectives

### 1. User Management Dashboard

- **Location**: `/dashboard/admin/users`
- **Features**:
  - List all users in system
  - Search and filter by role, status
  - View user details
  - Edit user information
  - Delete users
  - Bulk actions

### 2. Admin Invite System

- **Location**: `/dashboard/admin/invite`
- **Features**:
  - Generate invite links
  - Send email invites (template-based)
  - Track invite status
  - Resend invites
  - Invite expiration

### 3. Role Assignment

- **Features in Dashboard**:
  - Assign roles (admin, property_manager, tenant)
  - Lock/unlock accounts
  - Change user status
  - View login attempts

### 4. Email Notifications

- **Backend Integration**:
  - Email service setup (NodeMailer / SendGrid)
  - Welcome emails
  - Invite emails
  - Password reset emails
  - Status update emails

### 5. Admin Settings

- **Location**: `/dashboard/admin/settings`
- **Features**:
  - Manage organization settings
  - Email template configuration
  - System configuration
  - Audit logs

## Implementation Timeline

### Phase 3a: User Management Dashboard (Days 1-2)

- Create admin users page layout
- Implement user listing API integration
- Add search/filter functionality
- Build user detail view modal
- Add edit user form

### Phase 3b: Invite System (Days 3-4)

- Create invite form component
- API integration for invite creation
- Email template setup
- Invite tracking dashboard
- Resend invite functionality

### Phase 3c: Role Management (Days 5-6)

- Role assignment UI in user management
- Bulk role updates
- Permission-based access control
- Role-specific dashboards

### Phase 3d: Email System (Days 7-8)

- Setup email service
- Create email templates
- Notification service integration
- Test email delivery

### Phase 3e: Admin Settings (Days 9-10)

- Settings page for admins
- Email configuration
- System audit logs
- Backup/export functionality

## Component Structure

```
/dashboard/admin/
├── users/
│   ├── page.tsx (User management dashboard)
│   ├── [id]/
│   │   └── page.tsx (User detail page)
│   └── components/
│       ├── user-list-table.tsx
│       ├── user-search-filter.tsx
│       ├── user-detail-modal.tsx
│       └── edit-user-form.tsx
├── invite/
│   ├── page.tsx (Invite management)
│   └── components/
│       ├── invite-form.tsx
│       ├── invite-list.tsx
│       └── resend-invite-button.tsx
└── settings/
    ├── page.tsx (Admin settings)
    └── components/
        ├── email-config.tsx
        ├── system-settings.tsx
        └── audit-logs.tsx
```

## API Endpoints to Use

### User Management (Already implemented)

```
GET    /api/auth/admin/users          - List all users
POST   /api/auth/admin/create-user    - Create admin user
GET    /api/auth/admin/users/:id      - Get user details
PUT    /api/auth/admin/users/:id      - Update user
DELETE /api/auth/admin/users/:id      - Delete user
```

### Admin Invite (To be implemented in backend)

```
POST   /api/auth/admin/invites        - Create invite
GET    /api/auth/admin/invites        - List invites
GET    /api/auth/admin/invites/:id    - Get invite details
POST   /api/auth/admin/invites/:id/resend - Resend invite
DELETE /api/auth/admin/invites/:id    - Delete invite
```

### Email Notifications (To be implemented in backend)

```
POST   /api/notifications/send        - Send notification
GET    /api/notifications/templates   - List templates
POST   /api/notifications/templates   - Create template
PUT    /api/notifications/templates/:id - Update template
```

## Frontend API Client Additions

### File: `lib/services/adminApi.ts` (To create)

```typescript
// User Management
export async function listAdminUsers(options?: {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
});

export async function getAdminUser(userId: string);

export async function updateAdminUser(userId: string, data: any);

export async function deleteAdminUser(userId: string);

export async function createAdminUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "property_manager" | "tenant";
  phone?: string;
});

// Invite Management
export async function createInvite(data: {
  email: string;
  role: string;
  message?: string;
});

export async function listInvites(options?: {
  status?: string;
  page?: number;
  limit?: number;
});

export async function getInvite(inviteId: string);

export async function resendInvite(inviteId: string);

export async function deleteInvite(inviteId: string);
```

## Component Implementation Priorities

### Priority 1 (Critical)

- [ ] User management dashboard
- [ ] User listing with API
- [ ] User detail modal
- [ ] Edit user form

### Priority 2 (Important)

- [ ] Invite form
- [ ] Invite tracking
- [ ] Role assignment UI

### Priority 3 (Nice-to-have)

- [ ] Email configuration
- [ ] Audit logs
- [ ] Bulk operations

## Security Considerations

### Authentication

- ✅ Only admins can access `/dashboard/admin/*`
- ✅ Token validation on all requests
- ✅ Role-based access control

### Authorization

- ✅ Backend validates admin role before operations
- ✅ User can only edit own profile (except admins)
- ✅ Delete operations require confirmation

### Data Protection

- [ ] Audit logs for all admin actions
- [ ] Activity tracking for user modifications
- [ ] Email verification for invites
- [ ] Secure invite link generation

## Database Schema Updates

### Invite Model (Backend - to add)

```javascript
{
  _id: ObjectId,
  email: String,
  role: String,
  inviteToken: String (unique),
  expiresAt: Date,
  sentAt: Date,
  resendCount: Number,
  status: 'pending' | 'accepted' | 'expired',
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### User Model Update (Backend - to add)

```javascript
{
  ...existing fields,
  lastLoginAt: Date,
  loginAttempts: Number,
  isLocked: Boolean,
  lockedUntil: Date,
  inviteToken: String (optional),
  emailVerifiedAt: Date,
  roleAssignedBy: ObjectId (ref: User),
  roleAssignedAt: Date,
  deletedAt: Date (soft delete),
  auditLog: [{
    action: String,
    changedBy: ObjectId,
    changes: Object,
    timestamp: Date
  }]
}
```

## Email Templates

### 1. Admin Invite Email

```
Subject: You're invited to join [App Name] as an Admin

Dear [Name],

You've been invited to join [App Name] as an Administrator.

Click the link below to set your password and activate your account:
[Invite Link]

This link expires in 7 days.

Best regards,
[App Name] Team
```

### 2. User Created Email

```
Subject: Your account has been created on [App Name]

Dear [Name],

Your account has been created as a [Role].

Email: [Email]
Temporary Password: [Password]

Please log in and change your password immediately.

Best regards,
[App Name] Team
```

### 3. Role Changed Email

```
Subject: Your role has been updated on [App Name]

Dear [Name],

Your role has been changed to [New Role].

If you have any questions, please contact support.

Best regards,
[App Name] Team
```

## Testing Checklist - Phase 3a (User Management)

- [ ] Admin can view list of all users
- [ ] Search filters users by email/name
- [ ] Role filter shows only selected role
- [ ] Status filter works (active/inactive/locked)
- [ ] Click user opens detail modal
- [ ] Edit form updates user information
- [ ] Delete user confirms before removal
- [ ] Pagination works for large user lists
- [ ] Loading states display properly
- [ ] Error messages show for API failures

## Testing Checklist - Phase 3b (Invite System)

- [ ] Admin can create invite
- [ ] Email validation works
- [ ] Role selection works
- [ ] Invite list displays all pending invites
- [ ] Resend invite button works
- [ ] Invite expiration works (7 days)
- [ ] Delete invite removes from list
- [ ] Email is sent on invite creation
- [ ] Invite link is unique and secure

## Testing Checklist - Phase 3c (Role Management)

- [ ] Admin can change user role
- [ ] Bulk role changes work
- [ ] Lock/unlock account works
- [ ] Status changes reflect immediately
- [ ] Audit log records changes

## Dependencies

### Frontend

```json
{
  "react-table": "^8.x.x",
  "date-fns": "^2.x.x",
  "next-intl": "^3.x.x"
}
```

### Backend

```json
{
  "nodemailer": "^6.x.x",
  "email-templates": "^11.x.x",
  "uuid": "^9.x.x"
}
```

## Success Criteria

- ✅ Admin can manage all users (CRUD)
- ✅ Invite system functional and tested
- ✅ Role assignment working correctly
- ✅ Email notifications being sent
- ✅ Audit logs recording changes
- ✅ All error cases handled
- ✅ UI/UX is intuitive and responsive
- ✅ Performance acceptable for 1000+ users

## Rollout Plan

### Pre-Launch

1. Complete Phase 3 development
2. Comprehensive testing
3. Security audit
4. Performance testing

### Launch

1. Deploy backend changes
2. Deploy frontend changes
3. Seed initial admin users
4. Monitor for issues

### Post-Launch

1. Gather user feedback
2. Monitor performance
3. Plan improvements for Phase 4

## Phase 3 Completion Criteria

All of the following must be true:

- [ ] User management dashboard deployed and tested
- [ ] Invite system working end-to-end
- [ ] Role assignment functional
- [ ] Email notifications sending correctly
- [ ] Admin settings page completed
- [ ] Audit logs recording changes
- [ ] All tests passing
- [ ] Documentation updated
- [ ] No security vulnerabilities

---

**Status**: 🟡 Planning Phase  
**Target Completion**: Upon successful Phase 3 implementation  
**Next Phase**: Phase 4 - Migration & Testing
