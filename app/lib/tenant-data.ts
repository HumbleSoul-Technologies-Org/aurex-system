import { getCurrentUser } from '@/lib/services/auth'
import { getTenant } from '@/lib/services/tenants'
import { listPayments } from '@/lib/services/payments'

// Expose a small client-side tenant helper and payment history derived from local-store
export const currentTenant: any = ((): any => {
	try {
		if (typeof window === 'undefined') return null
		const user = getCurrentUser()
		if (user?.role === 'tenant') return getTenant(user.id)
		return null
	} catch (e) {
		return null
	}
})()

export const paymentHistory: any[] = ((): any[] => {
	try {
		if (typeof window === 'undefined') return []
		const all = listPayments()
		const tenant = currentTenant
		if (!tenant) return all
		return all.filter(p => p.tenantId === tenant.id)
	} catch (e) {
		return []
	}
})()

export const maintenanceRequests: any[] = []
export const notifications: any[] = []
export const managementContacts: any[] = []
export const propertyInfo: any = null
