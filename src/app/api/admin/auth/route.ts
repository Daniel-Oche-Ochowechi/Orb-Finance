import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminPasscode,
  generateAdminSessionToken,
  isAuthenticatedAdmin,
} from '@/lib/supabase/adminAuth';
import { checkRateLimit } from '@/lib/security';

export const dynamic = 'force-dynamic';

// POST: Login with admin passcode
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    
    // Rate limit login attempts to prevent brute force (5 attempts per 5 mins)
    const rateLimit = checkRateLimit(`admin-login-${ip}`, 5, 5 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many failed login attempts. Please wait 5 minutes.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { passcode } = body;

    if (!passcode || typeof passcode !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Passcode is required.' },
        { status: 400 }
      );
    }

    const isValid = verifyAdminPasscode(passcode);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid security passcode.' },
        { status: 401 }
      );
    }

    const token = generateAdminSessionToken();

    const response = NextResponse.json({
      success: true,
      message: 'Authenticated successfully.',
      token,
    });

    // Set secure HttpOnly cookie
    response.cookies.set('orb_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed.' },
      { status: 500 }
    );
  }
}

// GET: Check current admin authentication status
export async function GET(req: NextRequest) {
  const isAuth = isAuthenticatedAdmin(req);
  return NextResponse.json({
    authenticated: isAuth,
  });
}

// DELETE: Logout
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully.',
  });
  response.cookies.delete('orb_admin_session');
  return response;
}
