import {
  getCollection,
  insertIntoCollection,
  updateInCollection,
  findInCollection,
  removeFromCollection,
  generateId,
} from "@/lib/local-store";
import {
  getProperty,
  updateProperty,
  PropertyRecord,
} from "@/lib/services/properties";
import { apiRequest, queryClient } from "@/lib/query-client";
import { notifyNewTenant } from "@/lib/services/notifications";
import { useAuth } from "../auth-context";
import { getStoredUser } from "@/lib/token-manager";

export interface NotificationChannelSettings {
  email: boolean;
  sms: boolean;
}

export interface NotificationPreferences {
  overdue: NotificationChannelSettings;
  leaseEnd: NotificationChannelSettings;
  maintenance: NotificationChannelSettings;
  profileChanges: NotificationChannelSettings;
  messages: NotificationChannelSettings;
}

export interface MoveOutNotice {
  noticeDate?: string;
  reason?: string;
  forwardingAddress?: string;
  additionalNotes?: string;
  status?: "draft" | "submitted";
}

export interface TenantRecord {
  announcements: boolean;
  messages: any;
  id: string;
  _id?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  tenantType?: "residential" | "commercial" | "mixed";
  unitNumber?: string;
  propertyId?: string;
  rentAmount?: number;
  leaseType?: string;
  leaseStartDate?: string;
  leaseRenewDate?: string;
  leaseEndDate?: string;
  leaseTerms?: string;
  emergencyContact?: string;
  notes?: string;
  preferredContactMethod?: "email" | "phone" | "sms";
  applicationDate?: string;
  moveInDate?: string;
  dateOfBirth?: string;
  employmentInfo?: string;
  previousAddresses?: string[];
  coSigner?: string;
  pets?: string;
  vehicles?: string;
  businessInfo?: string;
  businessContacts?: string;
  financialInfo?: string;
  securityDeposit?: string;
  status?: string;
  image?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;
  notificationPreferences?: NotificationPreferences;
  documentDelivery?: "email" | "in-app" | "both";
  moveOutNotice?: MoveOutNotice;
  avatar?: { url?: string; public_id?: string };
  currentBalance?: number;
  isBlocked?: boolean;
}

export function normalizeTenantRecord(tenant: any): TenantRecord {
  return {
    ...tenant,
    id: tenant.id || tenant._id || "",
  } as TenantRecord;
}

export function listTenants(): TenantRecord[] {
  return getCollection<TenantRecord>("tenants").map(normalizeTenantRecord);
}

export function getTenant(id: string): TenantRecord | null {
  return listTenants().find((t) => t.id === id || t._id === id) ?? null;
}

export function updateTenant(
  id: string,
  patch: Partial<TenantRecord>,
): TenantRecord | null {
  return updateInCollection<TenantRecord>("tenants", id, patch);
}

export async function createTenantApi(
  payload: Partial<TenantRecord>,
  token?: string,
): Promise<TenantRecord> {
  const res = await apiRequest("POST", "/tenants/create", payload, token);
  const data = await res.json();
  // Backend returns { tenant: newTenant }, extract it and map _id to id
  const tenantData = data.tenant || data.data.tenant || data.data;
  const tenant: TenantRecord = {
    ...tenantData,
    id: tenantData.id || tenantData._id,
  } as TenantRecord;

  if (tenant?.id) {
    const existing = findInCollection<TenantRecord>(
      "tenants",
      (t) => t.id === tenant.id,
    );

    if (existing) {
      updateInCollection<TenantRecord>("tenants", tenant.id, tenant);
    } else {
      insertIntoCollection<TenantRecord>("tenants", tenant);
    }

    queryClient.setQueryData<TenantRecord[]>(["tenants"], (current) =>
      current
        ? current.map((item) => (item.id === tenant.id ? tenant : item))
        : listTenants(),
    );

    // Also update properties cache: attach the new tenant object to the matching property's `tenants` array
    try {
      const storedUser = getStoredUser();
      const adminId = storedUser?.id || storedUser?._id || null;
      if (tenant?.propertyId && adminId) {
        queryClient.setQueryData<any>(
          ["properties", adminId],
          (current: any) => {
            if (!current) return current;
            return current.map((prop: any) => {
              if (prop.id === tenant.propertyId) {
                const existingTenants = Array.isArray(prop.tenants)
                  ? prop.tenants
                  : [];
                return { ...prop, tenants: [...existingTenants, tenant] };
              }
              return prop;
            });
          },
        );
      }
    } catch (e) {
      // best-effort cache update; ignore errors
      console.error(
        "Failed to update properties cache after creating tenant",
        e,
      );
    }

    if (tenant.propertyId) {
      const prop = getProperty(tenant.propertyId);
      if (prop) {
        const existingIds = Array.isArray(prop.tenants)
          ? prop.tenants.map((t: any) => (typeof t === "string" ? t : t._id))
          : [];
        const updatedTenants = [...existingIds, tenant._id];
        await updateProperty(prop._id || prop.id, { tenants: updatedTenants });
      }
    }
  }

  return tenant;
}

export async function updateTenantApi(
  id: string,
  patch: Partial<TenantRecord>,
  token?: string,
): Promise<TenantRecord | null> {
  try {
    console.log("====================================");
    console.log(id);
    console.log("====================================");
    const res = await apiRequest("PUT", `/tenants/${id}/update`, patch, token);
    const data = await res.json();
    // Backend returns { tenant: updatedTenant }, extract it and map _id to id
    const tenantData = data.tenant || data.data.tenant || data.data;
    const tenant: TenantRecord = {
      ...tenantData,
      id: tenantData.id || tenantData._id,
    } as TenantRecord;

    if (tenant?._id) {
      const existing = findInCollection<TenantRecord>(
        "tenants",
        (t) => t._id === tenant._id,
      );
      if (existing) {
        updateInCollection<TenantRecord>("tenants", tenant._id, tenant);
      } else {
        insertIntoCollection<TenantRecord>("tenants", tenant);
      }

      queryClient.setQueryData<TenantRecord[]>(["tenants"], (current) =>
        current
          ? current.map((item) => (item._id === tenant._id ? tenant : item))
          : listTenants(),
      );

      // Best-effort: update properties cache to reflect updated tenant object
      try {
        const storedUser = getStoredUser();
        const adminId = storedUser?.id || storedUser?._id || null;
        if (tenant?.propertyId && adminId) {
          queryClient.setQueryData<any>(
            ["properties", adminId],
            (current: any) => {
              if (!current) return current;
              return current.map((prop: any) => {
                if (prop.id === tenant.propertyId) {
                  const tenantsArr = Array.isArray(prop.tenants)
                    ? [...prop.tenants]
                    : [];
                  const idx = tenantsArr.findIndex(
                    (t: any) => (t?.id || t) === tenant._id,
                  );
                  if (idx !== -1) {
                    tenantsArr[idx] = tenant;
                  } else {
                    tenantsArr.push(tenant);
                  }
                  return { ...prop, tenants: tenantsArr };
                }
                return prop;
              });
            },
          );
        }
      } catch (e) {
        console.error(
          "Failed to update properties cache after updating tenant",
          e,
        );
      }
    }

    return tenant;
  } catch (e) {
    console.error("updateTenantApi failed", e);
    throw e;
  }
}

export async function updateTenantAvatarApi(
  id: string,
  payload: { avatar: { url: string; public_id: string } },
  token?: string,
): Promise<TenantRecord | null> {
  try {
    const res = await apiRequest(
      "PUT",
      `/tenants/${id}/avatar`,
      payload,
      token,
    );
    const data = await res.json();
    const tenantData = data.tenant || data.data.tenant || data.data;
    const tenant: TenantRecord = {
      ...tenantData,
      id: tenantData.id || tenantData._id,
    } as TenantRecord;

    if (tenant?._id) {
      const existing = findInCollection<TenantRecord>(
        "tenants",
        (t) => t._id === tenant._id,
      );
      if (existing) {
        updateInCollection<TenantRecord>("tenants", tenant._id, tenant);
      } else {
        insertIntoCollection<TenantRecord>("tenants", tenant);
      }

      queryClient.setQueryData<TenantRecord[]>(["tenants"], (current) =>
        current
          ? current.map((item) => (item._id === tenant._id ? tenant : item))
          : listTenants(),
      );

      try {
        const storedUser = getStoredUser();
        const adminId = storedUser?.id || storedUser?._id || null;
        if (tenant?.propertyId && adminId) {
          queryClient.setQueryData<any>(
            ["properties", adminId],
            (current: any) => {
              if (!current) return current;
              return current.map((prop: any) => {
                if (prop.id === tenant.propertyId) {
                  const tenantsArr = Array.isArray(prop.tenants)
                    ? [...prop.tenants]
                    : [];
                  const idx = tenantsArr.findIndex(
                    (t: any) => (t?.id || t) === tenant._id,
                  );
                  if (idx !== -1) {
                    tenantsArr[idx] = tenant;
                  } else {
                    tenantsArr.push(tenant);
                  }
                  return { ...prop, tenants: tenantsArr };
                }
                return prop;
              });
            },
          );
        }
      } catch (e) {
        console.error(
          "Failed to update properties cache after updating tenant avatar",
          e,
        );
      }
    }

    return tenant;
  } catch (e) {
    console.error("updateTenantAvatarApi failed", e);
    throw e;
  }
}

export async function deleteTenantApi(
  id: string,
  token?: string,
): Promise<boolean> {
  try {
    const res = await apiRequest(
      "DELETE",
      `/tenants/${id}/delete`,
      undefined,
      token,
    );
    const data = await res.json();
    // Backend returns { message: 'Tenant deleted successfully' }, check if response was OK
    const success = res.ok && (data?.message || data?.success);

    if (success) {
      // remove from local-store
      const tenant = getTenant(id);
      if (tenant?.propertyId) {
        const prop = getProperty(tenant.propertyId);
        if (prop) {
          const updatedTenants = (prop.tenants || [])
            .map((t: any) => (typeof t === "string" ? t : t.id))
            .filter((tid) => tid !== id);
          // persist property change via updateProperty (server-side)
          updateProperty(prop.id, { tenants: updatedTenants });
        }
      }

      removeFromCollection("tenants", id);
      queryClient.setQueryData<TenantRecord[]>(["tenants"], (current) =>
        current ? current.filter((tenant) => tenant.id !== id) : [],
      );

      // update properties cache to remove tenant object from any property's tenants
      try {
        const storedUser = getStoredUser();
        const adminId = storedUser?.id || storedUser?._id || null;
        if (adminId) {
          queryClient.setQueryData<any>(
            ["properties", adminId],
            (current: any) => {
              if (!current) return current;
              return current.map((prop: any) => {
                if (!Array.isArray(prop.tenants)) return prop;
                const filtered = prop.tenants.filter(
                  (t: any) => (t?.id || t) !== id,
                );
                return { ...prop, tenants: filtered };
              });
            },
          );
        }
      } catch (e) {
        console.error(
          "Failed to update properties cache after deleting tenant",
          e,
        );
      }

      return true;
    }

    return false;
  } catch (e) {
    console.error("deleteTenantApi failed", e);
    throw e;
  }
}

export function deleteTenant(id: string): boolean {
  const tenant = getTenant(id);
  if (!tenant) return false;

  // remove tenant from property's tenant list if present
  if (tenant.propertyId) {
    const prop = getProperty(tenant.propertyId);
    if (prop) {
      const updatedTenants = (prop.tenants || [])
        .map((t: any) => (typeof t === "string" ? t : t.id))
        .filter((tid) => tid !== id);
      updateProperty(prop.id, { tenants: updatedTenants });
    }
  }

  const removed = removeFromCollection("tenants", id);
  if (removed) {
    queryClient.setQueryData<TenantRecord[]>(["tenants"], (current) =>
      current ? current.filter((tenant) => tenant.id !== id) : [],
    );
    // Also update properties cache to remove tenant from any property's tenants array
    try {
      const storedUser = getStoredUser();
      const adminId = storedUser?.id || storedUser?._id || null;
      if (adminId) {
        queryClient.setQueryData<any>(
          ["properties", adminId],
          (current: any) => {
            if (!current) return current;
            return current.map((prop: any) => {
              if (!Array.isArray(prop.tenants)) return prop;
              const filtered = prop.tenants.filter(
                (t: any) => (t?.id || t) !== id,
              );
              return { ...prop, tenants: filtered };
            });
          },
        );
      }
    } catch (e) {
      console.error(
        "Failed to update properties cache after deleting tenant",
        e,
      );
    }
  }
  return removed;
}
export function findTenantByEmail(email: string): TenantRecord | null {
  return findInCollection<TenantRecord>("tenants", (t) => t.email === email);
}
