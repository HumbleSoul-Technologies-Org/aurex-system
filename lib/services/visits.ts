import { getAuthToken } from "@/lib/token-manager";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5454";
const API_BASE_URL = API_HOST.replace(/\/+$/, "");
const API_PREFIX = API_BASE_URL.endsWith("/api")
  ? API_BASE_URL
  : `${API_BASE_URL}/api`;

export type VisitStatus =
  | "scheduled"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "completed";

export interface VisitRecord {
  id: string;
  securityGuardId: string;
  securityGuardName: string;
  visitorName: string;
  visitorPhone?: string;
  propertyId?: string;
  propertyName?: string;
  hostTenantId?: string;
  hostTenantName?: string;
  visitDate: string;
  visitTime: string;
  purpose?: string;
  notes?: string;
  status: VisitStatus;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitPayload {
  securityGuardId: string;
  securityGuardName: string;
  visitorName: string;
  visitorPhone?: string;
  propertyId?: string;
  propertyName?: string;
  hostTenantId?: string;
  hostTenantName?: string;
  visitDate: string;
  visitTime: string;
  purpose?: string;
  notes?: string;
  status: VisitStatus;
}

export interface UpdateVisitPayload {
  status?: VisitStatus;
  visitorPhone?: string;
  purpose?: string;
  notes?: string;
  isArchived?: boolean;
}

export interface ListVisitsOptions {
  guardId?: string;
  search?: string;
  status?: string;
  isArchived?: boolean;
  page?: number;
  limit?: number;
}

export interface ListVisitsResponse {
  success: boolean;
  data: {
    visits: VisitRecord[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  message?: string;
  error?: string;
}

export async function createVisit(
  payload: CreateVisitPayload,
): Promise<{ success: boolean; data?: VisitRecord; error?: string }> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_PREFIX}/visits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create visit");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating visit:", error);
    throw error;
  }
}

export async function listVisits(
  options?: ListVisitsOptions,
): Promise<ListVisitsResponse> {
  try {
    const params = new URLSearchParams();
    if (options?.guardId) params.append("guardId", options.guardId);
    if (options?.search) params.append("search", options.search);
    if (options?.status) params.append("status", options.status);
    if (typeof options?.isArchived !== "undefined") {
      params.append("isArchived", String(options.isArchived));
    }
    if (options?.page) params.append("page", String(options.page));
    if (options?.limit) params.append("limit", String(options.limit));

    const token = getAuthToken();
    const endpoint = `${API_PREFIX}/visits?${params.toString()}`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to list visits");
    }

    return await response.json();
  } catch (error) {
    console.error("Error listing visits:", error);
    throw error;
  }
}

export async function updateVisit(
  id: string,
  payload: UpdateVisitPayload,
): Promise<{ success: boolean; data?: VisitRecord; error?: string }> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_PREFIX}/visits/${id}/update`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update visit");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating visit:", error);
    throw error;
  }
}

export async function deleteVisit(
  id: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_PREFIX}/admin/visits/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete visit");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting visit:", error);
    throw error;
  }
}
