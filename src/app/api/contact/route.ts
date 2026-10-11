import { NextRequest, NextResponse } from 'next/server';
import {
  checkRateLimit,
  sanitizeInput,
  validateFullName,
  validateWorkEmail,
} from '@/lib/security';
import { createContactInquiry } from '@/lib/supabase/server';
import { ContactCategory } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // Rate Limit: 5 submissions per 10 minutes per IP
    const rateLimit = checkRateLimit(`contact-${ip}`, 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please wait a few moments before sending another message.',
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { fullName, email, company, category, subject, message } = body;

    // Validation
    const nameCheck = validateFullName(fullName);
    if (!nameCheck.isValid) {
      return NextResponse.json(
        { success: false, error: nameCheck.error || 'Please enter a valid full name.' },
        { status: 400 }
      );
    }

    const emailCheck = validateWorkEmail(email);
    if (!emailCheck.isValid) {
      return NextResponse.json(
        { success: false, error: emailCheck.error || 'Please enter a valid work email.' },
        { status: 400 }
      );
    }

    const cleanCompany = company ? sanitizeInput(company) : '';
    const cleanSubject = subject ? sanitizeInput(subject) : '';
    const cleanMessage = message ? sanitizeInput(message) : '';


    if (!cleanMessage || cleanMessage.length < 5 || cleanMessage.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Message must be between 5 and 2000 characters.' },
        { status: 400 }
      );
    }

    const validCategories: ContactCategory[] = [
      'Partnership',
      'Institutional Sandbox',
      'Integration Support',
      'Compliance',
      'General',
    ];

    const safeCategory = validCategories.includes(category) ? category : 'General';
    const safeSubject = cleanSubject || `Inquiry from ${nameCheck.cleanName}`;

    // Generate Reference ID: ORB-INQ-XXXX
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    const referenceId = `ORB-INQ-${randomHex}`;

    const { inquiry } = await createContactInquiry({
      fullName: nameCheck.cleanName,
      email: emailCheck.cleanEmail,
      company: cleanCompany || null,
      category: safeCategory,
      subject: safeSubject,
      message: cleanMessage,
      referenceId,
      ipAddress: ip,

      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been transmitted directly to the Orb Finance relations team.',
      referenceId: inquiry.reference_id,
    });
  } catch (error) {
    console.error('[Contact Submission Route Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to submit your message right now. Please try again later.' },
      { status: 500 }
    );
  }
}
