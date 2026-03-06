export async function fetchNotifications(tenantId?: string, unreadOnly?: boolean) {
  const url = new URL('/api/notifications', location.origin)
  if (tenantId) url.searchParams.set('tenantId', tenantId)
  if (unreadOnly) url.searchParams.set('unreadOnly', 'true')
  const res = await fetch(url.toString())
  if (!res.ok) return []
  return res.json()
}

export async function createNotification(payload: { type?: string; tenantId?: string; title: string; body?: string; metadata?: any }) {
  const res = await fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) return null
  return res.json()
}

export async function markNotificationRead(id: string) {
  const res = await fetch('/api/notifications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
  if (!res.ok) return null
  return res.json()
}
