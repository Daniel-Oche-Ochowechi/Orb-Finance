import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  WaitlistSubmission,
  WaitlistRole,
  WaitlistStatus,
  WaitlistStats,
  ContactInquiry,
  ContactCategory,
  ContactStatus,
  ContactStats,
} from './types';

// Detect environment configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl.startsWith('https://') && 
  supabaseServiceKey && 
  !supabaseUrl.includes('your-project-id')
);

// Server-side Supabase Client Singleton
let serverClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!serverClient) {
    serverClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return serverClient;
}

// In-Memory Persistent Store Fallback for Local Dev / Staging when credentials are being set up
const fallbackSubmissions: WaitlistSubmission[] = [
  {
    id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    full_name: 'Dr. Amina Bello',
    email: 'amina.bello@fidelitybank.ng',
    role: 'Bank',
    reference_id: 'ORB-BAN-8291',
    status: 'approved',
    notes: 'Institutional liquidity integration requested for Q2 2027.',
    ip_address: '102.89.43.12',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  },
  {
    id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    full_name: 'Tunde Adeleke',
    email: 'tunde@paystack.com',
    role: 'Fintech or payments company',
    reference_id: 'ORB-FIN-4318',
    status: 'pending',
    notes: 'Inquired about sandbox API keys and settlement SLA.',
    ip_address: '105.112.98.54',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  },
  {
    id: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    full_name: 'Chukwuma Obi',
    email: 'c.obi@dangotecorp.com',
    role: 'Business',
    reference_id: 'ORB-BUS-9104',
    status: 'contacted',
    notes: 'Multi-currency corporate treasury discussion scheduled.',
    ip_address: '197.210.65.23',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)',
  },
];

// Helper Functions for Data Access
export async function createWaitlistEntry(params: {
  fullName: string;
  email: string;
  role: WaitlistRole;
  referenceId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<{ submission: WaitlistSubmission; isDuplicate: boolean }> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const normalizedEmail = params.email.trim().toLowerCase();
    const cleanFullName = params.fullName.trim();

    // 1. Check for existing submission by normalized email
    const { data: existing, error: lookupError } = await supabase
      .from('waitlist_submissions')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (lookupError) {
      console.error('[Supabase Waitlist Lookup Error]:', lookupError);
      throw new Error(lookupError.message || 'Database lookup failed');
    }

    if (existing) {
      return {
        submission: existing as WaitlistSubmission,
        isDuplicate: true,
      };
    }

    // 2. Insert new submission into Supabase PostgreSQL
    const { data, error } = await supabase
      .from('waitlist_submissions')
      .insert({
        full_name: cleanFullName,
        email: normalizedEmail,
        role: params.role,
        reference_id: params.referenceId,
        status: 'pending',
        ip_address: params.ipAddress || null,
        user_agent: params.userAgent || null,
      })
      .select('*')
      .single();

    if (error) {
      // Gracefully handle concurrent duplicate email inserts via unique index violation (23505)
      if (error.code === '23505') {
        const { data: conflictRow } = await supabase
          .from('waitlist_submissions')
          .select('*')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (conflictRow) {
          return {
            submission: conflictRow as WaitlistSubmission,
            isDuplicate: true,
          };
        }
      }

      console.error('[Supabase Waitlist Insert Error]:', error);
      throw new Error(error.message || 'Database insert failed');
    }

    return {
      submission: data as WaitlistSubmission,
      isDuplicate: false,
    };
  }

  // Fallback Local Storage Mode
  const existingFallback = fallbackSubmissions.find(
    (s) => s.email.toLowerCase() === params.email.trim().toLowerCase()
  );

  if (existingFallback) {
    return {
      submission: existingFallback,
      isDuplicate: true,
    };
  }

  const newEntry: WaitlistSubmission = {
    id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    full_name: params.fullName.trim(),
    email: params.email.trim().toLowerCase(),
    role: params.role,
    reference_id: params.referenceId,
    status: 'pending',
    notes: null,
    ip_address: params.ipAddress || '127.0.0.1',
    user_agent: params.userAgent || 'Local Dev Client',
  };

  fallbackSubmissions.unshift(newEntry);

  return {
    submission: newEntry,
    isDuplicate: false,
  };
}

export async function fetchAllWaitlistEntries(filter?: {
  role?: string;
  status?: string;
  search?: string;
}): Promise<WaitlistSubmission[]> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    let query = supabase
      .from('waitlist_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter?.role && filter.role !== 'all') {
      query = query.eq('role', filter.role);
    }

    if (filter?.status && filter.status !== 'all') {
      query = query.eq('status', filter.status);
    }

    if (filter?.search) {
      const s = filter.search.trim().toLowerCase();
      query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%,reference_id.ilike.%${s}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[Supabase Fetch Error]:', error);
      throw error;
    }
    return (data || []) as WaitlistSubmission[];
  }

  // Fallback Filtering
  let results = [...fallbackSubmissions];

  if (filter?.role && filter.role !== 'all') {
    results = results.filter((s) => s.role === filter.role);
  }

  if (filter?.status && filter.status !== 'all') {
    results = results.filter((s) => s.status === filter.status);
  }

  if (filter?.search) {
    const s = filter.search.toLowerCase().trim();
    results = results.filter(
      (item) =>
        item.full_name.toLowerCase().includes(s) ||
        item.email.toLowerCase().includes(s) ||
        item.reference_id.toLowerCase().includes(s)
    );
  }

  return results;
}

export async function updateWaitlistEntry(
  id: string,
  updates: { status?: WaitlistStatus; notes?: string }
): Promise<WaitlistSubmission | null> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('waitlist_submissions')
      .update({
        ...(updates.status ? { status: updates.status } : {}),
        ...(typeof updates.notes !== 'undefined' ? { notes: updates.notes } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[Supabase Update Error]:', error);
      throw error;
    }
    return data as WaitlistSubmission;
  }

  const idx = fallbackSubmissions.findIndex((s) => s.id === id);
  if (idx !== -1) {
    fallbackSubmissions[idx] = {
      ...fallbackSubmissions[idx],
      ...(updates.status ? { status: updates.status } : {}),
      ...(typeof updates.notes !== 'undefined' ? { notes: updates.notes } : {}),
      updated_at: new Date().toISOString(),
    };
    return fallbackSubmissions[idx];
  }
  return null;
}

export async function deleteWaitlistEntry(id: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { error } = await supabase.from('waitlist_submissions').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  const idx = fallbackSubmissions.findIndex((s) => s.id === id);
  if (idx !== -1) {
    fallbackSubmissions.splice(idx, 1);
    return true;
  }
  return false;
}

export async function getWaitlistAnalytics(): Promise<WaitlistStats> {
  const entries = await fetchAllWaitlistEntries();

  const now = Date.now();
  const dayAgo = now - 24 * 3600 * 1000;

  const stats: WaitlistStats = {
    totalSubmissions: entries.length,
    byRole: {
      bank: entries.filter((e) => e.role === 'Bank').length,
      fintech: entries.filter((e) => e.role === 'Fintech or payments company').length,
      business: entries.filter((e) => e.role === 'Business').length,
      individual: entries.filter((e) => e.role === 'Individual').length,
    },
    byStatus: {
      pending: entries.filter((e) => e.status === 'pending').length,
      approved: entries.filter((e) => e.status === 'approved').length,
      contacted: entries.filter((e) => e.status === 'contacted').length,
      rejected: entries.filter((e) => e.status === 'rejected').length,
    },
    last24hCount: entries.filter((e) => new Date(e.created_at).getTime() >= dayAgo).length,
    isLiveSupabase: isSupabaseConfigured,
  };

  return stats;
}

// ==============================================================================
// Contact Inquiries Data Management
// ==============================================================================

const fallbackContacts: ContactInquiry[] = [
  {
    id: 'c1-9a8b-7c6d-5e4f-3a2b1c0d9e8f',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    full_name: 'Marcus Vance',
    email: 'm.vance@citadel-fx.com',
    company: 'Citadel FX Liquidity',
    category: 'Partnership',
    subject: 'Institutional FX Corridor Integration & Volume Settlement',
    message: 'We are looking to integrate our institutional liquidity pool with Orb Finance ahead of the Q2 (15 April 2027) launch. Can we schedule a partner review call with your treasury team?',
    reference_id: 'ORB-INQ-7102',
    status: 'new',
    notes: 'High-priority institutional partner lead. Tier-1 FX provider.',
    ip_address: '194.28.112.4',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  },
  {
    id: 'c2-8b7a-6c5d-4e3f-2a1b0c9d8e7f',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    full_name: 'Elena Rostova',
    email: 'elena@novacash.io',
    company: 'NovaCash Europe',
    category: 'Institutional Sandbox',
    subject: 'API Sandbox Access Keys & Webhook Documentation',
    message: 'Our engineering department would like early access to your API sandbox environment to test real-time cross-currency quote generation and settlement webhooks.',
    reference_id: 'ORB-INQ-4820',
    status: 'in_progress',
    notes: 'Sent preliminary API spec sheet. Awaiting sandbox environment keys provision.',
    ip_address: '82.165.197.80',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2)',
  },
  {
    id: 'c3-7a6b-5c4d-3e2f-1a0b9c8d7e6f',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    full_name: 'Kariuki Mwangi',
    email: 'kmwangi@standardbank.ke',
    company: 'Standard Bank East Africa',
    category: 'Compliance',
    subject: 'NDPR Compliance & Data Residency Architecture',
    message: 'Could you share the audit documentation regarding multi-currency routing compliance, NDPR guidelines, and audit trail retention periods?',
    reference_id: 'ORB-INQ-3199',
    status: 'responded',
    notes: 'Legal compliance package dispatched on 10 Oct.',
    ip_address: '102.134.12.91',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  },
];

export async function createContactInquiry(params: {
  fullName: string;
  email: string;
  company?: string | null;
  category: ContactCategory;
  subject: string;
  message: string;
  referenceId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<{ inquiry: ContactInquiry; isNew: boolean }> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .insert({
          full_name: params.fullName.trim(),
          email: params.email.trim().toLowerCase(),
          company: params.company ? params.company.trim() : null,
          category: params.category,
          subject: params.subject.trim(),
          message: params.message.trim(),
          reference_id: params.referenceId,
          status: 'new',
          ip_address: params.ipAddress || null,
          user_agent: params.userAgent || null,
        })
        .select('*')
        .single();

      if (!error && data) {
        return {
          inquiry: data as ContactInquiry,
          isNew: true,
        };
      }
      if (error && error.code !== 'PGRST205') {
        console.error('[Supabase Contact Insert Error]:', error);
      }
    } catch (err) {
      console.warn('[Supabase Contact Catch]: falling back to local store', err);
    }
  }

  // Fallback in-memory insertion
  const newInquiry: ContactInquiry = {
    id: `local-inq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    full_name: params.fullName.trim(),
    email: params.email.trim().toLowerCase(),
    company: params.company ? params.company.trim() : null,
    category: params.category,
    subject: params.subject.trim(),
    message: params.message.trim(),
    reference_id: params.referenceId,
    status: 'new',
    ip_address: params.ipAddress || null,
    user_agent: params.userAgent || null,
  };

  fallbackContacts.unshift(newInquiry);
  return {
    inquiry: newInquiry,
    isNew: true,
  };
}

export async function fetchAllContactInquiries(filter?: {
  category?: string;
  status?: string;
  search?: string;
}): Promise<ContactInquiry[]> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      let query = supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter?.category && filter.category !== 'all') {
        query = query.eq('category', filter.category);
      }
      if (filter?.status && filter.status !== 'all') {
        query = query.eq('status', filter.status);
      }
      if (filter?.search) {
        const s = filter.search.trim();
        query = query.or(
          `full_name.ilike.%${s}%,email.ilike.%${s}%,company.ilike.%${s}%,subject.ilike.%${s}%,reference_id.ilike.%${s}%`
        );
      }

      const { data, error } = await query;
      if (!error && data) {
        return data as ContactInquiry[];
      }
      if (error && error.code !== 'PGRST205') {
        console.error('[Supabase Contact Fetch Error]:', error);
      }
    } catch (err) {
      console.warn('[Supabase Contact Fetch Catch]: falling back to local store', err);
    }
  }

  // Fallback in-memory query
  let results = [...fallbackContacts];

  if (filter?.category && filter.category !== 'all') {
    results = results.filter((c) => c.category === filter.category);
  }

  if (filter?.status && filter.status !== 'all') {
    results = results.filter((c) => c.status === filter.status);
  }

  if (filter?.search) {
    const s = filter.search.toLowerCase().trim();
    results = results.filter(
      (item) =>
        item.full_name.toLowerCase().includes(s) ||
        item.email.toLowerCase().includes(s) ||
        (item.company && item.company.toLowerCase().includes(s)) ||
        item.subject.toLowerCase().includes(s) ||
        item.reference_id.toLowerCase().includes(s) ||
        item.message.toLowerCase().includes(s)
    );
  }

  return results;
}

export async function updateContactInquiry(
  id: string,
  updates: { status?: ContactStatus; notes?: string }
): Promise<ContactInquiry | null> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .update({
          ...(updates.status ? { status: updates.status } : {}),
          ...(typeof updates.notes !== 'undefined' ? { notes: updates.notes } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (!error && data) {
        return data as ContactInquiry;
      }
      if (error && error.code !== 'PGRST205') {
        console.error('[Supabase Contact Update Error]:', error);
      }
    } catch (err) {
      console.warn('[Supabase Contact Update Catch]: falling back to local store', err);
    }
  }

  const idx = fallbackContacts.findIndex((c) => c.id === id);
  if (idx !== -1) {
    fallbackContacts[idx] = {
      ...fallbackContacts[idx],
      ...(updates.status ? { status: updates.status } : {}),
      ...(typeof updates.notes !== 'undefined' ? { notes: updates.notes } : {}),
      updated_at: new Date().toISOString(),
    };
    return fallbackContacts[idx];
  }
  return null;
}

export async function deleteContactInquiry(id: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      const { error } = await supabase.from('contact_inquiries').delete().eq('id', id);
      if (!error) return true;
      if (error && error.code !== 'PGRST205') console.error('[Supabase Contact Delete Error]:', error);
    } catch (err) {
      console.warn('[Supabase Contact Delete Catch]: falling back to local store', err);
    }
  }

  const idx = fallbackContacts.findIndex((c) => c.id === id);
  if (idx !== -1) {
    fallbackContacts.splice(idx, 1);
    return true;
  }
  return false;
}

export async function getContactAnalytics(): Promise<ContactStats> {
  const entries = await fetchAllContactInquiries();

  const now = Date.now();
  const dayAgo = now - 24 * 3600 * 1000;

  const stats: ContactStats = {
    totalInquiries: entries.length,
    byStatus: {
      new: entries.filter((e) => e.status === 'new').length,
      in_progress: entries.filter((e) => e.status === 'in_progress').length,
      responded: entries.filter((e) => e.status === 'responded').length,
      archived: entries.filter((e) => e.status === 'archived').length,
    },
    byCategory: {
      partnership: entries.filter((e) => e.category === 'Partnership').length,
      sandbox: entries.filter((e) => e.category === 'Institutional Sandbox').length,
      integration: entries.filter((e) => e.category === 'Integration Support').length,
      compliance: entries.filter((e) => e.category === 'Compliance').length,
      general: entries.filter((e) => e.category === 'General').length,
    },
    last24hCount: entries.filter((e) => new Date(e.created_at).getTime() >= dayAgo).length,
    isLiveSupabase: isSupabaseConfigured,
  };

  return stats;
}
