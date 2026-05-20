import { getCollection, insertIntoCollection, updateInCollection, removeFromCollection, generateId } from '@/lib/local-store'
import { notifyNewMaintenanceRequest } from '@/lib/services/notifications'

export interface MaintenanceRequest {
  id: string
  propertyId: string
  propertyName: string
  unit: string
  tenantId?: string
  tenantName?: string
  description: string
  category: string
  location?: string
  contactMethod?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'assigned' | 'completed'
  createdDate: Date
  completedDate?: Date
  assignedTo?: string
  cost?: number
  transactionId?: string
}

const MAINTENANCE_KEY = 'maintenance'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555/api'
const MAINTENANCE_API_BASE = `${API_BASE}/maintenance`

export function getMaintenanceRequests(): MaintenanceRequest[] {
  return getCollection<MaintenanceRequest>(MAINTENANCE_KEY) || []
}

export function createMaintenanceRequest(request: Omit<MaintenanceRequest, 'id' | 'createdDate' | 'status'>): MaintenanceRequest {
  const newRequest: MaintenanceRequest = {
    ...request,
    id: generateId('maintenance'),
    createdDate: new Date(),
    status: 'pending',
  }

  insertIntoCollection(MAINTENANCE_KEY, newRequest)

  // Notify about new maintenance request
  notifyNewMaintenanceRequest(request.description, request.propertyName, newRequest.id)

  return newRequest
}

export function updateMaintenanceRequest(id: string, updates: Partial<MaintenanceRequest>): MaintenanceRequest | null {
  return updateInCollection<MaintenanceRequest>(MAINTENANCE_KEY, id, updates)
}

export function deleteMaintenanceRequest(id: string): boolean {
  return removeFromCollection(MAINTENANCE_KEY, id)
}

export function getMaintenanceRequest(id: string): MaintenanceRequest | null {
  return getCollection<MaintenanceRequest>(MAINTENANCE_KEY).find(r => r.id === id) || null
}

function mapMaintenanceRequestResponse(doc: any): MaintenanceRequest {
  return {
    id: doc._id || doc.id || '',
    propertyId: doc.propertyId || '',
    propertyName: doc.propertyName || '',
    unit: doc.unitNumber || doc.unit || '',
    tenantId: doc.tenantId,
    tenantName: doc.tenantName,
    description: doc.description || '',
    category: doc.category || 'other',
    location: doc.location,
    contactMethod: doc.contactMethod,
    priority: doc.priority || 'medium',
    status: doc.status || 'pending',
    createdDate: doc.createdAt
      ? new Date(doc.createdAt)
      : doc.createdDate
      ? new Date(doc.createdDate)
      : new Date(),
    completedDate: doc.completedDate ? new Date(doc.completedDate) : undefined,
    assignedTo: doc.assignedTo,
    cost: doc.cost,
    transactionId: doc.transactionId,
  }
}

async function parseJsonResponse(response: Response) {
  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload?.message || response.statusText || 'Failed to fetch maintenance data')
  }
  return payload
}

export async function fetchMaintenanceRequestsByTenant(tenantId: string): Promise<MaintenanceRequest[]> {
  const response = await fetch(`${MAINTENANCE_API_BASE}/tenant/${tenantId}/all`, {
    cache: 'no-store',
  })
  const data = await parseJsonResponse(response)
  return Array.isArray(data)
    ? data.map(mapMaintenanceRequestResponse)
    : []
}

export async function submitMaintenanceRequest(request: Omit<MaintenanceRequest, 'id' | 'createdDate' | 'status'>): Promise<MaintenanceRequest> {
  const response = await fetch(`${MAINTENANCE_API_BASE}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...request,
      unitNumber: request.unit,
    }),
  })
  const data = await parseJsonResponse(response)
  return mapMaintenanceRequestResponse(data.maintenanceRequest || data)
}

export async function deleteMaintenanceRequestById(id: string): Promise<boolean> {
  const response = await fetch(`${MAINTENANCE_API_BASE}/${id}/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  await parseJsonResponse(response)
  return true
}

export async function fetchAllMaintenanceRequests(): Promise<MaintenanceRequest[]> {
  const response = await fetch(`${MAINTENANCE_API_BASE}/all`, {
    cache: 'no-store',
  })
  const data = await parseJsonResponse(response)
  return Array.isArray(data) ? data.map(mapMaintenanceRequestResponse) : []
}

export async function updateMaintenanceRequestById(
  id: string,
  updates: Partial<MaintenanceRequest>,
): Promise<MaintenanceRequest> {
  const response = await fetch(`${MAINTENANCE_API_BASE}/${id}/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })
  const data = await parseJsonResponse(response)
  return mapMaintenanceRequestResponse(data.maintenanceRequest || data)
}
