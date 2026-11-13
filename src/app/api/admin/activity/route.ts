import { NextRequest, NextResponse } from 'next/server';
import { verifyLiveSupabaseAdminSession } from '@/lib/supabase/adminAuth';
import {
  fetchAllWaitlistEntries,
  fetchAllContactInquiries,
  getWaitlistAnalytics,
  getContactAnalytics,
} from '@/lib/supabase/server';
import { getConfiguredEmailProvider } from '@/lib/email/mailer';
import { decodeStoredInput } from '@/lib/email/waitlistTemplate';

export const dynamic = 'force-dynamic';

export interface PlatformActivityItem {
  id: string;
  source: 'waitlist' | 'contact';
  action: 'waitlist_signup' | 'contact_inquiry' | 'status_update';
  title: string;
  actorName: string;
  actorEmail: string;
  organization: string | null;
  categoryOrRole: string;
  referenceId: string;
  status: string;
  summary: string;
  ipAddress: string | null;
  timestamp: string;
  recordId: string;
}

export async function GET(req: NextRequest) {
  try {
    const activeAdmin = await verifyLiveSupabaseAdminSession(req);
    if (!activeAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Verified Supabase Auth admin session required.' },
        { status: 401 }
      );
    }

    const [submissions, contacts, waitlistStats, contactStats] = await Promise.all([
      fetchAllWaitlistEntries(),
      fetchAllContactInquiries(),
      getWaitlistAnalytics(),
      getContactAnalytics(),
    ]);

    const events: PlatformActivityItem[] = [];

    for (const sub of submissions) {
      const cleanName = decodeStoredInput(sub.full_name) || sub.full_name;
      events.push({
        id: `wl-create-${sub.id}`,
        source: 'waitlist',
        action: 'waitlist_signup',
        title: `New ${sub.role} Registration`,
        actorName: cleanName,
        actorEmail: sub.email,
        organization: null,
        categoryOrRole: sub.role,
        referenceId: sub.reference_id,
        status: sub.status,
        summary: `Registered for Q2 (15 April 2027) priority queue as ${sub.role}.`,
        ipAddress: sub.ip_address || null,
        timestamp: sub.created_at,
        recordId: sub.id,
      });

      const createdMs = new Date(sub.created_at).getTime();
      const updatedMs = new Date(sub.updated_at).getTime();
      if (!Number.isNaN(createdMs) && !Number.isNaN(updatedMs) && updatedMs - createdMs > 5000) {
        events.push({
          id: `wl-update-${sub.id}-${updatedMs}`,
          source: 'waitlist',
          action: 'status_update',
          title: `Waitlist Status → ${sub.status.toUpperCase()}`,
          actorName: cleanName,
          actorEmail: sub.email,
          organization: null,
          categoryOrRole: sub.role,
          referenceId: sub.reference_id,
          status: sub.status,
          summary: sub.notes
            ? decodeStoredInput(sub.notes)
            : `Candidate record updated to "${sub.status}".`,
          ipAddress: sub.ip_address || null,
          timestamp: sub.updated_at,
          recordId: sub.id,
        });
      }
    }

    for (const con of contacts) {
      const cleanName = decodeStoredInput(con.full_name) || con.full_name;
      const cleanCompany = con.company ? decodeStoredInput(con.company) : null;
      const cleanSubject = decodeStoredInput(con.subject) || con.subject;

      events.push({
        id: `ct-create-${con.id}`,
        source: 'contact',
        action: 'contact_inquiry',
        title: `${con.category} Inquiry`,
        actorName: cleanName,
        actorEmail: con.email,
        organization: cleanCompany,
        categoryOrRole: con.category,
        referenceId: con.reference_id,
        status: con.status,
        summary: cleanSubject,
        ipAddress: con.ip_address || null,
        timestamp: con.created_at,
        recordId: con.id,
      });

      const createdMs = new Date(con.created_at).getTime();
      const updatedMs = new Date(con.updated_at).getTime();
      if (!Number.isNaN(createdMs) && !Number.isNaN(updatedMs) && updatedMs - createdMs > 5000) {
        events.push({
          id: `ct-update-${con.id}-${updatedMs}`,
          source: 'contact',
          action: 'status_update',
          title: `Inquiry Status → ${con.status.replace('_', ' ').toUpperCase()}`,
          actorName: cleanName,
          actorEmail: con.email,
          organization: cleanCompany,
          categoryOrRole: con.category,
          referenceId: con.reference_id,
          status: con.status,
          summary: con.notes ? decodeStoredInput(con.notes) : cleanSubject,
          ipAddress: con.ip_address || null,
          timestamp: con.updated_at,
          recordId: con.id,
        });
      }
    }

    events.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const emailProvider = getConfiguredEmailProvider();

    return NextResponse.json({
      success: true,
      data: {
        events: events.slice(0, 100),
        waitlistStats,
        contactStats,
        systemHealth: {
          supabaseLive: waitlistStats.isLiveSupabase,
          emailProvider,
          emailConfigured: emailProvider !== 'none',
          lastSyncedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('[Admin Activity Fetch Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve platform activity.' },
      { status: 500 }
    );
  }
}

