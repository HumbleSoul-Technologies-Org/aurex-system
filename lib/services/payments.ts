import { apiRequest } from "../query-client";
import {
  getCollection,
  insertIntoCollection,
  generateId,
  removeFromCollection,
  updateInCollection,
} from "@/lib/local-store";
import { getTenant, updateTenant } from "@/lib/services/tenants";

function dispatchPaymentsUpdatedEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("paymentsUpdated"));
  }
}

export type PaymentReasonFor = "securityDeposit" | "rentPayment";
export type RentPaymentStatus =
  | "complete"
  | "balance"
  | "pending"
  | "failed"
  | "refunded"
  | "recorded"
  | "confirmed";

export interface RentPayment {
  id: string;
  tenantId: string;
  propertyId: string;
  txdId?: string;
  transId?: string;
  amount: number;
  paymentMethod: "cash" | "bank_transfer" | "check" | "card" | "manual";
  leaseType?: string;
  paidOn: string;
  paidBy?: string;
  reasonForPayment?: PaymentReasonFor;
  notes?: string;
  balance?: number;
  status?: RentPaymentStatus;
  currency?: string;
  monthlyRent?: number;
  receiptUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  raw?: any;
  reference?: string;
  recordedBy?: string;
  paymentDate?: string;
  method?: string;
  date?: string;
}

export async function createManualPayment(
  payload: Partial<RentPayment>,
): Promise<RentPayment | null> {
  try {
    const res = await apiRequest("POST", "/payments/create", payload);
    const data = await res.json();
    const raw = data?.data || data?.payment || data || null;
    if (!raw) return null;
    const record = mapServerPaymentToClient(raw);
    dispatchPaymentsUpdatedEvent();
    return record;
  } catch (err) {
    console.warn("Failed to create manual payment:", err);
    return null;
  }
}

export async function updatePayment(
  id: string,
  updates: Partial<RentPayment>,
): Promise<RentPayment | null> {
  try {
    const res = await apiRequest(
      "PUT",
      `/payments?id=${encodeURIComponent(id)}`,
      updates,
    );
    const data = await res.json();
    const raw = data?.data || data?.payment || data || null;
    if (!raw) return null;
    const record = mapServerPaymentToClient(raw);
    dispatchPaymentsUpdatedEvent();
    return record;
  } catch (err) {
    console.warn("Failed to update payment:", err);
    return null;
  }
}

export async function getAllPayments(
  propertyId: string,
  token?: string,
): Promise<RentPayment[]> {
  return getPaymentsForProperty(propertyId, token);
}

export async function deletePaymentApi(id: string): Promise<boolean> {
  try {
    await apiRequest("DELETE", `/payments?id=${encodeURIComponent(id)}`);
    dispatchPaymentsUpdatedEvent();
    return true;
  } catch (err) {
    console.warn(`Failed to delete payment ${id}:`, err);
    return false;
  }
}

export async function getPaymentsForTenant(
  tenantId: string,
): Promise<RentPayment[]> {
  try {
    const res = await apiRequest(
      "GET",
      `/payments/tenant/${encodeURIComponent(tenantId)}/all`,
    );
    const data = await res.json();
    const rawList: any[] = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.payments)
        ? data.payments
        : Array.isArray(data)
          ? data
          : [];
    return rawList
      .map((raw: any) => mapServerPaymentToClient(raw))
      .filter((payment): payment is RentPayment => payment !== null);
  } catch (err) {
    console.warn(
      "Failed to fetch payments for tenant via API, falling back to local store:",
      err,
    );
    try {
      const local = getCollection("payments") as any[];
      return local
        .filter((p) => p.tenantId === tenantId)
        .map((p) => ({
          id: p.id,
          tenantId: p.tenantId,
          propertyId: p.propertyId ?? "",
          amount: Number(p.amount || 0),
          currency: p.currency || "USD",
          paidOn: p.paidOn || p.date || new Date().toISOString(),
        })) as RentPayment[];
    } catch (e) {
      return [];
    }
  }
}

export async function getPaymentsForProperty(
  propertyId: string,
  token?: string,
): Promise<RentPayment[]> {
  if (!propertyId) {
    return [];
  }

  try {
    const res = await apiRequest(
      "GET",
      `/payments/property/${encodeURIComponent(propertyId)}/all`,
      undefined,
      token,
    );
    const data = await res.json();

    console.log("Raw payments response for property:", data);

    const rawList: any[] = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.payments)
        ? data.payments
        : Array.isArray(data)
          ? data
          : [];

    return rawList
      .map((raw: any) => mapServerPaymentToClient(raw))
      .filter((payment): payment is RentPayment => payment !== null);
  } catch (err) {
    console.warn(
      "Failed to fetch payments for property via API, falling back to local store:",
      err,
    );
    try {
      const local = listPayments();
      return local
        .filter((p) => p.propertyId === propertyId)
        .map((p) => ({
          id: p.id,
          tenantId: p.tenantId || "",
          propertyId: p.propertyId || "",
          amount: Number(p.amount || 0),
          currency: p.currency || "USD",
          paidOn: p.paidOn || p.date || new Date().toISOString(),
        })) as RentPayment[];
    } catch (e) {
      return [];
    }
  }
}

export async function getPaymentsForPropertyIds(
  propertyIds: string[],
  token?: string,
): Promise<RentPayment[]> {
  if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
    return [];
  }

  const normalizedPropertyIds = propertyIds.filter(Boolean);
  if (normalizedPropertyIds.length === 0) {
    return [];
  }

  try {
    const res = await apiRequest(
      "GET",
      "/payments/property/all",
      { propertyIds: normalizedPropertyIds },
      token,
    );
    const data = await res.json();
    const rawList: any[] = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.payments)
        ? data.payments
        : Array.isArray(data)
          ? data
          : [];

    const payments = rawList
      .map((raw: any) => mapServerPaymentToClient(raw))
      .filter((payment): payment is RentPayment => payment !== null);

    if (payments.length > 0) {
      return payments;
    }
  } catch (err) {
    console.warn(
      "Batch payments request failed, falling back to per-property fetch:",
      err,
    );
  }

  const paymentsByProperty = await Promise.all(
    normalizedPropertyIds.map((propertyId) =>
      getPaymentsForProperty(propertyId, token),
    ),
  );
  const allPayments = paymentsByProperty.flat();
  const seen = new Set<string>();

  return allPayments.filter((payment) => {
    if (!payment) return false;
    const paymentKey = payment.id || payment.txdId || JSON.stringify(payment);
    if (!paymentKey || seen.has(paymentKey)) {
      return false;
    }
    seen.add(paymentKey);
    return true;
  });
}

function mapServerPaymentToClient(p: any): any {
  if (!p) return null;

  const id = p._id || p.id || (p._doc && p._doc._id);
  const txdId = p.txdId || p.transId || p.reference || p.receiptReference || id;
  const tenantId =
    typeof p.tenantId === "object"
      ? p.tenantId?._id || p.tenantId?.id
      : p.tenantId;
  const propertyId =
    typeof p.propertyId === "object"
      ? p.propertyId?._id || p.propertyId?.id
      : p.propertyId;
  const rawAmount =
    p.amount ?? p.total ?? p.value ?? p.paymentAmount ?? p.amountPaid ?? 0;
  const amount = Number(String(rawAmount).replace(/[^0-9.-]+/g, "")) || 0;
  const currency = p.currency || "USD";
  const paymentMethod = p.paymentMethod || p.method || p.payment_type || "";
  const paidOn =
    p.paidOn ||
    p.paymentDate ||
    p.date ||
    p.createdAt ||
    new Date().toISOString();
  const paidBy =
    p.paidBy ||
    (typeof p.recordedBy === "object"
      ? p.recordedBy._id || p.recordedBy.id
      : p.recordedBy) ||
    null;
  const reasonForPayment =
    p.reasonForPayment ||
    (p.paymentType === "security_deposit"
      ? "securityDeposit"
      : p.paymentType === "rent"
        ? "rentPayment"
        : undefined);
  const balance = Number(p.balance ?? 0);
  let status = p.status || "pending";
  if (["recorded", "confirmed", "completed", "paid"].includes(status))
    status = "complete";
  if (["pending", "balance"].includes(status)) status = "balance";
  if (status === "refunded") status = "refunded";

  return {
    id,
    txdId,
    transId: txdId,
    tenantId,
    propertyId,
    amount,
    currency,
    paidOn,
    paymentDate: paidOn,
    date: paidOn,
    paidBy,
    reasonForPayment,
    balance,
    paymentMethod,
    method: paymentMethod,
    status,
    receiptUrl: p.receiptUrl || p.receiptURL || p.receipt || null,
    reference: p.reference || null,
    notes: p.notes || p.reference || null,
    recordedBy: p.recordedBy || p.recorded_by || null,
    leaseType: p.leaseType || p.lease_type || null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    raw: p,
  } as RentPayment;
}

function generateShortId(len = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export interface PaymentRecord {
  id: string;
  txdId: string;
  transId: string;
  tenantId: string;
  propertyId?: string;
  unit?: string;
  amount: number;
  price_per_unit?: number;
  currency?: string;
  date: string;
  paidOn?: string;
  paidBy?: string;
  paymentMethod?: string;
  method?: string;
  reasonForPayment?: "securityDeposit" | "rentPayment";
  paymentType?:
    | "rent"
    | "commercial"
    | "residential"
    | "misc"
    | "security_deposit";
  leaseType?: string;
  paymentDate?: string;
  lease_start?: string;
  lease_type?: string;
  description?: string;
  balance?: number;
  note?: string;
  total?: number;
  value?: number;
  paymentAmount?: number;
  amountPaid?: number;
  commercialPaymentDetails?: {
    baseRent?: number;
    additionalRent?: number;
    percentageRent?: number;
    escalation?: string;
  };
  residentialPaymentDetails?: {
    petFee?: number;
    parkingFee?: number;
    utilitiesIncluded?: boolean;
  };
  paymentPlan?: {
    installments?: number;
    frequency?: "weekly" | "biweekly" | "monthly" | "quarterly";
  };
  autoPay?: boolean;
  status?:
    | "pending"
    | "completed"
    | "failed"
    | "complete"
    | "balance"
    | "refunded"
    | "paid";
  receiptReference?: string;
  receiptUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function listPayments(): PaymentRecord[] {
  return getCollection<PaymentRecord>("payments");
}

export function getPayment(id: string): PaymentRecord | null {
  return listPayments().find((payment) => payment.id === id) ?? null;
}

export function updateLocalPayment(
  id: string,
  patch: Partial<PaymentRecord>,
): PaymentRecord | null {
  return updateInCollection<PaymentRecord>("payments", id, {
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

export function deletePayment(id: string): boolean {
  return removeFromCollection("payments", id);
}

export function createPayment(payload: Partial<PaymentRecord>): PaymentRecord {
  const now = new Date().toISOString();
  const rec: PaymentRecord = {
    id: generateId("pay"),
    txdId: payload.txdId ?? generateShortId(8),
    transId: payload.txdId ?? payload.transId ?? generateShortId(8),
    tenantId: payload.tenantId || "",
    propertyId: payload.propertyId,
    unit: payload.unit,
    amount: payload.amount ?? 0,
    price_per_unit: payload.price_per_unit,
    currency: payload.currency ?? "USD",
    date: payload.date ?? now,
    paidOn: payload.paidOn ?? payload.paymentDate ?? payload.date ?? now,
    paidBy: payload.paidBy,
    paymentMethod: payload.paymentMethod ?? payload.method ?? "offline",
    method: payload.method ?? payload.paymentMethod ?? "offline",
    reasonForPayment:
      payload.reasonForPayment ||
      (payload.paymentType === "security_deposit"
        ? "securityDeposit"
        : payload.paymentType === "rent"
          ? "rentPayment"
          : undefined),
    status: payload.status ?? "complete",
    note: payload.note,
    lease_start: payload.lease_start,
    lease_type: payload.lease_type ?? payload.leaseType,
    balance: payload.balance ?? 0,
    receiptReference: payload.receiptReference,
    receiptUrl: payload.receiptUrl,
    createdAt: now,
    updatedAt: now,
  };
  insertIntoCollection("payments", rec);

  // Update tenant lease status based on payment amount vs tenant rent
  try {
    if (rec.tenantId) {
      const tenant = getTenant(rec.tenantId);
      if (tenant) {
        const rent = Number(tenant.rentAmount || 0);
        const paid = Number(rec.amount || 0);
        if (rent > 0) {
          if (paid >= rent) {
            updateTenant(tenant.id, { status: "paid" });
          } else if (paid > 0) {
            updateTenant(tenant.id, { status: "balance" });
          }
          // notify UI listeners that tenants may have changed
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("tenantsUpdated"));
          }
        }
      }
    }
  } catch (e) {
    // ignore tenant update failures
    // eslint-disable-next-line no-console
    console.error("Failed to update tenant status after payment", e);
  }

  return rec;
}
