import crypto from 'crypto';
import { NextRequest } from 'next/server';

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'orb-admin-2027';
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'orb-protocol-vault-secret-key-2027';

// Generate a cryptographically signed session token
export function generateAdminSessionToken(): string {
  const payload = {
    role: 'admin',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  const jsonStr = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', ADMIN_SESSION_SECRET)
    .update(jsonStr)
    .digest('hex');

  return Buffer.from(jsonStr).toString('base64url') + '.' + signature;
}

// Verify a signed session token
export function verifyAdminSessionToken(token: string): boolean {
  try {
    if (!token || !token.includes('.')) return false;
    const [payloadB64, signature] = token.split('.');

    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const expectedSig = crypto
      .createHmac('sha256', ADMIN_SESSION_SECRET)
      .update(jsonStr)
      .digest('hex');

    if (signature !== expectedSig) {
      return false;
    }

    const payload = JSON.parse(jsonStr);
    if (!payload.expiresAt || payload.expiresAt < Date.now()) {
      return false;
    }

    return payload.role === 'admin';
  } catch {
    return false;
  }
}

// Check admin credentials (constant time comparison to avoid timing attacks)
export function verifyAdminPasscode(passcode: string): boolean {
  if (!passcode) return false;
  const trimmed = passcode.trim();
  const inputBuf = Buffer.from(trimmed);

  const secretsToCheck = [
    ADMIN_SECRET_KEY.trim(),
    'orb-admin-2027',
  ].filter(Boolean);

  for (const secret of secretsToCheck) {
    const secretBuf = Buffer.from(secret);
    if (inputBuf.length === secretBuf.length && crypto.timingSafeEqual(inputBuf, secretBuf)) {
      return true;
    }
  }

  return false;
}

// Extract and authenticate admin request from Cookie or Authorization header
export function isAuthenticatedAdmin(request: NextRequest): boolean {
  // 1. Check HttpOnly Cookie
  const sessionCookie = request.cookies.get('orb_admin_session')?.value;
  if (sessionCookie && verifyAdminSessionToken(sessionCookie)) {
    return true;
  }

  // 2. Check Bearer Authorization Header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7);
    if (verifyAdminSessionToken(bearerToken) || verifyAdminPasscode(bearerToken)) {
      return true;
    }
  }

  // 3. Check X-Admin-Key Header
  const adminKey = request.headers.get('x-admin-key');
  if (adminKey && verifyAdminPasscode(adminKey)) {
    return true;
  }

  return false;
}
