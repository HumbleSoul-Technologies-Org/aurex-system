import { getAuthToken } from '@/lib/token-manager';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'property_manager' | 'tenant';
  status: 'active' | 'inactive' | 'locked';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  loginAttempts: number;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'property_manager';
  phone?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: 'admin' | 'property_manager' | 'tenant';
  status?: 'active' | 'inactive' | 'locked';
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
export async function listAdminUsers(options?: ListUsersOptions): Promise<ListUsersResponse> {
  try {
    const params = new URLSearchParams();
    if (options?.role) params.append('role', options.role);
    if (options?.status) params.append('status', options.status);
    if (options?.search) params.append('search', options.search);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());

    const token = getAuthToken();
    const response = await fetch(`${API_URL}/auth/admin/users?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch users');
    }

    return await response.json();
  } catch (error) {
    console.error('Error listing users:', error);
    throw error;
  }
}

export async function getAdminUser(userId: string): Promise<AdminApiResponse<AdminUser>> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/auth/admin/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function updateAdminUser(userId: string, data: UpdateUserPayload): Promise<AdminApiResponse<AdminUser>> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/auth/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteAdminUser(userId: string): Promise<AdminApiResponse<{ message: string }>> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/auth/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export async function createAdminUser(data: CreateUserPayload): Promise<AdminApiResponse<AdminUser>> {
  try {
    // const token = getAuthToken();
    const response = await fetch(`${API_URL}/auth/admin/create-user`, {
      method: 'POST',
      headers: {
        // 'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function resendVerificationEmail(userId: string): Promise<AdminApiResponse<any>> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/auth/send-verification-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to resend verification email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error resending verification email:', error);
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
    const response = await fetch(`${API_URL}/auth/admin/invites`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create invite');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating invite:', error);
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
    if (options?.status) params.append('status', options.status);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());

    const token = getAuthToken();
    const response = await fetch(`${API_URL}/auth/admin/invites?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch invites');
    }

    return await response.json();
  } catch (error) {
    console.error('Error listing invites:', error);
    throw error;
  }
}

export async function resendInvite(inviteId: string): Promise<AdminApiResponse<any>> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/auth/admin/invites/${inviteId}/resend`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to resend invite');
    }

    return await response.json();
  } catch (error) {
    console.error('Error resending invite:', error);
    throw error;
  }
}

export async function deleteInvite(inviteId: string): Promise<AdminApiResponse<{ message: string }>> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/auth/admin/invites/${inviteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete invite');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting invite:', error);
    throw error;
  }
}
