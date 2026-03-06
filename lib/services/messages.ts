import { insertIntoCollection, getCollection, generateId } from '@/lib/local-store'
import { notifyNewMessage } from '@/lib/services/notifications'
import { getUserById } from '@/lib/services/auth'

export interface MessageRecord {
  id: string
  fromUserId: string
  toUserId: string
  propertyId?: string
  body: string
  createdAt: string
  read?: boolean
}

export function listMessages(): MessageRecord[] {
  return getCollection<MessageRecord>('messages')
}

export function createMessage(payload: Partial<MessageRecord>): MessageRecord {
  const msg: MessageRecord = {
    id: generateId('msg'),
    fromUserId: payload.fromUserId || '',
    toUserId: payload.toUserId || '',
    propertyId: payload.propertyId,
    body: payload.body || '',
    createdAt: new Date().toISOString(),
    read: false,
  }
  insertIntoCollection('messages', msg)

  // Notify about new message
  const sender = getUserById(msg.fromUserId)
  const senderName = sender?.name || 'Unknown User'
  const preview = msg.body.length > 50 ? msg.body.substring(0, 50) + '...' : msg.body
  notifyNewMessage(senderName, preview, msg.id)

  return msg
}
