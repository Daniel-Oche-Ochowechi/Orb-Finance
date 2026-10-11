import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/supabase/adminAuth';
import { fetchAllContactInquiries } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!isAuthenticatedAdmin(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin session required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'all';
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    const entries = await fetchAllContactInquiries({ category, status, search });

    return NextResponse.json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.error('[Admin Contacts Fetch Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact inquiries.' },
      { status: 500 }
    );
  }
}
