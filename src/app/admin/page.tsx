'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield,
  Lock,
  Search,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  MessageSquare,
  XCircle,
  Building2,
  CreditCard,
  Briefcase,
  User,
  ArrowRight,
  LogOut,
  ExternalLink,
  Database,
  Trash2,
  Edit3,
  X,
  Check,
  AlertCircle,
  Mail,
  Send,
  Terminal,
  Scale,
  Sparkles,
  Inbox,
  Filter,
  Copy,
  ChevronDown,
  Layers,
  Activity,
  Calendar,
  Globe,
  Eye,
  FileText,
} from 'lucide-react';
import {
  WaitlistSubmission,
  WaitlistStats,
  WaitlistStatus,
  WaitlistRole,
  ContactInquiry,
  ContactStats,
  ContactStatus,
  ContactCategory,
} from '@/lib/supabase/types';

type DashboardTab = 'waitlist' | 'contacts' | 'telemetry';

export default function AdminDashboardPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);


  // Active Tab
  const [activeTab, setActiveTab] = useState<DashboardTab>('waitlist');

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

  // 1. Initial Authentication Check
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && data.authenticated) {
            setIsAuthenticated(true);
          }
        }
      } catch {
        // Silently stay on login screen
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);


  // 2. Fetch All Data (Waitlist + Contacts + Stats)
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Build waitlist query params
      const waitlistParams = new URLSearchParams();
      if (selectedRole !== 'all') waitlistParams.append('role', selectedRole);
      if (selectedWaitlistStatus !== 'all') waitlistParams.append('status', selectedWaitlistStatus);
      if (waitlistSearch.trim()) waitlistParams.append('search', waitlistSearch.trim());

      // Build contacts query params
      const contactParams = new URLSearchParams();
      if (selectedCategory !== 'all') contactParams.append('category', selectedCategory);
      if (selectedContactStatus !== 'all') contactParams.append('status', selectedContactStatus);
      if (contactSearch.trim()) contactParams.append('search', contactSearch.trim());

      const [subRes, subStatsRes, conRes, conStatsRes] = await Promise.all([
        fetch(`/api/admin/submissions?${waitlistParams.toString()}`),
        fetch('/api/admin/stats'),
        fetch(`/api/admin/contacts?${contactParams.toString()}`),
        fetch('/api/admin/contacts/stats'),
      ]);

      if (
        subRes.status === 401 ||
        subStatsRes.status === 401 ||
        conRes.status === 401 ||
        conStatsRes.status === 401
      ) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const subData = await subRes.json();
      const subStatsData = await subStatsRes.json();
      const conData = await conRes.json();
      const conStatsData = await conStatsRes.json();

      if (subData.success) setSubmissions(subData.data);
      if (subStatsData.success) setWaitlistStats(subStatsData.data);
      if (conData.success) setContacts(conData.data);
      if (conStatsData.success) setContactStats(conStatsData.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      showToast('Network error while refreshing data.');
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedRole,
    selectedWaitlistStatus,
    waitlistSearch,
    selectedCategory,
    selectedContactStatus,
    contactSearch,
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setIsLoggingIn(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication rejected.');
      }

      setIsAuthenticated(true);
      setPasscode('');
      showToast('Authenticated as Orb Administrator.');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
      showToast('Admin session terminated.');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // ----------------------------------------------------------------------------
  // Waitlist Actions
  // ----------------------------------------------------------------------------
  const handleUpdateWaitlistStatus = async (id: string, newStatus: WaitlistStatus) => {
    try {
      // Optimistic update
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
      // Refresh stats
      fetch('/api/admin/stats')
        .then((r) => r.json())
        .then((d) => d.success && setWaitlistStats(d.data));
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      showToast('Error deleting candidate.');
    }
  };

  // ----------------------------------------------------------------------------
  // Contact Inquiries Actions
  // ----------------------------------------------------------------------------
  const handleUpdateContactStatus = async (id: string, newStatus: ContactStatus) => {
    try {
      // Optimistic update
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
      // Refresh contact stats
      fetch('/api/admin/contacts/stats')
        .then((r) => r.json())
        .then((d) => d.success && setContactStats(d.data));
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      showToast('Error deleting inquiry.');
    }
  };

  // CSV Export Handlers
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
    const sql = `-- Supabase SQL Schema for Orb Finance
-- Run in Supabase SQL Editor:
-- Table: waitlist_submissions & contact_inquiries
-- Check supabase_schema.sql in project root for full scripts.`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    showToast('SQL Schema snippet copied.');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // ============================================================================
  // Unauthenticated: Master Passcode Login Screen
  // ============================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Ambient Halo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-amber-500/10 via-violet-600/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 shadow-2xl mb-4 backdrop-blur-xl">
              <Shield className="w-7 h-7 text-amber-400" strokeWidth={1.75} />
            </div>
            <h1 className="text-2xl font-medium tracking-tight text-white">
              Orb Finance <span className="font-mono text-sm text-gold">Vault</span>
            </h1>
            <p className="text-xs text-white/50 mt-1.5 font-mono tracking-wider uppercase">
              Administrative Control Terminal • 15 Jan 2027
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            {authError && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
                <AlertCircle size={15} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2">
                  Security Passcode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                    <Lock size={15} />
                  </div>
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter admin passcode"
                    autoFocus
                    required
                    className="w-full pl-10 pr-20 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-white/40 hover:text-white/80 transition-colors"
                  >
                    {showPasscode ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-medium text-xs tracking-wide hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Verifying Cryptographic Session...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Terminal</span>
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/5 text-center">
              <p className="text-[11px] text-white/40 leading-relaxed">
                Authorized administrative personnel only. System access is audited and logged in accordance with NDPR & institutional standards.
              </p>
              <div className="mt-3 inline-block px-2.5 py-1 rounded bg-white/[0.02] border border-white/5 text-[10px] font-mono text-white/40">
                Default Key: <span className="text-amber-400/80">orb-admin-2027</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // ============================================================================
  // Authenticated Executive Admin Dashboard
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#08080c] text-white font-sans selection:bg-amber-400/30">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-black/90 border border-amber-400/30 backdrop-blur-xl px-4 py-3 rounded-xl shadow-2xl text-xs flex items-center gap-2.5 text-white animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#08080c]/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand + Status Chip */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400/20 to-white/10 border border-white/10 flex items-center justify-center">
                <Shield size={16} className="text-amber-400" />
              </div>
              <span className="font-semibold tracking-tight text-sm sm:text-base">
                ORB <span className="font-light text-white/60">Executive</span>
              </span>
            </div>

            {/* Supabase Connection Chip */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-white/70">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>
                {waitlistStats?.isLiveSupabase ? 'Supabase PostgreSQL (Live)' : 'Local Fallback Store'}
              </span>
            </div>
          </div>

          {/* Navigation Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <button
              onClick={() => setActiveTab('waitlist')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'waitlist'
                  ? 'bg-white text-black shadow-sm font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <UsersIcon size={14} />
              <span>Waitlist</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'waitlist' ? 'bg-black/15 text-black' : 'bg-white/10 text-white/70'
                }`}
              >
                {submissions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'contacts'
                  ? 'bg-white text-black shadow-sm font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Mail size={14} />
              <span>Contacts</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'contacts' ? 'bg-black/15 text-black' : 'bg-white/10 text-white/70'
                }`}
              >
                {contacts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('telemetry')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'telemetry'
                  ? 'bg-white text-black shadow-sm font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Activity size={14} />
              <span>Telemetry</span>
            </button>
          </div>

          {/* Header Action Cluster */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              title="Download CSV report"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-white/80 hover:text-white transition-all"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => fetchData()}
              disabled={isLoading}
              title="Refresh current feed"
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/70 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 hover:border-rose-500/30 border border-white/[0.08] text-white/70 hover:text-rose-400 transition-all"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ====================================================================== */}
        {/* TAB 1: WAITLIST SUBMISSIONS                                            */}
        {/* ====================================================================== */}
        {activeTab === 'waitlist' && (
          <div className="space-y-6">
            {/* Waitlist KPI Tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider block mb-1">
                  Total Waitlist
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-semibold tracking-tight text-white">
                    {waitlistStats?.totalSubmissions ?? submissions.length}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    +{waitlistStats?.last24hCount ?? 0} today
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider block mb-1">
                  Banks & Institutions
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-semibold tracking-tight text-amber-400">
                    {waitlistStats?.byRole?.bank ?? 0}
                  </span>
                  <Building2 size={16} className="text-amber-400/40" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider block mb-1">
                  Fintech & Payments
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-semibold tracking-tight text-violet-400">
                    {waitlistStats?.byRole?.fintech ?? 0}
                  </span>
                  <CreditCard size={16} className="text-violet-400/40" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider block mb-1">
                  Corporate Businesses
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-semibold tracking-tight text-blue-400">
                    {waitlistStats?.byRole?.business ?? 0}
                  </span>
                  <Briefcase size={16} className="text-blue-400/40" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md col-span-2 lg:col-span-1">
                <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider block mb-1">
                  Individual Early Access
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-semibold tracking-tight text-white/80">
                    {waitlistStats?.byRole?.individual ?? 0}
                  </span>
                  <User size={16} className="text-white/30" />
                </div>
              </div>
            </div>

            {/* Waitlist Filters & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={waitlistSearch}
                  onChange={(e) => setWaitlistSearch(e.target.value)}
                  placeholder="Search by name, email, or reference code..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400/60 transition-all font-mono"
                />
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0">
                {/* Role Filter */}
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/60"
                >
                  <option value="all" className="bg-[#101018] text-white">All Roles</option>
                  <option value="Bank" className="bg-[#101018] text-white">Bank</option>
                  <option value="Fintech or payments company" className="bg-[#101018] text-white">Fintech</option>
                  <option value="Business" className="bg-[#101018] text-white">Business</option>
                  <option value="Individual" className="bg-[#101018] text-white">Individual</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedWaitlistStatus}
                  onChange={(e) => setSelectedWaitlistStatus(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/60"
                >
                  <option value="all" className="bg-[#101018] text-white">All Statuses</option>
                  <option value="pending" className="bg-[#101018] text-white">Pending</option>
                  <option value="approved" className="bg-[#101018] text-white">Approved</option>
                  <option value="contacted" className="bg-[#101018] text-white">Contacted</option>
                  <option value="rejected" className="bg-[#101018] text-white">Rejected</option>
                </select>
              </div>
            </div>

            {/* Waitlist Table */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] text-white/50 border-b border-white/[0.06] font-mono uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Ref ID</th>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Registration</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {submissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-white/40">
                          <Inbox size={32} className="mx-auto mb-2 opacity-40" />
                          <p>No waitlist submissions match your search parameters.</p>
                        </td>
                      </tr>
                    ) : (
                      submissions.map((sub) => {
                        const statusColors: Record<WaitlistStatus, string> = {
                          pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                          approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                          contacted: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                          rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                        };

                        return (
                          <tr
                            key={sub.id}
                            className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                            onClick={() => {
                              setActiveSubmission(sub);
                              setSubmissionNotes(sub.notes || '');
                            }}
                          >
                            <td className="py-3.5 px-4 font-mono font-semibold text-amber-400/90 whitespace-nowrap">
                              {sub.reference_id}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-medium text-white group-hover:text-amber-300 transition-colors">
                                {sub.full_name}
                              </div>
                              <div className="text-[11px] text-white/40 font-mono">
                                {sub.email}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] bg-white/[0.05] border border-white/10 text-white/80">
                                {sub.role === 'Bank' && <Building2 size={11} className="text-amber-400" />}
                                {sub.role === 'Fintech or payments company' && <CreditCard size={11} className="text-violet-400" />}
                                {sub.role === 'Business' && <Briefcase size={11} className="text-blue-400" />}
                                {sub.role === 'Individual' && <User size={11} className="text-white/40" />}
                                <span>{sub.role}</span>
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-white/50 text-[11px] font-mono whitespace-nowrap">
                              {new Date(sub.created_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={sub.status}
                                onChange={(e) =>
                                  handleUpdateWaitlistStatus(sub.id, e.target.value as WaitlistStatus)
                                }
                                className={`px-2.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider border font-medium focus:outline-none transition-all cursor-pointer ${
                                  statusColors[sub.status]
                                }`}
                              >
                                <option value="pending" className="bg-[#101018] text-amber-400">PENDING</option>
                                <option value="approved" className="bg-[#101018] text-emerald-400">APPROVED</option>
                                <option value="contacted" className="bg-[#101018] text-blue-400">CONTACTED</option>
                                <option value="rejected" className="bg-[#101018] text-rose-400">REJECTED</option>
                              </select>
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setActiveSubmission(sub);
                                    setSubmissionNotes(sub.notes || '');
                                  }}
                                  title="Inspect Dossier"
                                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubmission(sub.id, sub.reference_id)}
                                  title="Delete Entry"
                                  className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 2: CONTACT INQUIRIES & MESSAGES                                    */}
        {/* ====================================================================== */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            {/* Contact KPI Tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider block mb-1">
                  Total Inquiries
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-semibold tracking-tight text-white">
                    {contactStats?.totalInquiries ?? contacts.length}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    +{contactStats?.last24hCount ?? 0} today
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider block mb-1">
                  New / Unread
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-semibold tracking-tight text-amber-400">
                    {contactStats?.byStatus?.new ?? 0}
                  </span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider block mb-1">
                  In Progress
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-semibold tracking-tight text-blue-400">
                    {contactStats?.byStatus?.in_progress ?? 0}
                  </span>
                  <Clock size={16} className="text-blue-400/40" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider block mb-1">
                  Responded
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-semibold tracking-tight text-emerald-400">
                    {contactStats?.byStatus?.responded ?? 0}
                  </span>
                  <CheckCircle2 size={16} className="text-emerald-400/40" />
                </div>
              </div>
            </div>

            {/* Contacts Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search sender, company, subject, or message..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400/60 transition-all font-mono"
                />
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/60"
                >
                  <option value="all" className="bg-[#101018] text-white">All Topics</option>
                  <option value="Partnership" className="bg-[#101018] text-white">Partnership</option>
                  <option value="Institutional Sandbox" className="bg-[#101018] text-white">Sandbox & APIs</option>
                  <option value="Integration Support" className="bg-[#101018] text-white">Integration</option>
                  <option value="Compliance" className="bg-[#101018] text-white">Compliance</option>
                  <option value="General" className="bg-[#101018] text-white">General</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedContactStatus}
                  onChange={(e) => setSelectedContactStatus(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/60"
                >
                  <option value="all" className="bg-[#101018] text-white">All Statuses</option>
                  <option value="new" className="bg-[#101018] text-white">New</option>
                  <option value="in_progress" className="bg-[#101018] text-white">In Progress</option>
                  <option value="responded" className="bg-[#101018] text-white">Responded</option>
                  <option value="archived" className="bg-[#101018] text-white">Archived</option>
                </select>
              </div>
            </div>

            {/* Contacts Table */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] text-white/50 border-b border-white/[0.06] font-mono uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Ref Code</th>
                      <th className="py-3 px-4">Contact & Org</th>
                      <th className="py-3 px-4">Topic</th>
                      <th className="py-3 px-4">Message Snippet</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {contacts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-white/40">
                          <Inbox size={32} className="mx-auto mb-2 opacity-40" />
                          <p>No contact inquiries found matching criteria.</p>
                        </td>
                      </tr>
                    ) : (
                      contacts.map((c) => {
                        const statusColors: Record<ContactStatus, string> = {
                          new: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                          in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                          responded: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                          archived: 'bg-white/10 text-white/60 border-white/20',
                        };

                        return (
                          <tr
                            key={c.id}
                            className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                            onClick={() => {
                              setActiveContact(c);
                              setContactNotes(c.notes || '');
                            }}
                          >
                            <td className="py-3.5 px-4 font-mono font-semibold text-amber-400/90 whitespace-nowrap">
                              {c.reference_id}
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-medium text-white group-hover:text-amber-300 transition-colors">
                                {c.full_name}
                              </div>
                              <div className="text-[11px] text-white/40 font-mono">
                                {c.email}
                              </div>
                              {c.company && (
                                <div className="text-[10px] text-white/60 font-mono mt-0.5">
                                  🏢 {c.company}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] bg-white/[0.05] border border-white/10 text-white/80">
                                <span>{c.category}</span>
                              </span>
                            </td>

                            <td className="py-3.5 px-4 max-w-xs">
                              <p className="font-medium text-white/90 truncate">{c.subject}</p>
                              <p className="text-[11px] text-white/50 truncate font-light mt-0.5">
                                {c.message}
                              </p>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={c.status}
                                onChange={(e) =>
                                  handleUpdateContactStatus(c.id, e.target.value as ContactStatus)
                                }
                                className={`px-2.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider border font-medium focus:outline-none transition-all cursor-pointer ${
                                  statusColors[c.status]
                                }`}
                              >
                                <option value="new" className="bg-[#101018] text-amber-400">NEW</option>
                                <option value="in_progress" className="bg-[#101018] text-blue-400">IN PROGRESS</option>
                                <option value="responded" className="bg-[#101018] text-emerald-400">RESPONDED</option>
                                <option value="archived" className="bg-[#101018] text-white/60">ARCHIVED</option>
                              </select>
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <a
                                  href={`mailto:${c.email}?subject=Re: Orb Finance Inquiry [${c.reference_id}]&body=Dear ${encodeURIComponent(c.full_name)},\n\nThank you for reaching out to Orb Finance regarding ${encodeURIComponent(c.category)}.\n\nBest regards,\nOrb Relations Desk`}
                                  title="Reply via Email"
                                  className="p-1.5 rounded-lg text-white/50 hover:text-amber-400 hover:bg-white/10 transition-colors"
                                >
                                  <Send size={14} />
                                </a>
                                <button
                                  onClick={() => {
                                    setActiveContact(c);
                                    setContactNotes(c.notes || '');
                                  }}
                                  title="Read Full Inquiry"
                                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteContact(c.id, c.reference_id)}
                                  title="Delete Inquiry"
                                  className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 3: EXECUTIVE TELEMETRY & SYSTEM HEALTH                             */}
        {/* ====================================================================== */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            {/* System Readiness Banner */}
            <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-white/[0.02] to-transparent p-6 backdrop-blur-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-gold/20 text-gold border border-gold/40">
                      SYSTEM READINESS
                    </span>
                    <span className="text-xs text-white/50 font-mono">
                      OPENING 15 JANUARY 2027
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-white">
                    Platform Ingestion & Inquiries Pipeline
                  </h3>
                  <p className="text-xs text-white/60 mt-1 max-w-xl leading-relaxed">
                    All waitlist candidates and institutional contact transmissions are securely isolated and encrypted.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowSqlModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-white flex items-center gap-2 transition-all"
                  >
                    <Database size={14} className="text-amber-400" />
                    <span>View Supabase SQL Schema</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Telemetry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Waitlist Distribution Card */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Layers size={16} className="text-amber-400" />
                  <span>Waitlist Role Composition</span>
                </h4>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <div className="flex justify-between text-white/70 mb-1">
                      <span>Banks & Financial Institutions</span>
                      <span className="font-mono">{waitlistStats?.byRole?.bank ?? 0}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            submissions.length
                              ? Math.min(
                                  100,
                                  Math.round(((waitlistStats?.byRole?.bank ?? 0) / submissions.length) * 100)
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-white/70 mb-1">
                      <span>Fintech & Payments Infrastructure</span>
                      <span className="font-mono">{waitlistStats?.byRole?.fintech ?? 0}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-violet-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            submissions.length
                              ? Math.min(
                                  100,
                                  Math.round(
                                    ((waitlistStats?.byRole?.fintech ?? 0) / submissions.length) * 100
                                  )
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-white/70 mb-1">
                      <span>Corporate Businesses & Treasury</span>
                      <span className="font-mono">{waitlistStats?.byRole?.business ?? 0}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            submissions.length
                              ? Math.min(
                                  100,
                                  Math.round(
                                    ((waitlistStats?.byRole?.business ?? 0) / submissions.length) * 100
                                  )
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-white/70 mb-1">
                      <span>Individual Early Access</span>
                      <span className="font-mono">{waitlistStats?.byRole?.individual ?? 0}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-white/60 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            submissions.length
                              ? Math.min(
                                  100,
                                  Math.round(
                                    ((waitlistStats?.byRole?.individual ?? 0) / submissions.length) * 100
                                  )
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Inquiry Topics Breakdown */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Mail size={16} className="text-violet-400" />
                  <span>Inquiry Topics Breakdown</span>
                </h4>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <div className="flex justify-between text-white/70 mb-1">
                      <span>Institutional Partnerships</span>
                      <span className="font-mono">{contactStats?.byCategory?.partnership ?? 0}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{
                          width: `${
                            contacts.length
                              ? Math.min(
                                  100,
                                  Math.round(
                                    ((contactStats?.byCategory?.partnership ?? 0) / contacts.length) * 100
                                  )
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-white/70 mb-1">
                      <span>Sandbox & Developer APIs</span>
                      <span className="font-mono">{contactStats?.byCategory?.sandbox ?? 0}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{
                          width: `${
                            contacts.length
                              ? Math.min(
                                  100,
                                  Math.round(
                                    ((contactStats?.byCategory?.sandbox ?? 0) / contacts.length) * 100
                                  )
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-white/70 mb-1">
                      <span>Integration Support</span>
                      <span className="font-mono">{contactStats?.byCategory?.integration ?? 0}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{
                          width: `${
                            contacts.length
                              ? Math.min(
                                  100,
                                  Math.round(
                                    ((contactStats?.byCategory?.integration ?? 0) / contacts.length) * 100
                                  )
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-white/70 mb-1">
                      <span>Compliance & NDPR Review</span>
                      <span className="font-mono">{contactStats?.byCategory?.compliance ?? 0}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-rose-400 rounded-full"
                        style={{
                          width: `${
                            contacts.length
                              ? Math.min(
                                  100,
                                  Math.round(
                                    ((contactStats?.byCategory?.compliance ?? 0) / contacts.length) * 100
                                  )
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ====================================================================== */}
      {/* MODAL 1: WAITLIST APPLICANT INSPECTION DOSSIER                         */}
      {/* ====================================================================== */}
      {activeSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setActiveSubmission(null)}
          />

          <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0d0d12]/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl z-10 text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveSubmission(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gold block mb-1">
                WAITLIST DOSSIER
              </span>
              <h3 className="text-xl font-semibold tracking-tight text-white">
                {activeSubmission.full_name}
              </h3>
              <p className="text-xs font-mono text-white/50 mt-0.5">
                {activeSubmission.email}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/5 text-xs font-mono">
              <div>
                <span className="text-white/40 block text-[10px]">REFERENCE ID</span>
                <span className="text-amber-400 font-semibold">{activeSubmission.reference_id}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px]">ROLE</span>
                <span className="text-white">{activeSubmission.role}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px]">REGISTERED AT</span>
                <span className="text-white/80">
                  {new Date(activeSubmission.created_at).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px]">CURRENT STATUS</span>
                <span className="uppercase text-amber-300">{activeSubmission.status}</span>
              </div>
            </div>

            {/* Quick Status Buttons */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-white/60 mb-2">
                Transition Status
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                {(['pending', 'approved', 'contacted', 'rejected'] as WaitlistStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateWaitlistStatus(activeSubmission.id, st)}
                    className={`py-2 rounded-lg text-center font-medium uppercase border transition-all ${
                      activeSubmission.status === st
                        ? 'bg-amber-400 text-black border-amber-400 font-semibold'
                        : 'bg-white/[0.03] border-white/10 text-white/70 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Notes Editor */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-white/60 mb-2 flex items-center justify-between">
                <span>Internal Dossier Notes</span>
                <span className="text-[10px] text-white/40">Only visible to administrators</span>
              </label>
              <textarea
                rows={4}
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="Add meeting outcomes, corridor requirements, SLA notes..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-amber-400/60 transition-all font-mono resize-none"
              />
              <button
                onClick={handleSaveSubNotes}
                disabled={isSavingSubNotes}
                className="mt-2.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSavingSubNotes ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    <span>Save Notes</span>
                  </>
                )}
              </button>
            </div>

            {/* Technical Metadata */}
            <div className="pt-4 border-t border-white/5 text-[11px] font-mono text-white/40 space-y-1">
              <div>IP Address: {activeSubmission.ip_address || 'Not recorded'}</div>
              <div className="truncate">Client: {activeSubmission.user_agent || 'Standard client'}</div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODAL 2: CONTACT INQUIRY DETAIL & REPLY VIEWER                         */}
      {/* ====================================================================== */}
      {activeContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setActiveContact(null)}
          />

          <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0d0d12]/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl z-10 text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveContact(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold">
                  INQUIRY MESSAGE • {activeContact.reference_id}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white/80">
                  {activeContact.category}
                </span>
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-white">
                {activeContact.subject}
              </h3>
              <p className="text-xs text-white/50 mt-1">
                From <span className="text-white font-medium">{activeContact.full_name}</span>
                {activeContact.company && ` • ${activeContact.company}`} ({activeContact.email})
              </p>
            </div>

            {/* Message Body */}
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white/90 leading-relaxed whitespace-pre-wrap font-sans mb-6">
              {activeContact.message}
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-3 mb-6">
              <a
                href={`mailto:${activeContact.email}?subject=Re: Orb Finance Inquiry [${activeContact.reference_id}] - ${encodeURIComponent(
                  activeContact.subject
                )}&body=Dear ${encodeURIComponent(
                  activeContact.full_name
                )},\n\nThank you for contacting Orb Finance.\n\nBest regards,\nOrb Relations Desk`}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-xs text-center flex items-center justify-center gap-2 hover:brightness-105 transition-all shadow-md shadow-amber-500/10"
              >
                <Send size={13} />
                <span>Reply via Email Client</span>
              </a>

              <select
                value={activeContact.status}
                onChange={(e) =>
                  handleUpdateContactStatus(activeContact.id, e.target.value as ContactStatus)
                }
                className="py-2.5 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-mono uppercase text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="new" className="bg-[#101018] text-amber-400">Status: NEW</option>
                <option value="in_progress" className="bg-[#101018] text-blue-400">Status: IN PROGRESS</option>
                <option value="responded" className="bg-[#101018] text-emerald-400">Status: RESPONDED</option>
                <option value="archived" className="bg-[#101018] text-white/60">Status: ARCHIVED</option>
              </select>
            </div>

            {/* Internal Admin Resolution Memo */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-white/60 mb-2 flex items-center justify-between">
                <span>Internal Follow-Up & Resolution Memo</span>
                <span className="text-[10px] text-white/40">Private admin note</span>
              </label>
              <textarea
                rows={3}
                value={contactNotes}
                onChange={(e) => setContactNotes(e.target.value)}
                placeholder="Log internal action taken, assigned representative, or follow-up date..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-amber-400/60 transition-all font-mono resize-none"
              />
              <button
                onClick={handleSaveContactNotes}
                disabled={isSavingContactNotes}
                className="mt-2.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSavingContactNotes ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    <span>Save Resolution Memo</span>
                  </>
                )}
              </button>
            </div>

            {/* Audit trail */}
            <div className="pt-4 border-t border-white/5 text-[11px] font-mono text-white/40 flex justify-between">
              <span>Received: {new Date(activeContact.created_at).toLocaleString()}</span>
              <span>IP: {activeContact.ip_address || 'Logged'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODAL 3: SUPABASE SQL SCHEMA VIEWER                                    */}
      {/* ====================================================================== */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setShowSqlModal(false)}
          />

          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0d0d12]/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl z-10 text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowSqlModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gold block mb-1">
                SUPABASE POSTGRESQL ARCHITECTURE
              </span>
              <h3 className="text-xl font-semibold tracking-tight text-white">
                Database Schema & Security
              </h3>
              <p className="text-xs text-white/60 mt-1">
                Run this SQL script in your Supabase Dashboard (SQL Editor) to provision the tables and RLS security policies.
              </p>
            </div>

            <div className="relative rounded-xl bg-black/60 border border-white/10 p-4 font-mono text-[11px] text-white/80 overflow-x-auto max-h-80">
              <pre>{`-- 1. WAITLIST SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.waitlist_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  reference_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT
);

-- 2. CONTACT INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT
);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.waitlist_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public insert only; service_role has full admin access
CREATE POLICY "Public insert waitlist" ON public.waitlist_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public insert contact" ON public.contact_inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin full waitlist" ON public.waitlist_submissions FOR ALL TO service_role USING (true);
CREATE POLICY "Admin full contact" ON public.contact_inquiries FOR ALL TO service_role USING (true);`}</pre>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-white/40">File: supabase_schema.sql</span>
              <button
                onClick={copySqlSchema}
                className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-semibold hover:bg-amber-300 transition-all flex items-center gap-1.5"
              >
                {copiedSql ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedSql ? 'Copied to Clipboard' : 'Copy SQL Schema'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icon Helper
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
