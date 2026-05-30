const BASE_SERVER = process.env.NEXT_PUBLIC_API_URL ? String(process.env.NEXT_PUBLIC_API_URL).replace(/\/$/, '') : ''

function buildExternalUrl(path: string) {
  // If BASE_SERVER is set (external backend), build absolute URL
  if (BASE_SERVER) return `${BASE_SERVER}${path}`
  // otherwise use relative path for Next.js API routes
  return path
}

export async function fetchNotifications(tenantId?: string, unreadOnly?: boolean, token?: string) {
  const basePath = '/notifications'
  const headers: Record<string, string> = {}
  if (token) headers['authorization'] = `Bearer ${token}`

  const makeUrl = (path: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    return new URL(path, origin)
  }

  const externalUrl = makeUrl(buildExternalUrl(basePath))
  const localUrl = makeUrl(`${basePath}?local=true`)
  if (tenantId) {
    externalUrl.searchParams.set('tenantId', tenantId)
    localUrl.searchParams.set('tenantId', tenantId)
  }
  if (unreadOnly) {
    externalUrl.searchParams.set('unreadOnly', 'true')
    localUrl.searchParams.set('unreadOnly', 'true')
  }

  const tryFetch = async (url: URL) => {
    const res = await fetch(url.toString(), { credentials: 'include', headers })
    if (!res.ok) throw new Error(`fetchNotifications failed: ${res.status}`)
    return res.json()
  }

  if (BASE_SERVER) {
    try {
      return await tryFetch(externalUrl)
    } catch (externalError) {
      try {
        return await tryFetch(localUrl)
      } catch (localError) {
        console.error('fetchNotifications failed on external and local fallback', {
          externalError,
          localError,
        })
        return []
      }
    }
  }

  try {
    return await tryFetch(localUrl)
  } catch (error) {
    console.error('fetchNotifications failed', error)
    return []
  }
}

export async function createNotification(payload: { type?: string; tenantId?: string; title: string; body?: string; metadata?: any }, token?: string) {
  // External backend exposes POST /notifications/create
  if (BASE_SERVER) {
    const url = buildExternalUrl('/notifications/create')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['authorization'] = `Bearer ${token}`
    const res = await fetch(url, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
    })
    if (!res.ok) return null
    return res.json()
  }

  // Fallback to Next.js internal route
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['authorization'] = `Bearer ${token}`
  const res = await fetch('/notifications', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  if (!res.ok) return null
  return res.json()
}

export async function markNotificationRead(id: string, token?: string) {
  if (!id) return null
  if (BASE_SERVER) {
    const url = buildExternalUrl(`/notifications/${id}/read`)
    const headers: Record<string, string> = {}
    if (token) headers['authorization'] = `Bearer ${token}`
    const res = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
      headers,
    })
    if (!res.ok) return null
    return res.json()
  }

  // Fallback to Next.js internal route which expects body { id }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['authorization'] = `Bearer ${token}`
  const res = await fetch('/notifications', {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ id }),
  })
  if (!res.ok) return null
  return res.json()
}
