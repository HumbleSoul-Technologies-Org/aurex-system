import { apiRequest } from '@/lib/query-client'

export async function fetchNotifications(tenantId?: string, unreadOnly?: boolean, token?: string) {
  const params = new URLSearchParams()
  if (tenantId) params.set('tenantId', tenantId)
  if (unreadOnly) params.set('unreadOnly', 'true')
  const url = `/notifications${params.toString() ? `?${params.toString()}` : ''}`

  try {
    const res = await apiRequest('GET', url, undefined, token)
    return await res.json()
  } catch (error) {
    console.error('fetchNotifications failed', error)
    return []
  }
}

export async function createNotification(payload: { type?: string; tenantId?: string; title: string; body?: string; metadata?: any }, token?: string) {
  try {
    const res = await apiRequest('POST', '/notifications/create', payload, token)
    return await res.json()
  } catch (error) {
    console.error('createNotification failed', error)
    return null
  }
}

export async function markNotificationRead(id: string, token?: string) {
  if (!id) return null
  try {
    const res = await apiRequest('PATCH', '/notifications', { id }, token)
    return await res.json()
  } catch (error) {
    console.error('markNotificationRead failed', error)
    return null
  }
}
