import { NextResponse } from 'next/server'
import { addNotification, getNotifications, markNotificationRead } from '@/app/lib/server-notifications'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const tenantId = url.searchParams.get('tenantId') || undefined
  const unreadOnly = url.searchParams.get('unreadOnly') === 'true'
  const list = getNotifications({ tenantId, unreadOnly })
  return NextResponse.json(list)
}

export async function POST(request: Request) {
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
