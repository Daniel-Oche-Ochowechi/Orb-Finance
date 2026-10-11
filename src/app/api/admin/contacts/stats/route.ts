import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/supabase/adminAuth';
import { getContactAnalytics } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!isAuthenticatedAdmin(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const stats = await getContactAnalytics();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[Admin Contacts Stats Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve contacts analytics.' },
      { status: 500 }
    );
  }
}
