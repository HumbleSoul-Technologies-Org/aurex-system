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
