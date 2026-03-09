import { getCollection, insertIntoCollection, updateInCollection } from '@/lib/local-store'
import { addNotification as addServerNotification } from '@/app/lib/server-notifications'

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
  return getCollection<Notification>(NOTIFICATIONS_KEY) || []
}

export function addNotification(notification: Omit<Notification, 'id' | 'date' | 'read'>): Notification {
  const newNotification: Notification = {
    ...notification,
    id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    date: new Date(),
    read: false,
  }

  insertIntoCollection(NOTIFICATIONS_KEY, newNotification)

  // Also add to server notifications for API access
  addServerNotification({
    type: notification.type,
    tenantId: undefined, // adjust if needed
    title: notification.title,
    body: notification.message,
    metadata: { relatedId: notification.relatedId, actionUrl: notification.actionUrl },
  })

  return newNotification
}

export function markAsRead(notificationId: string): void {
  updateInCollection(NOTIFICATIONS_KEY, notificationId, { read: true })
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