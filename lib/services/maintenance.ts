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