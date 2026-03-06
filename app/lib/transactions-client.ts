export type TransactionCreate = {
  tenantId?: string
  propertyId?: string
  amount: number
  type?: 'rent' | 'expense' | string
  description?: string
  status?: 'completed' | 'pending' | 'failed'
}

export type Transaction = TransactionCreate & { id: string; date: string }

export async function fetchTransactions(tenantId?: string, type?: string): Promise<Transaction[]> {
  const params = new URLSearchParams()
  if (tenantId) params.set('tenantId', tenantId)
  if (type) params.set('type', type)
  const res = await fetch(`/api/transactions?${params.toString()}`)
  if (!res.ok) return []
  return res.json()
}

export async function createTransaction(payload: TransactionCreate): Promise<Transaction | null> {
  const res = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) return null
  return res.json()
}
