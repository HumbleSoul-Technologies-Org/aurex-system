import { NextResponse } from 'next/server'
import { addNotification, getNotifications, markNotificationRead } from '@/app/lib/server-notifications'
import { requireAuth } from '@/lib/middleware/jwt'

const BASE_SERVER = process.env.NEXT_PUBLIC_API_URL ? String(process.env.NEXT_PUBLIC_API_URL).replace(/\/$/, '') : ''

function buildUrl(path: string) {
  if (!BASE_SERVER) return path
  return `${BASE_SERVER}${path}`
}

function forwardHeaders(request: Request) {
  const headers: Record<string, string> = {}
  const auth = request.headers.get('authorization')
  const cookie = request.headers.get('cookie')
  if (auth) headers['authorization'] = auth
  if (cookie) headers['cookie'] = cookie
  return headers
}

export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (!auth.ok) return auth.response

  const url = new URL(request.url)
  const tenantId = url.searchParams.get('tenantId') || undefined
  const unreadOnly = url.searchParams.get('unreadOnly') === 'true'
  const forceLocal = url.searchParams.get('local') === 'true'

  if (BASE_SERVER && !forceLocal) {
    const q = new URLSearchParams()
    if (tenantId) q.set('tenantId', tenantId)
    if (unreadOnly) q.set('unreadOnly', 'true')
    const forwardUrl = buildUrl(`/notifications?${q.toString()}`)
    const res = await fetch(forwardUrl, { headers: forwardHeaders(request) })
    const data = await res.json().catch(() => [])
    return NextResponse.json(data, { status: res.status })
  }

  const list = getNotifications({ tenantId, unreadOnly })
  return NextResponse.json(list)
}

export async function POST(request: Request) {
  const auth = requireAuth(request, ['admin', 'property_manager'])
  if (!auth.ok) return auth.response

  const url = new URL(request.url)
  const forceLocal = url.searchParams.get('local') === 'true'

  if (BASE_SERVER && !forceLocal) {
    const body = await request.json().catch(() => null)
    if (!body || !body.title) return NextResponse.json({ error: 'Missing title' }, { status: 400 })
    const forwardUrl = buildUrl('/notifications/create')
    const res = await fetch(forwardUrl, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        ...forwardHeaders(request),
        'content-type': 'application/json',
      },
    })
    const data = await res.json().catch(() => ({ error: 'Invalid response' }))
    return NextResponse.json(data, { status: res.status })
  }

  try {
    const body = await request.json()
    if (!body || !body.title) return NextResponse.json({ error: 'Missing title' }, { status: 400 })
    const created = addNotification({
      type: body.type || 'transaction',
      tenantId: body.tenantId,
      title: body.title,
      body: body.body,
      metadata: body.metadata,
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  const auth = requireAuth(request)
  if (!auth.ok) return auth.response

  const url = new URL(request.url)
  const forceLocal = url.searchParams.get('local') === 'true'

  if (BASE_SERVER && !forceLocal) {
    const body = await request.json().catch(() => null)
    const id = body?.id
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const forwardUrl = buildUrl('/notifications/' + encodeURIComponent(id) + '/read')
    const res = await fetch(forwardUrl, {
      method: 'PATCH',
      headers: {
        ...forwardHeaders(request),
        'content-type': 'application/json',
      },
    })
    const data = await res.json().catch(() => ({ error: 'Invalid response' }))
    return NextResponse.json(data, { status: res.status })
  }

  try {
    const body = await request.json()
    const id = body?.id
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const updated = markNotificationRead(id)
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}
