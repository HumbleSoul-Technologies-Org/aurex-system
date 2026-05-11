export interface TenantInviteRecord {
  id: string;
  token: string;
  propertyId: string;
  unitNumber?: string;
  email?: string;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  status: 'pending' | 'accepted' | 'revoked';
  notes?: string;
}

const INVITE_STORAGE_KEY = 'tenant-invites';

export function listTenantInvites(): TenantInviteRecord[] {
  const stored = localStorage.getItem(INVITE_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getTenantInviteByToken(token: string): TenantInviteRecord | null {
  const invites = listTenantInvites();
  return invites.find(invite => invite.token === token) || null;
}

export function createTenantInvite(inviteData: Omit<TenantInviteRecord, 'id' | 'token' | 'createdAt' | 'status'>): TenantInviteRecord {
  const invites = listTenantInvites();
  const newInvite: TenantInviteRecord = {
    ...inviteData,
    id: `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    token: `invite-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  invites.push(newInvite);
  localStorage.setItem(INVITE_STORAGE_KEY, JSON.stringify(invites));
  return newInvite;
}

export function validateTenantInvite(token: string): { valid: boolean; invite?: TenantInviteRecord; error?: string } {
  const invite = getTenantInviteByToken(token);
  if (!invite) {
    return { valid: false, error: 'Invite not found' };
  }
  if (invite.status !== 'pending') {
    return { valid: false, error: `Invite is ${invite.status}` };
  }
  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
    return { valid: false, error: 'Invite has expired' };
  }
  return { valid: true, invite };
}

export function acceptTenantInvite(token: string): boolean {
  const invites = listTenantInvites();
  const index = invites.findIndex(invite => invite.token === token);
  if (index === -1) return false;
  invites[index].status = 'accepted';
  localStorage.setItem(INVITE_STORAGE_KEY, JSON.stringify(invites));
  return true;
}

export function revokeTenantInvite(id: string): boolean {
  const invites = listTenantInvites();
  const index = invites.findIndex(invite => invite.id === id);
  if (index === -1) return false;
  invites[index].status = 'revoked';
  localStorage.setItem(INVITE_STORAGE_KEY, JSON.stringify(invites));
  return true;
}

export function deleteTenantInvite(id: string): boolean {
  const invites = listTenantInvites();
  const filtered = invites.filter(invite => invite.id !== id);
  if (filtered.length === invites.length) return false;
  localStorage.setItem(INVITE_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function updateTenantInvite(id: string, updates: Partial<TenantInviteRecord>): boolean {
  const invites = listTenantInvites();
  const index = invites.findIndex(invite => invite.id === id);
  if (index === -1) return false;
  invites[index] = { ...invites[index], ...updates };
  localStorage.setItem(INVITE_STORAGE_KEY, JSON.stringify(invites));
  return true;
}