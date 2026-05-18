import { apiRequest } from '@/lib/query-client'

export interface MessageRecord {
  id: string
  fromUserId?: string
  tenantId?: string
  propertyId?: string
  to?: string
  subject?: string
  message: string
  seen?: boolean
  replyId?: string
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export async function createMessageApi(payload: Partial<MessageRecord>, token?: string) {
  const res = await apiRequest('POST', '/messages/create', payload, token)
  const json = await res.json()
  const m = json.message || json
  return { ...m, id: m.id || m._id } as MessageRecord
}

export async function getMessagesByTenant(tenantId: string, token?: string) {
  const res = await apiRequest('GET', `/messages/tenant/${tenantId}/all`, undefined, token)
  const json = await res.json()
  return (json || []).map((m: any) => ({ ...m, id: m.id || m._id })) as MessageRecord[]
}

export async function getMessageById(id: string, token?: string) {
  const res = await apiRequest('GET', `/messages/${id}`, undefined, token)
  const json = await res.json()
  const m = json.message || json
  return { ...m, id: m.id || m._id } as MessageRecord
}

export async function updateMessageApi(id: string, patch: Partial<MessageRecord>, token?: string) {
  const res = await apiRequest('PUT', `/messages/${id}/update`, patch, token)
  const json = await res.json()
  const m = json.message || json
  return { ...m, id: m.id || m._id } as MessageRecord
}

export async function deleteMessageApi(id: string, token?: string) {
  const res = await apiRequest('DELETE', `/messages/${id}/delete`, undefined, token)
  const json = await res.json()
  return res.ok && (json?.message || json?.success)
}

export async function createReplyApi(messageId: string, payload: { reply: string; createdBy?: string }, token?: string) {
  const res = await apiRequest('POST', `/messages/${messageId}/reply`, payload, token)
  const json = await res.json()
  return json.reply
}

export async function getRepliesForMessage(messageId: string, token?: string) {
  const res = await apiRequest('GET', `/messages/${messageId}/replies`, undefined, token)
  const json = await res.json()
  return (json || []).map((r: any) => ({ ...r, id: r.id || r._id }))
}
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
  // optional subject line stored with the message
  subject?: string
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


