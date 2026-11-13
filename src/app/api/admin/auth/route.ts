import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_OTP_COOKIE,
  OTP_EXPIRY_SECONDS,
  OTP_RESEND_COOLDOWN_SECONDS,
  verifySupabaseAdminCredentials,
  fetchVerifiedSupabaseAdminById,
  createAdminOtpChallenge,
  readAdminOtpChallengeCookie,
  invalidateAdminOtpChallenge,
  verifyAdminOtpChallenge,
  generateAdminSessionToken,
  verifyLiveSupabaseAdminSession,
  maskEmailAddress,
} from '@/lib/supabase/adminAuth';
import { isEmailConfigured, sendAdminOtpEmail } from '@/lib/email/mailer';
import { checkRateLimit } from '@/lib/security';

export const dynamic = 'force-dynamic';

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
}

function getCookieBaseOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

// POST: Step 1 (Supabase Auth email + password -> Admin role check -> Email OTP)
//       Step 2 (Verify 6-digit OTP -> Re-verify Supabase Auth Admin -> Issue session)
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const body = await req.json().catch(() => ({}));
    const step = typeof body.step === 'string' ? body.step : 'credentials';

    if (step === 'cancel_otp') {
      const challenge = readAdminOtpChallengeCookie(req);
      if (challenge) {
        await invalidateAdminOtpChallenge(challenge.challengeId);
      }
      const res = NextResponse.json({ success: true });
      res.cookies.delete(ADMIN_OTP_COOKIE);
      return res;
    }

    if (step === 'resend_otp') {
      const rateLimit = checkRateLimit(`admin-otp-resend-${ip}`, 6, 5 * 60 * 1000);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { success: false, error: 'Too many OTP requests. Please wait a few minutes.' },
          { status: 429 }
        );
      }

      const challenge = readAdminOtpChallengeCookie(req);
      if (!challenge) {
        return NextResponse.json(
          { success: false, error: 'OTP session expired. Please sign in with email and password again.' },
          { status: 401 }
        );
      }

      const elapsedSec = Math.floor((Date.now() - challenge.issuedAt) / 1000);
      if (elapsedSec < OTP_RESEND_COOLDOWN_SECONDS) {
        const waitSec = OTP_RESEND_COOLDOWN_SECONDS - elapsedSec;
        return NextResponse.json(
          { success: false, error: `Please wait ${waitSec}s before requesting another code.` },
          { status: 429 }
        );
      }

      const liveAdmin = await fetchVerifiedSupabaseAdminById(challenge.userId);
      if (!liveAdmin) {
        await invalidateAdminOtpChallenge(challenge.challengeId);
        const res = NextResponse.json(
          { success: false, error: "Supabase Auth account no longer holds the 'admin' role." },
          { status: 403 }
        );
        res.cookies.delete(ADMIN_OTP_COOKIE);
        return res;
      }

      if (!isEmailConfigured()) {
        return NextResponse.json(
          { success: false, error: 'Email delivery provider is not configured.' },
          { status: 503 }
        );
      }

      await invalidateAdminOtpChallenge(challenge.challengeId);
      const nextChallenge = await createAdminOtpChallenge({
        admin: liveAdmin,
        ipAddress: ip,
      });

      const emailResult = await sendAdminOtpEmail({
        email: liveAdmin.email,
        fullName: liveAdmin.fullName,
        otpCode: nextChallenge.otpCode,
        expiresInMinutes: Math.round(OTP_EXPIRY_SECONDS / 60),
        ipAddress: ip,
      });

      if (!emailResult.sent) {
        await invalidateAdminOtpChallenge(nextChallenge.challengeId);
        return NextResponse.json(
          { success: false, error: emailResult.error || 'Failed to dispatch OTP email.' },
          { status: 502 }
        );
      }

      const res = NextResponse.json({
        success: true,
        step: 'otp_required',
        maskedEmail: maskEmailAddress(liveAdmin.email),
        expiresInSeconds: OTP_EXPIRY_SECONDS,
        expiresAt: nextChallenge.expiresAt,
      });
      res.cookies.set(
        ADMIN_OTP_COOKIE,
        nextChallenge.challengeToken,
        getCookieBaseOptions(OTP_EXPIRY_SECONDS)
      );
      return res;
    }

    if (step === 'verify_otp') {
      const rateLimit = checkRateLimit(`admin-otp-verify-${ip}`, 10, 5 * 60 * 1000);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { success: false, error: 'Too many verification attempts. Please wait 5 minutes.' },
          { status: 429 }
        );
      }

      const challenge = readAdminOtpChallengeCookie(req);
      if (!challenge) {
        return NextResponse.json(
          { success: false, error: 'OTP verification challenge expired or missing. Please sign in again.' },
          { status: 401 }
        );
      }

      const otp = typeof body.otp === 'string' ? body.otp : '';
      const verifyResult = await verifyAdminOtpChallenge({
        challenge,
        otpCode: otp,
      });

      if (verifyResult.ok === false) {
        const res = NextResponse.json(
          { success: false, error: verifyResult.error, exhausted: Boolean(verifyResult.exhausted) },
          { status: verifyResult.status }
        );
        if (verifyResult.exhausted) {
          res.cookies.delete(ADMIN_OTP_COOKIE);
        }
        return res;
      }

      const sessionToken = generateAdminSessionToken(verifyResult.admin);
      const res = NextResponse.json({
        success: true,
        authenticated: true,
        message: 'Authenticated via Supabase Auth & Email OTP.',
        admin: verifyResult.admin,
      });

      res.cookies.set(
        ADMIN_SESSION_COOKIE,
        sessionToken,
        getCookieBaseOptions(24 * 60 * 60)
      );
      res.cookies.delete(ADMIN_OTP_COOKIE);
      return res;
    }

    // Default Step 1: Verify Email + Password against Supabase Auth & require role === 'admin'
    const rateLimit = checkRateLimit(`admin-login-${ip}`, 8, 5 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many failed login attempts. Please wait 5 minutes.' },
        { status: 429 }
      );
    }

    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Admin email and password are required.' },
        { status: 400 }
      );
    }

    const authCheck = await verifySupabaseAdminCredentials(email, password);
    if (authCheck.ok === false) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Transactional email provider (RESEND_API_KEY or SMTP) must be configured to send OTP confirmation.',
        },
        { status: 503 }
      );
    }

    const challenge = await createAdminOtpChallenge({
      admin: authCheck.admin,
      ipAddress: ip,
    });

    const emailResult = await sendAdminOtpEmail({
      email: authCheck.admin.email,
      fullName: authCheck.admin.fullName,
      otpCode: challenge.otpCode,
      expiresInMinutes: Math.round(OTP_EXPIRY_SECONDS / 60),
      ipAddress: ip,
    });

    if (!emailResult.sent) {
      await invalidateAdminOtpChallenge(challenge.challengeId);
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error || 'Unable to deliver verification OTP email.',
        },
        { status: 502 }
      );
    }

    const response = NextResponse.json({
      success: true,
      step: 'otp_required',
      message: 'Verification OTP dispatched to administrator email.',
      maskedEmail: maskEmailAddress(authCheck.admin.email),
      expiresInSeconds: OTP_EXPIRY_SECONDS,
      expiresAt: challenge.expiresAt,
    });

    response.cookies.set(
      ADMIN_OTP_COOKIE,
      challenge.challengeToken,
      getCookieBaseOptions(OTP_EXPIRY_SECONDS)
    );
    // Ensure no stale session remains while OTP confirmation is pending
    response.cookies.delete(ADMIN_SESSION_COOKIE);

    return response;
  } catch (error) {
    console.error('[Admin Auth Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed.' },
      { status: 500 }
    );
  }
}

// GET: Live check against Supabase Auth (verifies session cookie + confirms role === 'admin')
export async function GET(req: NextRequest) {
  const verifiedAdmin = await verifyLiveSupabaseAdminSession(req);
  if (verifiedAdmin) {
    return NextResponse.json({
      authenticated: true,
      admin: verifiedAdmin,
    });
  }

  const pendingChallenge = readAdminOtpChallengeCookie(req);
  const res = NextResponse.json({
    authenticated: false,
    admin: null,
    ...(pendingChallenge
      ? {
          pendingOtp: {
            maskedEmail: maskEmailAddress(pendingChallenge.email),
            expiresAt: pendingChallenge.expiresAt,
          },
        }
      : {}),
  });

  if (req.cookies.get(ADMIN_SESSION_COOKIE)) {
    res.cookies.delete(ADMIN_SESSION_COOKIE);
  }
  return res;
}

// DELETE: Logout & clear both session and pending OTP cookies
export async function DELETE(req: NextRequest) {
  const challenge = readAdminOtpChallengeCookie(req);
  if (challenge) {
    await invalidateAdminOtpChallenge(challenge.challengeId);
  }

  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully.',
  });
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  response.cookies.delete(ADMIN_OTP_COOKIE);
  return response;
}
