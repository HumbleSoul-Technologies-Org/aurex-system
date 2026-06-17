/**
 * Tenant Due-Date Checker
 *
 * Utility to identify tenants whose lease end dates have passed
 * and should be marked as "due".
 *
 * Used by admin dashboard to auto-check and update tenant status.
 */

import { TenantRecord } from "./tenants";

export interface TenantDueCheckResult {
  dueTenants: TenantRecord[];
  alreadyMarkedDue: TenantRecord[];
  tenantsToUpdate: TenantRecord[]; // due date passed and status != "due"
}

/**
 * Check if a tenant's lease has ended (past due date) and is not yet marked "due"
 */
function isTenantDue(tenant: TenantRecord): boolean {
  if (!tenant.leaseEndDate) return false;
  if (tenant.status === "due") return false; // already marked due

  const leaseEndDate = new Date(tenant.leaseEndDate);
  const today = new Date();

  // Normalize to start of day (00:00:00) for consistent day comparison
  const leaseEndDay = new Date(
    leaseEndDate.getFullYear(),
    leaseEndDate.getMonth(),
    leaseEndDate.getDate(),
  );
  const todayDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return leaseEndDay < todayDay;
}

/**
 * Analyze tenants and return those needing due status update
 *
 * @param tenants List of tenants from the property/data context
 * @returns Object with due, already marked, and tenants to update
 */
export function checkTenantsForDueStatus(
  tenants: TenantRecord[],
): TenantDueCheckResult {
  const dueTenants: TenantRecord[] = [];
  const alreadyMarkedDue: TenantRecord[] = [];
  const tenantsToUpdate: TenantRecord[] = [];

  for (const tenant of tenants) {
    if (!tenant.leaseEndDate) continue;

    const leaseEndDate = new Date(tenant.leaseEndDate);
    const today = new Date();
    const leaseEndDay = new Date(
      leaseEndDate.getFullYear(),
      leaseEndDate.getMonth(),
      leaseEndDate.getDate(),
    );
    const todayDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    if (leaseEndDay < todayDay) {
      dueTenants.push(tenant);
      if (tenant.status === "due") {
        alreadyMarkedDue.push(tenant);
      } else {
        tenantsToUpdate.push(tenant);
      }
    }
  }

  return {
    dueTenants,
    alreadyMarkedDue,
    tenantsToUpdate,
  };
}

/**
 * Get IDs of tenants that need due status update
 */
export function getTenantIdsToMarkDue(tenants: TenantRecord[]): string[] {
  const { tenantsToUpdate } = checkTenantsForDueStatus(tenants);
  return tenantsToUpdate.map((t) => t.id || t._id || "").filter(Boolean);
}

/**
 * Log due status check results for debugging
 */
export function logDueCheckResults(
  tenants: TenantRecord[],
  verbose: boolean = false,
): void {
  const result = checkTenantsForDueStatus(tenants);

  if (result.tenantsToUpdate.length > 0) {
    console.log(
      `[Tenant Due Check] Found ${result.tenantsToUpdate.length} tenant(s) to mark due:`,
      result.tenantsToUpdate.map((t) => `${t.name} (${t.id})`),
    );
  }

  if (verbose) {
    console.log(
      `[Tenant Due Check] Already marked due: ${result.alreadyMarkedDue.length}`,
    );
    console.log(
      `[Tenant Due Check] Total past lease end date: ${result.dueTenants.length}`,
    );
  }
}
