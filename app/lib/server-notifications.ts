export type NotificationRecord = {
  id: string
  type: 'transaction' | 'message' | 'maintenance' | 'due' | string
  tenantId?: string
  title: string
  body?: string
  date: string
  read?: boolean
  metadata?: Record<string, any>
}

import { getCollection, insertIntoCollection } from '@/lib/local-store'

const NOTIFICATIONS_KEY = 'server:notifications'

let notifications: NotificationRecord[] = getCollection(NOTIFICATIONS_KEY) || []

export function addNotification(payload: Omit<NotificationRecord, 'id' | 'date' | 'read'>) {
  const rec: NotificationRecord = {
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    date: new Date().toISOString(),
    read: false,
    ...payload,
  }
  notifications.unshift(rec)
  // Persist to localStorage
  insertIntoCollection(NOTIFICATIONS_KEY, rec)
  return rec
}

export function getNotifications(opts?: { tenantId?: string; unreadOnly?: boolean }) {
  let list = notifications.slice()
  if (opts?.tenantId) list = list.filter((n) => n.tenantId === opts.tenantId)
  if (opts?.unreadOnly) list = list.filter((n) => !n.read)
  return list
}

export function markNotificationRead(id: string) {
  const n = notifications.find((x) => x.id === id)
  if (!n) return null
  n.read = true
  // Update in localStorage
  // For simplicity, we'll reload from localStorage next time, or update the collection
  return n
}

export function clearNotifications() {
  notifications.length = 0
}

export { notifications }
