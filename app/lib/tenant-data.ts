import { getCurrentUser } from '@/lib/services/auth'
import { getTenant } from '@/lib/services/tenants'
import { getPaymentsForTenant } from '@/lib/services/payments'

// Expose a small client-side tenant helper and payment history derived from local-store
export const currentTenant: any = ((): any => {
	try {
		if (typeof window === 'undefined') return null
    const user = getCurrentUser()
    if (user?.role !== 'admin') return user?.id ? getTenant(user.id) : null
		return null
	} catch (e) {
		return null
	}
})()

export const paymentHistory: any[] = []

export async function fetchPaymentHistory(): Promise<any[]> {
  try {
    if (typeof window === 'undefined') return []
    const tenant = currentTenant
    if (!tenant?.id) return []
    const payments = await getPaymentsForTenant(tenant.id)
    return payments
  } catch (e) {
    return []
  }
}

export const maintenanceRequests: any[] = []
export const notifications: any[] = []
export const managementContacts: any[] = []
export const propertyInfo: any = null
