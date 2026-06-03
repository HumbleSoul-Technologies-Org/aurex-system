"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./query-client";
import { useAuth } from "./auth-context";
import { listProperties, PropertyRecord } from "./services/properties";
import { listTenants, TenantRecord } from "./services/tenants";
import { getPaymentsForProperty, PaymentRecord } from "./services/payments";
import { getExpensesForProperties, ExpenseRecord } from "./services/expenses";
import {
  getMaintenanceRequests,
  fetchAllMaintenanceRequests,
  MaintenanceRequest,
} from "./services/maintenance";
import { writeCollection } from "./local-store";

interface DataContextValue {
  properties: PropertyRecord[];
  tenants: TenantRecord[];
  currentTenant: TenantRecord | null;
  currentProperty: PropertyRecord | null;
  payments: PaymentRecord[];
  expenses: ExpenseRecord[];
  tenantPayments: PaymentRecord[];
  tenantExpenses: ExpenseRecord[];
  maintenanceRequests: MaintenanceRequest[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  paymentsError: string | null;
  expensesError: string | null;
  refetch: () => void;
  refetchAll: () => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

function normalizeTenant(tenant: any, parentPropertyId?: string) {
  if (!tenant) return null;

  if (typeof tenant === "string") {
    return {
      id: tenant,
      propertyId: parentPropertyId || "",
    };
  }

  const id = tenant.id || tenant._id || "";
  const propertyId = tenant.propertyId || parentPropertyId || "";

  return {
    ...tenant,
    id,
    propertyId,
  };
}

function normalizePropertyRecord(property: any): PropertyRecord {
  const propertyId = property.id || property._id || "";

  return {
    ...property,
    id: propertyId,
    tenants: Array.isArray(property.tenants)
      ? property.tenants
          .map((tenant: any) => normalizeTenant(tenant, propertyId))
          .filter(Boolean)
      : [],
  };
}

async function fetchProperties(
  adminId: string | null,
  userRole: string | null,
): Promise<PropertyRecord[]> {
  const normalizedRole = userRole?.toLowerCase() || "";
  if (
    !adminId ||
    (normalizedRole !== "admin" && normalizedRole !== "property_manager")
  ) {
    return listProperties();
  }

  const endpoint = `/property/${adminId}/all`;
  try {
    const res = await apiRequest("GET", endpoint);
    const data = await res.json();

    const rawProperties = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.properties)
          ? data.properties
          : Array.isArray(data?.data?.properties)
            ? data.data.properties
            : Array.isArray(data?.property)
              ? data.property
              : [];

    return rawProperties.map(normalizePropertyRecord);
  } catch (err) {
    console.warn(
      "Failed to fetch properties from API, falling back to local store:",
      err,
    );
    return listProperties();
  }
}

async function fetchPayments(
  propertyIds: string[] | null,
  token: string | null,
): Promise<PaymentRecord[]> {
  if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
    return [];
  }

  try {
    return (await getPaymentsForProperty(
      propertyIds,
      token ?? undefined,
    )) as unknown as PaymentRecord[];
  } catch (err) {
    console.warn(
      `Failed to fetch payments for properties ${propertyIds.join(", ")} from API, falling back to empty list:`,
      err,
    );
    return [];
  }
}

async function fetchExpenses(
  propertyIds: string[] | null,
  token: string | null,
): Promise<ExpenseRecord[]> {
  if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
    return [];
  }

  try {
    return await getExpensesForProperties(propertyIds, token ?? undefined);
  } catch (err) {
    console.warn(
      "Failed to fetch expenses from API, falling back to local store:",
      err,
    );
    return [];
  }
}

async function fetchMaintenanceRequests(): Promise<MaintenanceRequest[]> {
  const localRequests = getMaintenanceRequests();
  try {
    const remoteRequests = await fetchAllMaintenanceRequests();
    const mergedRequests = [...localRequests];
    remoteRequests.forEach((req) => {
      if (!mergedRequests.some((localReq) => localReq.id === req.id)) {
        mergedRequests.push(req);
      }
    });
    return mergedRequests;
  } catch (err) {
    console.warn(
      "Failed to fetch maintenance requests from API, falling back to local store:",
      err,
    );
    return localRequests;
  }
}

// Tenant data is now derived from populated `property.tenants` returned by the properties API.
// No separate tenant fetch required.
// If you still need a standalone tenant endpoint later, re-introduce a fetch function.

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const adminId = user?.id || null;
  const [paymentsError, setPaymentsError] = React.useState<string | null>(null);
  const [expensesError, setExpensesError] = React.useState<string | null>(null);

  async function fetchPaymentsWithErrorHandling(
    propertyIds: string[] | null,
    token: string | null,
  ): Promise<PaymentRecord[]> {
    try {
      setPaymentsError(null);
      return await fetchPayments(propertyIds, token);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Payment fetch error:", message);
      setPaymentsError(message);
      return [];
    }
  }

  async function fetchExpensesWithErrorHandling(
    propertyIds: string[] | null,
    token: string | null,
  ): Promise<ExpenseRecord[]> {
    try {
      setExpensesError(null);
      return await fetchExpenses(propertyIds, token);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Expense fetch error:", message);
      setExpensesError(message);
      return [];
    }
  }

  const propertiesQuery = useQuery({
    queryKey: ["properties", adminId, user?.role] as const,
    queryFn: () => fetchProperties(adminId, user?.role ?? null),
    initialData: () => listProperties(),
    staleTime: 1000 * 60 * 2,
  });

  const maintenanceRequestsQuery = useQuery({
    queryKey: ["maintenanceRequests"],
    queryFn: fetchMaintenanceRequests,
    initialData: () => [] as MaintenanceRequest[],
    staleTime: 1000 * 60 * 2,
  });

  // derive tenants from properties (API now returns populated tenant subdocuments)
  const propertiesData = propertiesQuery.data ?? listProperties();

  const expensePropertyIds = React.useMemo(() => {
    return propertiesData
      .map((property) => property.id || property._id || "")
      .filter(Boolean);
  }, [propertiesData]);

  const expensesQuery = useQuery({
    queryKey: ["expenses", expensePropertyIds, token || ""],
    queryFn: () =>
      fetchExpensesWithErrorHandling(expensePropertyIds, token ?? null),
    enabled: expensePropertyIds.length > 0,
    initialData: () => [] as ExpenseRecord[],
    staleTime: 1000 * 60 * 2,
  });

  const tenantsDerived: TenantRecord[] = (propertiesData as any[])
    .flatMap((p) => {
      const propertyId = p.id || p._id || "";
      const rawTenants = Array.isArray(p.tenants) ? p.tenants : [];
      return rawTenants
        .map((tenant: any) => normalizeTenant(tenant, propertyId))
        .filter(Boolean);
    })
    .filter((tenant: any) => Boolean(tenant?.id))
    .map((tenant: any) => ({
      ...tenant,
      id: tenant.id || tenant._id || "",
      propertyId: tenant.propertyId || "",
    }));

  const tenantsData =
    tenantsDerived.length > 0 ? tenantsDerived : listTenants();

  const currentTenant = React.useMemo(() => {
    if (!user || tenantsData.length === 0) return null;
    const email = user.email?.toLowerCase();
    return (
      tenantsData.find(
        (tenant) =>
          tenant.id === user.id ||
          tenant._id === user.id ||
          tenant.email?.toLowerCase() === email,
      ) || null
    );
  }, [user, tenantsData]);

  const currentProperty = React.useMemo(() => {
    if (!currentTenant) return null;
    return (
      propertiesData.find(
        (property) =>
          property.id === currentTenant.propertyId ||
          property._id === currentTenant.propertyId,
      ) || null
    );
  }, [currentTenant, propertiesData]);

  const paymentPropertyIds = React.useMemo(() => {
    if (currentProperty?.id) {
      return [currentProperty.id];
    }

    return propertiesData
      .map((property) => property.id || property._id || "")
      .filter(Boolean);
  }, [currentProperty, propertiesData]);

  const paymentsQuery = useQuery({
    queryKey: ["payments", paymentPropertyIds.join(","), token || ""] as const,
    queryFn: () =>
      fetchPaymentsWithErrorHandling(paymentPropertyIds, token ?? null),
    enabled: paymentPropertyIds.length > 0,
    initialData: () => [] as PaymentRecord[],
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });

  const tenantPayments = React.useMemo(() => {
    if (!currentTenant) return [];
    return (paymentsQuery.data ?? []).filter(
      (payment) => payment.tenantId === currentTenant.id,
    );
  }, [currentTenant, paymentsQuery.data]);

  const tenantExpenses = React.useMemo(() => {
    if (!currentTenant) return [];
    return (expensesQuery.data ?? []).filter(
      (expense) => expense.tenantId === currentTenant.id,
    );
  }, [currentTenant, expensesQuery.data]);

  const value: DataContextValue = {
    properties: propertiesQuery.data ?? listProperties(),
    tenants: tenantsData,
    currentTenant,
    currentProperty,
    payments: paymentsQuery.data ?? [],
    expenses: expensesQuery.data ?? [],
    tenantPayments,
    tenantExpenses,
    maintenanceRequests: maintenanceRequestsQuery.data ?? [],
    isLoading:
      propertiesQuery.isLoading ||
      paymentsQuery.isLoading ||
      expensesQuery.isLoading ||
      maintenanceRequestsQuery.isLoading,
    isFetching:
      propertiesQuery.isFetching ||
      paymentsQuery.isFetching ||
      expensesQuery.isFetching ||
      maintenanceRequestsQuery.isFetching,
    paymentsError,
    expensesError,
    isError:
      propertiesQuery.isError ||
      paymentsQuery.isError ||
      expensesQuery.isError ||
      maintenanceRequestsQuery.isError ||
      Boolean(paymentsError) ||
      Boolean(expensesError),
    refetch: () => {
      propertiesQuery.refetch();
    },
    refetchAll: () => {
      propertiesQuery.refetch();
      paymentsQuery.refetch();
      expensesQuery.refetch();
      maintenanceRequestsQuery.refetch();
    },
  };

  React.useEffect(() => {
    if (Array.isArray(propertiesQuery.data)) {
      writeCollection("properties", propertiesQuery.data);
    }
  }, [propertiesQuery.data]);

  React.useEffect(() => {
    if (Array.isArray(tenantsDerived) && tenantsDerived.length > 0) {
      writeCollection("tenants", tenantsDerived as any[]);
    }
  }, [JSON.stringify(tenantsDerived)]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const onPaymentsUpdated = () => paymentsQuery.refetch();
    const onExpensesUpdated = () => expensesQuery.refetch();
    const onMaintenanceUpdated = () => maintenanceRequestsQuery.refetch();

    window.addEventListener("paymentsUpdated", onPaymentsUpdated);
    window.addEventListener("expensesUpdated", onExpensesUpdated);
    window.addEventListener("maintenanceUpdated", onMaintenanceUpdated);

    return () => {
      window.removeEventListener("paymentsUpdated", onPaymentsUpdated);
      window.removeEventListener("expensesUpdated", onExpensesUpdated);
      window.removeEventListener("maintenanceUpdated", onMaintenanceUpdated);
    };
  }, [
    paymentsQuery.refetch,
    expensesQuery.refetch,
    maintenanceRequestsQuery.refetch,
  ]);

  React.useEffect(() => {
    if (propertiesQuery.error) {
      console.error("Failed to fetch properties", propertiesQuery.error);
    }
  }, [propertiesQuery.error]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useAppData must be used inside DataProvider");
  return ctx;
}
