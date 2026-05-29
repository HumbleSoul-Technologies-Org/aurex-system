import { getCollection } from '@/lib/local-store'
import { fetchNotifications, createNotification, markNotificationRead } from '@/app/lib/notifications-client'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'property' | 'maintenance' | 'message' | 'payment' | 'general'
  read: boolean
  date: Date
  actionUrl?: string
  relatedId?: string // ID of related entity (property, maintenance request, etc.)
}

const NOTIFICATIONS_KEY = 'notifications'

// Initialize with empty array if not exists
if (!getCollection<Notification>(NOTIFICATIONS_KEY)) {
  // Initialize empty collection
}

export function getNotifications(): Notification[] {
  // Try server first; fall back to local-store synchronous collection
  // Note: fetchNotifications is async; for legacy synchronous callers we return local-store immediately and
  // consumers should call `loadNotifications` from context to refresh from server.
  return getCollection<Notification>(NOTIFICATIONS_KEY) || []
}

export function addNotification(notification: Omit<Notification, 'id' | 'date' | 'read'>): Notification {
  const newNotification: Notification = {
    ...notification,
    id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    date: new Date(),
    read: false,
  }

  // persist locally for immediate UI responsiveness
  try {
    const existing = getCollection<Notification>(NOTIFICATIONS_KEY) || []
    existing.unshift(newNotification)
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(existing))
  } catch (e) {
    console.error('Failed to persist local notification', e)
  }

  // async send to server (best-effort)
  createNotification({
    type: notification.type,
    tenantId: undefined,
    title: notification.title,
    body: notification.message,
    metadata: { relatedId: notification.relatedId, actionUrl: notification.actionUrl },
  }).catch((e) => console.error('Failed to create server notification', e))

  return newNotification
}

export function markAsRead(notificationId: string): void {
  try {
    const notifications = getCollection<Notification>(NOTIFICATIONS_KEY) || []
    const updated = notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
  } catch (e) {
    console.error('Failed to mark local notification read', e)
  }

  markNotificationRead(notificationId).catch((e) => console.error('Failed to mark server notification read', e))
}

export function markAllAsRead(): void {
  const notifications = getNotifications()
  notifications.forEach(notification => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
  })
}

export function deleteNotification(notificationId: string): void {
  // For local storage, we'll need to filter and re-save
  const notifications = getNotifications().filter(n => n.id !== notificationId)
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
}

export function getUnreadCount(): number {
  return getNotifications().filter(n => !n.read).length
}

// Specific notification creators
export function notifyNewProperty(propertyName: string, propertyId: string): void {
  addNotification({
    title: 'New Property Added',
    message: `Property "${propertyName}" has been successfully added to your portfolio.`,
    type: 'property',
    actionUrl: `/dashboard/properties/${propertyId}`,
    relatedId: propertyId,
  })
  // Refresh notifications in UI
  if (typeof window !== 'undefined' && (window as any).refreshNotifications) {
    (window as any).refreshNotifications();
  }
}

export function notifyNewMaintenanceRequest(description: string, propertyName: string, requestId: string): void {
  addNotification({
    title: 'New Maintenance Request',
    message: `${description} - ${propertyName}`,
    type: 'maintenance',
    actionUrl: '/dashboard/maintenance',
    relatedId: requestId,
  })
  // Refresh notifications in UI
  if (typeof window !== 'undefined' && (window as any).refreshNotifications) {
    (window as any).refreshNotifications();
  }
}

export function notifyNewMessage(senderName: string, preview: string, messageId?: string): void {
  addNotification({
    title: 'New Message Received',
    message: `${senderName}: ${preview}`,
    type: 'message',
    actionUrl: '/dashboard/communications',
    relatedId: messageId,
  })
  // Refresh notifications in UI
  if (typeof window !== 'undefined' && (window as any).refreshNotifications) {
    (window as any).refreshNotifications();
  }
}

export function notifyNewTenant(tenantName: string, propertyName: string, tenantId: string): void {
  addNotification({
    title: 'New Tenant Added',
    message: `Tenant "${tenantName}" has been added to property "${propertyName}".`,
    type: 'general',
    actionUrl: `/dashboard/tenants/${tenantId}`,
    relatedId: tenantId,
  })
  // Refresh notifications in UI
  if (typeof window !== 'undefined' && (window as any).refreshNotifications) {
    (window as any).refreshNotifications();
  }
}