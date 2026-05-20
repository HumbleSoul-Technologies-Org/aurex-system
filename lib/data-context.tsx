"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./query-client";
import { getStoredUser } from "./token-manager";
import { listProperties, PropertyRecord } from "./services/properties";
import { listTenants, TenantRecord } from "./services/tenants";
import { writeCollection } from "./local-store";

interface DataContextValue {
  properties: PropertyRecord[];
  tenants: TenantRecord[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

function getAdminId(): string | null {
  const storedUser = getStoredUser();
  return storedUser?.id || storedUser?._id || null;
}

async function fetchProperties(): Promise<PropertyRecord[]> {
  const adminId = getAdminId();
  const endpoint = adminId ? `/property/${adminId}/all` : "/property/all";
  const res = await apiRequest("GET", endpoint);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((property: any) => ({
    ...property,
    id: property.id || property._id || "",
    tenants: Array.isArray(property.tenants)
      ? property.tenants.map((tenant: any) => ({
          ...tenant,
          id: tenant.id || tenant._id || "",
        }))
      : property.tenants || [],
  }));
}

// Tenant data is now derived from populated `property.tenants` returned by the properties API.
// No separate tenant fetch required.
// If you still need a standalone tenant endpoint later, re-introduce a fetch function.

export function DataProvider({ children }: { children: ReactNode }) {
  const adminId = getAdminId();

  const propertiesQuery = useQuery({
    queryKey: ["properties", adminId] as const,
    queryFn: fetchProperties,
    initialData: () => listProperties(),
    staleTime: 1000 * 60 * 2,
  });

  // derive tenants from properties (API now returns populated tenant subdocuments)
  const propertiesData = propertiesQuery.data ?? listProperties();
  const tenantsDerived: TenantRecord[] = (propertiesData as any[])
    .flatMap((p) => (Array.isArray(p.tenants) ? p.tenants : []))
    .filter(Boolean)
    .map((tenant: any) => ({
      ...tenant,
      id: tenant.id || tenant._id || "",
    }));

  const value: DataContextValue = {
    properties: propertiesQuery.data ?? listProperties(),
    tenants: tenantsDerived ?? listTenants(),
    isLoading: propertiesQuery.isLoading,
    isError: propertiesQuery.isError,
    refetch: () => {
      propertiesQuery.refetch();
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
