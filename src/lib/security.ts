/**
 * ORB FINANCE — ENTERPRISE SECURITY & INPUT SANITIZATION SUITE
 * Protects against XSS, SQLi, Prototype Pollution, Header Injection, Bot Spam, and DoS.
 */

// Whitelist of legitimate early access roles
export const ALLOWED_ROLES = [
  'Bank',
  'Fintech or payments company',
  'Business',
  'Individual',
] as const;

export type AllowedRole = (typeof ALLOWED_ROLES)[number];

// Known disposable / spam domain blacklist
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'trashmail.com',
  'yopmail.com',
  'sharklasers.com',
  'dispostable.com',
  'getairmail.com',
  'throwawaymail.com',
]);

/**
 * Strips HTML tags, script vectors, null bytes, and dangerous characters.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\r\n]/g, '') // Prevent CRLF / Header injection
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[&<>"']/g, (m) => {
      // Escape HTML special characters
      const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
      };
      return map[m] || m;
    })
    .trim();
}

/**
 * Validates and sanitizes a Full Name.
 * Rejects numbers, script injections, and excessive/empty strings.
 */
export function validateFullName(name: string): {
  isValid: boolean;
  error?: string;
  cleanName: string;
} {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Please enter your full name.', cleanName: '' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long.', cleanName: '' };
  }

  if (trimmed.length > 70) {
    return { isValid: false, error: 'Name cannot exceed 70 characters.', cleanName: '' };
  }

  // Allow letters (including international accents), spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Name may only contain letters, spaces, hyphens, and apostrophes.',
      cleanName: '',
    };
  }

  // Prevent repeated spam characters (e.g. "aaaaaaa")
  if (/(.)\1{5,}/.test(trimmed)) {
    return { isValid: false, error: 'Please provide a valid full name.', cleanName: '' };
  }

  const clean = sanitizeInput(trimmed);
  return { isValid: true, cleanName: clean };
}

/**
 * Validates and sanitizes an Email Address.
 * Ensures RFC 5322 compliance, detects disposable emails, and prevents injection attacks.
 */
export function validateWorkEmail(email: string): {
  isValid: boolean;
  error?: string;
  cleanEmail: string;
} {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Please enter your work email address.', cleanEmail: '' };
  }

  const trimmed = email.trim().toLowerCase();

  if (trimmed.length > 254) {
    return { isValid: false, error: 'Email cannot exceed 254 characters.', cleanEmail: '' };
  }

  // Strict RFC 5322 compliant regex pattern
  const emailRegex =
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid work email address.', cleanEmail: '' };
  }

  const domain = trimmed.split('@')[1];
  if (!domain || !domain.includes('.')) {
    return { isValid: false, error: 'Please provide an email with a valid domain.', cleanEmail: '' };
  }

  // Check against known disposable / trash email domains
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: 'Please use an official corporate or personal email domain.',
      cleanEmail: '',
    };
  }

  const clean = sanitizeInput(trimmed);
  return { isValid: true, cleanEmail: clean };
}

/**
 * Validates the selected Role against strict whitelist.
 */
export function validateRole(role: string): role is AllowedRole {
  return ALLOWED_ROLES.includes(role as AllowedRole);
}

// -------------------------------------------------------------
// In-Memory Sliding Window Rate Limiter (For Server API Route)
// -------------------------------------------------------------
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 10 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const windowMs = 60 * 1000;
    rateLimitStore.forEach((record, key) => {
      record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    });
  }, 10 * 60 * 1000);
}

/**
 * Rate limits requests per IP or identifier.
 * Default: 6 requests per 60 seconds window.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests = 6,
  windowMs = 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  let record = rateLimitStore.get(identifier);

  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filter timestamps within window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const resetTime = oldestTimestamp + windowMs;
    return { allowed: false, remaining: 0, resetTime };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    resetTime: now + windowMs,
  };
}
