import { getAuthToken } from "@/lib/token-manager";
import { apiRequest } from "../query-client";
const API_HOST = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5454";

export type VisitStatus =
  | "scheduled"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "completed";

export interface VisitRecord {
  id: string;
  _id?: string;
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
  visitDate?: string;
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
    const response = await apiRequest(
      "POST",
      "/visits/create",
      payload,
      token ? token : undefined,
    );

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
    if (options?.visitDate) params.append("visitDate", options.visitDate);
    if (options?.page) params.append("page", String(options.page));
    if (options?.limit) params.append("limit", String(options.limit));

    const token = getAuthToken();
    // If a guardId is provided we call the public visits route, otherwise use the admin listing

    const response = await apiRequest(
      "GET",
      `/visits/admin/all?${params.toString()}`,
      null,
      token ? token : undefined,
    );

    console.log("List Visits Response:", response);

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
    const response = await apiRequest(
      "PUT",
      `/visits/${id}/update`,
      payload,
      token ? token : undefined,
    );

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
    const response = await apiRequest(
      `/visits/${id}/delete`,
      "DELETE",
      null,
      token ? token : undefined,
    );

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
