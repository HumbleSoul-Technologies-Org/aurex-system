# Admin Panel Quick Start Guide

## Accessing the Admin Panel

### Prerequisites

- You must be logged in as an admin user
- Backend server must be running on port 5555
- Frontend running on port 3000

### Login Steps

1. Navigate to: `http://localhost:3000/auth/login`
2. Enter credentials:
   - **Email**: admin@example.com
   - **Password**: Admin@1234
3. Click "Sign In"
4. You'll be redirected to the admin dashboard

### Direct Navigation

Once logged in as admin, navigate to: `http://localhost:3000/dashboard/admin/users`

## Admin Panel Overview

### Main Sections

#### 1. Users Management (`/dashboard/admin/users`)

**Purpose**: Manage all system users

**Features**:

- 📋 View all users in a table
- 🔍 Search by name or email
- 🏷️ Filter by role (Admin, Property Manager, Tenant)
- ✓ Filter by status (Active, Inactive, Locked)
- 👁️ View user details
- ✏️ Edit user information
- ➕ Create new users

**How to Create a User**:

1. Click "Create User" button (top right)
2. Fill in form:
   - First Name
   - Last Name
   - Email
   - Phone (optional)
   - Role (dropdown)
3. Click "Create User"
4. User receives temporary password via email
5. New user appears in the list

**How to Edit a User**:

1. Find user in list
2. Click the "Edit" button (pencil icon)
3. Modify any fields
4. Click "Save Changes"

**How to View User Details**:

1. Find user in list
2. Click the "Eye" button
3. Modal shows full user information

---

#### 2. Invites (`/dashboard/admin/invite`)

**Purpose**: Invite new users to the system

**Features**:

- 📧 Send invite emails
- 🔗 Generate invite links
- 📋 Select user role
- 💬 Add optional message
- 📋 Copy invite link
- ⏱️ Invites expire in 7 days

**How to Send an Invite**:

1. Navigate to: `http://localhost:3000/dashboard/admin/invite`
2. Fill in the form:
   - **Email Address**: Recipient's email
   - **Role**: Select role (Admin, Property Manager, Tenant)
   - **Message**: Optional personal message
3. Click "Send Invite"
4. Success message appears
5. Copy the generated invite link if needed
6. User receives email with invite

**What Happens**:

- Email is sent to the user with an invite link
- Link is valid for 7 days
- User clicks link to set password
- User account is created with selected role

---

#### 3. Settings (`/dashboard/admin/settings`)

**Purpose**: Configure system settings

**Tabs Available**:

**📋 General**

- Organization name
- Admin email
- Basic configuration

**📧 Email**

- Email provider selection (SMTP, SendGrid, Mailgun)
- SMTP configuration (if selected)
- Connection details

**🔔 Notifications**

- Toggle all email notifications
- Toggle specific notification types:
  - Invite emails
  - Welcome emails
  - Password reset emails

**🔐 Security**

- Account lockout policy (info-only)
- Password requirements (info-only)
- Token expiry settings (info-only)

**📊 Audit Logs** (Coming Soon)

- Track admin actions
- User activity logs
- System events

---

## User Roles Explained

### Admin

- **Access**: Full system access
- **Can do**: Manage users, send invites, configure settings
- **View**: All sections of admin panel

### Property Manager

- **Access**: Property and tenant management
- **Can do**: Manage properties, manage tenant assignments
- **View**: Properties, tenants, transactions

### Tenant

- **Access**: Personal tenant portal
- **Can do**: View payments, submit maintenance requests
- **View**: Own lease, payments, messages

---

## Common Tasks

### Task: Add a New Property Manager

1. Go to: `/dashboard/admin/users`
2. Click "Create User"
3. Fill in details:
   - Name
   - Email
   - Phone
   - Role: "Property Manager"
4. Click "Create User"
5. Manager receives temporary password
6. Manager can login and change password

### Task: Lock a User Account

1. Go to: `/dashboard/admin/users`
2. Find the user
3. Click "Edit"
4. Change Status to "Locked"
5. Click "Save Changes"
6. User cannot login until unlocked

### Task: Invite Multiple Users

1. Go to: `/dashboard/admin/invite`
2. For each user:
   - Enter email
   - Select role
   - Add message (optional)
   - Click "Send Invite"
3. Each user receives invite email separately

### Task: Change User Role

1. Go to: `/dashboard/admin/users`
2. Find user
3. Click "Edit"
4. Change Role dropdown
5. Click "Save Changes"
6. User's role is updated immediately

### Task: Search for a Specific User

1. Go to: `/dashboard/admin/users`
2. Use search box: type name or email
3. Results update in real-time
4. Results show matching users

### Task: Filter Users by Status

1. Go to: `/dashboard/admin/users`
2. Click Status dropdown
3. Select: "Active", "Inactive", or "Locked"
4. Table updates to show only selected status

---

## Sidebar Navigation

The admin sidebar (left side) contains:

| Icon | Label     | Location                    |
| ---- | --------- | --------------------------- |
| 📊   | Dashboard | `/dashboard`                |
| 👥   | Users     | `/dashboard/admin/users`    |
| 📧   | Invites   | `/dashboard/admin/invite`   |
| ⚙️   | Settings  | `/dashboard/admin/settings` |

**User Info Box** at bottom shows:

- Your name
- Your email
- Logout button

---

## Important Notes

### Security

- ✅ Only admins can access `/dashboard/admin/*`
- ✅ All API calls use secure JWT tokens
- ✅ Passwords are hashed with bcrypt
- ✅ Login attempts are tracked (5 max, 2-min lockout)

### Email Notifications

- ✅ New user creation sends welcome email
- ✅ Invite creation sends invite email
- ✅ Password reset sends reset email
- ✅ All emails contain secure links

### Temporary Passwords

- When you create a user, a temporary password is generated
- The password is sent via email to the user
- User must change password on first login
- Password must have: 8+ chars, uppercase, lowercase, number

### Data Privacy

- User data is only shown to admins
- Search/filter happens on backend
- No sensitive data in URL
- Forms don't cache passwords

---

## Troubleshooting

### Can't Access Admin Panel

**Problem**: Getting redirected to regular dashboard
**Solution**:

- Ensure you're logged in as admin user
- Check email is admin@example.com (or admin account)
- Verify token is valid (refresh page)

### User Creation Fails

**Problem**: "Failed to create user" error
**Solution**:

- Check email format is valid
- Verify email isn't already used
- Ensure backend is running
- Check API_URL in environment

### Invites Not Sending

**Problem**: Email not received by user
**Solution**:

- Check email configuration in settings
- Verify backend email service is set up
- Check spam folder
- Try resending invite

### Search Not Working

**Problem**: Search doesn't filter users
**Solution**:

- Type slowly (search is debounced)
- Use name or email (only fields searched)
- Clear search to see all users
- Refresh page

---

## User Types Reference

### Creating Different User Types

**Admin**

- Email: admin2@example.com
- Role: Admin
- Can access admin panel

**Property Manager**

- Email: manager@example.com
- Role: Property Manager
- Can manage properties

**Tenant**

- Email: tenant@example.com
- Role: Tenant
- Can view own data only

---

## Default Test Credentials

Use these to test the system:

```
Admin User:
  Email: admin@example.com
  Password: Admin@1234
  Role: Admin

Property Manager:
  Email: property-manager@example.com
  Password: Manager@1234
  Role: Property Manager

Tenant:
  Email: tenant@example.com
  Password: Tenant@1234
  Role: Tenant
```

---

## API Endpoints (For Reference)

### User Management

```
GET    /api/auth/admin/users           - List all users
POST   /api/auth/admin/create-user     - Create user
GET    /api/auth/admin/users/{id}      - Get user details
PUT    /api/auth/admin/users/{id}      - Update user
DELETE /api/auth/admin/users/{id}      - Delete user
```

### Authentication (General)

```
POST   /api/auth/login                 - User login
POST   /api/auth/register              - User registration
GET    /api/auth/me                    - Get current user
```

---

## What's Coming Next

- **Phase 3b**: Role management and bulk operations
- **Phase 3c**: Email template management
- **Phase 3d**: Audit logs and activity tracking
- **Phase 4**: User migration and comprehensive testing

---

## Need Help?

For issues or questions:

1. Check browser console (F12)
2. Check server logs (terminal window)
3. Verify configuration in `.env.local`
4. Review error messages for clues
5. Check documentation files in `/docs`

---

**Admin Panel Ready to Use!** 🚀

Last Updated: May 11, 2026
