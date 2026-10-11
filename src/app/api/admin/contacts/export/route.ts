import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/supabase/adminAuth';
import { fetchAllContactInquiries } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!isAuthenticatedAdmin(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'all';
    const status = searchParams.get('status') || 'all';

    const entries = await fetchAllContactInquiries({ category, status });

    // Build CSV Content
    const headers = [
      'Reference ID',
      'Full Name',
      'Email Address',
      'Company',
      'Category',
      'Subject',
      'Message',
      'Status',
      'Received Date (UTC)',
      'Internal Notes',
      'IP Address',
    ];

    const escapeCsv = (val: string | null | undefined) => {
      if (!val) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = entries.map((entry) => [
      escapeCsv(entry.reference_id),
      escapeCsv(entry.full_name),
      escapeCsv(entry.email),
      escapeCsv(entry.company || 'N/A'),
      escapeCsv(entry.category),
      escapeCsv(entry.subject),
      escapeCsv(entry.message),
      escapeCsv(entry.status),
      escapeCsv(new Date(entry.created_at).toISOString()),
      escapeCsv(entry.notes),
      escapeCsv(entry.ip_address),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\r\n');

    const filename = `orb_finance_contacts_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[Admin CSV Contacts Export Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export contacts CSV.' },
      { status: 500 }
    );
  }
}
