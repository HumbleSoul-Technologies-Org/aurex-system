import { insertIntoCollection, getCollection, generateId } from '@/lib/local-store'

export interface PaymentRecord {
  id: string
  tenantId: string
  propertyId?: string
  amount: number
  currency?: string
  date: string
  method?: string
  status?: 'pending' | 'completed' | 'failed'
  note?: string
}

export function listPayments(): PaymentRecord[] {
  return getCollection<PaymentRecord>('payments')
}

export function createPayment(payload: Partial<PaymentRecord>): PaymentRecord {
  const rec: PaymentRecord = {
    id: generateId('pay'),
    tenantId: payload.tenantId || '',
    propertyId: payload.propertyId,
    amount: payload.amount ?? 0,
    currency: payload.currency ?? 'USD',
    date: payload.date ?? new Date().toISOString(),
    method: payload.method ?? 'offline',
    status: payload.status ?? 'completed',
    note: payload.note,
  }
  insertIntoCollection('payments', rec)
  return rec
}
