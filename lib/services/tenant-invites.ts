import { apiRequest } from '@/lib/query-client'
import * as tokenManager from '@/lib/token-manager'
import { getValue, setValue } from '@/lib/local-store'

export interface TenantInviteRecord {
  id: string
  token: string
  propertyId: string
  unitNumber?: string
  email?: string
  createdBy: string
  createdAt: string
  expiresAt?: string
  status: 'pending' | 'accepted' | 'revoked' | 'expired'
  notes?: string
}

// Try server API first; fallback to localStorage for compatibility during migration
const INVITE_STORAGE_KEY = 'tenant-invites'

function listTenantInvitesLocal(): TenantInviteRecord[] {
  const stored = getValue<TenantInviteRecord[]>(INVITE_STORAGE_KEY);
  return stored ?? [];
}

function saveTenantInvitesLocal(invites: TenantInviteRecord[]) {
  setValue(INVITE_STORAGE_KEY, invites);
}

export async function createTenantInvite(
  inviteData: Partial<TenantInviteRecord>,
  token?: string
)
{
  try {
    // If caller didn't pass a token, try to retrieve stored auth token
    const authToken = token || (typeof window !== 'undefined' ? tokenManager.getAuthToken() : null)
    const res = await apiRequest('POST', '/invites/create', inviteData, authToken || undefined)
    const data = await res.json()
    return { success: true, invite: data}
  } catch (err: any) {
    console.warn('Failed to create tenant invite link:', err?.message)
    // Local fallback
    
  }
}

export async function validateTenantInvite(
  token: string,
) 
{
  try {
    const res = await apiRequest('POST', '/invites/validate', { token })
    const data = await res.json()
    console.log('Invite validation response:', data)
    return { valid: true, invite: data.invite }
  } catch (err: any) {
    // Try local fallback
    try {
      const invites = listTenantInvitesLocal()
      const invite = invites.find((i) => i.token === token) || null
      if (!invite) return { valid: false, error: 'Invite not found' }
      if (invite.status !== 'pending') return { valid: false, error: `Invite is ${invite.status}` }
      if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) return { valid: false, error: 'Invite has expired' }
      return { valid: true, invite }
    } catch (e) {
      return { valid: false, error: err?.message || String(err) }
    }
  }
}

export async function acceptTenantInvite(token: string): Promise<boolean> {
  try {
    const res = await apiRequest('POST', '/invites/accept', { token })
    const data = await res.json()
    return data.success ?? true
  } catch (err: any) {
    console.warn('acceptTenantInvite API failed, falling back to localStorage:', err?.message)
    const invites = listTenantInvitesLocal()
    const index = invites.findIndex((invite) => invite.token === token)
    if (index === -1) return false
    invites[index].status = 'accepted'
    saveTenantInvitesLocal(invites)
    return true
  }
}

// Export legacy helpers (local-only) for admin UI or migration if needed
export function listTenantInvites(): TenantInviteRecord[] {
  return listTenantInvitesLocal()
}

export function getTenantInviteByToken(token: string): TenantInviteRecord | null {
  return listTenantInvitesLocal().find((invite) => invite.token === token) || null
}

export function revokeTenantInvite(id: string): boolean {
  const invites = listTenantInvitesLocal()
  const index = invites.findIndex((invite) => invite.id === id)
  if (index === -1) return false
  invites[index].status = 'revoked'
  saveTenantInvitesLocal(invites)
  return true
}

export function deleteTenantInvite(id: string): boolean {
  const invites = listTenantInvitesLocal()
  const filtered = invites.filter((invite) => invite.id !== id)
  if (filtered.length === invites.length) return false
  saveTenantInvitesLocal(filtered)
  return true
}

export function updateTenantInvite(id: string, updates: Partial<TenantInviteRecord>): boolean {
  const invites = listTenantInvitesLocal()
  const index = invites.findIndex((invite) => invite.id === id)
  if (index === -1) return false
  invites[index] = { ...invites[index], ...updates }
  saveTenantInvitesLocal(invites)
  return true
}