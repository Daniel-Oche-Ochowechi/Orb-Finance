import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  validateFullName,
  validateWorkEmail,
  validateRole,
  checkRateLimit,
  sanitizeInput,
} from '@/lib/security';
import { createWaitlistEntry } from '@/lib/supabase/server';
import {
  sendWaitlistConfirmationEmail,
  EmailDeliveryStatus,
} from '@/lib/email/mailer';
import { decodeStoredInput } from '@/lib/email/waitlistTemplate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. IP extraction & Rate Limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0].trim() || realIp || '127.0.0.1';

    const rateLimit = checkRateLimit(ip, 5, 60 * 1000); // 5 requests per minute
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please wait a moment before trying again.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // 2. Body Payload Parsing & Size Protection
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload.' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { fullName, email, role, honeypot } = body;

    // 3. Anti-Bot Honeypot Defense
    // Automated bots fill all input fields; if honeypot is populated, silently reject
    if (honeypot && String(honeypot).trim().length > 0) {
      return NextResponse.json(
        { success: true, message: 'Your request has been received.' },
        { status: 200 }
      );
    }

    // 4. Strict Input Validation & Sanitization
    const nameValidation = validateFullName(fullName);
    if (!nameValidation.isValid) {
      return NextResponse.json(
        { success: false, error: nameValidation.error },
        { status: 422 }
      );
    }

    const emailValidation = validateWorkEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { success: false, error: emailValidation.error },
        { status: 422 }
      );
    }

    if (!validateRole(role)) {
      return NextResponse.json(
        { success: false, error: 'Please select a valid membership category.' },
        { status: 422 }
      );
    }

    // 5. Save directly to Supabase
    const cleanName = nameValidation.cleanName;
    const cleanEmail = emailValidation.cleanEmail;
    const cleanRole = sanitizeInput(role) as any;
    const generatedRefId = `ORB-${cleanRole.slice(0, 3).toUpperCase()}-${crypto.randomInt(1000, 10000)}`;

    const userAgent = req.headers.get('user-agent') || 'Unknown';

    const { submission, isDuplicate } = await createWaitlistEntry({
      fullName: cleanName,
      email: cleanEmail,
      role: cleanRole,
      referenceId: generatedRefId,
      ipAddress: ip,
      userAgent: userAgent,
    });

    // 6. Dispatch waitlist confirmation email on new registration
    let emailSent = false;
    let emailStatus: EmailDeliveryStatus = 'skipped_duplicate';

    if (!isDuplicate) {
      const emailResult = await sendWaitlistConfirmationEmail({
        fullName: submission.full_name,
        email: submission.email,
        role: submission.role,
        referenceId: submission.reference_id,
        launchDate: '15 April 2027 (Q2)',
      });

      emailSent = emailResult.sent;
      emailStatus = emailResult.status;

      if (emailResult.status === 'failed') {
        console.error('[Waitlist Email Dispatch Failed]:', emailResult.error);
      }
    }

    return NextResponse.json(
      {
        success: true,
        isDuplicate,
        emailSent,
        emailStatus,
        data: {
          id: submission.id,
          name: decodeStoredInput(submission.full_name),
          email: submission.email,
          role: submission.role,
          referenceId: submission.reference_id,
          status: submission.status,
          launchDate: '15 April 2027 (Q2)',
          timestamp: submission.created_at,
        },
      },
      {
        status: 200,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      }
    );
  } catch (error) {
    // Return generic error to prevent server stack trace leakage
    return NextResponse.json(
      {
        success: false,
        error: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Block non-POST methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}
