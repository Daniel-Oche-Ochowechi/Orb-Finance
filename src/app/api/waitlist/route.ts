import { NextRequest, NextResponse } from 'next/server';
import {
  validateFullName,
  validateWorkEmail,
  validateRole,
  checkRateLimit,
  sanitizeInput,
} from '@/lib/security';

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

    // 5. Successful Clean Response
    const cleanName = nameValidation.cleanName;
    const cleanEmail = emailValidation.cleanEmail;
    const cleanRole = sanitizeInput(role);
    const referenceId = `ORB-${cleanRole.slice(0, 3).toUpperCase()}-${Math.floor(1000 + (cleanName.length * 137) % 9000)}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          name: cleanName,
          email: cleanEmail,
          role: cleanRole,
          referenceId,
          launchDate: '15 January 2027',
          timestamp: new Date().toISOString(),
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
