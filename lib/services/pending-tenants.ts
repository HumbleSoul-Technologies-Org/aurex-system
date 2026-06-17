import { apiRequest } from "@/lib/query-client";

export interface PendingTenant {
  _id: string;
  propertyId: string;
  inviteToken: string;
  email: string;
  name: string;
  phone: string;
  dateOfBirth?: string;
  tenantType: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  leaseType: string;
  leaseTerms?: string;
  preferredContactMethod: string;
  applicationDate?: string;
  moveInDate?: string;
  rentAmount?: number;
  securityDeposit?: string;
  emergencyContact?: string;
  employmentInfo?: string;
  preferredName?: string;
  middleName?: string;
  gender?: "male" | "female" | "non-binary" | "other";
  maritalStatus?: "single" | "married" | "divorced" | "widowed" | "separated";
  nationality?: string;
  placeOfOrigin?: string;
  hasFamily?: boolean;
  householdMembers?: Array<{
    name?: string;
    relationship?: string;
    age?: number;
  }>;
  cohabitant?: {
    name?: string;
    relationship?: string;
  };
  occupation?: string;
  employerName?: string;
  position?: string;
  nextOfKin?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
  previousAddresses?: string;
  coSigner?: string;
  pets?: string;
  vehicles?: string;
  businessInfo?: string;
  businessContacts?: string;
  financialInfo?: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch all pending tenants for the authenticated admin
 */
export async function getPendingTenants(
  token: string | null,
): Promise<PendingTenant[]> {
  try {
    const response = await apiRequest(
      "GET",
      "/pending-tenants",
      undefined,
      token ? token : "",
    );
    const data: any = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch pending tenants");
    }

    return data.pendingTenants || [];
  } catch (error: any) {
    console.error("Failed to fetch pending tenants:", error);
    throw error;
  }
}

/**
 * Approve a pending tenant and create active tenant account
 */
export async function approvePendingTenant(
  pendingTenantId: string,
  token?: string,
): Promise<any> {
  try {
    const response = await apiRequest(
      "POST",
      `/pending-tenants/${pendingTenantId}/approve`,
      undefined,
      token,
    );
    const data: any = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to approve tenant");
    }

    return data;
  } catch (error: any) {
    console.error("Failed to approve pending tenant:", error);
    throw error;
  }
}

/**
 * Reject a pending tenant registration
 */
export async function rejectPendingTenant(
  pendingTenantId: string,
  reason?: string,
  token?: string,
): Promise<any> {
  try {
    const response = await apiRequest(
      "POST",
      `/pending-tenants/${pendingTenantId}/reject`,
      {
        reason,
      },
      token,
    );
    const data: any = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to reject tenant");
    }

    return data;
  } catch (error: any) {
    console.error("Failed to reject pending tenant:", error);
    throw error;
  }
}
