import { insertIntoCollection, getCollection, generateId, removeFromCollection } from '@/lib/local-store'
import { getTenant, updateTenant } from '@/lib/services/tenants'

function generateShortId(len = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export interface PaymentRecord {
  id: string
  transId: string
  tenantId: string
  propertyId?: string
  unit?: string
  amount: number
  price_per_unit?: number
  currency?: string
  date: string
  method?: string
  status?: 'pending' | 'completed' | 'failed'
  note?: string
  lease_start?: string
  lease_type?: string
  balance?: number
  receiptReference?: string
  createdAt?: string
  updatedAt?: string
}

export function listPayments(): PaymentRecord[] {
  return getCollection<PaymentRecord>('payments')
}

export function deletePayment(id: string): boolean {
  return removeFromCollection('payments', id)
}

export function createPayment(payload: Partial<PaymentRecord>): PaymentRecord {
  const now = new Date().toISOString()
  const rec: PaymentRecord = {
    id: generateId('pay'),
    transId: payload.transId ?? generateShortId(8),
    tenantId: payload.tenantId || '',
    propertyId: payload.propertyId,
    unit: payload.unit,
    amount: payload.amount ?? 0,
    price_per_unit: payload.price_per_unit,
    currency: payload.currency ?? 'USD',
    date: payload.date ?? now,
    method: payload.method ?? 'offline',
    status: payload.status ?? 'completed',
    note: payload.note,
    lease_start: payload.lease_start,
    lease_type: payload.lease_type,
    balance: payload.balance ?? 0,
    receiptReference: payload.receiptReference,
    createdAt: now,
    updatedAt: now,
  }
  insertIntoCollection('payments', rec)
  
  // Update tenant lease status based on payment amount vs tenant rent
  try {
    if (rec.tenantId) {
      const tenant = getTenant(rec.tenantId)
      if (tenant) {
        const rent = Number(tenant.rentAmount || 0)
        const paid = Number(rec.amount || 0)
        if (rent > 0) {
          if (paid >= rent) {
            updateTenant(tenant.id, { status: 'paid' })
          } else if (paid > 0) {
            updateTenant(tenant.id, { status: 'balance' })
          }
          // notify UI listeners that tenants may have changed
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('tenantsUpdated'))
          }
        }
      }
    }
  } catch (e) {
    // ignore tenant update failures
    // eslint-disable-next-line no-console
    console.error('Failed to update tenant status after payment', e)
  }

  return rec
}
