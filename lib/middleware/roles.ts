type Role = string

const ROLE_ALIASES: Record<string, Role[]> = {
  superadmin: ['admin'],
  owner: ['admin', 'property_manager'],
}

export function normalizeRoles(input?: Role | Role[] | undefined): Role[] {
  if (!input) return []
  if (Array.isArray(input)) return input.flatMap((r) => (ROLE_ALIASES[r] ? [r, ...ROLE_ALIASES[r]] : [r]))
  return ROLE_ALIASES[input] ? [input, ...ROLE_ALIASES[input]] : [input]
}

/**
 * Check whether the token payload roles contain any of the allowedRoles.
 * Accepts `payload.role` as string or `payload.roles` as array.
 */
export function hasRequiredRole(payload: any, allowedRoles?: Role[] | undefined): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true
  const normalizedAllowed = new Set(allowedRoles.flatMap((r) => normalizeRoles(r)))

  const roleField = payload?.role
  const rolesField = payload?.roles

  const userRoles: string[] = []
  if (typeof roleField === 'string') userRoles.push(...normalizeRoles(roleField))
  if (Array.isArray(rolesField)) userRoles.push(...rolesField.flatMap((r) => normalizeRoles(r)))

  for (const ur of userRoles) {
    if (normalizedAllowed.has(ur)) return true
  }
  return false
}

export default { normalizeRoles, hasRequiredRole }
