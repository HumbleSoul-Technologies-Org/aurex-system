import { getCollection, insertIntoCollection, updateInCollection, removeFromCollection, generateId } from '@/lib/local-store'

export type TransactionType = 'rent' | 'expense' | 'security_deposit' | string
export type TransactionStatus = 'completed' | 'pending' | 'failed' | string

export interface TransactionRecord {
  id: string
  tenantId?: string
  propertyId?: string
  amount: number
  date: string
  type: TransactionType
  description?: string
  status?: TransactionStatus
  category?: string
  paymentMethod?: string
  receiptReference?: string
  unit?: string
  currency?: string
  paymentSource?: {
    type?: 'card' | 'bank' | 'other'
    last4?: string
    provider?: string
  }
  scheduledDate?: string
  processedDate?: string
  reversed?: boolean
  appliedTo?: string[]
  notes?: string
  metadata?: Record<string, any>
}

export function listTransactions(): TransactionRecord[] {
  return getCollection<TransactionRecord>('transactions')
}

export function getTransaction(id: string): TransactionRecord | null {
  return listTransactions().find((transaction) => transaction.id === id) ?? null
}

export function createTransaction(payload: Partial<TransactionRecord>): TransactionRecord {
  const transaction: TransactionRecord = {
    id: generateId('txn'),
    tenantId: payload.tenantId,
    propertyId: payload.propertyId,
    amount: payload.amount ?? 0,
    date: payload.date ?? new Date().toISOString(),
    type: payload.type ?? 'rent',
    description: payload.description,
    status: payload.status ?? 'completed',
    category: payload.category,
    paymentMethod: payload.paymentMethod,
    receiptReference: payload.receiptReference,
    unit: payload.unit,
    currency: payload.currency ?? 'USD',
    paymentSource: payload.paymentSource,
    scheduledDate: payload.scheduledDate,
    processedDate: payload.processedDate,
    reversed: payload.reversed ?? false,
    appliedTo: payload.appliedTo || [],
    notes: payload.notes,
    metadata: payload.metadata,
  }
  insertIntoCollection('transactions', transaction)
  return transaction
}

export function updateTransaction(id: string, patch: Partial<TransactionRecord>): TransactionRecord | null {
  return updateInCollection<TransactionRecord>('transactions', id, patch)
}

export function deleteTransaction(id: string): boolean {
  return removeFromCollection('transactions', id)
}
