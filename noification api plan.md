# Notification API Plan

## Backend Plan

### Goal

Add a real MongoDB-backed notifications feature in `ten-server` so notifications persist and can be queried from the frontend.

### What to add

1. `ten-server/models/Notification.js`
   - Create a Mongoose schema with fields:
     - `title`
     - `body`
     - `type`
     - `tenantId`
     - `createdBy`
     - `actionUrl`
     - `metadata`
     - `read`
     - `readAt`
     - timestamps
   - Add indexes on `tenantId`, `createdAt`, and `read`
   - Use the same style as `User.js`

2. `ten-server/models/index.js`
   - Export `Notification` from the model index

3. `ten-server/controllers/notificationController.js`
   - Create a controller class, ideally extending `BaseController`
   - Add methods:
     - `createNotification`
       - authenticated
       - build a notification doc
       - save to DB
       - return JSON success + created record
     - `listNotifications`
       - authenticated
       - filter by `tenantId`, `unreadOnly`, `type`
       - support pagination via query params
     - `markNotificationRead`
       - authenticated
       - update `read: true` and `readAt`
     - optionally `markAllAsRead`
   - Follow existing error/response structure used by other controllers

4. `ten-server/routes/notificationRoutes.js`
   - Add route file with Express router
   - Mount routes:
     - `GET /` → `notificationController.listNotifications`
     - `POST /` → `notificationController.createNotification`
     - `PATCH /:id/read` or `PATCH /` with `{ id }` body → `notificationController.markNotificationRead`
   - Protect with `authenticate`
   - Optionally use `authorize('admin')` for admin-only create endpoints if desired

5. `ten-server/server.js`
   - Import and mount route:
     - `const notificationRoutes = require('./routes/notificationRoutes');`
     - `app.use('/api/notifications', notificationRoutes);`

6. Optional validation
   - Add `notificationValidators` in `ten-server/middleware/validators`
   - Validate required fields like `title`, `type`, `tenantId` when needed
   - Use existing `handleValidationErrors` pattern

7. Optional services wiring
   - If backend should generate notifications internally on events, plan a service layer or hook from controllers like `transactionController`, `tenantController`, `messageController`

### Why this fits

- Backend already uses Express + Mongoose and JWT auth
- Route naming will match the frontend expectation (`/api/notifications`)
- Protecting with `authenticate` keeps notifications tied to real user/tenant identity

---

## Client Plan

### Goal

Switch the front-end notification flow from local mock storage to the real backend notification API.

### What to change

1. `app/lib/notifications-client.ts`
   - Update URL construction to backend:
     - call `NEXT_PUBLIC_API_URL/notifications` instead of relative local route if using direct backend access
   - Add `Authorization: Bearer <token>` header using the existing token manager
   - Keep methods:
     - `fetchNotifications(tenantId?, unreadOnly?)`
     - `createNotification(payload)`
     - `markNotificationRead(id)`

2. `components/ui/notification-bell.tsx`
   - Keep the existing refresh and read flow
   - Ensure it fetches from the backend API
   - Continue using `refresh()` after `markNotificationRead`

3. `lib/services/notifications.ts`
   - Replace the local storage-based notification persistence with backend API calls, or convert it into a thin adapter over `notifications-client`
   - If you want a migration path, keep the same interface but let it:
     - create notifications via backend
     - optionally cache UI state locally if needed

4. Event producers
   - Update calls like `notifyNewProperty`, `notifyNewMaintenanceRequest`, `notifyNewMessage`, `notifyNewTenant`
   - Instead of only writing to localStorage, call backend `createNotification` API
   - For now, keep client-side refresh logic after creation

5. Authentication handling
   - Ensure all notification API calls use the same JWT token flow as other authenticated requests
   - Use `getAuthToken()` from `@/lib/token-manager` or equivalent

6. Route shape decision
   - Prefer RESTful routes:
     - `GET /notifications`
     - `POST /notifications`
     - `PATCH /notifications/:id/read`
   - If you keep the existing shape, update `markNotificationRead` to match the backend route

### Recommended client architecture

- `app/lib/notifications-client.ts` = transport layer
- `lib/services/notifications.ts` = application logic / event triggers
- `components/ui/notification-bell.tsx` = UI renderer

---

## Next-step summary

### Backend

- add notification model
- add notification controller
- add notification routes
- mount route in `server.js`
- protect routes with JWT auth

### Frontend

- point notification client at backend API
- include auth header
- replace local-storage notification persistence
- update notification UI to use backend data
