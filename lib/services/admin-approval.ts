import {
  getCollection,
  insertIntoCollection,
  findInCollection,
  updateInCollection,
  removeFromCollection,
  generateId,
} from '@/lib/local-store'

export interface ApprovalRequest {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'property_manager'
  status: 'pending' | 'approved' | 'rejected'
  createdAt: number
  expiresAt?: number
  rejectionReason?: string
  approvedBy?: string
  approvedAt?: number
}

const COLLECTION_NAME = 'admin_approval_requests'
const APPROVAL_EXPIRY_DAYS = 7

/**
 * Create a new approval request for admin/property manager registration
 */
export function createApprovalRequest(payload: {
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'property_manager'
}): ApprovalRequest {
  // Check if email already exists in pending requests
  const existing = findInCollection<ApprovalRequest>(
    COLLECTION_NAME,
    (r) => r.email === payload.email && r.status === 'pending'
  )
  if (existing) {
    throw new Error('An approval request with this email already exists')
  }

  const request: ApprovalRequest = {
    id: generateId('approval'),
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: payload.role,
    status: 'pending',
    createdAt: Date.now(),
    expiresAt: Date.now() + APPROVAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  }

  insertIntoCollection(COLLECTION_NAME, request)
  return request
}

/**
 * Get all approval requests with optional status filter
 */
export function listApprovalRequests(
  status?: 'pending' | 'approved' | 'rejected'
): ApprovalRequest[] {
  const requests = getCollection<ApprovalRequest>(COLLECTION_NAME)
  
  if (status) {
    return requests.filter((r) => r.status === status)
  }
  
  return requests
}

/**
 * Get a specific approval request by ID
 */
export function getApprovalRequest(id: string): ApprovalRequest | null {
  return findInCollection<ApprovalRequest>(COLLECTION_NAME, (r) => r.id === id)
}

/**
 * Get pending request by email
 */
export function getApprovalRequestByEmail(email: string): ApprovalRequest | null {
  return findInCollection<ApprovalRequest>(
    COLLECTION_NAME,
    (r) => r.email === email && r.status === 'pending'
  )
}

/**
 * Approve an approval request
 */
export function approveApprovalRequest(
  id: string,
  approvedBy: string
): ApprovalRequest | null {
  return updateInCollection<ApprovalRequest>(COLLECTION_NAME, id, {
    status: 'approved',
    approvedBy,
    approvedAt: Date.now(),
  })
}

/**
 * Reject an approval request
 */
export function rejectApprovalRequest(
  id: string,
  reason?: string
): ApprovalRequest | null {
  return updateInCollection<ApprovalRequest>(COLLECTION_NAME, id, {
    status: 'rejected',
    rejectionReason: reason,
  })
}

/**
 * Delete an approval request (used after user creation or cleanup)
 */
export function deleteApprovalRequest(id: string): boolean {
  return removeFromCollection(COLLECTION_NAME, id)
}

/**
 * Check if approval request is expired
 */
export function isApprovalRequestExpired(request: ApprovalRequest): boolean {
  if (!request.expiresAt) return false
  return Date.now() > request.expiresAt
}

/**
 * Get count of pending approval requests
 */
export function getPendingApprovalCount(): number {
  const requests = getCollection<ApprovalRequest>(COLLECTION_NAME)
  return requests.filter((r) => r.status === 'pending').length
}
