import { insertIntoCollection, getCollection, generateId, updateInCollection, removeFromCollection } from '@/lib/local-store'
import { notifyNewMessage } from '@/lib/services/notifications'
import { getUserById } from '@/lib/services/auth'

export interface MessageRecord {
  id: string
  from: string
  to: string
  message: string
  createdAt: string
  seen?: boolean
  replyId?: string
}

export interface ReplyRecord {
  id: string
  reply: string
  createdAt: string
  msgId: string
}

// messages
export function listMessages(): MessageRecord[] {
  return getCollection<MessageRecord>('messages')
}

export function getMessage(id: string): MessageRecord | null {
  return listMessages().find((m) => m.id === id) ?? null
}

export function createMessage(payload: Partial<MessageRecord>): MessageRecord {
  const msg: MessageRecord = {
    id: generateId('msg'),
    from: payload.from || '',
    to: payload.to || '',
    message: payload.message || '',
    createdAt: payload.createdAt ?? new Date().toISOString(),
    seen: payload.seen ?? false,
    replyId: payload.replyId,
  }
  insertIntoCollection('messages', msg)

  // Notify about new message
  const sender = getUserById(msg.from)
  const senderName = sender?.name || 'Unknown User'
  const preview = msg.message.length > 50 ? msg.message.substring(0, 50) + '...' : msg.message
  notifyNewMessage(senderName, preview, msg.id)

  return msg
}

export function updateMessage(id: string, patch: Partial<MessageRecord>): MessageRecord | null {
  return updateInCollection<MessageRecord>('messages', id, patch)
}

export function deleteMessage(id: string): boolean {
  const msg = getMessage(id)
  if (msg && msg.replyId) {
    deleteReply(msg.replyId)
  }
  return removeFromCollection('messages', id)
}

export function markMessageSeen(id: string): MessageRecord | null {
  return updateMessage(id, { seen: true })
}

// replies
export function listReplies(): ReplyRecord[] {
  return getCollection<ReplyRecord>('replies')
}

export function getReply(id: string): ReplyRecord | null {
  return listReplies().find((r) => r.id === id) ?? null
}

export function createReply(payload: Partial<ReplyRecord>): ReplyRecord {
  const rec: ReplyRecord = {
    id: generateId('reply'),
    reply: payload.reply || '',
    createdAt: payload.createdAt ?? new Date().toISOString(),
    msgId: payload.msgId || '',
  }
  insertIntoCollection('replies', rec)
  if (rec.msgId) {
    updateMessage(rec.msgId, { replyId: rec.id })
  }
  return rec
}

export function deleteReply(id: string): boolean {
  const reply = getReply(id)
  if (!reply) return false
  if (reply.msgId) {
    const m = getMessage(reply.msgId)
    if (m && m.replyId === id) {
      updateMessage(m.id, { replyId: undefined })
    }
  }
  return removeFromCollection('replies', id)
}

export function getRepliesForMessage(msgId: string): ReplyRecord[] {
  return listReplies().filter((r) => r.msgId === msgId)
}
