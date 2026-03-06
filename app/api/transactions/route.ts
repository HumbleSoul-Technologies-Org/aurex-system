import { NextResponse } from 'next/server'
import { addNotification } from '@/app/lib/server-notifications'

type Transaction = {
  id: string
  tenantId?: string
  propertyId?: string
  amount: number
  date: string
  type: 'rent' | 'expense' | string
  description?: string
  status?: 'completed' | 'pending' | 'failed'
}

// In-memory transaction store (server-side only)
const transactions: Transaction[] = []

export async function GET(request: Request) {
  const url = new URL(request.url)
  const tenantId = url.searchParams.get('tenantId')
  const type = url.searchParams.get('type')

  let results = transactions.slice()
  if (tenantId) results = results.filter((t) => t.tenantId === tenantId)
  if (type) results = results.filter((t) => t.type === type)

  return NextResponse.json(results)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const tx: Transaction = {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      tenantId: body.tenantId,
      propertyId: body.propertyId,
      amount: Number(body.amount) || 0,
      date: body.date || new Date().toISOString(),
      type: body.type || 'rent',
      description: body.description || '',
      status: body.status || 'completed',
    }
    transactions.unshift(tx)
    try {
      // create a notification for the new transaction
      addNotification({
        type: 'transaction',
        tenantId: tx.tenantId,
        title: tx.type === 'expense' ? `Expense recorded: $${tx.amount}` : `Payment received: $${tx.amount}`,
        body: tx.description || undefined,
        metadata: { transactionId: tx.id, amount: tx.amount, type: tx.type },
      })
    } catch (e) {
      // swallow notification errors on server to avoid failing transaction creation
    }
    return NextResponse.json(tx, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}
