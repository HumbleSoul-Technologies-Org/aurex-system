import { insertIntoCollection, getCollection, generateId, updateInCollection } from '@/lib/local-store'

export interface AnnouncementRecord {
  id: string
  title: string
  message: string
  recipients: string
  priority: string
  scheduledDate?: string
  propertyId?: string
  tenantSelectionMode?: string
  tenantIds: string[]
  createdAt: string
  sentAt?: string
  readBy: string[] // array of tenantIds who have read the announcement
}

// announcements
export function listAnnouncements(): AnnouncementRecord[] {
  return getCollection<AnnouncementRecord>('announcements')
}

export function getAnnouncement(id: string): AnnouncementRecord | null {
  return listAnnouncements().find((a) => a.id === id) ?? null
}

export function createAnnouncement(payload: Partial<AnnouncementRecord>): AnnouncementRecord {
  const announcement: AnnouncementRecord = {
    id: generateId('ann'),
    title: payload.title || '',
    message: payload.message || '',
    recipients: payload.recipients || 'all',
    priority: payload.priority || 'normal',
    scheduledDate: payload.scheduledDate,
    propertyId: payload.propertyId,
    tenantSelectionMode: payload.tenantSelectionMode,
    tenantIds: payload.tenantIds || [],
    createdAt: payload.createdAt ?? new Date().toISOString(),
    sentAt: payload.sentAt ?? new Date().toISOString(),
    readBy: payload.readBy || [],
  }
  insertIntoCollection('announcements', announcement)
  return announcement
}

export function markAnnouncementRead(announcementId: string, tenantId: string): void {
  const announcement = getAnnouncement(announcementId)
  if (announcement && !announcement.readBy.includes(tenantId)) {
    announcement.readBy.push(tenantId)
    updateInCollection('announcements', announcementId, { readBy: announcement.readBy })
  }
}

export function updateAnnouncement(id: string, updates: Partial<AnnouncementRecord>): AnnouncementRecord | null {
  const announcement = getAnnouncement(id)
  if (announcement) {
    const updated = { ...announcement, ...updates }
    updateInCollection('announcements', id, updates)
    return updated
  }
  return null
}

export function deleteAnnouncement(id: string): boolean {
  const collection = getCollection<AnnouncementRecord>('announcements')
  const idx = collection.findIndex((a) => a.id === id)
  if (idx !== -1) {
    collection.splice(idx, 1)
    return true
  }
  return false
}