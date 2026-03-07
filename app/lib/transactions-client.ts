import { insertIntoCollection, getCollection, generateId, updateInCollection, removeFromCollection } from '@/lib/local-store'

export type TransactionCreate = {
  tenantId?: string
  propertyId?: string
  amount: number
  type?: 'rent' | 'expense' | string
  description?: string
  status?: 'completed' | 'pending' | 'failed'
}

export type Transaction = TransactionCreate & { id: string; date: string }

export function listTransactions(tenantId?: string, type?: string): Transaction[] {
  let transactions = getCollection<Transaction>('transactions') || []
  if (tenantId) transactions = transactions.filter((t) => t.tenantId === tenantId)
  if (type) transactions = transactions.filter((t) => t.type === type)
  return transactions
}

export function createTransaction(payload: TransactionCreate): Transaction {
  const tx: Transaction = {
    id: generateId('tx'),
    tenantId: payload.tenantId,
    propertyId: payload.propertyId,
    amount: payload.amount,
    date: new Date().toISOString(),
    type: payload.type || 'rent',
    description: payload.description || '',
    status: payload.status || 'completed',
  }
  insertIntoCollection('transactions', tx)
  return tx
}

export function updateTransaction(id: string, patch: Partial<TransactionCreate>): Transaction | null {
  return updateInCollection<Transaction>('transactions', id, patch as any)
}

export function deleteTransaction(id: string): boolean {
  return removeFromCollection('transactions', id)
}
