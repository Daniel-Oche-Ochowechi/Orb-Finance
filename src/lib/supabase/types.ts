export type WaitlistRole =
  | 'Bank'
  | 'Fintech or payments company'
  | 'Business'
  | 'Individual';

export type WaitlistStatus = 'pending' | 'approved' | 'contacted' | 'rejected';

export interface WaitlistSubmission {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string;
  role: WaitlistRole;
  reference_id: string;
  status: WaitlistStatus;
  notes?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface WaitlistStats {
  totalSubmissions: number;
  byRole: {
    bank: number;
    fintech: number;
    business: number;
    individual: number;
  };
  byStatus: {
    pending: number;
    approved: number;
    contacted: number;
    rejected: number;
  };
  last24hCount: number;
  isLiveSupabase: boolean;
}

export interface AdminAuthResponse {
  authenticated: boolean;
  user?: {
    role: 'admin';
    username: string;
  };
}
