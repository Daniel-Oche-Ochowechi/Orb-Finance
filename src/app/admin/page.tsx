'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Lock,
  Search,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  Building2,
  CreditCard,
  Briefcase,
  User,
  UserPlus,
  ArrowRight,
  ArrowUpRight,
  LogOut,
  Database,
  Trash2,
  X,
  Check,
  AlertCircle,
  Mail,
  Send,
  Inbox,
  Copy,
  Layers,
  Activity,
  Eye,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import {
  WaitlistSubmission,
  WaitlistStats,
  WaitlistStatus,
  ContactInquiry,
  ContactStats,
  ContactStatus,
} from '@/lib/supabase/types';
import type { PlatformActivityItem } from '@/app/api/admin/activity/route';
import { decodeStoredInput } from '@/lib/email/waitlistTemplate';

type DashboardTab = 'overview' | 'waitlist' | 'contacts' | 'telemetry';
type ActivityFilter = 'all' | 'waitlist' | 'contact' | '24h';

interface SystemHealthState {
  supabaseLive: boolean;
  emailProvider: string;
  emailConfigured: boolean;
  lastSyncedAt: string;
}

function formatRelativeTime(iso: string): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return '—';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

interface VerifiedAdminIdentity {
  userId: string;
  email: string;
  fullName: string;
  role: 'admin';
}

export default function AdminDashboardPage() {
  // Authentication State (Supabase Auth Email/Password + Role + Email OTP)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentAdmin, setCurrentAdmin] = useState<VerifiedAdminIdentity | null>(null);
  const [loginStep, setLoginStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpMaskedEmail, setOtpMaskedEmail] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [otpRemainingSec, setOtpRemainingSec] = useState<number>(0);
  const [resendCooldownSec, setResendCooldownSec] = useState<number>(0);
  const [isResendingOtp, setIsResendingOtp] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const otpInputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  // Active Tab & Live Stream State
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [liveSyncEnabled, setLiveSyncEnabled] = useState(true);
  const [activityEvents, setActivityEvents] = useState<PlatformActivityItem[]>([]);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [activitySearch, setActivitySearch] = useState('');
  const [systemHealth, setSystemHealth] = useState<SystemHealthState | null>(null);

  // Loading & Toast State
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);

  // Waitlist Data State
  const [submissions, setSubmissions] = useState<WaitlistSubmission[]>([]);
  const [waitlistStats, setWaitlistStats] = useState<WaitlistStats | null>(null);
  const [waitlistSearch, setWaitlistSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedWaitlistStatus, setSelectedWaitlistStatus] = useState('all');
  const [activeSubmission, setActiveSubmission] = useState<WaitlistSubmission | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSavingSubNotes, setIsSavingSubNotes] = useState(false);

  // Contact Data State
  const [contacts, setContacts] = useState<ContactInquiry[]>([]);
  const [contactStats, setContactStats] = useState<ContactStats | null>(null);
  const [contactSearch, setContactSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedContactStatus, setSelectedContactStatus] = useState('all');
  const [activeContact, setActiveContact] = useState<ContactInquiry | null>(null);
  const [contactNotes, setContactNotes] = useState('');
  const [isSavingContactNotes, setIsSavingContactNotes] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Authentication Check in background (verifies live Supabase Auth + 'admin' role)
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;
          if (data?.authenticated && data.admin) {
            setIsAuthenticated(true);
            setCurrentAdmin(data.admin);
          } else if (data?.pendingOtp) {
            setLoginStep('otp');
            setOtpMaskedEmail(data.pendingOtp.maskedEmail || '');
            setOtpExpiresAt(data.pendingOtp.expiresAt || null);
          }
        }
      } catch {
        // stay on login view
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  // OTP expiry & resend cooldown timers
  useEffect(() => {
    if (isAuthenticated || loginStep !== 'otp') return;

    const updateTimers = () => {
      if (otpExpiresAt) {
        const secsLeft = Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000));
        setOtpRemainingSec(secsLeft);
      }
      setResendCooldownSec((prev) => (prev > 0 ? prev - 1 : 0));
    };

    updateTimers();
    const timer = setInterval(updateTimers, 1000);
    return () => clearInterval(timer);
  }, [isAuthenticated, loginStep, otpExpiresAt]);

  // 2. Fetch All Data (Waitlist + Contacts + Stats + Live Platform Activity)
  const fetchData = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      try {
        const waitlistParams = new URLSearchParams();
        if (selectedRole !== 'all') waitlistParams.append('role', selectedRole);
        if (selectedWaitlistStatus !== 'all') waitlistParams.append('status', selectedWaitlistStatus);
        if (waitlistSearch.trim()) waitlistParams.append('search', waitlistSearch.trim());

        const contactParams = new URLSearchParams();
        if (selectedCategory !== 'all') contactParams.append('category', selectedCategory);
        if (selectedContactStatus !== 'all') contactParams.append('status', selectedContactStatus);
        if (contactSearch.trim()) contactParams.append('search', contactSearch.trim());

        const [subRes, subStatsRes, conRes, conStatsRes, actRes] = await Promise.all([
          fetch(`/api/admin/submissions?${waitlistParams.toString()}`, { cache: 'no-store' }),
          fetch('/api/admin/stats', { cache: 'no-store' }),
          fetch(`/api/admin/contacts?${contactParams.toString()}`, { cache: 'no-store' }),
          fetch('/api/admin/contacts/stats', { cache: 'no-store' }),
          fetch('/api/admin/activity', { cache: 'no-store' }),
        ]);

        if (
          subRes.status === 401 ||
          subStatsRes.status === 401 ||
          conRes.status === 401 ||
          conStatsRes.status === 401 ||
          actRes.status === 401
        ) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const [subData, subStatsData, conData, conStatsData, actData] = await Promise.all([
          subRes.json(),
          subStatsRes.json(),
          conRes.json(),
          conStatsRes.json(),
          actRes.json(),
        ]);

        if (subData.success) setSubmissions(subData.data);
        if (subStatsData.success) setWaitlistStats(subStatsData.data);
        if (conData.success) setContacts(conData.data);
        if (conStatsData.success) setContactStats(conStatsData.data);
        if (actData.success && actData.data) {
          setActivityEvents(actData.data.events || []);
          setSystemHealth(actData.data.systemHealth || null);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        if (!silent) showToast('Network error while refreshing data.');
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [
      selectedRole,
      selectedWaitlistStatus,
      waitlistSearch,
      selectedCategory,
      selectedContactStatus,
      contactSearch,
    ]
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // 3. Optional 15-second live stream polling for platform activity
  useEffect(() => {
    if (!isAuthenticated || !liveSyncEnabled) return;
    const timer = setInterval(() => {
      fetchData(true);
    }, 15000);
    return () => clearInterval(timer);
  }, [isAuthenticated, liveSyncEnabled, fetchData]);

  // 4. Escape key cleanly dismisses open drawers or modals
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSqlModal) setShowSqlModal(false);
        else if (activeSubmission) setActiveSubmission(null);
        else if (activeContact) setActiveContact(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showSqlModal, activeSubmission, activeContact]);

  const filteredActivity = useMemo(() => {
    const cutoff24h = Date.now() - 24 * 60 * 60 * 1000;
    const q = activitySearch.trim().toLowerCase();
    return activityEvents.filter((item) => {
      if (activityFilter === 'waitlist' && item.source !== 'waitlist') return false;
      if (activityFilter === 'contact' && item.source !== 'contact') return false;
      if (activityFilter === '24h' && new Date(item.timestamp).getTime() < cutoff24h) return false;
      if (!q) return true;
      return (
        item.actorName.toLowerCase().includes(q) ||
        item.actorEmail.toLowerCase().includes(q) ||
        item.referenceId.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        (item.organization && item.organization.toLowerCase().includes(q))
      );
    });
  }, [activityEvents, activityFilter, activitySearch]);

  const handleInspectActivity = async (item: PlatformActivityItem) => {
    if (item.source === 'waitlist') {
      let target = submissions.find((s) => s.id === item.recordId);
      if (!target) {
        const res = await fetch('/api/admin/submissions', { cache: 'no-store' }).then((r) => r.json()).catch(() => null);
        if (res?.success && Array.isArray(res.data)) {
          target = res.data.find((s: WaitlistSubmission) => s.id === item.recordId);
        }
      }
      if (target) {
        setActiveSubmission(target);
        setSubmissionNotes(target.notes || '');
      }
    } else {
      let target = contacts.find((c) => c.id === item.recordId);
      if (!target) {
        const res = await fetch('/api/admin/contacts', { cache: 'no-store' }).then((r) => r.json()).catch(() => null);
        if (res?.success && Array.isArray(res.data)) {
          target = res.data.find((c: ContactInquiry) => c.id === item.recordId);
        }
      }
      if (target) {
        setActiveContact(target);
        setContactNotes(target.notes || '');
      }
    }
  };

  // Step 1: Verify Email + Password against Supabase Auth & check 'admin' role, then trigger Email OTP
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setIsLoggingIn(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'credentials',
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication rejected.');
      }

      setLoginStep('otp');
      setOtpCode('');
      setOtpMaskedEmail(data.maskedEmail || email.trim());
      setOtpExpiresAt(
        data.expiresAt || Date.now() + (data.expiresInSeconds || 600) * 1000
      );
      setResendCooldownSec(30);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please verify credentials.';
      setAuthError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Step 2: Confirm 6-digit Email OTP & issue signed session
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedOtp = otpCode.replace(/\D/g, '').slice(0, 6);
    if (cleanedOtp.length !== 6) {
      setAuthError('Please enter the full 6-digit confirmation code.');
      return;
    }

    setIsLoggingIn(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'verify_otp',
          otp: cleanedOtp,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data?.exhausted) {
          setLoginStep('credentials');
          setOtpCode('');
          setOtpExpiresAt(null);
        }
        throw new Error(data.error || 'OTP verification failed.');
      }

      setCurrentAdmin(data.admin || null);
      setIsAuthenticated(true);
      setPassword('');
      setOtpCode('');
      setLoginStep('credentials');
      setOtpExpiresAt(null);
      showToast('Authenticated via Supabase Auth & Email OTP.');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unable to verify OTP code.';
      setAuthError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldownSec > 0 || isResendingOtp) return;
    setIsResendingOtp(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'resend_otp' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to resend OTP.');
      }
      setOtpMaskedEmail(data.maskedEmail || otpMaskedEmail);
      setOtpExpiresAt(
        data.expiresAt || Date.now() + (data.expiresInSeconds || 600) * 1000
      );
      setResendCooldownSec(30);
      setOtpCode('');
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Failed to resend OTP.');
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleCancelOtp = async () => {
    setAuthError(null);
    setOtpCode('');
    setOtpExpiresAt(null);
    setLoginStep('credentials');
    await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'cancel_otp' }),
    }).catch(() => undefined);
  };

  const handleOtpDigitChange = (index: number, rawValue: string) => {
    const digitsOnly = rawValue.replace(/\D/g, '');
    if (!digitsOnly) {
      const chars = Array.from({ length: 6 }, (_, i) => otpCode[i] || '');
      chars[index] = '';
      setOtpCode(chars.join(''));
      return;
    }

    // Handle full 6-digit browser/OS autofill or multi-char paste
    if (digitsOnly.length >= 3) {
      const merged = digitsOnly.slice(0, 6);
      setOtpCode(merged);
      const nextFocus = Math.min(5, merged.length - 1);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    // Single-digit entry or replacing an already-filled cell
    const nextDigit = digitsOnly.length === 2 && otpCode[index]
      ? (digitsOnly[0] === otpCode[index] ? digitsOnly[1] : digitsOnly[0])
      : digitsOnly.slice(-1);

    const chars = Array.from({ length: 6 }, (_, i) => otpCode[i] || '');
    chars[index] = nextDigit;
    setOtpCode(chars.join('').slice(0, 6));
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpDigitKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace') {
      const currentChar = otpCode[index];
      if (currentChar) {
        const chars = Array.from({ length: 6 }, (_, i) => otpCode[i] || '');
        chars[index] = '';
        setOtpCode(chars.join(''));
      } else if (index > 0) {
        const chars = Array.from({ length: 6 }, (_, i) => otpCode[i] || '');
        chars[index - 1] = '';
        setOtpCode(chars.join(''));
        otpInputRefs.current[index - 1]?.focus();
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    setOtpCode(pasted);
    otpInputRefs.current[Math.min(5, pasted.length - 1)]?.focus();
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
      setCurrentAdmin(null);
      setLoginStep('credentials');
      setOtpCode('');
      setPassword('');
      setOtpExpiresAt(null);
      showToast('Admin session terminated.');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Status updates
  const handleUpdateWaitlistStatus = async (id: string, newStatus: WaitlistStatus) => {
    try {
      setSubmissions((prev) =>
        prev.map((sub) => (sub.id === id ? { ...sub, status: newStatus } : sub))
      );
      if (activeSubmission && activeSubmission.id === id) {
        setActiveSubmission((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Status update failed');
      showToast(`Status updated to "${newStatus.toUpperCase()}"`);
      fetch('/api/admin/stats')
        .then((r) => r.json())
        .then((d) => d.success && setWaitlistStats(d.data));
    } catch {
      showToast('Error updating status.');
      fetchData();
    }
  };

  const handleSaveSubNotes = async () => {
    if (!activeSubmission) return;
    setIsSavingSubNotes(true);
    try {
      const res = await fetch(`/api/admin/submissions/${activeSubmission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: submissionNotes }),
      });
      if (!res.ok) throw new Error('Failed to save notes');

      setSubmissions((prev) =>
        prev.map((s) => (s.id === activeSubmission.id ? { ...s, notes: submissionNotes } : s))
      );
      setActiveSubmission((prev) => (prev ? { ...prev, notes: submissionNotes } : null));
      showToast('Dossier notes preserved.');
    } catch {
      showToast('Error saving dossier notes.');
    } finally {
      setIsSavingSubNotes(false);
    }
  };

  const handleDeleteSubmission = async (id: string, ref: string) => {
    if (!confirm(`Permanently remove waitlist applicant [${ref}]?`)) return;

    try {
      const res = await fetch(`/api/admin/submissions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Deletion failed');

      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      if (activeSubmission?.id === id) setActiveSubmission(null);
      showToast(`Submission ${ref} deleted.`);
      fetch('/api/admin/stats')
        .then((r) => r.json())
        .then((d) => d.success && setWaitlistStats(d.data));
    } catch {
      showToast('Error deleting candidate.');
    }
  };

  const handleUpdateContactStatus = async (id: string, newStatus: ContactStatus) => {
    try {
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      if (activeContact && activeContact.id === id) {
        setActiveContact((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Status update failed');
      showToast(`Inquiry marked as "${newStatus.replace('_', ' ').toUpperCase()}"`);
      fetch('/api/admin/contacts/stats')
        .then((r) => r.json())
        .then((d) => d.success && setContactStats(d.data));
    } catch {
      showToast('Error updating inquiry status.');
      fetchData();
    }
  };

  const handleSaveContactNotes = async () => {
    if (!activeContact) return;
    setIsSavingContactNotes(true);
    try {
      const res = await fetch(`/api/admin/contacts/${activeContact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: contactNotes }),
      });
      if (!res.ok) throw new Error('Failed to save notes');

      setContacts((prev) =>
        prev.map((c) => (c.id === activeContact.id ? { ...c, notes: contactNotes } : c))
      );
      setActiveContact((prev) => (prev ? { ...prev, notes: contactNotes } : null));
      showToast('Inquiry resolution memo saved.');
    } catch {
      showToast('Error saving notes.');
    } finally {
      setIsSavingContactNotes(false);
    }
  };

  const handleDeleteContact = async (id: string, ref: string) => {
    if (!confirm(`Permanently remove contact inquiry [${ref}]?`)) return;

    try {
      const res = await fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Deletion failed');

      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (activeContact?.id === id) setActiveContact(null);
      showToast(`Inquiry ${ref} deleted.`);
      fetch('/api/admin/contacts/stats')
        .then((r) => r.json())
        .then((d) => d.success && setContactStats(d.data));
    } catch {
      showToast('Error deleting inquiry.');
    }
  };

  const handleExportCsv = () => {
    if (activeTab === 'waitlist') {
      const params = new URLSearchParams();
      if (selectedRole !== 'all') params.append('role', selectedRole);
      if (selectedWaitlistStatus !== 'all') params.append('status', selectedWaitlistStatus);
      window.location.href = `/api/admin/export?${params.toString()}`;
      showToast('Generating waitlist CSV export...');
    } else {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedContactStatus !== 'all') params.append('status', selectedContactStatus);
      window.location.href = `/api/admin/contacts/export?${params.toString()}`;
      showToast('Generating contacts CSV export...');
    }
  };

  const copySqlSchema = () => {
    const sql = `-- Supabase SQL Schema for Orb Finance\n-- Run in Supabase SQL Editor:\n-- Check supabase_schema.sql in project root for full scripts.`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    showToast('SQL Schema copied to clipboard.');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // ============================================================================
  // Unauthenticated: Supabase Auth (Email/Password + Role Admin) & Email OTP
  // ============================================================================
  if (!isAuthenticated) {
    const otpMins = String(Math.floor(otpRemainingSec / 60)).padStart(2, '0');
    const otpSecs = String(otpRemainingSec % 60).padStart(2, '0');

    return (
      <div className="admin-login-wrapper">
        <div className="admin-ambient-halo" aria-hidden="true" />
        <div className="admin-orbital-ring ring-outer" aria-hidden="true" />
        <div className="admin-orbital-ring ring-inner" aria-hidden="true" />
        <div className="admin-grid-backdrop" aria-hidden="true" />

        {/* Minimal Top Rail */}
        <div className="login-top-rail">
          <Link href="/" className="login-back-pill">
            <span>&larr;</span>
            <span>orbfinance.co</span>
          </Link>
          <div className="login-enclave-chip">
            <span className="enclave-dot" />
            <span>ENCLAVE // Q2 2027</span>
          </div>
        </div>

        <div className="admin-login-box">
          <div className="admin-login-card">
            <div className="login-card-specular" aria-hidden="true" />

            {/* Executive Crest & Title Header */}
            <div className="vault-header">
              <div className="vault-logo-crest">
                <img
                  src="/images/orb-logo-white.png"
                  alt="Orb Finance"
                  className="login-brand-logo"
                />
              </div>

              <h1 className="vault-title">
                {loginStep === 'otp' ? 'Confirm Your Identity' : 'Executive Access'}
              </h1>
              <p className="vault-desc">
                {loginStep === 'otp'
                  ? 'Enter the 6-digit single-use confirmation code delivered to your administrator inbox.'
                  : 'Sign in with your Supabase administrator credentials to inspect live platform activity.'}
              </p>

              {/* 2-Step Verification Progress Stepper */}
              <div className="auth-stepper" aria-label="Authentication steps">
                <div
                  className={`step-node ${
                    loginStep === 'credentials' ? 'step-active' : 'step-done'
                  }`}
                >
                  <span className="step-index">
                    {loginStep === 'otp' ? <Check size={11} strokeWidth={3} /> : '01'}
                  </span>
                  <span className="step-label">Credentials</span>
                </div>

                <span className={`step-bridge ${loginStep === 'otp' ? 'bridge-lit' : ''}`} />

                <div className={`step-node ${loginStep === 'otp' ? 'step-active' : ''}`}>
                  <span className="step-index">02</span>
                  <span className="step-label">Email OTP</span>
                </div>
              </div>
            </div>

            {authError && (
              <div className="admin-error-banner" role="alert">
                <AlertCircle size={15} />
                <span>{authError}</span>
              </div>
            )}

            {loginStep === 'credentials' ? (
              <form onSubmit={handleCredentialsSubmit} className="admin-login-form">
                <div className="form-group">
                  <label htmlFor="admin-email-input" className="input-label">
                    Administrator Email
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <Mail size={15} />
                    </span>
                    <input
                      id="admin-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@orbfinance.co"
                      autoComplete="email"
                      autoFocus
                      required
                      className="vault-input vault-email-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-label-row">
                    <label htmlFor="admin-password-input" className="input-label" style={{ marginBottom: 0 }}>
                      Password
                    </label>
                    <span className="role-requirement-tag">ROLE: ADMIN</span>
                  </div>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <Lock size={15} />
                    </span>
                    <input
                      id="admin-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="vault-input vault-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="passcode-toggle"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="admin-unlock-btn"
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw size={14} className="spin-icon" />
                      <span>Verifying & Dispatching OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight size={14} strokeWidth={2.4} className="btn-arrow" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="admin-login-form">
                <div className="otp-status-callout">
                  <div className="otp-callout-top">
                    <ShieldCheck size={14} />
                    <span>Supabase Authority Confirmed</span>
                  </div>
                  <p>
                    Dispatched to <strong>{otpMaskedEmail || email}</strong>
                  </p>
                </div>

                <div className="form-group">
                  <div className="otp-label-row">
                    <label className="input-label" style={{ marginBottom: 0 }}>
                      Verification Code
                    </label>
                    <span className={`otp-expiry-timer ${otpRemainingSec <= 60 ? 'timer-low' : ''}`}>
                      {otpRemainingSec > 0
                        ? `Valid ${otpMins}:${otpSecs}`
                        : 'Code expired'}
                    </span>
                  </div>

                  {/* Segmented 6-Digit Pin Matrix */}
                  <div className="otp-matrix" role="group" aria-label="6-digit verification code">
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                      <React.Fragment key={idx}>
                        {idx === 3 && <span className="otp-matrix-sep" aria-hidden="true">&bull;</span>}
                        <input
                          ref={(el) => {
                            otpInputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                          maxLength={6}
                          value={otpCode[idx] || ''}
                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpDigitKeyDown(idx, e)}
                          onFocus={(e) => e.target.select()}
                          onPaste={handleOtpPaste}
                          autoFocus={idx === 0}
                          aria-label={`Verification digit ${idx + 1}`}
                          className={`otp-cell ${otpCode[idx] ? 'otp-cell-filled' : ''}`}
                        />
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn || otpCode.length !== 6 || otpRemainingSec === 0}
                  className="admin-unlock-btn"
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw size={14} className="spin-icon" />
                      <span>Unlocking Terminal...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Enter Terminal</span>
                      <ArrowRight size={14} strokeWidth={2.4} className="btn-arrow" />
                    </>
                  )}
                </button>

                <div className="otp-secondary-actions">
                  <button
                    type="button"
                    onClick={handleCancelOtp}
                    className="otp-link-btn"
                  >
                    &larr; Change account
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldownSec > 0 || isResendingOtp}
                    className="otp-link-btn"
                  >
                    {isResendingOtp
                      ? 'Sending new code...'
                      : resendCooldownSec > 0
                      ? `Resend in ${resendCooldownSec}s`
                      : 'Resend code'}
                  </button>
                </div>
              </form>
            )}

            {/* Security Provenance Footer */}
            <div className="admin-card-footer">
              <div className="provenance-row">
                <span>Supabase Auth Verified</span>
                <span className="prov-dot" />
                <span>Single-Use 2FA OTP</span>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .admin-login-wrapper {
            min-height: 100vh;
            background:
              radial-gradient(ellipse 80% 55% at 50% 0%, rgba(226, 232, 240, 0.06) 0%, transparent 65%),
              #04060a;
            color: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4.5rem 1.25rem 2rem;
            position: relative;
            overflow: hidden;
            font-family: var(--font-sans);
          }

          .admin-grid-backdrop {
            position: absolute;
            inset: 0;
            background-image:
              linear-gradient(rgba(255, 255, 255, 0.024) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.024) 1px, transparent 1px);
            background-size: 56px 56px;
            mask-image: radial-gradient(ellipse at center, black 28%, transparent 76%);
            pointer-events: none;
          }

          .admin-orbital-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.045);
            pointer-events: none;
          }

          .ring-outer {
            width: 820px;
            height: 820px;
            mask-image: linear-gradient(180deg, rgba(0,0,0,0.8), transparent 75%);
          }

          .ring-inner {
            width: 560px;
            height: 560px;
            border-color: rgba(226, 232, 240, 0.055);
          }

          .admin-ambient-halo {
            position: absolute;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 640px;
            height: 640px;
            background: radial-gradient(circle, rgba(226, 232, 240, 0.1) 0%, rgba(148, 163, 184, 0.04) 45%, transparent 72%);
            border-radius: 50%;
            filter: blur(85px);
            pointer-events: none;
          }

          .login-top-rail {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 20;
            max-width: 1200px;
            margin: 0 auto;
            padding: 1.25rem 1.75rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            pointer-events: none;
          }

          :global(.login-back-pill) {
            pointer-events: auto;
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            padding: 0.4rem 0.85rem;
            border-radius: 9999px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 0.74rem;
            font-family: var(--font-mono);
            color: rgba(226, 232, 240, 0.78);
            text-decoration: none;
            backdrop-filter: blur(12px);
            transition: all 0.2s ease;
          }

          :global(.login-back-pill:hover) {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.22);
            color: #ffffff;
          }

          .login-enclave-chip {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            padding: 0.36rem 0.82rem;
            border-radius: 9999px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            font-family: var(--font-mono);
            font-size: 0.66rem;
            letter-spacing: 0.12em;
            color: rgba(148, 163, 184, 0.85);
          }

          .enclave-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #e2e8f0;
            box-shadow: 0 0 8px rgba(226, 232, 240, 0.75);
          }

          .admin-login-box {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 452px;
          }

          .admin-login-card {
            position: relative;
            border-radius: 26px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            background: linear-gradient(168deg, rgba(16, 20, 30, 0.9) 0%, rgba(7, 9, 15, 0.96) 100%);
            backdrop-filter: blur(36px);
            padding: 2.35rem 2.25rem 1.85rem;
            box-shadow:
              0 36px 90px rgba(0, 0, 0, 0.85),
              0 0 0 1px rgba(255, 255, 255, 0.03),
              inset 0 1px 0 rgba(255, 255, 255, 0.16);
            overflow: hidden;
          }

          .login-card-specular {
            position: absolute;
            top: 0;
            left: 14%;
            right: 14%;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
            pointer-events: none;
          }

          .vault-header {
            text-align: center;
            margin-bottom: 1.75rem;
          }

          .vault-logo-crest {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.72rem 1.15rem;
            border-radius: 14px;
            background: linear-gradient(155deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%);
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: 0 12px 26px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.18);
            margin-bottom: 1.2rem;
          }

          .login-brand-logo {
            height: 22px;
            width: auto;
            display: block;
          }

          .vault-title {
            margin: 0;
            font-size: 1.55rem;
            font-weight: 700;
            letter-spacing: -0.025em;
            background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .vault-desc {
            margin: 0.5rem auto 0;
            max-width: 340px;
            font-size: 0.81rem;
            line-height: 1.55;
            color: rgba(148, 163, 184, 0.88);
          }

          .auth-stepper {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.65rem;
            margin-top: 1.35rem;
            padding: 0.6rem 0.9rem;
            border-radius: 9999px;
            background: rgba(255, 255, 255, 0.025);
            border: 1px solid rgba(255, 255, 255, 0.07);
          }

          .step-node {
            display: inline-flex;
            align-items: center;
            gap: 0.42rem;
            color: rgba(148, 163, 184, 0.52);
            font-size: 0.72rem;
            font-weight: 500;
            transition: color 0.2s ease;
          }

          .step-node.step-active {
            color: #ffffff;
          }

          .step-node.step-done {
            color: #a7f3d0;
          }

          .step-index {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-mono);
            font-size: 0.62rem;
            font-weight: 700;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .step-node.step-active .step-index {
            background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%);
            color: #07090e;
            border-color: transparent;
            box-shadow: 0 0 12px rgba(226, 232, 240, 0.35);
          }

          .step-node.step-done .step-index {
            background: rgba(52, 211, 153, 0.18);
            border-color: rgba(52, 211, 153, 0.45);
            color: #6ee7b7;
          }

          .step-label {
            letter-spacing: 0.01em;
          }

          .step-bridge {
            width: 34px;
            height: 1px;
            background: rgba(255, 255, 255, 0.12);
            transition: background 0.25s ease;
          }

          .step-bridge.bridge-lit {
            background: linear-gradient(90deg, rgba(110, 231, 183, 0.6), rgba(255, 255, 255, 0.45));
          }

          .admin-error-banner {
            margin-bottom: 1.2rem;
            padding: 0.78rem 0.95rem;
            border-radius: 13px;
            background: rgba(244, 63, 94, 0.1);
            border: 1px solid rgba(244, 63, 94, 0.28);
            color: #fda4af;
            font-size: 0.79rem;
            line-height: 1.45;
            display: flex;
            align-items: center;
            gap: 0.6rem;
          }

          .admin-login-form {
            display: flex;
            flex-direction: column;
            gap: 1.18rem;
          }

          .input-label-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.5rem;
          }

          .role-requirement-tag {
            font-family: var(--font-mono);
            font-size: 0.6rem;
            letter-spacing: 0.1em;
            padding: 0.14rem 0.46rem;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.09);
            color: rgba(203, 213, 225, 0.7);
          }

          .input-label {
            display: block;
            font-size: 0.72rem;
            font-weight: 500;
            letter-spacing: 0.02em;
            color: rgba(226, 232, 240, 0.82);
            margin-bottom: 0.5rem;
          }

          .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .input-icon-left {
            position: absolute;
            left: 1rem;
            color: rgba(148, 163, 184, 0.65);
            pointer-events: none;
            display: flex;
            align-items: center;
            transition: color 0.2s ease;
          }

          .input-wrapper:focus-within .input-icon-left {
            color: #e2e8f0;
          }

          .vault-input {
            width: 100%;
            border-radius: 14px;
            background: rgba(4, 6, 11, 0.78);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #ffffff;
            font-size: 0.9rem;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.45);
            transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          }

          .vault-email-input {
            padding: 0.9rem 1rem 0.9rem 2.75rem;
            font-family: var(--font-sans);
          }

          .vault-password-input {
            padding: 0.9rem 4.35rem 0.9rem 2.75rem;
            font-family: var(--font-mono);
          }

          .vault-input::placeholder {
            color: rgba(148, 163, 184, 0.42);
          }

          .vault-input:focus {
            outline: none;
            background: rgba(6, 9, 16, 0.92);
            border-color: rgba(226, 232, 240, 0.5);
            box-shadow:
              inset 0 2px 4px rgba(0, 0, 0, 0.45),
              0 0 0 3px rgba(226, 232, 240, 0.11);
          }

          .passcode-toggle {
            position: absolute;
            right: 0.7rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            color: rgba(203, 213, 225, 0.76);
            font-size: 0.7rem;
            font-weight: 500;
            cursor: pointer;
            padding: 0.28rem 0.58rem;
            transition: all 0.18s ease;
          }

          .passcode-toggle:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.18);
          }

          .admin-unlock-btn {
            margin-top: 0.2rem;
            width: 100%;
            padding: 0.96rem 1.5rem;
            border-radius: 14px;
            background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%);
            color: #06080d;
            font-weight: 700;
            font-size: 0.88rem;
            letter-spacing: -0.01em;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.55rem;
            transition: transform 0.18s ease, box-shadow 0.2s ease, filter 0.2s ease;
            box-shadow:
              0 14px 32px rgba(0, 0, 0, 0.5),
              0 1px 0 rgba(255, 255, 255, 0.95) inset;
          }

          .admin-unlock-btn:hover:not(:disabled) {
            filter: brightness(1.04);
            transform: translateY(-1px);
            box-shadow:
              0 18px 38px rgba(0, 0, 0, 0.6),
              0 0 24px rgba(226, 232, 240, 0.16),
              0 1px 0 rgba(255, 255, 255, 0.95) inset;
          }

          .admin-unlock-btn:active:not(:disabled) {
            transform: scale(0.99);
          }

          .admin-unlock-btn:disabled {
            opacity: 0.52;
            cursor: not-allowed;
          }

          :global(.btn-arrow) {
            transition: transform 0.2s ease;
          }

          .admin-unlock-btn:hover:not(:disabled) :global(.btn-arrow) {
            transform: translateX(2px);
          }

          .otp-status-callout {
            padding: 0.85rem 1rem;
            border-radius: 14px;
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.045) 0%, rgba(255, 255, 255, 0.015) 100%);
            border: 1px solid rgba(226, 232, 240, 0.13);
            display: flex;
            flex-direction: column;
            gap: 0.28rem;
          }

          .otp-callout-top {
            display: flex;
            align-items: center;
            gap: 0.45rem;
            font-family: var(--font-mono);
            font-size: 0.66rem;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #a7f3d0;
          }

          .otp-status-callout p {
            margin: 0;
            font-size: 0.79rem;
            line-height: 1.45;
            color: rgba(203, 213, 225, 0.78);
          }

          .otp-status-callout strong {
            color: #ffffff;
            font-weight: 600;
          }

          .otp-label-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.65rem;
          }

          .otp-expiry-timer {
            font-family: var(--font-mono);
            font-size: 0.68rem;
            padding: 0.16rem 0.52rem;
            border-radius: 9999px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.09);
            color: #cbd5e1;
          }

          .otp-expiry-timer.timer-low {
            color: #fda4af;
            border-color: rgba(244, 63, 94, 0.3);
            background: rgba(244, 63, 94, 0.09);
          }

          .otp-matrix {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.45rem;
          }

          .otp-matrix-sep {
            color: rgba(148, 163, 184, 0.55);
            font-size: 0.95rem;
            padding: 0 0.1rem;
            user-select: none;
          }

          .otp-cell {
            flex: 1;
            min-width: 0;
            height: 54px;
            border-radius: 13px;
            background: rgba(4, 6, 11, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.11);
            color: #ffffff;
            font-family: var(--font-mono);
            font-size: 1.35rem;
            font-weight: 700;
            text-align: center;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
            transition: all 0.18s ease;
          }

          .otp-cell-filled {
            border-color: rgba(226, 232, 240, 0.34);
            background: rgba(255, 255, 255, 0.045);
          }

          .otp-cell:focus {
            outline: none;
            border-color: #ffffff;
            background: rgba(8, 12, 21, 0.95);
            box-shadow:
              inset 0 2px 4px rgba(0, 0, 0, 0.45),
              0 0 0 3px rgba(226, 232, 240, 0.15);
            transform: translateY(-1px);
          }

          .otp-secondary-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
            padding-top: 0.15rem;
          }

          .otp-link-btn {
            background: none;
            border: none;
            padding: 0.25rem 0;
            font-size: 0.74rem;
            font-family: var(--font-sans);
            font-weight: 500;
            color: rgba(203, 213, 225, 0.72);
            cursor: pointer;
            transition: color 0.18s ease;
          }

          .otp-link-btn:hover:not(:disabled) {
            color: #ffffff;
          }

          .otp-link-btn:disabled {
            opacity: 0.42;
            cursor: not-allowed;
          }

          .admin-card-footer {
            margin-top: 1.6rem;
            padding-top: 1.1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.07);
            display: flex;
            justify-content: center;
          }

          .provenance-row {
            display: inline-flex;
            align-items: center;
            gap: 0.55rem;
            font-family: var(--font-mono);
            font-size: 0.64rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: rgba(148, 163, 184, 0.65);
          }

          .prov-dot {
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background: rgba(148, 163, 184, 0.45);
          }

          :global(.spin-icon) {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @media (max-width: 480px) {
            .admin-login-card {
              padding: 1.85rem 1.35rem 1.5rem;
              border-radius: 22px;
            }

            .otp-cell {
              height: 48px;
              font-size: 1.15rem;
            }
          }
        `}</style>
      </div>
    );
  }

  // ============================================================================
  // Authenticated Executive Admin Dashboard
  // ============================================================================
  const totalWaitlistCount = waitlistStats?.totalSubmissions ?? submissions.length;
  const totalContactCount = contactStats?.totalInquiries ?? contacts.length;
  const totalPlatformCount = totalWaitlistCount + totalContactCount;
  const total24hVelocity = (waitlistStats?.last24hCount ?? 0) + (contactStats?.last24hCount ?? 0);
  const processedCount =
    (waitlistStats?.byStatus?.approved ?? 0) +
    (waitlistStats?.byStatus?.contacted ?? 0) +
    (contactStats?.byStatus?.responded ?? 0);
  const resolutionRate = totalPlatformCount
    ? Math.round((processedCount / totalPlatformCount) * 100)
    : 0;

  const adminEmail = currentAdmin?.email || 'admin@orbfinance.co';
  const adminInitials = adminEmail
    .split('@')[0]
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'OA';

  const tabMeta: Record<DashboardTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Platform Activity',
      subtitle: 'Unified audit ledger of waitlist onboarding, institutional inquiries, and desk updates.',
    },
    waitlist: {
      title: 'Waitlist Register',
      subtitle: 'Review institutional and priority access candidates ahead of Q2 launch (15 April 2027).',
    },
    contacts: {
      title: 'Institutional Inquiries',
      subtitle: 'Direct partnership requests, sandbox onboarding, and compliance correspondence.',
    },
    telemetry: {
      title: 'Pipeline & Schema',
      subtitle: 'Segment composition, inquiry distribution, and Supabase PostgreSQL architecture.',
    },
  };

  return (
    <div className="dash-shell">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast" role="status">
          <CheckCircle2 size={15} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Architectural Navigation Rail */}
      <aside className="dash-sidebar">
        <div className="sidebar-brand">
          <Link href="/" className="sidebar-logo-link" title="Open public website">
            <img
              src="/images/orb-logo-black.png"
              alt="Orb Finance"
              className="sidebar-logo"
            />
          </Link>
          <span className="sidebar-env-tag">Operations</span>
        </div>

        <nav className="sidebar-nav" aria-label="Dashboard sections">
          <div className="nav-section-label">Workspace</div>
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`nav-item ${activeTab === 'overview' ? 'is-active' : ''}`}
          >
            <span className="nav-item-left">
              <Radio size={15} />
              <span>Activity</span>
            </span>
            <span className="nav-badge">{activityEvents.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('waitlist')}
            className={`nav-item ${activeTab === 'waitlist' ? 'is-active' : ''}`}
          >
            <span className="nav-item-left">
              <UsersIcon size={15} />
              <span>Waitlist</span>
            </span>
            <span className="nav-badge">{submissions.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`nav-item ${activeTab === 'contacts' ? 'is-active' : ''}`}
          >
            <span className="nav-item-left">
              <Mail size={15} />
              <span>Inquiries</span>
            </span>
            <span className="nav-badge">{contacts.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`nav-item ${activeTab === 'telemetry' ? 'is-active' : ''}`}
          >
            <span className="nav-item-left">
              <Activity size={15} />
              <span>Telemetry</span>
            </span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          {/* Quiet Infrastructure Readout */}
          <div className="infra-card">
            <div className="infra-row">
              <span className="infra-key">Database</span>
              <span className="infra-val">
                <span className={`dot-indicator ${waitlistStats?.isLiveSupabase ? 'is-live' : ''}`} />
                {waitlistStats?.isLiveSupabase ? 'Supabase' : 'Fallback'}
              </span>
            </div>
            <div className="infra-row">
              <span className="infra-key">Mailer</span>
              <span className="infra-val">
                {systemHealth?.emailConfigured
                  ? systemHealth.emailProvider.toUpperCase()
                  : 'Resend'}
              </span>
            </div>
            <div className="infra-row">
              <span className="infra-key">Target</span>
              <span className="infra-val">Apr 15, 2027</span>
            </div>
          </div>

          {/* Signed-In Supabase Administrator */}
          <div className="operator-row">
            <div className="operator-avatar" aria-hidden="true">
              {adminInitials}
            </div>
            <div className="operator-meta">
              <div className="operator-email" title={adminEmail}>
                {adminEmail}
              </div>
              <div className="operator-role">
                {currentAdmin?.role === 'admin' ? 'Supabase Admin' : 'Administrator'}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="operator-logout"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Canvas */}
      <div className="dash-workspace">
        {/* Top Workspace Header */}
        <header className="workspace-topbar">
          <div className="topbar-left">
            <div className="topbar-breadcrumb">
              <span>Orb Finance</span>
              <span className="crumb-sep">/</span>
              <span>{tabMeta[activeTab].title}</span>
            </div>
            <h1 className="topbar-title">{tabMeta[activeTab].title}</h1>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              onClick={() => setLiveSyncEnabled((v) => !v)}
              className={`toolbar-btn ${liveSyncEnabled ? 'is-synced' : ''}`}
              title="Toggle automatic 15s platform activity polling"
            >
              <span className={`dot-indicator ${liveSyncEnabled ? 'is-live' : ''}`} />
              <span>{liveSyncEnabled ? 'Live sync' : 'Paused'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="toolbar-btn csv-btn"
              title="Download CSV report"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => fetchData()}
              disabled={isLoading}
              className="toolbar-btn icon-btn"
              title="Refresh data"
              aria-label="Refresh data"
            >
              <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="toolbar-btn icon-btn mobile-only-btn"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </header>

        {/* Responsive Mobile Navigation */}
        <div className="mobile-tab-bar">
          {(
            [
              { id: 'overview', label: 'Activity', count: activityEvents.length },
              { id: 'waitlist', label: 'Waitlist', count: submissions.length },
              { id: 'contacts', label: 'Inquiries', count: contacts.length },
              { id: 'telemetry', label: 'Telemetry' },
            ] as Array<{ id: DashboardTab; label: string; count?: number }>
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`mobile-tab-btn ${activeTab === item.id ? 'is-active' : ''}`}
            >
              <span>{item.label}</span>
              {typeof item.count === 'number' && <span className="mobile-tab-count">{item.count}</span>}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <main className="admin-main">
          <p className="view-subtitle">{tabMeta[activeTab].subtitle}</p>

          {/* ==================================================================== */}
          {/* TAB 0: OVERVIEW & LIVE PLATFORM ACTIVITY FEED                        */}
          {/* ==================================================================== */}
          {activeTab === 'overview' && (
            <div className="tab-view-container" key="overview">
              {/* Architectural 4-Cell Bold Hairline Metric Ledger */}
              <section className="metric-ledger" aria-label="Platform metrics">
                <div className="metric-cell">
                  <div className="metric-head-row">
                    <span className="metric-label">Total records</span>
                    <span className="metric-index">01</span>
                  </div>
                  <div className="metric-num-row">
                    <span className="metric-num">{totalPlatformCount}</span>
                    <span className="metric-delta is-positive">+{total24hVelocity} in 24h</span>
                  </div>
                </div>

                <div className="metric-cell">
                  <div className="metric-head-row">
                    <span className="metric-label">Waitlist queue</span>
                    <span className="metric-index">02</span>
                  </div>
                  <div className="metric-num-row">
                    <span className="metric-num">{totalWaitlistCount}</span>
                    <span className="metric-delta">
                      {waitlistStats?.byStatus?.pending ?? 0} pending
                    </span>
                  </div>
                </div>

                <div className="metric-cell">
                  <div className="metric-head-row">
                    <span className="metric-label">Institutional inquiries</span>
                    <span className="metric-index">03</span>
                  </div>
                  <div className="metric-num-row">
                    <span className="metric-num">{totalContactCount}</span>
                    <span className="metric-delta">
                      {contactStats?.byStatus?.new ?? 0} unread
                    </span>
                  </div>
                </div>

                <div className="metric-cell">
                  <div className="metric-head-row">
                    <span className="metric-label">Resolution rate</span>
                    <span className="metric-index">04</span>
                  </div>
                  <div className="metric-num-row">
                    <span className="metric-num">{resolutionRate}%</span>
                    <span className="metric-delta">
                      {systemHealth?.lastSyncedAt
                        ? `Synced ${new Date(systemHealth.lastSyncedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`
                        : 'Live'}
                    </span>
                  </div>
                </div>
              </section>

              {/* 2-Column Workspace Grid */}
              <div className="overview-command-grid">
                {/* Left: Clean Chronological Activity Ledger */}
                <section className="panel-card">
                  <div className="panel-header">
                    <div>
                      <h2 className="panel-title">Recent events</h2>
                      <p className="panel-meta">
                        Select any entry to inspect dossier or update workflow status
                      </p>
                    </div>

                    <div className="segmented-tabs" role="tablist" aria-label="Filter events">
                      {(
                        [
                          { id: 'all', label: 'All' },
                          { id: 'waitlist', label: 'Waitlist' },
                          { id: 'contact', label: 'Inquiries' },
                          { id: '24h', label: '24h' },
                        ] as Array<{ id: ActivityFilter; label: string }>
                      ).map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setActivityFilter(f.id)}
                          className={`seg-tab ${activityFilter === f.id ? 'is-active' : ''}`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="panel-search-bar">
                    <Search size={14} className="panel-search-icon" />
                    <input
                      type="text"
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      placeholder="Filter by name, email, organization, or ORB reference..."
                      className="panel-search-input"
                    />
                  </div>

                  <div className="ledger-list">
                    {filteredActivity.length === 0 ? (
                      <div className="empty-panel-state">
                        <Inbox size={24} style={{ opacity: 0.3 }} />
                        <p>No platform activity matches the selected filter.</p>
                      </div>
                    ) : (
                      filteredActivity.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleInspectActivity(item)}
                          className="ledger-row"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleInspectActivity(item);
                            }
                          }}
                        >
                          <div className="ledger-row-main">
                            <div className="ledger-row-top">
                              <span className={`event-type-dot ${item.action}`} />
                              <span className="ledger-actor">{item.actorName}</span>
                              <span className="ledger-action-text">{item.title}</span>
                            </div>

                            <div className="ledger-row-sub">
                              <span className="ledger-email">{item.actorEmail}</span>
                              {item.organization && (
                                <>
                                  <span className="ledger-sep">&middot;</span>
                                  <span>{item.organization}</span>
                                </>
                              )}
                              <span className="ledger-sep">&middot;</span>
                              <span className="ledger-summary">{item.summary}</span>
                            </div>
                          </div>

                          <div className="ledger-row-right">
                            <span className="ledger-ref">{item.referenceId}</span>
                            <span className={`status-pill status-${item.status}`}>
                              {item.status.replace('_', ' ')}
                            </span>
                            <span className="ledger-time">
                              {formatRelativeTime(item.timestamp)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Right: Composition & Direct Shortcuts */}
                <aside className="overview-side-stack">
                  <div className="panel-card panel-pad">
                    <div className="side-panel-head">
                      <h3 className="panel-title">Waitlist composition</h3>
                      <span className="side-panel-count">{totalWaitlistCount}</span>
                    </div>
                    {(() => {
                      const rows = [
                        { label: 'Banks & institutions', count: waitlistStats?.byRole?.bank ?? 0, shade: '100' },
                        { label: 'Fintech & payments', count: waitlistStats?.byRole?.fintech ?? 0, shade: '70' },
                        { label: 'Business & treasury', count: waitlistStats?.byRole?.business ?? 0, shade: '45' },
                        { label: 'Individuals', count: waitlistStats?.byRole?.individual ?? 0, shade: '28' },
                      ];
                      return (
                        <>
                          <div className="ratio-strip" aria-hidden="true">
                            {rows.map((row) => {
                              const pct = totalWaitlistCount
                                ? Math.round((row.count / totalWaitlistCount) * 100)
                                : 0;
                              if (pct <= 0) return null;
                              return (
                                <span
                                  key={row.label}
                                  className={`ratio-segment shade-${row.shade}`}
                                  style={{ width: `${pct}%` }}
                                />
                              );
                            })}
                          </div>
                          <div className="bars-list">
                            {rows.map((row) => {
                              const pct = totalWaitlistCount
                                ? Math.min(100, Math.round((row.count / totalWaitlistCount) * 100))
                                : 0;
                              return (
                                <div className="bar-row" key={row.label}>
                                  <div className="bar-header">
                                    <span>{row.label}</span>
                                    <span className="mono-count">
                                      {row.count} <span className="pct-muted">({pct}%)</span>
                                    </span>
                                  </div>
                                  <div className="bar-track">
                                    <div
                                      className={`bar-fill shade-${row.shade}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="panel-card panel-pad">
                    <h3 className="panel-title" style={{ marginBottom: '0.85rem' }}>
                      Quick actions
                    </h3>
                    <div className="quick-actions-stack">
                      <button
                        type="button"
                        onClick={() => setActiveTab('waitlist')}
                        className="quick-nav-btn"
                      >
                        <span>Review waitlist register</span>
                        <ArrowRight size={14} className="quick-arrow" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('contacts')}
                        className="quick-nav-btn"
                      >
                        <span>Triage institutional inquiries</span>
                        <ArrowRight size={14} className="quick-arrow" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSqlModal(true)}
                        className="quick-nav-btn"
                      >
                        <span>Inspect database schema</span>
                        <Database size={14} className="quick-arrow" />
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          )}

        {/* ==================================================================== */}
        {/* TAB 1: WAITLIST SUBMISSIONS                                          */}
        {/* ==================================================================== */}
        {activeTab === 'waitlist' && (
          <div className="tab-view-container" key="waitlist">
            {/* Architectural 5-Cell Bold Hairline Metric Ledger */}
            <section className="metric-ledger metric-ledger-5" aria-label="Waitlist metrics">
              <div className="metric-cell">
                <div className="metric-head-row">
                  <span className="metric-label">Total candidates</span>
                  <span className="metric-index">01</span>
                </div>
                <div className="metric-num-row">
                  <span className="metric-num">
                    {waitlistStats?.totalSubmissions ?? submissions.length}
                  </span>
                  <span className="metric-delta is-positive">
                    +{waitlistStats?.last24hCount ?? 0} today
                  </span>
                </div>
              </div>

              <div className="metric-cell">
                <div className="metric-head-row">
                  <span className="metric-label">Banks</span>
                  <span className="metric-index">02</span>
                </div>
                <div className="metric-num-row">
                  <span className="metric-num">{waitlistStats?.byRole?.bank ?? 0}</span>
                  <Building2 size={15} className="metric-icon-muted" />
                </div>
              </div>

              <div className="metric-cell">
                <div className="metric-head-row">
                  <span className="metric-label">Fintech</span>
                  <span className="metric-index">03</span>
                </div>
                <div className="metric-num-row">
                  <span className="metric-num">{waitlistStats?.byRole?.fintech ?? 0}</span>
                  <CreditCard size={15} className="metric-icon-muted" />
                </div>
              </div>

              <div className="metric-cell">
                <div className="metric-head-row">
                  <span className="metric-label">Business</span>
                  <span className="metric-index">04</span>
                </div>
                <div className="metric-num-row">
                  <span className="metric-num">{waitlistStats?.byRole?.business ?? 0}</span>
                  <Briefcase size={15} className="metric-icon-muted" />
                </div>
              </div>

              <div className="metric-cell">
                <div className="metric-head-row">
                  <span className="metric-label">Individuals</span>
                  <span className="metric-index">05</span>
                </div>
                <div className="metric-num-row">
                  <span className="metric-num">{waitlistStats?.byRole?.individual ?? 0}</span>
                  <User size={15} className="metric-icon-muted" />
                </div>
              </div>
            </section>

            {/* Unified Filter & Register Panel */}
            <div className="panel-card">
              <div className="table-toolbar">
                <div className="search-box">
                  <Search size={14} className="search-icon" />
                  <input
                    type="text"
                    value={waitlistSearch}
                    onChange={(e) => setWaitlistSearch(e.target.value)}
                    placeholder="Search name, email, or ORB reference..."
                    className="search-input"
                  />
                </div>

                <div className="filter-group">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Segments</option>
                    <option value="Bank">Bank</option>
                    <option value="Fintech or payments company">Fintech</option>
                    <option value="Business">Business</option>
                    <option value="Individual">Individual</option>
                  </select>

                  <select
                    value={selectedWaitlistStatus}
                    onChange={(e) => setSelectedWaitlistStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="contacted">Contacted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Candidate</th>
                      <th>Segment</th>
                      <th>Registered</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty-table-cell">
                          <Inbox size={26} style={{ opacity: 0.3, marginBottom: '0.45rem' }} />
                          <p>No waitlist submissions match your filters.</p>
                        </td>
                      </tr>
                    ) : (
                      submissions.map((sub) => (
                        <tr
                          key={sub.id}
                          onClick={() => {
                            setActiveSubmission(sub);
                            setSubmissionNotes(sub.notes || '');
                          }}
                        >
                          <td className="ref-cell">{sub.reference_id}</td>
                          <td>
                            <div className="candidate-name">{decodeStoredInput(sub.full_name)}</div>
                            <div className="candidate-email">{sub.email}</div>
                          </td>
                          <td>
                            <span className="role-tag">{sub.role}</span>
                          </td>
                          <td className="date-cell">
                            {new Date(sub.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <select
                              value={sub.status}
                              onChange={(e) =>
                                handleUpdateWaitlistStatus(sub.id, e.target.value as WaitlistStatus)
                              }
                              className={`status-select status-${sub.status}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="contacted">Contacted</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                          <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <div className="row-action-btns">
                              <button
                                onClick={() => {
                                  setActiveSubmission(sub);
                                  setSubmissionNotes(sub.notes || '');
                                }}
                                className="table-action-icon"
                                title="Inspect record"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteSubmission(sub.id, sub.reference_id)}
                                className="table-action-icon delete-icon"
                                title="Delete record"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: CONTACT INQUIRIES & MESSAGES                                  */}
        {/* ==================================================================== */}
        {activeTab === 'contacts' && (
          <div className="tab-view-container" key="contacts">
            <section className="metric-ledger" aria-label="Inquiry metrics">
              <div className="metric-cell">
                <div className="metric-head-row">
                  <span className="metric-label">Total inquiries</span>
                  <span className="metric-index">01</span>
                </div>
                <div className="metric-num-row">
                  <span className="metric-num">
                    {contactStats?.totalInquiries ?? contacts.length}
                  </span>
                  <span className="metric-delta is-positive">
                    +{contactStats?.last24hCount ?? 0} today
                  </span>
                </div>
              </div>

              <div className="metric-cell">
                <div className="metric-head-row">
                  <span className="metric-label">Unread</span>
                  <span className="metric-index">02</span>
                </div>
                <div className="metric-num-row">
                  <span className="metric-num">{contactStats?.byStatus?.new ?? 0}</span>
                  <span className="dot-indicator is-live" />
                </div>
              </div>

              <div className="metric-cell">
                <div className="metric-head-row">
                  <span className="metric-label">In progress</span>
                  <span className="metric-index">03</span>
                </div>
                <div className="metric-num-row">
                  <span className="metric-num">{contactStats?.byStatus?.in_progress ?? 0}</span>
                  <Clock size={15} className="metric-icon-muted" />
                </div>
              </div>

              <div className="metric-cell">
                <div className="metric-head-row">
                  <span className="metric-label">Responded</span>
                  <span className="metric-index">04</span>
                </div>
                <div className="metric-num-row">
                  <span className="metric-num">{contactStats?.byStatus?.responded ?? 0}</span>
                  <CheckCircle2 size={15} className="metric-icon-muted" />
                </div>
              </div>
            </section>

            <div className="panel-card">
              <div className="table-toolbar">
                <div className="search-box">
                  <Search size={14} className="search-icon" />
                  <input
                    type="text"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Search sender, company, subject, or message..."
                    className="search-input"
                  />
                </div>

                <div className="filter-group">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Topics</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Institutional Sandbox">Sandbox &amp; APIs</option>
                    <option value="Integration Support">Integration</option>
                    <option value="Compliance">Compliance</option>
                    <option value="General">General</option>
                  </select>

                  <select
                    value={selectedContactStatus}
                    onChange={(e) => setSelectedContactStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Statuses</option>
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="responded">Responded</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Sender</th>
                      <th>Topic</th>
                      <th>Subject &amp; Excerpt</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty-table-cell">
                          <Inbox size={26} style={{ opacity: 0.3, marginBottom: '0.45rem' }} />
                          <p>No contact inquiries match your filters.</p>
                        </td>
                      </tr>
                    ) : (
                      contacts.map((c) => (
                        <tr
                          key={c.id}
                          onClick={() => {
                            setActiveContact(c);
                            setContactNotes(c.notes || '');
                          }}
                        >
                          <td className="ref-cell">{c.reference_id}</td>
                          <td>
                            <div className="candidate-name">{decodeStoredInput(c.full_name)}</div>
                            <div className="candidate-email">{c.email}</div>
                            {c.company && (
                              <div className="company-tag">{decodeStoredInput(c.company)}</div>
                            )}
                          </td>
                          <td>
                            <span className="role-tag">{c.category}</span>
                          </td>
                          <td className="msg-preview-cell">
                            <div className="msg-subj truncate">{decodeStoredInput(c.subject)}</div>
                            <div className="msg-body truncate">{decodeStoredInput(c.message)}</div>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <select
                              value={c.status}
                              onChange={(e) =>
                                handleUpdateContactStatus(c.id, e.target.value as ContactStatus)
                              }
                              className={`status-select status-${c.status}`}
                            >
                              <option value="new">New</option>
                              <option value="in_progress">In Progress</option>
                              <option value="responded">Responded</option>
                              <option value="archived">Archived</option>
                            </select>
                          </td>
                          <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <div className="row-action-btns">
                              <a
                                href={`mailto:${c.email}?subject=Re: Orb Finance Inquiry [${c.reference_id}]&body=Dear ${encodeURIComponent(c.full_name)},\n\nThank you for reaching out to Orb Finance regarding ${encodeURIComponent(c.category)}.\n\nBest regards,\nOrb Relations Desk`}
                                className="table-action-icon reply-icon"
                                title="Reply via email"
                              >
                                <Send size={13} />
                              </a>
                              <button
                                onClick={() => {
                                  setActiveContact(c);
                                  setContactNotes(c.notes || '');
                                }}
                                className="table-action-icon"
                                title="Inspect inquiry"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteContact(c.id, c.reference_id)}
                                className="table-action-icon delete-icon"
                                title="Delete inquiry"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: EXECUTIVE TELEMETRY & SYSTEM HEALTH                           */}
        {/* ==================================================================== */}
        {activeTab === 'telemetry' && (
          <div className="tab-view-container" key="telemetry">
            <div className="panel-card schema-banner-card">
              <div>
                <div className="telemetry-meta-line">
                  <span>PostgreSQL + Supabase Auth</span>
                  <span className="ledger-sep">&middot;</span>
                  <span>Launch target: 15 April 2027</span>
                </div>
                <h2 className="schema-banner-title">Platform Data &amp; Security Schema</h2>
                <p className="schema-banner-desc">
                  Waitlist records, institutional inquiries, and hashed single-use admin OTP challenges are isolated under Row-Level Security.
                </p>
              </div>

              <button type="button" onClick={() => setShowSqlModal(true)} className="schema-btn">
                <Database size={14} />
                <span>Inspect SQL Schema</span>
              </button>
            </div>

            <div className="charts-grid">
              <div className="panel-card panel-pad">
                <div className="side-panel-head">
                  <h3 className="panel-title">Waitlist segment distribution</h3>
                  <span className="side-panel-count">{submissions.length}</span>
                </div>

                {(() => {
                  const rows = [
                    { label: 'Banks & financial institutions', count: waitlistStats?.byRole?.bank ?? 0, shade: '100' },
                    { label: 'Fintech & payments infrastructure', count: waitlistStats?.byRole?.fintech ?? 0, shade: '70' },
                    { label: 'Corporate businesses & treasury', count: waitlistStats?.byRole?.business ?? 0, shade: '45' },
                    { label: 'Individual early access', count: waitlistStats?.byRole?.individual ?? 0, shade: '28' },
                  ];
                  return (
                    <>
                      <div className="ratio-strip" aria-hidden="true">
                        {rows.map((row) => {
                          const pct = submissions.length
                            ? Math.round((row.count / submissions.length) * 100)
                            : 0;
                          if (pct <= 0) return null;
                          return (
                            <span
                              key={row.label}
                              className={`ratio-segment shade-${row.shade}`}
                              style={{ width: `${pct}%` }}
                            />
                          );
                        })}
                      </div>
                      <div className="bars-list">
                        {rows.map((row) => {
                          const pct = submissions.length
                            ? Math.min(100, Math.round((row.count / submissions.length) * 100))
                            : 0;
                          return (
                            <div className="bar-row" key={row.label}>
                              <div className="bar-header">
                                <span>{row.label}</span>
                                <span className="mono-count">
                                  {row.count} <span className="pct-muted">({pct}%)</span>
                                </span>
                              </div>
                              <div className="bar-track">
                                <div className={`bar-fill shade-${row.shade}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="panel-card panel-pad">
                <div className="side-panel-head">
                  <h3 className="panel-title">Inquiry topics distribution</h3>
                  <span className="side-panel-count">{contacts.length}</span>
                </div>

                {(() => {
                  const rows = [
                    { label: 'Institutional partnerships', count: contactStats?.byCategory?.partnership ?? 0, shade: '100' },
                    { label: 'Sandbox & developer APIs', count: contactStats?.byCategory?.sandbox ?? 0, shade: '70' },
                    { label: 'Integration support', count: contactStats?.byCategory?.integration ?? 0, shade: '45' },
                    { label: 'Compliance & NDPR review', count: contactStats?.byCategory?.compliance ?? 0, shade: '28' },
                  ];
                  return (
                    <>
                      <div className="ratio-strip" aria-hidden="true">
                        {rows.map((row) => {
                          const pct = contacts.length
                            ? Math.round((row.count / contacts.length) * 100)
                            : 0;
                          if (pct <= 0) return null;
                          return (
                            <span
                              key={row.label}
                              className={`ratio-segment shade-${row.shade}`}
                              style={{ width: `${pct}%` }}
                            />
                          );
                        })}
                      </div>
                      <div className="bars-list">
                        {rows.map((row) => {
                          const pct = contacts.length
                            ? Math.min(100, Math.round((row.count / contacts.length) * 100))
                            : 0;
                          return (
                            <div className="bar-row" key={row.label}>
                              <div className="bar-header">
                                <span>{row.label}</span>
                                <span className="mono-count">
                                  {row.count} <span className="pct-muted">({pct}%)</span>
                                </span>
                              </div>
                              <div className="bar-track">
                                <div className={`bar-fill shade-${row.shade}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
        </main>
      </div>

      {/* ==================================================================== */}
      {/* DRAWER 1: WAITLIST INSPECTOR                                         */}
      {/* ==================================================================== */}
      {activeSubmission && (
        <div className="drawer-backdrop" onClick={() => setActiveSubmission(null)}>
          <aside className="inspector-drawer" onClick={(e) => e.stopPropagation()} aria-label="Waitlist record inspector">
            <div className="drawer-top">
              <div>
                <span className="drawer-ref">{activeSubmission.reference_id}</span>
                <h3 className="drawer-title">{decodeStoredInput(activeSubmission.full_name)}</h3>
                <p className="drawer-sub">{activeSubmission.email}</p>
              </div>
              <button onClick={() => setActiveSubmission(null)} className="drawer-close-btn" aria-label="Close inspector">
                <X size={16} />
              </button>
            </div>

            <div className="drawer-kv-table">
              <div className="kv-row">
                <span className="kv-key">Segment</span>
                <span className="kv-val">{activeSubmission.role}</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Submitted</span>
                <span className="kv-val mono">
                  {new Date(activeSubmission.created_at).toLocaleString()}
                </span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Origin IP</span>
                <span className="kv-val mono">{activeSubmission.ip_address || '—'}</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Status</span>
                <span className={`status-pill status-${activeSubmission.status}`}>
                  {activeSubmission.status}
                </span>
              </div>
            </div>

            <div className="drawer-section">
              <label className="drawer-label">Workflow status</label>
              <div className="status-btn-group">
                {(['pending', 'approved', 'contacted', 'rejected'] as WaitlistStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateWaitlistStatus(activeSubmission.id, st)}
                    className={`status-toggle-btn ${activeSubmission.status === st ? 'active' : ''}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="drawer-section">
              <div className="section-label-row">
                <span className="drawer-label" style={{ marginBottom: 0 }}>Internal notes</span>
                <span className="hint-label">Private to admins</span>
              </div>
              <textarea
                rows={4}
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="Add corridor requirements, review notes, or follow-up details..."
                className="notes-textarea"
              />
              <button
                type="button"
                onClick={handleSaveSubNotes}
                disabled={isSavingSubNotes}
                className="save-notes-btn"
              >
                {isSavingSubNotes ? (
                  <>
                    <RefreshCw size={12} className="spin-icon" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    <span>Save notes</span>
                  </>
                )}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ==================================================================== */}
      {/* DRAWER 2: CONTACT INQUIRY INSPECTOR                                  */}
      {/* ==================================================================== */}
      {activeContact && (
        <div className="drawer-backdrop" onClick={() => setActiveContact(null)}>
          <aside className="inspector-drawer" onClick={(e) => e.stopPropagation()} aria-label="Contact inquiry inspector">
            <div className="drawer-top">
              <div>
                <span className="drawer-ref">{activeContact.reference_id}</span>
                <h3 className="drawer-title">{decodeStoredInput(activeContact.subject)}</h3>
                <p className="drawer-sub">
                  {decodeStoredInput(activeContact.full_name)}
                  {activeContact.company && ` · ${decodeStoredInput(activeContact.company)}`} · {activeContact.email}
                </p>
              </div>
              <button onClick={() => setActiveContact(null)} className="drawer-close-btn" aria-label="Close inspector">
                <X size={16} />
              </button>
            </div>

            <div className="drawer-kv-table">
              <div className="kv-row">
                <span className="kv-key">Topic</span>
                <span className="kv-val">{activeContact.category}</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Received</span>
                <span className="kv-val mono">
                  {new Date(activeContact.created_at).toLocaleString()}
                </span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Status</span>
                <span className={`status-pill status-${activeContact.status}`}>
                  {activeContact.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="drawer-section">
              <label className="drawer-label">Message</label>
              <div className="drawer-msg-body">
                {decodeStoredInput(activeContact.message)}
              </div>
            </div>

            <div className="drawer-actions-row">
              <a
                href={`mailto:${activeContact.email}?subject=Re: Orb Finance Inquiry [${activeContact.reference_id}] - ${encodeURIComponent(activeContact.subject)}&body=Dear ${encodeURIComponent(activeContact.full_name)},\n\nThank you for contacting Orb Finance.\n\nBest regards,\nOrb Relations Desk`}
                className="reply-email-btn"
              >
                <Send size={13} />
                <span>Reply by email</span>
              </a>

              <select
                value={activeContact.status}
                onChange={(e) =>
                  handleUpdateContactStatus(activeContact.id, e.target.value as ContactStatus)
                }
                className="modal-status-select"
              >
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="responded">Responded</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="drawer-section">
              <div className="section-label-row">
                <span className="drawer-label" style={{ marginBottom: 0 }}>Resolution memo</span>
                <span className="hint-label">Private note</span>
              </div>
              <textarea
                rows={3}
                value={contactNotes}
                onChange={(e) => setContactNotes(e.target.value)}
                placeholder="Log internal response, owner, or next step..."
                className="notes-textarea"
              />
              <button
                type="button"
                onClick={handleSaveContactNotes}
                disabled={isSavingContactNotes}
                className="save-notes-btn"
              >
                {isSavingContactNotes ? (
                  <>
                    <RefreshCw size={12} className="spin-icon" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    <span>Save memo</span>
                  </>
                )}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: SQL SCHEMA VIEWER                                           */}
      {/* ==================================================================== */}
      {showSqlModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowSqlModal(false)}>
          <div className="admin-modal-card sql-modal" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowSqlModal(false)} className="modal-close-btn">
              <X size={18} />
            </button>

            <div className="modal-header">
              <span className="modal-tag">SUPABASE POSTGRESQL ARCHITECTURE</span>
              <h3 className="modal-title">Database Schema & Security</h3>
              <p className="modal-sub">
                Run this SQL script in your Supabase Dashboard SQL Editor to provision the tables and RLS security policies.
              </p>
            </div>

            <div className="sql-code-box">
              <pre>{`-- 1. WAITLIST SUBMISSIONS & EMAIL UNIQUENESS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.waitlist_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  reference_id TEXT NOT NULL UNIQUE,
  status waitlist_status NOT NULL DEFAULT 'pending',
  notes TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_submissions_email_lower
ON public.waitlist_submissions (LOWER(email));

-- 2. CONTACT INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id TEXT NOT NULL UNIQUE,
  status contact_status NOT NULL DEFAULT 'new',
  notes TEXT
);

-- 3. IDEMPOTENT ROW LEVEL SECURITY POLICIES
ALTER TABLE public.waitlist_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert to waitlist" ON public.waitlist_submissions;
CREATE POLICY "Allow public insert to waitlist" ON public.waitlist_submissions
FOR INSERT TO anon, authenticated WITH CHECK (length(trim(full_name)) >= 2 AND length(trim(email)) >= 5);

DROP POLICY IF EXISTS "Allow service role full access to waitlist" ON public.waitlist_submissions;
CREATE POLICY "Allow service role full access to waitlist" ON public.waitlist_submissions
FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert to contact_inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow public insert to contact_inquiries" ON public.contact_inquiries
FOR INSERT TO anon, authenticated WITH CHECK (length(trim(full_name)) >= 2 AND length(trim(email)) >= 5);

DROP POLICY IF EXISTS "Allow service role full access to contact_inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow service role full access to contact_inquiries" ON public.contact_inquiries
FOR ALL TO service_role USING (true) WITH CHECK (true);`}</pre>
            </div>

            <div className="sql-modal-footer">
              <span className="file-hint">File: supabase_schema.sql</span>
              <button onClick={copySqlSchema} className="copy-sql-btn">
                {copiedSql ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedSql ? 'Copied' : 'Copy SQL Schema'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Dedicated Bright Curved & Classy Dashboard Stylesheet */}
      <style jsx>{`
        .dash-shell {
          min-height: 100vh;
          display: flex;
          background:
            radial-gradient(circle at 12% 0%, #ffffff 0%, #f3f5f9 48%, #eef1f6 100%);
          color: #0a0d14;
          font-family: var(--font-sans);
        }

        @keyframes viewReveal {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes drawerSlideIn {
          from {
            opacity: 0;
            transform: translateX(34px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes modalScaleIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes toastRise {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes livePulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45);
          }
          65% {
            box-shadow: 0 0 0 5px rgba(16, 185, 129, 0);
          }
        }

        .admin-toast {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 120;
          background: #0a0d14;
          border: 1px solid rgba(255, 255, 255, 0.14);
          padding: 0.78rem 1.3rem;
          border-radius: 9999px;
          box-shadow: 0 20px 44px rgba(15, 23, 42, 0.24);
          font-size: 0.8rem;
          font-weight: 600;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          animation: toastRise 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Floating Curved Left Sidebar Rail */
        .dash-sidebar {
          width: 262px;
          flex-shrink: 0;
          position: sticky;
          top: 0.9rem;
          height: calc(100vh - 1.8rem);
          margin: 0.9rem 0 0.9rem 0.9rem;
          background: #ffffff;
          border: 1px solid #e6e9f0;
          border-radius: 26px;
          box-shadow:
            0 2px 8px rgba(15, 23, 42, 0.03),
            0 16px 38px -20px rgba(15, 23, 42, 0.1);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1.05rem 1.2rem;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.15rem 0.5rem 1.35rem;
          border-bottom: 1px solid #f0f2f7;
          margin-bottom: 1.2rem;
        }

        :global(.sidebar-logo-link) {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          transition: opacity 0.18s ease;
        }

        :global(.sidebar-logo-link:hover) {
          opacity: 0.72;
        }

        .sidebar-logo {
          height: 18px;
          width: auto;
          display: block;
        }

        .sidebar-env-tag {
          font-family: var(--font-mono);
          font-size: 0.63rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #475569;
          padding: 0.22rem 0.62rem;
          border-radius: 9999px;
          background: #f3f5f9;
          border: 1px solid #e4e8f0;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.32rem;
          flex: 1;
        }

        .nav-section-label {
          font-family: var(--font-mono);
          font-size: 0.64rem;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #94a3b8;
          padding: 0.25rem 0.78rem 0.5rem;
        }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0.72rem 0.92rem;
          border-radius: 9999px;
          border: 1px solid transparent;
          background: transparent;
          color: #525d70;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition:
            background 0.22s cubic-bezier(0.16, 1, 0.3, 1),
            color 0.18s ease,
            box-shadow 0.22s ease,
            transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nav-item:hover {
          color: #0a0d14;
          background: #f3f5f9;
          transform: translateX(2px);
        }

        .nav-item.is-active {
          color: #ffffff;
          font-weight: 600;
          background: #0a0d14;
          border-color: #0a0d14;
          box-shadow: 0 8px 20px -8px rgba(10, 13, 20, 0.45);
          transform: translateX(0);
        }

        .nav-item-left {
          display: inline-flex;
          align-items: center;
          gap: 0.68rem;
        }

        .nav-badge {
          font-family: var(--font-mono);
          font-size: 0.69rem;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          color: #64748b;
          padding: 0.14rem 0.56rem;
          border-radius: 9999px;
          background: #f1f4f9;
          transition: background 0.18s ease, color 0.18s ease;
        }

        .nav-item.is-active .nav-badge {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.16);
        }

        .sidebar-bottom {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          padding-top: 1rem;
        }

        .infra-card {
          padding: 0.9rem 1rem;
          border-radius: 18px;
          background: #f8f9fc;
          border: 1px solid #eaedf4;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .infra-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.73rem;
        }

        .infra-key {
          color: #64748b;
        }

        .infra-val {
          display: inline-flex;
          align-items: center;
          gap: 0.42rem;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 600;
          color: #0a0d14;
        }

        .dot-indicator {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #94a3b8;
          flex-shrink: 0;
        }

        .dot-indicator.is-live {
          background: #10b981;
          animation: livePulse 2.4s ease-out infinite;
        }

        .operator-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.68rem 0.55rem 0.2rem;
          border-top: 1px solid #f0f2f7;
        }

        .operator-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          flex-shrink: 0;
          background: #0a0d14;
          color: #ffffff;
          font-family: var(--font-mono);
          font-size: 0.71rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .operator-meta {
          min-width: 0;
          flex: 1;
        }

        .operator-email {
          font-size: 0.76rem;
          font-weight: 600;
          color: #0a0d14;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .operator-role {
          font-size: 0.67rem;
          color: #64748b;
        }

        .operator-logout {
          background: none;
          border: 1px solid transparent;
          padding: 0.45rem;
          border-radius: 50%;
          color: #64748b;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: color 0.16s ease, background 0.16s ease, border-color 0.16s ease;
        }

        .operator-logout:hover {
          color: #be123c;
          background: #fff1f2;
          border-color: #fecdd3;
        }

        /* Fluid Bright Curved Workspace Canvas */
        .dash-workspace {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .workspace-topbar {
          height: 74px;
          margin: 0.9rem clamp(1rem, 2.2vw, 2rem) 0;
          padding: 0 1.45rem;
          border-radius: 22px;
          border: 1px solid #e6e9f0;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(16px);
          box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
          position: sticky;
          top: 0.9rem;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .topbar-left {
          display: flex;
          flex-direction: column;
          gap: 0.14rem;
        }

        .topbar-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-mono);
          font-size: 0.67rem;
          color: #64748b;
        }

        .crumb-sep {
          opacity: 0.55;
        }

        .topbar-title {
          margin: 0;
          font-size: 1.32rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #0a0d14;
        }

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }

        .toolbar-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          height: 37px;
          padding: 0 1.05rem;
          border-radius: 9999px;
          background: #ffffff;
          border: 1px solid #dce1ea;
          color: #1e293b;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
          transition:
            background 0.18s ease,
            border-color 0.18s ease,
            color 0.18s ease,
            transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .toolbar-btn:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          color: #0a0d14;
          transform: translateY(-1px);
        }

        .toolbar-btn:active {
          transform: translateY(0);
        }

        .toolbar-btn.is-synced {
          color: #065f46;
          border-color: #a7f3d0;
          background: #ecfdf5;
        }

        .toolbar-btn.csv-btn {
          background: #0a0d14;
          border-color: #0a0d14;
          color: #ffffff;
        }

        .toolbar-btn.csv-btn:hover {
          background: #1e293b;
          border-color: #1e293b;
          color: #ffffff;
        }

        .toolbar-btn.icon-btn {
          width: 37px;
          padding: 0;
          justify-content: center;
        }

        .mobile-only-btn {
          display: none;
        }

        .mobile-tab-bar {
          display: none;
          margin: 0.75rem 1rem 0;
          padding: 0.45rem;
          gap: 0.4rem;
          border-radius: 9999px;
          border: 1px solid #e4e7ee;
          background: #ffffff;
          overflow-x: auto;
        }

        .mobile-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.42rem;
          padding: 0.45rem 0.95rem;
          border-radius: 9999px;
          background: transparent;
          border: 1px solid transparent;
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.18s ease;
        }

        .mobile-tab-btn.is-active {
          color: #ffffff;
          background: #0a0d14;
          border-color: #0a0d14;
        }

        .mobile-tab-count {
          font-family: var(--font-mono);
          font-size: 0.69rem;
          opacity: 0.8;
        }

        .admin-main {
          max-width: 1480px;
          width: 100%;
          margin: 0 auto;
          padding: 1.45rem clamp(1rem, 2.2vw, 2rem) 4rem;
        }

        .view-subtitle {
          margin: 0 0 1.35rem 0.35rem;
          font-size: 0.88rem;
          color: #64748b;
          max-width: 720px;
        }

        .tab-view-container {
          display: flex;
          flex-direction: column;
          gap: 1.4rem;
          animation: viewReveal 0.34s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Sculpted Curved Metric Cards */
        .metric-ledger {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1.05rem;
          background: transparent;
          border: none;
        }

        .metric-ledger-5 {
          grid-template-columns: repeat(5, minmax(0, 1fr));
        }

        .metric-cell {
          position: relative;
          padding: 1.45rem 1.55rem;
          border-radius: 24px;
          background: #ffffff;
          border: 1px solid #e5e8f0;
          box-shadow:
            0 2px 6px rgba(15, 23, 42, 0.03),
            0 12px 28px -18px rgba(15, 23, 42, 0.08);
          transition:
            transform 0.24s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.24s cubic-bezier(0.16, 1, 0.3, 1),
            border-color 0.2s ease;
        }

        .metric-cell:hover {
          transform: translateY(-3px);
          border-color: #cbd5e1;
          box-shadow:
            0 6px 14px rgba(15, 23, 42, 0.05),
            0 18px 34px -18px rgba(15, 23, 42, 0.12);
        }

        .metric-head-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.85rem;
        }

        .metric-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #64748b;
          letter-spacing: -0.005em;
        }

        .metric-index {
          font-family: var(--font-mono);
          font-size: 0.64rem;
          font-weight: 600;
          color: #64748b;
          padding: 0.15rem 0.48rem;
          border-radius: 9999px;
          background: #f3f5f9;
        }

        .metric-num-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.65rem;
        }

        .metric-num {
          font-size: clamp(2rem, 2.5vw, 2.55rem);
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.045em;
          font-variant-numeric: tabular-nums;
          color: #0a0d14;
        }

        .metric-delta {
          font-family: var(--font-mono);
          font-size: 0.71rem;
          font-weight: 500;
          color: #64748b;
        }

        .metric-delta.is-positive {
          color: #059669;
          font-weight: 600;
        }

        :global(.metric-icon-muted) {
          color: #94a3b8;
        }

        /* Curved Bright Panels */
        .overview-command-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.95fr) minmax(305px, 1fr);
          gap: 1.4rem;
          align-items: start;
        }

        .panel-card {
          border-radius: 26px;
          background: #ffffff;
          border: 1px solid #e5e8f0;
          box-shadow:
            0 2px 8px rgba(15, 23, 42, 0.03),
            0 16px 36px -22px rgba(15, 23, 42, 0.09);
          overflow: hidden;
          transition: border-color 0.22s ease;
        }

        .panel-pad {
          padding: 1.5rem;
        }

        .panel-header {
          padding: 1.35rem 1.6rem;
          border-bottom: 1px solid #f0f2f7;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.85rem;
        }

        .panel-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          color: #0a0d14;
          letter-spacing: -0.02em;
        }

        .panel-meta {
          margin: 0.22rem 0 0;
          font-size: 0.77rem;
          color: #64748b;
        }

        .segmented-tabs {
          display: inline-flex;
          padding: 4px;
          border-radius: 9999px;
          background: #f2f4f8;
          border: 1px solid #e5e8f0;
        }

        .seg-tab {
          padding: 0.36rem 0.92rem;
          border-radius: 9999px;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition:
            color 0.18s ease,
            background 0.2s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.2s ease;
        }

        .seg-tab:hover {
          color: #0a0d14;
        }

        .seg-tab.is-active {
          background: #ffffff;
          color: #0a0d14;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.1);
        }

        .panel-search-bar {
          position: relative;
          padding: 0.85rem 1.6rem;
          border-bottom: 1px solid #f0f2f7;
          background: #fafbfd;
        }

        :global(.panel-search-icon) {
          position: absolute;
          left: 2.5rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .panel-search-input {
          width: 100%;
          padding: 0.6rem 1rem 0.6rem 2.4rem;
          border-radius: 9999px;
          background: #ffffff;
          border: 1px solid #dfe4ed;
          color: #0a0d14;
          font-size: 0.8rem;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .panel-search-input:focus {
          border-color: #0a0d14;
          box-shadow: 0 0 0 3px rgba(10, 13, 20, 0.06);
        }

        .ledger-list {
          max-height: 590px;
          overflow-y: auto;
          padding: 0.55rem;
        }

        .empty-panel-state {
          padding: 3.25rem 1.5rem;
          text-align: center;
          color: #64748b;
          font-size: 0.82rem;
        }

        .ledger-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.1rem;
          padding: 0.95rem 1.15rem;
          border-radius: 18px;
          border: 1px solid transparent;
          cursor: pointer;
          transition:
            background 0.18s cubic-bezier(0.16, 1, 0.3, 1),
            border-color 0.18s ease,
            transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ledger-row:hover {
          background: #f6f8fc;
          border-color: #e6eaf2;
          transform: translateX(3px);
        }

        .ledger-row-main {
          min-width: 0;
          flex: 1;
        }

        .ledger-row-top {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          margin-bottom: 0.26rem;
        }

        .event-type-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          background: #64748b;
        }

        .event-type-dot.contact_inquiry {
          background: #0a0d14;
        }

        .event-type-dot.status_update {
          background: #10b981;
        }

        .ledger-actor {
          font-size: 0.87rem;
          font-weight: 700;
          color: #0a0d14;
        }

        .ledger-action-text {
          font-size: 0.8rem;
          color: #64748b;
        }

        .ledger-row-sub {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ledger-email {
          color: #475569;
          font-weight: 500;
        }

        .ledger-sep {
          color: #cbd5e1;
        }

        .ledger-summary {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ledger-row-right {
          display: flex;
          align-items: center;
          gap: 0.78rem;
          flex-shrink: 0;
        }

        .ledger-ref {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 600;
          color: #475569;
        }

        .ledger-time {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: #94a3b8;
          min-width: 58px;
          text-align: right;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          padding: 0.24rem 0.72rem;
          border-radius: 9999px;
          font-family: var(--font-mono);
          font-size: 0.66rem;
          font-weight: 600;
          text-transform: capitalize;
          border: 1px solid #d8dde6;
          background: #f4f6f9;
          color: #334155;
        }

        .status-pill.status-approved,
        .status-pill.status-responded {
          background: #ecfdf5;
          border-color: #a7f3d0;
          color: #065f46;
        }

        .status-pill.status-rejected,
        .status-pill.status-archived {
          background: #fff1f2;
          border-color: #fecdd3;
          color: #9f1239;
        }

        /* Side Stack, Stacked Ratio Strip & Ink-to-Silver Progress */
        .overview-side-stack {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .side-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .side-panel-count {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          font-weight: 700;
          color: #0a0d14;
          padding: 0.2rem 0.65rem;
          border-radius: 9999px;
          background: #f3f5f9;
        }

        .ratio-strip {
          display: flex;
          width: 100%;
          height: 10px;
          gap: 3px;
          border-radius: 9999px;
          overflow: hidden;
          background: #eef1f6;
          margin-bottom: 1.2rem;
        }

        .ratio-segment {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ratio-segment.shade-100 { background: #0a0d14; }
        .ratio-segment.shade-70 { background: #334155; }
        .ratio-segment.shade-45 { background: #64748b; }
        .ratio-segment.shade-28 { background: #cbd5e1; }

        .bars-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .bar-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          font-weight: 500;
          color: #334155;
          margin-bottom: 0.4rem;
        }

        .mono-count {
          font-family: var(--font-mono);
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          color: #0a0d14;
        }

        .pct-muted {
          color: #94a3b8;
          font-weight: 500;
        }

        .bar-track {
          width: 100%;
          height: 7px;
          border-radius: 9999px;
          background: #eef1f6;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .bar-fill.shade-100 { background: #0a0d14; }
        .bar-fill.shade-70 { background: #334155; }
        .bar-fill.shade-45 { background: #64748b; }
        .bar-fill.shade-28 { background: #94a3b8; }

        .quick-actions-stack {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }

        .quick-nav-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0.82rem 1.15rem;
          border-radius: 9999px;
          background: #f6f8fc;
          border: 1px solid #e5e8f0;
          color: #0a0d14;
          font-size: 0.81rem;
          font-weight: 600;
          cursor: pointer;
          transition:
            background 0.18s ease,
            border-color 0.18s ease,
            transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .quick-nav-btn:hover {
          background: #edf1f7;
          border-color: #cbd5e1;
          transform: translateX(3px);
        }

        :global(.quick-arrow) {
          color: #64748b;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.18s ease;
        }

        .quick-nav-btn:hover :global(.quick-arrow) {
          color: #0a0d14;
          transform: translateX(3px);
        }

        /* Precision Tables (Waitlist & Contacts) */
        .table-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.85rem;
          padding: 1.05rem 1.6rem;
          border-bottom: 1px solid #f0f2f7;
          background: #fafbfd;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 240px;
          max-width: 460px;
        }

        :global(.search-icon) {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.58rem 1rem 0.58rem 2.45rem;
          border-radius: 9999px;
          background: #ffffff;
          border: 1px solid #dfe4ed;
          color: #0a0d14;
          font-size: 0.8rem;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .search-input:focus {
          border-color: #0a0d14;
          box-shadow: 0 0 0 3px rgba(10, 13, 20, 0.06);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }

        .filter-select {
          padding: 0.56rem 1.05rem;
          border-radius: 9999px;
          background: #ffffff;
          border: 1px solid #dfe4ed;
          color: #1e293b;
          font-size: 0.78rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          transition: border-color 0.18s ease;
        }

        .filter-select:hover,
        .filter-select:focus {
          border-color: #94a3b8;
        }

        .filter-select option {
          background: #ffffff;
          color: #0a0d14;
        }

        .table-scroll {
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.82rem;
        }

        .admin-table thead {
          background: #fafbfd;
          border-bottom: 1px solid #eaedf4;
        }

        .admin-table th {
          padding: 0.9rem 1.5rem;
          font-family: var(--font-mono);
          font-size: 0.69rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
        }

        .admin-table tbody tr {
          border-bottom: 1px solid #f2f4f8;
          cursor: pointer;
          transition: background 0.18s ease;
        }

        .admin-table tbody tr:last-child {
          border-bottom: none;
        }

        .admin-table tbody tr:hover {
          background: #f6f8fc;
        }

        .admin-table td {
          padding: 1.05rem 1.5rem;
          vertical-align: middle;
        }

        .ref-cell {
          font-family: var(--font-mono);
          font-size: 0.76rem;
          font-weight: 600;
          color: #334155;
          white-space: nowrap;
        }

        .candidate-name {
          font-weight: 600;
          color: #0a0d14;
        }

        .candidate-email {
          font-size: 0.74rem;
          color: #64748b;
          margin-top: 0.14rem;
        }

        .company-tag {
          font-size: 0.72rem;
          color: #475569;
          margin-top: 0.16rem;
        }

        .role-tag {
          display: inline-block;
          padding: 0.25rem 0.78rem;
          border-radius: 9999px;
          background: #f3f5f9;
          border: 1px solid #e4e8f0;
          color: #1e293b;
          font-size: 0.73rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .date-cell {
          font-size: 0.75rem;
          font-family: var(--font-mono);
          color: #64748b;
          white-space: nowrap;
        }

        .msg-preview-cell {
          max-width: 280px;
        }

        .msg-subj {
          font-weight: 600;
          color: #0a0d14;
        }

        .msg-body {
          font-size: 0.73rem;
          color: #64748b;
          margin-top: 0.14rem;
        }

        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .status-select {
          padding: 0.3rem 0.78rem;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-family: var(--font-mono);
          font-weight: 600;
          border: 1px solid #d8dde6;
          background: #f4f6f9;
          color: #0a0d14;
          cursor: pointer;
          outline: none;
        }

        .status-select option {
          background: #ffffff;
          color: #0a0d14;
        }

        .status-approved,
        .status-responded {
          background: #ecfdf5;
          border-color: #a7f3d0;
          color: #065f46;
        }

        .status-rejected,
        .status-archived {
          background: #fff1f2;
          border-color: #fecdd3;
          color: #9f1239;
        }

        .row-action-btns {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.35rem;
        }

        .table-action-icon {
          padding: 0.46rem;
          border-radius: 50%;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: color 0.16s ease, background 0.16s ease, transform 0.16s ease;
        }

        .table-action-icon:hover {
          color: #0a0d14;
          background: #edf1f7;
          transform: translateY(-1px);
        }

        .table-action-icon.delete-icon:hover {
          color: #be123c;
          background: #fff1f2;
        }

        .empty-table-cell {
          text-align: center;
          padding: 3.25rem 1rem;
          color: #64748b;
        }

        /* Telemetry Tab */
        .schema-banner-card {
          padding: 1.6rem 1.8rem;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1.15rem;
        }

        .telemetry-meta-line {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          font-family: var(--font-mono);
          font-size: 0.71rem;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 0.4rem;
        }

        .schema-banner-title {
          margin: 0;
          font-size: 1.18rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          color: #0a0d14;
        }

        .schema-banner-desc {
          margin: 0.35rem 0 0;
          font-size: 0.82rem;
          color: #64748b;
          max-width: 620px;
        }

        .schema-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.68rem 1.25rem;
          border-radius: 9999px;
          background: #0a0d14;
          border: none;
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.18s ease, transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .schema-btn:hover {
          background: #1e293b;
          transform: translateY(-1px);
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 1.4rem;
        }

        /* Floating Curved Slide-Over Inspector Sheet */
        .drawer-backdrop {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(10, 13, 20, 0.34);
          backdrop-filter: blur(5px);
          display: flex;
          justify-content: flex-end;
          animation: backdropFadeIn 0.2s ease forwards;
        }

        .inspector-drawer {
          width: calc(100% - 1.5rem);
          max-width: 500px;
          height: calc(100vh - 1.7rem);
          margin: 0.85rem;
          border-radius: 28px;
          background: #ffffff;
          border: 1px solid #e4e7ee;
          padding: 1.85rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.55rem;
          box-shadow: -16px 14px 60px rgba(15, 23, 42, 0.18);
          animation: drawerSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .drawer-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid #f0f2f7;
        }

        .drawer-ref {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 600;
          color: #475569;
          padding: 0.2rem 0.65rem;
          border-radius: 9999px;
          background: #f3f5f9;
          margin-bottom: 0.5rem;
        }

        .drawer-title {
          margin: 0;
          font-size: 1.3rem;
          font-weight: 700;
          color: #0a0d14;
          letter-spacing: -0.025em;
        }

        .drawer-sub {
          margin: 0.28rem 0 0;
          font-size: 0.8rem;
          color: #64748b;
        }

        .drawer-close-btn {
          background: #f3f5f9;
          border: 1px solid #e5e8f0;
          color: #475569;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          cursor: pointer;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: color 0.16s ease, background 0.16s ease;
        }

        .drawer-close-btn:hover {
          color: #0a0d14;
          background: #e2e7ef;
        }

        .drawer-kv-table {
          border-radius: 20px;
          background: #f8f9fc;
          border: 1px solid #eaedf4;
          overflow: hidden;
        }

        .kv-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.78rem 1.15rem;
          border-bottom: 1px solid #eef1f6;
          font-size: 0.8rem;
        }

        .kv-row:last-child {
          border-bottom: none;
        }

        .kv-key {
          color: #64748b;
        }

        .kv-val {
          color: #0a0d14;
          font-weight: 600;
        }

        .kv-val.mono {
          font-family: var(--font-mono);
          font-size: 0.74rem;
        }

        .drawer-section {
          display: flex;
          flex-direction: column;
        }

        .drawer-label {
          display: block;
          font-size: 0.77rem;
          font-weight: 700;
          color: #0a0d14;
          margin-bottom: 0.58rem;
        }

        .section-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.58rem;
        }

        .hint-label {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .drawer-msg-body {
          padding: 1.05rem 1.2rem;
          border-radius: 20px;
          background: #f8f9fc;
          border: 1px solid #eaedf4;
          font-size: 0.84rem;
          line-height: 1.62;
          color: #1e293b;
          white-space: pre-wrap;
        }

        .drawer-actions-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .status-btn-group {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.45rem;
        }

        .status-toggle-btn {
          padding: 0.54rem 0.35rem;
          border-radius: 9999px;
          border: 1px solid #dce1ea;
          background: #ffffff;
          color: #475569;
          font-size: 0.73rem;
          font-weight: 600;
          text-transform: capitalize;
          cursor: pointer;
          transition: all 0.16s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .status-toggle-btn:hover {
          color: #0a0d14;
          border-color: #94a3b8;
        }

        .status-toggle-btn.active {
          background: #0a0d14;
          border-color: #0a0d14;
          color: #ffffff;
          font-weight: 700;
        }

        .notes-textarea {
          width: 100%;
          padding: 0.9rem 1.05rem;
          border-radius: 18px;
          background: #f8f9fc;
          border: 1px solid #dce1ea;
          color: #0a0d14;
          font-size: 0.82rem;
          font-family: var(--font-sans);
          outline: none;
          resize: vertical;
          box-sizing: border-box;
          transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
        }

        .notes-textarea:focus {
          background: #ffffff;
          border-color: #0a0d14;
          box-shadow: 0 0 0 3px rgba(10, 13, 20, 0.06);
        }

        .save-notes-btn {
          margin-top: 0.75rem;
          align-self: flex-start;
          padding: 0.62rem 1.25rem;
          border-radius: 9999px;
          background: #0a0d14;
          border: none;
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          transition: background 0.16s ease, transform 0.16s ease;
        }

        .save-notes-btn:hover {
          background: #1e293b;
          transform: translateY(-1px);
        }

        .reply-email-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.48rem;
          padding: 0.64rem 1.1rem;
          border-radius: 9999px;
          background: #0a0d14;
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.16s ease, transform 0.16s ease;
        }

        .reply-email-btn:hover {
          background: #1e293b;
          transform: translateY(-1px);
        }

        .modal-status-select {
          padding: 0.64rem 1rem;
          border-radius: 9999px;
          background: #f8f9fc;
          border: 1px solid #dce1ea;
          color: #0a0d14;
          font-size: 0.78rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }

        /* Curved SQL Modal */
        .admin-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(10, 13, 20, 0.42);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: backdropFadeIn 0.2s ease forwards;
        }

        .admin-modal-card.sql-modal {
          position: relative;
          width: 100%;
          max-width: 710px;
          border-radius: 28px;
          background: #ffffff;
          border: 1px solid #e4e7ee;
          box-shadow: 0 32px 84px rgba(15, 23, 42, 0.22);
          padding: 1.9rem;
          max-height: 88vh;
          overflow-y: auto;
          animation: modalScaleIn 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .modal-close-btn {
          position: absolute;
          top: 1.35rem;
          right: 1.35rem;
          background: #f3f5f9;
          border: 1px solid #e5e8f0;
          color: #475569;
          cursor: pointer;
          padding: 0.45rem;
          border-radius: 50%;
          transition: color 0.16s ease, background 0.16s ease;
        }

        .modal-close-btn:hover {
          color: #0a0d14;
          background: #e2e7ef;
        }

        .modal-tag {
          display: block;
          font-family: var(--font-mono);
          font-size: 0.68rem;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 0.32rem;
        }

        .modal-title {
          margin: 0;
          font-size: 1.24rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          color: #0a0d14;
        }

        .modal-sub {
          margin: 0.32rem 0 0;
          font-size: 0.8rem;
          color: #64748b;
        }

        .sql-code-box {
          border-radius: 20px;
          background: #0b0f17;
          border: 1px solid #1e293b;
          padding: 1.25rem;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: #e2e8f0;
          max-height: 340px;
          overflow: auto;
          margin: 1.25rem 0;
        }

        .sql-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .file-hint {
          font-size: 0.73rem;
          font-family: var(--font-mono);
          color: #64748b;
        }

        .copy-sql-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.42rem;
          padding: 0.62rem 1.25rem;
          border-radius: 9999px;
          background: #0a0d14;
          border: none;
          color: #ffffff;
          font-size: 0.77rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.16s ease, transform 0.16s ease;
        }

        .copy-sql-btn:hover {
          background: #1e293b;
          transform: translateY(-1px);
        }

        :global(.spin-icon) {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1120px) {
          .overview-command-grid {
            grid-template-columns: 1fr;
          }

          .metric-ledger,
          .metric-ledger-5 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .dash-sidebar {
            display: none;
          }

          .mobile-only-btn {
            display: inline-flex;
          }

          .mobile-tab-bar {
            display: flex;
          }

          .workspace-topbar {
            margin: 0.75rem 1rem 0;
            padding: 0 1.1rem;
            border-radius: 18px;
          }

          .admin-main {
            padding: 1.2rem 1rem 3rem;
          }
        }

        @media (max-width: 640px) {
          .metric-ledger,
          .metric-ledger-5 {
            grid-template-columns: 1fr;
          }

          .csv-btn {
            display: none;
          }

          .ledger-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .ledger-row-right {
            width: 100%;
            justify-content: space-between;
          }

          .status-btn-group {
            grid-template-columns: repeat(2, 1fr);
          }

          .inspector-drawer {
            width: 100%;
            max-width: 100%;
            margin: 0;
            height: 100vh;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
}

function UsersIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
