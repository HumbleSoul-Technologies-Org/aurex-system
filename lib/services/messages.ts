import { apiRequest } from '@/lib/query-client'

// Unified message schema: use explicit fromUserId/toUserId (IDs) instead of magic strings
export interface MessageRecord {
  id: string
  fromUserId?: string        // sender user ID
  toUserId?: string          // recipient user ID (optional; can use role-based routing)
  tenantId?: string          // tenant context
  propertyId?: string        // property context
  to?: string                // legacy: recipient display name/email (deprecated; prefer toUserId)
  subject?: string
  message: string
  seen?: boolean
  replyId?: string           // ObjectId of linked Reply
  createdBy?: string         // legacy: creator (deprecated; prefer fromUserId)
  createdAt?: string
  updatedAt?: string
}

export interface ReplyRecord {
  id: string
  reply: string
  msgId: string              // message ObjectId
  createdBy?: string
  createdAt?: string
}

// Create message with explicit sender/recipient IDs
export async function createMessageApi(payload: Partial<MessageRecord>, token?: string) {
  const res = await apiRequest('POST', '/messages/create', payload, token)
  const json = await res.json()
  const m = json.message || json
  return { ...m, id: m.id || m._id } as MessageRecord
}

// Get all messages for a tenant (inbox + sent + announcements)
export async function getMessagesByTenant(tenantId: string, token?: string) {
  const res = await apiRequest('GET', `/messages/tenant/${tenantId}/all`, undefined, token)
  const json = await res.json()
  return (json || []).map((m: any) => ({ ...m, id: m.id || m._id })) as MessageRecord[]
}

// Get single message by ID
export async function getMessageById(id: string, token?: string) {
  const res = await apiRequest('GET', `/messages/${id}`, undefined, token)
  const json = await res.json()
  const m = json.message || json
  return { ...m, id: m.id || m._id } as MessageRecord
}

// Update message (e.g., mark seen)
export async function updateMessageApi(id: string, patch: Partial<MessageRecord>, token?: string) {
  const res = await apiRequest('PUT', `/messages/${id}/update`, patch, token)
  const json = await res.json()
  const m = json.message || json
  return { ...m, id: m.id || m._id } as MessageRecord
}

// Delete message
export async function deleteMessageApi(id: string, token?: string) {
  const res = await apiRequest('DELETE', `/messages/${id}/delete`, undefined, token)
  const json = await res.json()
  return res.ok && (json?.message || json?.success)
}

// Create reply to a message and link it via replyId
export async function createReplyApi(messageId: string, payload: { reply: string; createdBy?: string }, token?: string) {
  const res = await apiRequest('POST', `/messages/${messageId}/reply`, payload, token)
  const json = await res.json()
  return { ...json.reply, id: json.reply?.id || json.reply?._id } as ReplyRecord
}

// Get all replies for a message
export async function getRepliesForMessage(messageId: string, token?: string) {
  const res = await apiRequest('GET', `/messages/${messageId}/replies`, undefined, token)
  const json = await res.json()
  return (json || []).map((r: any) => ({ ...r, id: r.id || r._id })) as ReplyRecord[]
}


