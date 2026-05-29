import { NextResponse } from 'next/server'

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
  try {
    const body = await req.json()
    const result = await forward('/payments/create', req, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return NextResponse.json(result.data, { status: result.status })
  } catch (err) {
    console.error('Payments POST proxy error', err)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const propertyId = url.searchParams.get('propertyId')
    const tenantId = url.searchParams.get('tenantId')
    let forwardPath = `/payments`

    if (propertyId) {
      forwardPath = `/payments/property/${encodeURIComponent(propertyId)}/all`
    } else if (tenantId) {
      forwardPath = `/payments/tenant/${encodeURIComponent(tenantId)}/all`
    } else {
      const query = url.search ? `?${url.searchParams.toString()}` : ''
      forwardPath = `/payments${query}`
    }

    const result = await forward(forwardPath, req)
    return NextResponse.json(result.data, { status: result.status })
  } catch (err) {
    console.error('Payments GET proxy error', err)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop() || ''
    const body = await req.json()
    const result = await forward(`/payments/${id}`, req, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return NextResponse.json(result.data, { status: result.status })
  } catch (err) {
    console.error('Payments PUT proxy error', err)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}
