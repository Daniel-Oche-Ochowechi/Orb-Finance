import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

export const ADMIN_SESSION_COOKIE = 'orb_admin_session';
export const ADMIN_OTP_COOKIE = 'orb_admin_otp_challenge';
export const OTP_EXPIRY_SECONDS = 10 * 60; // 10 minutes
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 30;

export interface VerifiedSupabaseAdmin {
  userId: string;
  email: string;
  fullName: string;
  role: 'admin';
}

export interface AdminSessionPayload extends VerifiedSupabaseAdmin {
  authMethod: 'supabase_otp';
  issuedAt: number;
  expiresAt: number;
}

interface OtpChallengeCookiePayload {
  challengeId: string;
  userId: string;
  email: string;
  fullName: string;
  role: 'admin';
  codeHash: string;
  issuedAt: number;
  expiresAt: number;
}

interface InMemoryChallengeState {
  codeHash: string;
  userId: string;
  expiresAt: number;
  attempts: number;
  consumed: boolean;
  issuedAt: number;
}

const globalForOtp = globalThis as typeof globalThis & {
  __orbAdminOtpChallenges?: Map<string, InMemoryChallengeState>;
};

function getInMemoryChallengeStore(): Map<string, InMemoryChallengeState> {
  if (!globalForOtp.__orbAdminOtpChallenges) {
    globalForOtp.__orbAdminOtpChallenges = new Map<string, InMemoryChallengeState>();
  }
  const now = Date.now();
  globalForOtp.__orbAdminOtpChallenges.forEach((value, key) => {
    if (value.expiresAt < now) {
      globalForOtp.__orbAdminOtpChallenges?.delete(key);
    }
  });
  return globalForOtp.__orbAdminOtpChallenges;
}

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    'orb-protocol-vault-secret-key-2027'
  );
}

function signHmacPayload<T extends object>(payload: T): string {
  const jsonStr = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(jsonStr)
    .digest('hex');

  return `${Buffer.from(jsonStr).toString('base64url')}.${signature}`;
}

function verifyHmacToken<T>(token: string): T | null {
  try {
    if (!token || !token.includes('.')) return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;

    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const expectedSig = crypto
      .createHmac('sha256', getSessionSecret())
      .update(jsonStr)
      .digest('hex');

    const sigBuf = Buffer.from(signature, 'utf8');
    const expBuf = Buffer.from(expectedSig, 'utf8');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    return JSON.parse(jsonStr) as T;
  } catch {
    return null;
  }
}

function getSupabaseEnv(): {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
} {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '',
  };
}

function getSupabaseServiceAuthClient(): SupabaseClient | null {
  const { url, serviceRoleKey } = getSupabaseEnv();
  if (!url || !url.startsWith('https://') || !serviceRoleKey) {
    return null;
  }
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function createEphemeralSupabaseAnonClient(): SupabaseClient | null {
  const { url, anonKey, serviceRoleKey } = getSupabaseEnv();
  const key = anonKey || serviceRoleKey;
  if (!url || !url.startsWith('https://') || !key) {
    return null;
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Extracts and validates that a Supabase Auth user holds the server-controlled 'admin' role.
 * Checks app_metadata (role / roles), which cannot be forged via client sign-up.
 */
export function extractSupabaseAdminRole(user: User | null | undefined): 'admin' | null {
  if (!user) return null;
  const appMeta = (user.app_metadata || {}) as Record<string, unknown>;

  if (typeof appMeta.role === 'string' && appMeta.role.trim().toLowerCase() === 'admin') {
    return 'admin';
  }

  if (Array.isArray(appMeta.roles)) {
    const hasAdmin = appMeta.roles.some(
      (r) => typeof r === 'string' && r.trim().toLowerCase() === 'admin'
    );
    if (hasAdmin) return 'admin';
  }

  if (typeof appMeta.roles === 'string' && appMeta.roles.trim().toLowerCase() === 'admin') {
    return 'admin';
  }

  return null;
}

function isSupabaseUserActiveAdmin(user: User | null | undefined): VerifiedSupabaseAdmin | null {
  if (!user || !user.email) return null;

  const bannedUntil = (user as User & { banned_until?: string | null }).banned_until;
  if (bannedUntil && new Date(bannedUntil).getTime() > Date.now()) {
    return null;
  }

  if (extractSupabaseAdminRole(user) !== 'admin') {
    return null;
  }

  const userMeta = (user.user_metadata || {}) as Record<string, unknown>;
  const fullName =
    (typeof userMeta.full_name === 'string' && userMeta.full_name.trim()) ||
    (typeof userMeta.name === 'string' && userMeta.name.trim()) ||
    user.email.split('@')[0];

  return {
    userId: user.id,
    email: user.email.trim().toLowerCase(),
    fullName,
    role: 'admin',
  };
}

export async function fetchVerifiedSupabaseAdminById(
  userId: string
): Promise<VerifiedSupabaseAdmin | null> {
  const adminClient = getSupabaseServiceAuthClient();
  if (!adminClient || !userId) return null;

  try {
    const { data, error } = await adminClient.auth.admin.getUserById(userId);
    if (error || !data?.user) return null;
    if (!data.user.email_confirmed_at) return null;
    return isSupabaseUserActiveAdmin(data.user);
  } catch {
    return null;
  }
}

export async function verifySupabaseAdminCredentials(
  email: string,
  password: string
): Promise<
  | { ok: true; admin: VerifiedSupabaseAdmin }
  | { ok: false; status: number; error: string }
> {
  const normalizedEmail = email.trim().toLowerCase();
  const anonClient = createEphemeralSupabaseAnonClient();
  const serviceClient = getSupabaseServiceAuthClient();

  if (!anonClient || !serviceClient) {
    return {
      ok: false,
      status: 503,
      error:
        'Supabase Auth service role credentials are not configured on the server.',
    };
  }

  const { data: authData, error: signInError } =
    await anonClient.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

  // Immediately clear any ephemeral client session
  await anonClient.auth.signOut().catch(() => undefined);

  if (signInError || !authData?.user) {
    const msg = signInError?.message?.toLowerCase() || '';
    if (msg.includes('email not confirmed')) {
      return {
        ok: false,
        status: 403,
        error: 'Admin email address is not confirmed in Supabase Auth.',
      };
    }
    return {
      ok: false,
      status: 401,
      error: 'Invalid admin email or password.',
    };
  }

  // Re-fetch authoritative user record directly from Supabase Auth Admin API
  const { data: userLookup, error: lookupError } =
    await serviceClient.auth.admin.getUserById(authData.user.id);

  if (lookupError || !userLookup?.user) {
    return {
      ok: false,
      status: 401,
      error: 'Unable to fetch administrator record from Supabase Auth.',
    };
  }

  const verifiedAdmin = isSupabaseUserActiveAdmin(userLookup.user);
  if (!verifiedAdmin) {
    return {
      ok: false,
      status: 403,
      error:
        "Access denied. This Supabase Auth account does not carry the required 'admin' role.",
    };
  }

  return { ok: true, admin: verifiedAdmin };
}

function hashOtpCode(challengeId: string, userId: string, otpCode: string): string {
  return crypto
    .createHmac('sha256', getSessionSecret())
    .update(`${challengeId}:${userId}:${otpCode.trim()}`)
    .digest('hex');
}

export async function createAdminOtpChallenge(params: {
  admin: VerifiedSupabaseAdmin;
  ipAddress?: string | null;
}): Promise<{
  otpCode: string;
  challengeToken: string;
  challengeId: string;
  expiresAt: number;
}> {
  const challengeId = crypto.randomUUID();
  const otpCode = crypto.randomInt(100000, 1000000).toString();
  const issuedAt = Date.now();
  const expiresAt = issuedAt + OTP_EXPIRY_SECONDS * 1000;
  const codeHash = hashOtpCode(challengeId, params.admin.userId, otpCode);

  const memStore = getInMemoryChallengeStore();
  memStore.set(challengeId, {
    codeHash,
    userId: params.admin.userId,
    expiresAt,
    attempts: 0,
    consumed: false,
    issuedAt,
  });

  // Persist to Supabase table when schema is installed (non-fatal if table not yet migrated)
  const serviceClient = getSupabaseServiceAuthClient();
  if (serviceClient) {
    await serviceClient
      .from('admin_otp_challenges')
      .insert({
        challenge_id: challengeId,
        user_id: params.admin.userId,
        email: params.admin.email,
        code_hash: codeHash,
        attempts: 0,
        expires_at: new Date(expiresAt).toISOString(),
        ip_address: params.ipAddress || null,
      })
      .then(() => undefined, () => undefined);
  }

  const cookiePayload: OtpChallengeCookiePayload = {
    challengeId,
    userId: params.admin.userId,
    email: params.admin.email,
    fullName: params.admin.fullName,
    role: 'admin',
    codeHash,
    issuedAt,
    expiresAt,
  };

  return {
    otpCode,
    challengeToken: signHmacPayload(cookiePayload),
    challengeId,
    expiresAt,
  };
}

export function readAdminOtpChallengeCookie(
  request: NextRequest
): OtpChallengeCookiePayload | null {
  const rawCookie = request.cookies.get(ADMIN_OTP_COOKIE)?.value;
  if (!rawCookie) return null;

  const payload = verifyHmacToken<OtpChallengeCookiePayload>(rawCookie);
  if (!payload || payload.role !== 'admin') return null;
  if (!payload.challengeId || !payload.userId || !payload.email || !payload.codeHash) {
    return null;
  }
  if (!payload.expiresAt || payload.expiresAt < Date.now()) {
    return null;
  }
  return payload;
}

export async function invalidateAdminOtpChallenge(challengeId: string): Promise<void> {
  const memStore = getInMemoryChallengeStore();
  const existing = memStore.get(challengeId);
  if (existing) {
    existing.consumed = true;
  }

  const serviceClient = getSupabaseServiceAuthClient();
  if (serviceClient) {
    await serviceClient
      .from('admin_otp_challenges')
      .update({ consumed_at: new Date().toISOString() })
      .eq('challenge_id', challengeId)
      .then(() => undefined, () => undefined);
  }
}

export async function verifyAdminOtpChallenge(params: {
  challenge: OtpChallengeCookiePayload;
  otpCode: string;
}): Promise<
  | { ok: true; admin: VerifiedSupabaseAdmin }
  | { ok: false; status: number; error: string; exhausted?: boolean }
> {
  const { challenge, otpCode } = params;
  const cleanOtp = otpCode.trim();

  if (!/^\d{6}$/.test(cleanOtp)) {
    return {
      ok: false,
      status: 400,
      error: 'Enter the 6-digit verification code sent to your email.',
    };
  }

  if (challenge.expiresAt < Date.now()) {
    return {
      ok: false,
      status: 401,
      error: 'Verification code expired. Please sign in again.',
      exhausted: true,
    };
  }

  const memStore = getInMemoryChallengeStore();
  let memEntry = memStore.get(challenge.challengeId);
  let dbRecord: {
    attempts: number;
    consumed_at: string | null;
    expires_at: string;
    code_hash: string;
  } | null = null;

  const serviceClient = getSupabaseServiceAuthClient();
  if (serviceClient) {
    const { data, error } = await serviceClient
      .from('admin_otp_challenges')
      .select('attempts, consumed_at, expires_at, code_hash')
      .eq('challenge_id', challenge.challengeId)
      .maybeSingle();

    if (!error && data) {
      dbRecord = data;
    }
  }

  if (dbRecord?.consumed_at || memEntry?.consumed) {
    return {
      ok: false,
      status: 401,
      error: 'This verification code has already been used.',
      exhausted: true,
    };
  }

  const currentAttempts = Math.max(dbRecord?.attempts ?? 0, memEntry?.attempts ?? 0);
  if (currentAttempts >= OTP_MAX_ATTEMPTS) {
    await invalidateAdminOtpChallenge(challenge.challengeId);
    return {
      ok: false,
      status: 429,
      error: 'Maximum OTP attempts exceeded. Please restart sign-in.',
      exhausted: true,
    };
  }

  const expectedHash = dbRecord?.code_hash || challenge.codeHash;
  const candidateHash = hashOtpCode(challenge.challengeId, challenge.userId, cleanOtp);

  const expectedBuf = Buffer.from(expectedHash, 'utf8');
  const candidateBuf = Buffer.from(candidateHash, 'utf8');
  const isMatch =
    expectedBuf.length === candidateBuf.length &&
    crypto.timingSafeEqual(expectedBuf, candidateBuf);

  if (!isMatch) {
    const nextAttempts = currentAttempts + 1;
    if (!memEntry) {
      memEntry = {
        codeHash: expectedHash,
        userId: challenge.userId,
        expiresAt: challenge.expiresAt,
        attempts: nextAttempts,
        consumed: nextAttempts >= OTP_MAX_ATTEMPTS,
        issuedAt: challenge.issuedAt,
      };
      memStore.set(challenge.challengeId, memEntry);
    } else {
      memEntry.attempts = nextAttempts;
      if (nextAttempts >= OTP_MAX_ATTEMPTS) {
        memEntry.consumed = true;
      }
    }

    if (serviceClient) {
      await serviceClient
        .from('admin_otp_challenges')
        .update({
          attempts: nextAttempts,
          ...(nextAttempts >= OTP_MAX_ATTEMPTS
            ? { consumed_at: new Date().toISOString() }
            : {}),
        })
        .eq('challenge_id', challenge.challengeId)
        .then(() => undefined, () => undefined);
    }

    const remaining = Math.max(0, OTP_MAX_ATTEMPTS - nextAttempts);
    if (remaining === 0) {
      return {
        ok: false,
        status: 429,
        error: 'Too many invalid OTP attempts. Please sign in again.',
        exhausted: true,
      };
    }

    return {
      ok: false,
      status: 401,
      error: `Invalid verification code (${remaining} attempt${remaining === 1 ? '' : 's'} remaining).`,
    };
  }

  // Re-fetch user directly from Supabase Auth to confirm active admin role
  const liveAdmin = await fetchVerifiedSupabaseAdminById(challenge.userId);
  if (!liveAdmin) {
    await invalidateAdminOtpChallenge(challenge.challengeId);
    return {
      ok: false,
      status: 403,
      error:
        "Supabase Auth verification failed: account missing or lacks the 'admin' role.",
      exhausted: true,
    };
  }

  await invalidateAdminOtpChallenge(challenge.challengeId);
  return { ok: true, admin: liveAdmin };
}

// Generate a cryptographically signed session token bound to Supabase Auth admin user
export function generateAdminSessionToken(admin: VerifiedSupabaseAdmin): string {
  const payload: AdminSessionPayload = {
    userId: admin.userId,
    email: admin.email,
    fullName: admin.fullName,
    role: 'admin',
    authMethod: 'supabase_otp',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  return signHmacPayload(payload);
}

// Verify a signed session token (requires supabase_otp origin and admin role)
export function parseAdminSessionToken(token: string): AdminSessionPayload | null {
  const payload = verifyHmacToken<AdminSessionPayload>(token);
  if (!payload) return null;
  if (!payload.expiresAt || payload.expiresAt < Date.now()) return null;
  if (payload.role !== 'admin') return null;
  if (payload.authMethod !== 'supabase_otp') return null;
  if (!payload.userId || !payload.email) return null;
  return payload;
}

export function verifyAdminSessionToken(token: string): boolean {
  return Boolean(parseAdminSessionToken(token));
}

// Optional programmatic key verification (only active when ADMIN_SECRET_KEY is explicitly configured)
export function verifyAdminPasscode(passcode: string): boolean {
  const configuredSecret = process.env.ADMIN_SECRET_KEY?.trim();
  if (!passcode || !configuredSecret) return false;
  const inputBuf = Buffer.from(passcode.trim());
  const secretBuf = Buffer.from(configuredSecret);
  return inputBuf.length === secretBuf.length && crypto.timingSafeEqual(inputBuf, secretBuf);
}

export function getAdminSessionFromRequest(request: NextRequest): AdminSessionPayload | null {
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (sessionCookie) {
    const parsed = parseAdminSessionToken(sessionCookie);
    if (parsed) return parsed;
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7);
    const parsed = parseAdminSessionToken(bearerToken);
    if (parsed) return parsed;
  }

  return null;
}

// Synchronous auth check across admin API endpoints
export function isAuthenticatedAdmin(request: NextRequest): boolean {
  if (getAdminSessionFromRequest(request)) {
    return true;
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7);
    if (verifyAdminPasscode(bearerToken)) {
      return true;
    }
  }

  const adminKey = request.headers.get('x-admin-key');
  if (adminKey && verifyAdminPasscode(adminKey)) {
    return true;
  }

  return false;
}

// Live Supabase Auth re-verification for session inspection & sensitive polling
export async function verifyLiveSupabaseAdminSession(
  request: NextRequest
): Promise<VerifiedSupabaseAdmin | null> {
  const session = getAdminSessionFromRequest(request);
  if (!session) return null;
  return fetchVerifiedSupabaseAdminById(session.userId);
}

export function maskEmailAddress(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0] || '*'}***@${domain}`;
  return `${local.slice(0, 2)}${'*'.repeat(Math.min(5, Math.max(2, local.length - 2)))}@${domain}`;
}
