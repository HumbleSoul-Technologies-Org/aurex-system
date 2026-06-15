import { getAuthToken } from "@/lib/token-manager";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getServerErrorMessage(errorData: any, defaultMessage: string) {
  return (
    errorData?.message ||
    errorData?.error?.message ||
    errorData?.error?.details?.message ||
    defaultMessage
  );
}

const SERVER_ROOT = API_URL?.replace(/\/$/, "") || "http://localhost:5454";
const ADMIN_API_BASE = `${SERVER_ROOT}/admin`;

function adminFetch(path: string, options: RequestInit = {}) {
  return fetch(`${ADMIN_API_BASE}${path}`, options);
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "admin" | "property_manager" | "tenant" | "security_guard";
  status: "active" | "inactive" | "locked";
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  loginAttempts: number;
  propertyId?: string;
  assignedProperty?: {
    id?: string;
    _id?: string;
    name?: string;
  };
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "property_manager" | "security_guard";
  phone?: string;
  password?: string;
  propertyId?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: "admin" | "property_manager" | "tenant" | "security_guard";
  status?: "active" | "inactive" | "locked";
  propertyId?: string;
}

export interface ListUsersOptions {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListUsersResponse {
  success: boolean;
  data: {
    users: AdminUser[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AdminApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// User Management
export async function listAdminUsers(
  options?: ListUsersOptions,
): Promise<ListUsersResponse> {
  try {
    const params = new URLSearchParams();
    if (options?.role) params.append("role", options.role);
    if (options?.status) params.append("status", options.status);
    if (options?.search) params.append("search", options.search);
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());

    const token = getAuthToken();
    const response = await adminFetch(`/invites?${params}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        getServerErrorMessage(errorData, "Failed to fetch users"),
      );
    }

    const json = await response.json();
    const responseData = json.data;

    function normalizeAdminUser(rawUser: any): AdminUser {
      const id = rawUser.id || rawUser._id || "";
      const assignedProperty = rawUser.assignedProperty
        ? {
            ...rawUser.assignedProperty,
            id: rawUser.assignedProperty.id || rawUser.assignedProperty._id,
          }
        : undefined;

      return {
        ...rawUser,
        id,
        assignedProperty,
      };
    }

    const users = Array.isArray(responseData)
      ? responseData
      : (responseData?.users ?? []);
    const normalizedUsers = users.map(normalizeAdminUser);

    if (Array.isArray(responseData)) {
      const pagination = json.meta?.pagination || {};
      return {
        success: json.success,
        data: {
          users: normalizedUsers,
          total: Number(pagination.total ?? normalizedUsers.length ?? 0),
          page: Number(pagination.page ?? 1),
          limit: Number(pagination.limit ?? normalizedUsers.length ?? 0),
          pages: Number(pagination.pages ?? 1),
        },
      };
    }

    return {
      success: json.success,
      data: {
        users: normalizedUsers,
        total: Number(responseData.total ?? normalizedUsers.length ?? 0),
        page: Number(responseData.page ?? 1),
        limit: Number(responseData.limit ?? normalizedUsers.length ?? 0),
        pages: Number(responseData.pages ?? 1),
      },
    };
  } catch (error) {
    console.error("Error listing users:", error);
    throw error;
  }
}

export async function getAdminUser(
  userId: string,
): Promise<AdminApiResponse<AdminUser>> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/auth/admin/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(getServerErrorMessage(errorData, "Failed to fetch user"));
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

export async function updateAdminUser(
  userId: string,
  data: UpdateUserPayload,
): Promise<AdminApiResponse<AdminUser>> {
  try {
    const token = getAuthToken();
    const response = await adminFetch("/invites", {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        getServerErrorMessage(errorData, "Failed to update user"),
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function deleteAdminUser(
  userId: string,
): Promise<AdminApiResponse<{ message: string }>> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/auth/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        getServerErrorMessage(errorData, "Failed to delete user"),
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

export async function createAdminUser(
  data: CreateUserPayload,
): Promise<AdminApiResponse<AdminUser>> {
  try {
    // const token = getAuthToken();
    const response = await fetch(`${API_URL}/auth/admin/create-user`, {
      method: "POST",
      headers: {
        // 'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        getServerErrorMessage(errorData, "Failed to create user"),
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function resendVerificationEmail(
  userId: string,
): Promise<AdminApiResponse<any>> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/auth/send-verification-email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Failed to resend verification email",
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error resending verification email:", error);
    throw error;
  }
}

// Invite Management (placeholder - backend endpoints to be created)
export async function createInvite(data: {
  email: string;
  role: string;
  message?: string;
}): Promise<AdminApiResponse<any>> {
  try {
    const token = getAuthToken();
    const response = await adminFetch("/invites", {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create invite");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating invite:", error);
    throw error;
  }
}

export async function listInvites(options?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<AdminApiResponse<any>> {
  try {
    const params = new URLSearchParams();
    if (options?.status) params.append("status", options.status);
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());

    const token = getAuthToken();
    const response = await adminFetch(`/invites?${params}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch invites");
    }

    return await response.json();
  } catch (error) {
    console.error("Error listing invites:", error);
    throw error;
  }
}

export async function resendInvite(
  inviteId: string,
): Promise<AdminApiResponse<any>> {
  try {
    const token = getAuthToken();
    const response = await adminFetch(`/invites/${inviteId}/resend`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to resend invite");
    }

    return await response.json();
  } catch (error) {
    console.error("Error resending invite:", error);
    throw error;
  }
}

export async function deleteInvite(
  inviteId: string,
): Promise<AdminApiResponse<{ message: string }>> {
  try {
    const token = getAuthToken();
    const response = await adminFetch(`/invites/${inviteId}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete invite");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting invite:", error);
    throw error;
  }
}
