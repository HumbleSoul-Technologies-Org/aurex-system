import { apiRequest } from "../query-client";
import { insertIntoCollection, getCollection, generateId, removeFromCollection, updateInCollection } from "@/lib/local-store";
import { getTenant, updateTenant } from "@/lib/services/tenants";

export interface RentPayment {
  id: string;
  tenantId: string;
  propertyId: string;
  leaseId?: string;
  amount: number;
  currency: string;
  monthlyRent?: number;
  paymentMethod: "cash" | "bank_transfer" | "check" | "card" | "manual";
  paymentDate: string; // ISO date
  transId?: string;
  date?: string;
  method?: string;
  recordedBy?: string;
  recordedAt?: string;
  reference?: string;
  receiptUrl?: string;
  status?: "recorded" | "confirmed" | "refunded";
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function createManualPayment(payload: Partial<RentPayment>): Promise<RentPayment | null> {
  try {
    const res = await apiRequest("POST", "/payments/create", payload);
    const data = await res.json();
    const raw = data?.data || data?.payment || data || null;
    if (!raw) return null;
    return mapServerPaymentToClient(raw);
  } catch (err) {
    console.warn("Failed to create manual payment:", err);
    return null;
  }
}

export async function getPaymentsForTenant(tenantId: string): Promise<RentPayment[]> {
  try {
    const res = await apiRequest("GET", `/payments/tenant/${encodeURIComponent(tenantId)}/all`);
    const data = await res.json();
    const rawList = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.payments)
      ? data.payments
      : Array.isArray(data)
      ? data
      : [];
    return rawList.map(mapServerPaymentToClient);
  } catch (err) {
    console.warn("Failed to fetch payments for tenant:", err);
    return [];
  }
}

export async function getPaymentsForProperty(propertyId: string): Promise<RentPayment[]> {
  try {
    const res = await apiRequest("GET", `/payments/property/${encodeURIComponent(propertyId)}/all`);
    const data = await res.json();
    const rawList = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.payments)
      ? data.payments
      : Array.isArray(data)
      ? data
      : [];
    return rawList.map(mapServerPaymentToClient);
  } catch (err) {
    console.warn("Failed to fetch payments for property:", err);
    return [];
  }
}

export async function updatePayment(id: string, updates: Partial<RentPayment>): Promise<RentPayment | null> {
  try {
    const res = await apiRequest("PUT", `/payments/${id}/update`, updates);
    const data = await res.json();
    const raw = data?.data || data?.payment || data || null;
    if (!raw) return null;
    return mapServerPaymentToClient(raw);
  } catch (err) {
    console.warn("Failed to update payment:", err);
    return null;
  }
}

function mapServerPaymentToClient(p: any): any {
  const id = p._id || p.id || (p._doc && p._doc._id);
  const transId = p.reference || p.transId || p.receiptReference || id;
  const tenantId = typeof p.tenantId === 'object' ? (p.tenantId._id || p.tenantId.id) : p.tenantId;
  const propertyId = typeof p.propertyId === 'object' ? (p.propertyId._id || p.propertyId.id) : p.propertyId;
  const amount = Number(p.amount ?? p.total ?? 0);
  const currency = p.currency || 'USD';
  const method = p.paymentMethod || p.method || p.payment_type || '';
  const date = p.paymentDate || p.date || p.createdAt || new Date().toISOString();
  let status = p.status || 'pending';
  if (['recorded', 'confirmed', 'completed'].includes(status)) status = 'paid';
  if (status === 'refunded') status = 'refunded';

  return {
    id,
    transId,
    tenantId,
    propertyId,
    amount,
    currency,
    date,
    paymentDate: date,
    method,
    paymentMethod: method,
    status,
    receiptUrl: p.receiptUrl || p.receiptURL || p.receipt || null,
    reference: p.reference || null,
    notes: p.notes || p.reference || null,
    recordedBy: p.recordedBy || p.recorded_by || null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    raw: p,
  } as RentPayment;
}

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
  paymentType?: 'rent' | 'commercial' | 'residential' | 'misc'
  commercialPaymentDetails?: {
    baseRent?: number
    additionalRent?: number
    percentageRent?: number
    escalation?: string
  }
  residentialPaymentDetails?: {
    petFee?: number
    parkingFee?: number
    utilitiesIncluded?: boolean
  }
  paymentPlan?: {
    installments?: number
    frequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly'
  }
  autoPay?: boolean
  status?: 'pending' | 'completed' | 'failed'
  note?: string
  lease_start?: string
  lease_type?: string
  balance?: number
  receiptReference?: string
  receiptUrl?: string
  createdAt?: string
  updatedAt?: string
}

export function listPayments(): PaymentRecord[] {
  return getCollection<PaymentRecord>('payments')
}

export function getPayment(id: string): PaymentRecord | null {
  return listPayments().find((payment) => payment.id === id) ?? null
}

export function updateLocalPayment(id: string, patch: Partial<PaymentRecord>): PaymentRecord | null {
  return updateInCollection<PaymentRecord>('payments', id, {
    ...patch,
    updatedAt: new Date().toISOString(),
  })
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
    receiptUrl: payload.receiptUrl,
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
