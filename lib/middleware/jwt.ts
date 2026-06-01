import { NextResponse } from 'next/server'
import { hasRequiredRole } from './roles'

function b64UrlDecode(input: string) {
  // base64url -> base64
  input = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = input.length % 4
  if (pad === 2) input += '=='
  else if (pad === 3) input += '='
  else if (pad !== 0) input += ''
  return Buffer.from(input, 'base64').toString('utf8')
}

function base64Url(input: Buffer) {
  return input
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export type JwtPayload = {
  iat?: number
  exp?: number
  sub?: string
  role?: string
  [key: string]: any
}

/**
 * Very small HS256-only JWT verifier that does not add any external deps.
 * Expects a secret in `process.env.JWT_SECRET`.
 * Returns the parsed payload when valid, otherwise null.
 */
function parseAuthTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(/(?:^|;)\s*auth-token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export function verifyJwtHs256(token: string | null): JwtPayload | null {
  try {
    if (!token) return null
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [hdrB64, payloadB64, sigB64] = parts

    const headerJson = JSON.parse(b64UrlDecode(hdrB64))
    if (headerJson.alg !== 'HS256') return null

    const signingInput = `${hdrB64}.${payloadB64}`
    const secret = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || ''
    if (!secret) return null

    const crypto = require('crypto')
    const expected = crypto
      .createHmac('sha256', secret)
      .update(signingInput)
      .digest()
    const expectedB64 = base64Url(expected)

    if (sigB64 !== expectedB64) return null

    const payload = JSON.parse(b64UrlDecode(payloadB64)) as JwtPayload

    // check exp if present
    if (payload.exp && typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp < now) return null
    }

    return payload
  } catch (e) {
    return null
  }
}

export function requireAuth(req: Request, roles?: string[]) {
  try {
    const auth = req.headers.get('authorization') || ''
    let token = auth.startsWith('Bearer ') ? auth.slice(7) : auth || null
    if (!token) {
      token = parseAuthTokenFromCookie(req.headers.get('cookie'))
    }
    if (!token) return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

    const secret = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || ''
    let payload: JwtPayload | null = null

    if (secret) {
      payload = verifyJwtHs256(token)
    } else {
      // If no local secret is configured, parse the token payload for a best-effort auth check.
      try {
        const parts = token.split('.')
        if (parts.length === 3) {
          payload = JSON.parse(b64UrlDecode(parts[1])) as JwtPayload
          if (payload.exp && typeof payload.exp === 'number') {
            const now = Math.floor(Date.now() / 1000)
            if (payload.exp < now) {
              payload = null
            }
          }
        }
      } catch (e) {
        payload = null
      }
    }

    if (!payload) return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

    if (roles && roles.length > 0) {
      const ok = hasRequiredRole(payload, roles)
      if (!ok) return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
    }

    return { ok: true, payload }
  } catch (e) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
}
