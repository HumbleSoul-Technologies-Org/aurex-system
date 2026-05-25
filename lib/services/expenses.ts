import { apiRequest } from '@/lib/query-client'

export interface ExpenseRecord {
  id: string
  type?: 'expense' | 'rent' | string
  category?: string
  expenseType?: 'residential' | 'commercial' | 'both'
  amount: number
  date: string
  description?: string
  propertyId?: string
  tenantId?: string
  unitNumber?: string
  paymentMethod?: string
  currency?: string
  receiptReference?: string
  paymentSourceType?: 'card' | 'bank' | 'other' | ''
  paymentSourceProvider?: string
  paymentSourceLast4?: string
  vendorId?: string
  vendorName?: string
  invoiceNumber?: string
  dueDate?: string
  requiresApproval?: boolean
  approvedBy?: string
  approvalDate?: string
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | ''
  autoPay?: boolean
  notes?: string
  status?: 'completed' | 'pending' | 'failed'
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

function normalizeExpenseRecord(expense: any): ExpenseRecord {
  return {
    ...expense,
    id: expense.id || expense._id,
    type: expense.type || 'expense',
  } as ExpenseRecord
}

export async function createExpenseApi(
  payload: Partial<ExpenseRecord>,
  token?: string,
): Promise<ExpenseRecord> {
  const res = await apiRequest('POST', '/expenses/create', payload, token)
  const json = await res.json()
  const exp = json.expense || json
  return normalizeExpenseRecord(exp)
}

export async function getExpensesByProperty(
  propertyId: string,
  token?: string,
): Promise<ExpenseRecord[]> {
  const res = await apiRequest('GET', `/expenses/property/${propertyId}/all`, undefined, token)
  const json = await res.json()
  return (json || []).map(normalizeExpenseRecord) as ExpenseRecord[]
}

export async function getExpensesByTenant(
  tenantId: string,
  token?: string,
): Promise<ExpenseRecord[]> {
  const res = await apiRequest('GET', `/expenses/tenant/${tenantId}/all`, undefined, token)
  const json = await res.json()
  return (json || []).map(normalizeExpenseRecord) as ExpenseRecord[]
}

export async function getAllExpenses(token?: string): Promise<ExpenseRecord[]> {
  const res = await apiRequest('GET', `/expenses/all`, undefined, token)
  const json = await res.json()
  return (json || []).map(normalizeExpenseRecord) as ExpenseRecord[]
}

export async function updateExpenseApi(
  id: string,
  patch: Partial<ExpenseRecord>,
  token?: string,
): Promise<ExpenseRecord> {
  const res = await apiRequest('PUT', `/expenses/${id}/update`, patch, token)
  const json = await res.json()
  const exp = json.expense || json
  return normalizeExpenseRecord(exp)
}

export async function deleteExpenseApi(id: string, token?: string): Promise<boolean> {
  const res = await apiRequest('DELETE', `/expenses/${id}/delete`, undefined, token)
  const json = await res.json()
  return res.ok && (json?.message || json?.success)
}
