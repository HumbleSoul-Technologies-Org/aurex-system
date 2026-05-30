import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware/jwt'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5454/api'

async function forward(path: string, req: Request, init?: RequestInit) {
  const url = `${API_BASE}${path}`
  const headers = new Headers(init?.headers as HeadersInit)
  const auth = req.headers.get('authorization')
  const cookie = req.headers.get('cookie')
  if (auth) headers.set('authorization', auth)
  if (cookie) headers.set('cookie', cookie)

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: 'include',
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

export async function POST(req: Request) {
  const auth = requireAuth(req, ['admin', 'property_manager'])
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const result = await forward('/expenses/create', req, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return NextResponse.json(result.data, { status: result.status })
  } catch (err) {
    console.error('Expenses POST proxy error', err)
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const auth = requireAuth(req)
  if (!auth.ok) return auth.response

  try {
    const url = new URL(req.url)
    const propertyId = url.searchParams.get('propertyId')
    const tenantId = url.searchParams.get('tenantId')
    let forwardPath = `/expenses`

    if (propertyId) {
      forwardPath = `/expenses/property/${encodeURIComponent(propertyId)}/all`
    } else if (tenantId) {
      forwardPath = `/expenses/tenant/${encodeURIComponent(tenantId)}/all`
    } else {
      const query = url.search ? `?${url.searchParams.toString()}` : ''
      forwardPath = `/expenses${query}`
    }

    const result = await forward(forwardPath, req)
    return NextResponse.json(result.data, { status: result.status })
  } catch (err) {
    console.error('Expenses GET proxy error', err)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const auth = requireAuth(req, ['admin', 'property_manager'])
  if (!auth.ok) return auth.response

  try {
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop() || ''
    const body = await req.json()
    const result = await forward(`/expenses/${id}/update`, req, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return NextResponse.json(result.data, { status: result.status })
  } catch (err) {
    console.error('Expenses PUT proxy error', err)
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const auth = requireAuth(req, ['admin', 'property_manager'])
  if (!auth.ok) return auth.response

  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id') || url.pathname.split('/').pop() || ''
    const result = await forward(`/expenses/${encodeURIComponent(id)}/delete`, req, {
      method: 'DELETE',
    })
    return NextResponse.json(result.data, { status: result.status })
  } catch (err) {
    console.error('Expenses DELETE proxy error', err)
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}
