import { apiRequest } from "@/lib/query-client";
import { buildQueryParams, QueryOptions } from "@/lib/api-utils";
import { getCollection } from "@/lib/local-store";

function dispatchExpensesUpdatedEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("expensesUpdated"));
  }
}

export interface ExpenseRecord {
  id: string;
  type?: "expense" | "rent" | string;
  category?: string;
  expenseType?: "residential" | "commercial" | "both";
  amount: number;
  date: string;
  description?: string;
  propertyId?: string;
  tenantId?: string;
  unitNumber?: string;
  paymentMethod?: string;
  currency?: string;
  receiptReference?: string;
  paymentSourceType?: "card" | "bank" | "other" | "";
  paymentSourceProvider?: string;
  paymentSourceLast4?: string;
  vendorId?: string;
  vendorName?: string;
  invoiceNumber?: string;
  dueDate?: string;
  requiresApproval?: boolean;
  approvedBy?: string;
  approvalDate?: string;
  recurringFrequency?: "weekly" | "monthly" | "quarterly" | "yearly" | "";
  autoPay?: boolean;
  notes?: string;
  status?: "completed" | "pending" | "failed";
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  total?: number;
  value?: number;
  paymentAmount?: number;
  expenseAmount?: number;
}

function normalizeExpenseRecord(expense: any): ExpenseRecord {
  return {
    ...expense,
    id: expense.id || expense._id,
    type: expense.type || "expense",
  } as ExpenseRecord;
}

export async function createExpenseApi(
  payload: Partial<ExpenseRecord>,
  token?: string,
): Promise<ExpenseRecord> {
  const res = await apiRequest("POST", "/expenses/create", payload, token);
  const json = await res.json();
  const exp = json.expense || json;
  const record = normalizeExpenseRecord(exp);
  dispatchExpensesUpdatedEvent();
  return record;
}

function normalizeExpenseList(json: any): any[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.expenses)) return json.expenses;
  return [];
}

export interface ListExpensesOptions extends QueryOptions {
  token?: string;
}

export async function getExpensesByProperty(
  propertyId: string,
  options?: ListExpensesOptions,
): Promise<ExpenseRecord[]> {
  const params = buildQueryParams({
    fields: options?.fields,
    page: options?.page,
    limit: options?.limit,
    sort: options?.sort,
  });

  const res = await apiRequest(
    "GET",
    `/expenses/property/${encodeURIComponent(propertyId)}/all`,
    params,
    options?.token,
  );
  const json = await res.json();
  return normalizeExpenseList(json).map(
    normalizeExpenseRecord,
  ) as ExpenseRecord[];
}

export async function getExpensesByTenant(
  tenantId: string,
  options?: ListExpensesOptions,
): Promise<ExpenseRecord[]> {
  const params = buildQueryParams({
    fields: options?.fields,
    page: options?.page,
    limit: options?.limit,
    sort: options?.sort,
  });

  const res = await apiRequest(
    "GET",
    `/expenses/tenant/${encodeURIComponent(tenantId)}/all`,
    params,
    options?.token,
  );
  const json = await res.json();
  return normalizeExpenseList(json).map(
    normalizeExpenseRecord,
  ) as ExpenseRecord[];
}

export async function getExpensesForProperties(
  propertyIds: string[],
  token?: string,
): Promise<ExpenseRecord[]> {
  if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
    return [];
  }

  try {
    const requests = propertyIds.map((propertyId) =>
      getExpensesByProperty(propertyId, token),
    );
    const results = await Promise.all(requests);
    const flatList = results.flat();
    const uniqueById = new Map<string, ExpenseRecord>();
    flatList.forEach((expense) => {
      if (!expense?.id) return;
      if (!uniqueById.has(expense.id)) {
        uniqueById.set(expense.id, expense);
      }
    });
    return Array.from(uniqueById.values());
  } catch (err) {
    console.warn(
      `Failed to fetch expenses for properties ${propertyIds.join(", ")}:`,
      err,
    );
    try {
      const local = getCollection("expenses") as any[];
      return local
        .filter((expense) => propertyIds.includes(expense.propertyId || ""))
        .map((expense) => normalizeExpenseRecord(expense));
    } catch (fallbackErr) {
      console.error("Failed to fallback to local expense cache:", fallbackErr);
      return [];
    }
  }
}

export async function getAllExpenses(
  options?: ListExpensesOptions,
): Promise<ExpenseRecord[]> {
  const params = buildQueryParams({
    fields: options?.fields,
    page: options?.page,
    limit: options?.limit,
    sort: options?.sort,
    search: options?.search,
    status: options?.status,
  });

  try {
    const res = await apiRequest(
      "GET",
      `/expenses/all`,
      params,
      options?.token,
    );
    const json = await res.json();
    return normalizeExpenseList(json).map(
      normalizeExpenseRecord,
    ) as ExpenseRecord[];
  } catch (err) {
    console.warn(
      "Failed to fetch all expenses, falling back to local store:",
      err,
    );
    try {
      const local = getCollection("expenses") as any[];
      if (!Array.isArray(local) || local.length === 0) {
        throw new Error(
          `Failed to fetch all expenses and no local fallback available: ${String(err)}`,
        );
      }
      return local.map((expense) => normalizeExpenseRecord(expense));
    } catch (fallbackErr) {
      console.error("Local expense fallback failed:", fallbackErr);
      throw fallbackErr;
    }
  }
}

export async function updateExpenseApi(
  id: string,
  patch: Partial<ExpenseRecord>,
  token?: string,
): Promise<ExpenseRecord> {
  const res = await apiRequest(
    "PUT",
    `/expenses?id=${encodeURIComponent(id)}`,
    patch,
    token,
  );
  const json = await res.json();
  const exp = json.expense || json;
  const record = normalizeExpenseRecord(exp);
  dispatchExpensesUpdatedEvent();
  return record;
}

export async function deleteExpenseApi(
  id: string,
  token?: string,
): Promise<boolean> {
  const res = await apiRequest(
    "DELETE",
    `/expenses?id=${encodeURIComponent(id)}`,
    undefined,
    token,
  );
  const json = await res.json();
  const result = res.ok && (json?.message || json?.success);
  if (result) dispatchExpensesUpdatedEvent();
  return result;
}
