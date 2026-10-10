import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { WaitlistSubmission, WaitlistRole, WaitlistStatus, WaitlistStats } from './types';

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
    notes: 'Institutional liquidity integration requested for Q1 2027.',
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
    // 1. Check for existing submission by email
    const { data: existing } = await supabase
      .from('waitlist_submissions')
      .select('*')
      .ilike('email', params.email.trim())
      .single();

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
        full_name: params.fullName.trim(),
        email: params.email.trim().toLowerCase(),
        role: params.role,
        reference_id: params.referenceId,
        status: 'pending',
        ip_address: params.ipAddress || null,
        user_agent: params.userAgent || null,
      })
      .select('*')
      .single();

    if (error) {
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
