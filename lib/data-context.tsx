"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./query-client";
import { useAuth } from "./auth-context";
import { listProperties, PropertyRecord } from "./services/properties";
import { listTenants, TenantRecord } from "./services/tenants";
import { writeCollection } from "./local-store";

interface DataContextValue {
  properties: PropertyRecord[];
  tenants: TenantRecord[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
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
): Promise<PropertyRecord[]> {
  const endpoint = adminId ? `/property/${adminId}/all` : "/property/all";
  const res = await apiRequest("GET", endpoint);
  const data = await res.json();

  console.log('====================================');
  console.log(data);
  console.log('====================================');

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
}

// Tenant data is now derived from populated `property.tenants` returned by the properties API.
// No separate tenant fetch required.
// If you still need a standalone tenant endpoint later, re-introduce a fetch function.

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const adminId = user?.id || user?._id || null;

  const propertiesQuery = useQuery({
    queryKey: ["properties", adminId] as const,
    queryFn: () => fetchProperties(adminId),
    initialData: () => listProperties(),
    staleTime: 1000 * 60 * 2,
  });

  // derive tenants from properties (API now returns populated tenant subdocuments)
  const propertiesData = propertiesQuery.data ?? listProperties();
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

  const value: DataContextValue = {
    properties: propertiesQuery.data ?? listProperties(),
    tenants: tenantsDerived ?? listTenants(),
    isLoading: propertiesQuery.isLoading,
    isFetching: propertiesQuery.isFetching,
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
