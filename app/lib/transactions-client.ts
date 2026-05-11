import { insertIntoCollection, getCollection, generateId, updateInCollection, removeFromCollection } from '@/lib/local-store'

export type TransactionCreate = {
  tenantId?: string
  propertyId?: string
  amount: number
  type?: 'rent' | 'expense' | string
  expenseType?: 'residential' | 'commercial' | 'both'
  description?: string
  status?: 'completed' | 'pending' | 'failed'
  category?: string
  paymentMethod?: string
  date?: string
  receiptReference?: string
  unit?: string
  // Commercial expense fields
  tripleNetAllocation?: string
  capitalizable?: boolean
  depreciationSchedule?: string
  vendorId?: string
  vendorName?: string
  invoiceNumber?: string
  dueDate?: string
  requiresApproval?: boolean
  approvedBy?: string
  approvalDate?: string
  recurring?: {
    frequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    autoPay?: boolean
  }
}

export type Transaction = TransactionCreate & { id: string; date: string; transID: string; receiptReference?: string }

export function listTransactions(tenantId?: string, type?: string): Transaction[] {
  let transactions = getCollection<Transaction>('transactions') || []
  if (tenantId) transactions = transactions.filter((t) => t.tenantId === tenantId)
  if (type) transactions = transactions.filter((t) => t.type === type)
  return transactions
}

export function createTransaction(payload: TransactionCreate): Transaction {
  function generateShortId(len = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let out = ''
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
    return out
  }

  const txDate = payload.date ? new Date(payload.date).toISOString() : new Date().toISOString()
  const tx: Transaction = {
    id: generateId('tx'),
    transID: generateShortId(8),
    tenantId: payload.tenantId,
    propertyId: payload.propertyId,
    amount: payload.amount,
    date: txDate,
    type: payload.type || 'rent',
    expenseType: payload.expenseType,
    description: payload.description || '',
    status: payload.status || 'completed',
    category: payload.category,
    paymentMethod: payload.paymentMethod,
    receiptReference: payload.receiptReference,
    unit: payload.unit,
    vendorId: payload.vendorId,
    vendorName: payload.vendorName,
    invoiceNumber: payload.invoiceNumber,
    dueDate: payload.dueDate,
    requiresApproval: payload.requiresApproval,
    approvedBy: payload.approvedBy,
    approvalDate: payload.approvalDate,
    recurring: payload.recurring,
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
