import { NextResponse } from 'next/server'
import { insertIntoCollection, getCollection, updateInCollection, generateId } from '@/lib/local-store'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const now = new Date().toISOString()
    const id = generateId('pay')
    const payment = {
      id,
      tenantId: body.tenantId,
      propertyId: body.propertyId,
      leaseId: body.leaseId || null,
      amount: body.amount,
      currency: body.currency || 'USD',
      monthlyRent: body.monthlyRent ?? null,
      paymentMethod: body.paymentMethod || 'manual',
      paymentDate: body.paymentDate || now,
      recordedBy: body.recordedBy || null,
      recordedAt: now,
      reference: body.reference || null,
      receiptUrl: body.receiptUrl || null,
      status: body.status || 'recorded',
      notes: body.notes || null,
      createdAt: now,
      updatedAt: now,
    }

    insertIntoCollection('payments', payment)

    return NextResponse.json({ payment }, { status: 201 })
  } catch (err) {
    console.error('Payments POST error', err)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const tenantId = url.searchParams.get('tenantId')
    const propertyId = url.searchParams.get('propertyId')

    let payments = getCollection('payments')

    if (tenantId) {
      payments = payments.filter((p: any) => p.tenantId === tenantId)
    }
    if (propertyId) {
      payments = payments.filter((p: any) => p.propertyId === propertyId)
    }

    return NextResponse.json({ payments })
  } catch (err) {
    console.error('Payments GET error', err)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop() || ''
    const body = await req.json()

    const updated = updateInCollection('payments', id, { ...body, updatedAt: new Date().toISOString() })
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ payment: updated })
  } catch (err) {
    console.error('Payments PUT error', err)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}
