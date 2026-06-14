"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./query-client";
import { useAuth } from "./auth-context";
import {
  getPropertyById,
  listProperties,
  listPropertiesApi,
  PropertyRecord,
  PROPERTY_LIST_FIELDS,
} from "./services/properties";
import { listTenants, TenantRecord } from "./services/tenants";
import {
  getPaymentsForProperty,
  listPayments,
  PaymentRecord,
} from "./services/payments";
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
  isInitialDataLoading: boolean;
  isPaymentsLoading: boolean;
  isExpensesLoading: boolean;
  isPaymentsInitialLoading: boolean;
  isExpensesInitialLoading: boolean;
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
  token?: string,
): Promise<PropertyRecord[]> {
  const normalizedRole = userRole?.toLowerCase() || "";
  if (
    !adminId ||
    (normalizedRole !== "admin" && normalizedRole !== "property_manager")
  ) {
    return listProperties();
  }

  try {
    return await listPropertiesApi(adminId, {
      token,
      fields: PROPERTY_LIST_FIELDS,
    });
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
  const { user, token, isLoading: authLoading } = useAuth();
  const adminId = user?.id || null;
  const [paymentsError, setPaymentsError] = React.useState<string | null>(null);
  const [expensesError, setExpensesError] = React.useState<string | null>(null);

  async function fetchPaymentsWithErrorHandling(
    propertyIds: string[] | null,
    token: string | null,
  ): Promise<PaymentRecord[]> {
    try {
      setPaymentsError(null);
      console.log(
        "[DataProvider] fetchPaymentsWithErrorHandling - propertyIds:",
        propertyIds,
        "has token:",
        !!token,
      );
      const result = await fetchPayments(propertyIds, token);
      console.log(
        "[DataProvider] Payment fetch succeeded, returned:",
        result.length,
        "payments",
      );
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[DataProvider] Payment fetch error:", message);
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
    queryKey: ["properties", adminId, user?.role, token || ""] as const,
    queryFn: () => {
      console.log(
        "[DataProvider] propertiesQuery queryFn triggered - adminId:",
        adminId,
        "role:",
        user?.role,
        "token exists:",
        !!token,
      );
      return fetchProperties(adminId, user?.role ?? null, token ?? undefined);
    },
    initialData: authLoading ? undefined : () => listProperties(),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
    enabled: !authLoading,
  });

  const assignedPropertyQuery = useQuery({
    queryKey: ["property", user?.propertyId || ""],
    queryFn: async () =>
      getPropertyById(user?.propertyId ?? "", token ?? undefined),
    enabled:
      !authLoading &&
      Boolean(
        (user?.role === "security_guard" || user?.role === "tenant") &&
        user?.propertyId,
      ),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const maintenanceRequestsQuery = useQuery({
    queryKey: ["maintenanceRequests"],
    queryFn: fetchMaintenanceRequests,
    initialData: () => [] as MaintenanceRequest[],
    staleTime: 1000 * 60 * 5,
    refetchInterval: 5000,
    refetchOnMount: true,
  });

  // derive tenants from properties (API now returns populated tenant subdocuments)
  const propertiesData = React.useMemo(() => {
    const baseProperties = propertiesQuery.data ?? listProperties();
    const assignedProperty = assignedPropertyQuery.data;

    if (!assignedProperty) {
      return baseProperties;
    }

    const matchIndex = baseProperties.findIndex(
      (property) =>
        property.id === assignedProperty.id ||
        property._id === assignedProperty.id,
    );

    if (matchIndex >= 0) {
      return [
        ...baseProperties.slice(0, matchIndex),
        assignedProperty,
        ...baseProperties.slice(matchIndex + 1),
      ];
    }

    return [...baseProperties, assignedProperty];
  }, [propertiesQuery.data, assignedPropertyQuery.data]);

  const expensePropertyIds = React.useMemo(() => {
    return propertiesData
      .map((property) => property.id || property._id || "")
      .filter(Boolean);
  }, [propertiesData]);

  const expensesQuery = useQuery({
    queryKey: ["expenses", expensePropertyIds, token || ""],
    queryFn: () =>
      fetchExpensesWithErrorHandling(expensePropertyIds, token ?? null),
    enabled: !authLoading && expensePropertyIds.length > 0,
    initialData: authLoading ? undefined : () => [] as ExpenseRecord[],
    staleTime: 1000 * 60 * 5,
    refetchInterval: 5000,
    refetchOnMount: true,
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
    console.log(
      "[DataProvider] paymentPropertyIds computed - currentTenant:",
      currentTenant?.id,
      "currentProperty:",
      currentProperty?.id,
      "propertiesData count:",
      propertiesData.length,
    );
    if (currentProperty?.id) {
      console.log(
        "[DataProvider] Using currentProperty ID:",
        currentProperty.id,
      );
      return [currentProperty.id];
    }

    const ids = propertiesData
      .map((property) => property.id || property._id || "")
      .filter(Boolean);
    console.log("[DataProvider] Using all property IDs:", ids);
    return ids;
  }, [currentProperty, propertiesData]);

  const paymentsQuery = useQuery({
    queryKey: ["payments", paymentPropertyIds.join(","), token || ""] as const,
    queryFn: () => {
      console.log(
        "[DataProvider] paymentsQuery queryFn triggered - paymentPropertyIds:",
        paymentPropertyIds,
        "token exists:",
        !!token,
      );
      return fetchPaymentsWithErrorHandling(paymentPropertyIds, token ?? null);
    },
    enabled: !authLoading && paymentPropertyIds.length > 0,
    initialData: authLoading
      ? undefined
      : () =>
          listPayments().filter((payment) =>
            paymentPropertyIds.includes(payment.propertyId || ""),
          ),
    staleTime: 1000 * 60 * 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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

  const isPaymentsLoading = paymentsQuery.isLoading || paymentsQuery.isFetching;
  const isExpensesLoading = expensesQuery.isLoading || expensesQuery.isFetching;
  const isPaymentsInitialLoading =
    paymentsQuery.isLoading ||
    (paymentsQuery.isFetching && !paymentsQuery.isFetchedAfterMount);
  const isExpensesInitialLoading =
    expensesQuery.isLoading ||
    (expensesQuery.isFetching && !expensesQuery.isFetchedAfterMount);

  const isInitialDataLoading =
    authLoading ||
    propertiesQuery.isLoading ||
    assignedPropertyQuery.isLoading ||
    paymentsQuery.isLoading ||
    expensesQuery.isLoading ||
    maintenanceRequestsQuery.isLoading ||
    (propertiesQuery.isFetching && !propertiesQuery.isFetchedAfterMount) ||
    (assignedPropertyQuery.isFetching &&
      !assignedPropertyQuery.isFetchedAfterMount) ||
    (paymentsQuery.isFetching && !paymentsQuery.isFetchedAfterMount) ||
    (expensesQuery.isFetching && !expensesQuery.isFetchedAfterMount) ||
    (maintenanceRequestsQuery.isFetching &&
      !maintenanceRequestsQuery.isFetchedAfterMount);

  const value: DataContextValue = {
    properties: propertiesData,
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
    isInitialDataLoading,
    isPaymentsLoading,
    isExpensesLoading,
    isPaymentsInitialLoading,
    isExpensesInitialLoading,
    paymentsError,
    expensesError,
    isError:
      propertiesQuery.isError ||
      assignedPropertyQuery.isError ||
      paymentsQuery.isError ||
      expensesQuery.isError ||
      maintenanceRequestsQuery.isError ||
      Boolean(paymentsError) ||
      Boolean(expensesError),
    refetch: () => {
      propertiesQuery.refetch();
      assignedPropertyQuery.refetch();
    },
    refetchAll: () => {
      propertiesQuery.refetch();
      assignedPropertyQuery.refetch();
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
    if (paymentsQuery.isSuccess && Array.isArray(paymentsQuery.data)) {
      writeCollection("payments", paymentsQuery.data);
    }
  }, [paymentsQuery.data, paymentsQuery.isSuccess]);

  React.useEffect(() => {
    if (expensesQuery.isSuccess && Array.isArray(expensesQuery.data)) {
      writeCollection("expenses", expensesQuery.data);
    }
  }, [expensesQuery.data, expensesQuery.isSuccess]);

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
