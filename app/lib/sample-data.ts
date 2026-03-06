// Mock/sample data removed per user request.
// Provide typed empty exports so consuming code compiles and typechecks.

// Use loose `any` types for the sample exports so UI code that expects
// legacy/mock shapes continues to compile after removing the large dataset.
export const sampleProperties: any[] = []
export const sampleTenants: any[] = []
export const sampleTransactions: any[] = []
export const sampleMaintenanceRequests: any[] = []
export const sampleVendors: any[] = []

export const chartData: any[] = []
export const expenseBreakdown: any[] = []
export const occupancyData: any[] = []

export const getEnrichedTenants = (): any[] => {
	return sampleTenants.map((tenant) => ({
		...tenant,
		property: sampleProperties.find((p) => p.id === tenant.propertyId),
	}))
}

export const getTenantTransactions = (tenantId: string): any[] => {
	return sampleTransactions.filter((transaction) => transaction.tenantId === tenantId)
}

export const getTenantRentPayments = (tenantId: string): any[] => {
	return sampleTransactions.filter((transaction) => transaction.tenantId === tenantId && transaction.type === 'rent')
}

export const getTenantExpenses = (tenantId: string): any[] => {
	return sampleTransactions.filter((transaction) => transaction.tenantId === tenantId && transaction.type === 'expense')
}
