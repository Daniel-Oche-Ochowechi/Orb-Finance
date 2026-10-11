'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
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
  ArrowRight,
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
} from 'lucide-react';
import {
  WaitlistSubmission,
  WaitlistStats,
  WaitlistStatus,
  ContactInquiry,
  ContactStats,
  ContactStatus,
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

  // 1. Initial Authentication Check in background
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
        // stay on login view
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
      const waitlistParams = new URLSearchParams();
      if (selectedRole !== 'all') waitlistParams.append('role', selectedRole);
      if (selectedWaitlistStatus !== 'all') waitlistParams.append('status', selectedWaitlistStatus);
      if (waitlistSearch.trim()) waitlistParams.append('search', waitlistSearch.trim());

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
  // Unauthenticated: Master Passcode Login Screen
  // ============================================================================
  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-ambient-halo" />

        <div className="admin-login-box">
          <div className="admin-login-brand">
            <div className="admin-icon-shield">
              <Shield size={28} color="#f59e0b" strokeWidth={1.75} />
            </div>
            <h1 className="admin-title">
              ORB FINANCE <span className="admin-badge-gold">VAULT</span>
            </h1>
            <p className="admin-subtitle">
              Administrative Control Terminal • 15 January 2027
            </p>
          </div>

          <div className="admin-login-card">
            {authError && (
              <div className="admin-error-banner">
                <AlertCircle size={16} />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="admin-login-form">
              <div className="form-group">
                <label className="input-label">Security Passcode</label>
                <div className="input-wrapper">
                  <span className="input-icon-left">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter admin passcode"
                    autoFocus
                    required
                    className="passcode-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="passcode-toggle"
                  >
                    {showPasscode ? 'Hide' : 'Show'}
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

            <div className="admin-card-footer">
              <p>
                Authorized administrative personnel only. System access is audited and logged in accordance with NDPR & institutional standards.
              </p>
              <div className="admin-key-hint">
                Default Key: <code>orb-admin-2027</code>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .admin-login-wrapper {
            min-height: 100vh;
            background: #06070a;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            position: relative;
            overflow: hidden;
            font-family: var(--font-sans);
          }

          .admin-ambient-halo {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%);
            border-radius: 50%;
            filter: blur(90px);
            pointer-events: none;
          }

          .admin-login-box {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 440px;
          }

          .admin-login-brand {
            text-align: center;
            margin-bottom: 2rem;
          }

          .admin-icon-shield {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 58px;
            height: 58px;
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
            margin-bottom: 1.25rem;
            backdrop-filter: blur(16px);
          }

          .admin-title {
            font-size: 1.6rem;
            font-weight: 600;
            letter-spacing: -0.02em;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }

          .admin-badge-gold {
            font-family: var(--font-mono);
            font-size: 0.8rem;
            color: #f59e0b;
            background: rgba(245, 158, 11, 0.12);
            border: 1px solid rgba(245, 158, 11, 0.3);
            padding: 0.15rem 0.5rem;
            border-radius: 6px;
            letter-spacing: 0.05em;
          }

          .admin-subtitle {
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.5);
            margin-top: 0.4rem;
            font-family: var(--font-mono);
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }

          .admin-login-card {
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(14, 16, 26, 0.75);
            backdrop-filter: blur(30px);
            padding: 2rem;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
          }

          .admin-error-banner {
            margin-bottom: 1.25rem;
            padding: 0.75rem 1rem;
            border-radius: 12px;
            background: rgba(244, 63, 94, 0.12);
            border: 1px solid rgba(244, 63, 94, 0.25);
            color: #fb7185;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            gap: 0.6rem;
          }

          .admin-login-form {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }

          .input-label {
            display: block;
            font-size: 0.7rem;
            font-family: var(--font-mono);
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 0.5rem;
          }

          .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .input-icon-left {
            position: absolute;
            left: 0.9rem;
            color: rgba(255, 255, 255, 0.35);
            pointer-events: none;
            display: flex;
            align-items: center;
          }

          .passcode-input {
            width: 100%;
            padding: 0.85rem 4.5rem 0.85rem 2.6rem;
            border-radius: 14px;
            background: rgba(0, 0, 0, 0.45);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #ffffff;
            font-size: 0.9rem;
            font-family: var(--font-mono);
            transition: all 0.2s ease;
          }

          .passcode-input:focus {
            outline: none;
            border-color: rgba(245, 158, 11, 0.65);
            box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
          }

          .passcode-toggle {
            position: absolute;
            right: 0.9rem;
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.4);
            font-size: 0.75rem;
            cursor: pointer;
            padding: 0.3rem 0.5rem;
          }

          .passcode-toggle:hover {
            color: #ffffff;
          }

          .admin-unlock-btn {
            width: 100%;
            padding: 0.9rem 1.5rem;
            border-radius: 14px;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: #07070d;
            font-weight: 600;
            font-size: 0.85rem;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.2s ease;
            box-shadow: 0 10px 25px rgba(245, 158, 11, 0.25);
          }

          .admin-unlock-btn:hover {
            filter: brightness(1.08);
            transform: translateY(-1px);
          }

          .admin-unlock-btn:active {
            transform: scale(0.99);
          }

          .admin-card-footer {
            margin-top: 1.5rem;
            padding-top: 1.25rem;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            text-align: center;
          }

          .admin-card-footer p {
            font-size: 0.72rem;
            color: rgba(255, 255, 255, 0.45);
            line-height: 1.5;
          }

          .admin-key-hint {
            margin-top: 0.8rem;
            display: inline-block;
            padding: 0.25rem 0.6rem;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            font-size: 0.7rem;
            font-family: var(--font-mono);
            color: rgba(255, 255, 255, 0.5);
          }

          .admin-key-hint code {
            color: #f59e0b;
            font-weight: 600;
          }

          :global(.spin-icon) {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // ============================================================================
  // Authenticated Executive Admin Dashboard
  // ============================================================================
  return (
    <div className="admin-dashboard-root">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast">
          <CheckCircle2 size={16} color="#f59e0b" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="admin-header">
        <div className="admin-header-container">
          {/* Brand */}
          <div className="admin-brand-section">
            <div className="admin-brand-icon">
              <Shield size={16} color="#f59e0b" />
            </div>
            <div className="admin-brand-text">
              ORB <span className="admin-brand-muted">Executive</span>
            </div>

            <div className="supabase-status-chip">
              <span className="pulsing-green-dot" />
              <span>
                {waitlistStats?.isLiveSupabase ? 'Supabase Live' : 'Local Fallback'}
              </span>
            </div>
          </div>

          {/* Navigation Tab Switcher */}
          <div className="admin-tab-switcher">
            <button
              onClick={() => setActiveTab('waitlist')}
              className={`tab-btn ${activeTab === 'waitlist' ? 'active' : ''}`}
            >
              <UsersIcon size={14} />
              <span>Waitlist</span>
              <span className="tab-count">{submissions.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('contacts')}
              className={`tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
            >
              <Mail size={14} />
              <span>Contacts</span>
              <span className="tab-count">{contacts.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('telemetry')}
              className={`tab-btn ${activeTab === 'telemetry' ? 'active' : ''}`}
            >
              <Activity size={14} />
              <span>Telemetry</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="admin-action-cluster">
            <button
              onClick={handleExportCsv}
              className="action-btn csv-btn"
              title="Download CSV report"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => fetchData()}
              disabled={isLoading}
              className="action-btn icon-only"
              title="Refresh current feed"
            >
              <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} />
            </button>

            <button
              onClick={handleLogout}
              className="action-btn icon-only logout-btn"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* ==================================================================== */}
        {/* TAB 1: WAITLIST SUBMISSIONS                                          */}
        {/* ==================================================================== */}
        {activeTab === 'waitlist' && (
          <div className="tab-view-container">
            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <span className="kpi-label">Total Waitlist</span>
                <div className="kpi-value-row">
                  <span className="kpi-value">
                    {waitlistStats?.totalSubmissions ?? submissions.length}
                  </span>
                  <span className="kpi-badge-green">
                    +{waitlistStats?.last24hCount ?? 0} today
                  </span>
                </div>
              </div>

              <div className="kpi-card">
                <span className="kpi-label">Banks & Institutions</span>
                <div className="kpi-value-row">
                  <span className="kpi-value text-gold">
                    {waitlistStats?.byRole?.bank ?? 0}
                  </span>
                  <Building2 size={16} color="rgba(245, 158, 11, 0.5)" />
                </div>
              </div>

              <div className="kpi-card">
                <span className="kpi-label">Fintech & Payments</span>
                <div className="kpi-value-row">
                  <span className="kpi-value text-violet">
                    {waitlistStats?.byRole?.fintech ?? 0}
                  </span>
                  <CreditCard size={16} color="rgba(139, 92, 246, 0.5)" />
                </div>
              </div>

              <div className="kpi-card">
                <span className="kpi-label">Businesses & Treasury</span>
                <div className="kpi-value-row">
                  <span className="kpi-value text-blue">
                    {waitlistStats?.byRole?.business ?? 0}
                  </span>
                  <Briefcase size={16} color="rgba(59, 130, 246, 0.5)" />
                </div>
              </div>

              <div className="kpi-card">
                <span className="kpi-label">Individual Access</span>
                <div className="kpi-value-row">
                  <span className="kpi-value">
                    {waitlistStats?.byRole?.individual ?? 0}
                  </span>
                  <User size={16} color="rgba(255, 255, 255, 0.3)" />
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="controls-bar">
              <div className="search-box">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  value={waitlistSearch}
                  onChange={(e) => setWaitlistSearch(e.target.value)}
                  placeholder="Search by name, email, or reference code..."
                  className="search-input"
                />
              </div>

              <div className="filter-group">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Roles</option>
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

            {/* Table */}
            <div className="table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Candidate</th>
                    <th>Role</th>
                    <th>Registration</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="empty-table-cell">
                        <Inbox size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                        <p>No waitlist submissions match your search parameters.</p>
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
                          <div className="candidate-name">{sub.full_name}</div>
                          <div className="candidate-email">{sub.email}</div>
                        </td>
                        <td>
                          <span className="role-tag">
                            {sub.role}
                          </span>
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
                            <option value="pending">PENDING</option>
                            <option value="approved">APPROVED</option>
                            <option value="contacted">CONTACTED</option>
                            <option value="rejected">REJECTED</option>
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
                              title="Inspect dossier"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteSubmission(sub.id, sub.reference_id)}
                              className="table-action-icon delete-icon"
                              title="Delete candidate"
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
        )}

        {/* ==================================================================== */}
        {/* TAB 2: CONTACT INQUIRIES & MESSAGES                                  */}
        {/* ==================================================================== */}
        {activeTab === 'contacts' && (
          <div className="tab-view-container">
            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <span className="kpi-label">Total Inquiries</span>
                <div className="kpi-value-row">
                  <span className="kpi-value">
                    {contactStats?.totalInquiries ?? contacts.length}
                  </span>
                  <span className="kpi-badge-green">
                    +{contactStats?.last24hCount ?? 0} today
                  </span>
                </div>
              </div>

              <div className="kpi-card">
                <span className="kpi-label">New / Unread</span>
                <div className="kpi-value-row">
                  <span className="kpi-value text-gold">
                    {contactStats?.byStatus?.new ?? 0}
                  </span>
                  <span className="pulsing-amber-dot" />
                </div>
              </div>

              <div className="kpi-card">
                <span className="kpi-label">In Progress</span>
                <div className="kpi-value-row">
                  <span className="kpi-value text-blue">
                    {contactStats?.byStatus?.in_progress ?? 0}
                  </span>
                  <Clock size={16} color="rgba(59, 130, 246, 0.5)" />
                </div>
              </div>

              <div className="kpi-card">
                <span className="kpi-label">Responded</span>
                <div className="kpi-value-row">
                  <span className="kpi-value text-emerald">
                    {contactStats?.byStatus?.responded ?? 0}
                  </span>
                  <CheckCircle2 size={16} color="rgba(16, 185, 129, 0.5)" />
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="controls-bar">
              <div className="search-box">
                <Search size={15} className="search-icon" />
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
                  <option value="Institutional Sandbox">Sandbox & APIs</option>
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

            {/* Table */}
            <div className="table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ref Code</th>
                    <th>Contact & Org</th>
                    <th>Topic</th>
                    <th>Message Snippet</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="empty-table-cell">
                        <Inbox size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                        <p>No contact inquiries found matching criteria.</p>
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
                          <div className="candidate-name">{c.full_name}</div>
                          <div className="candidate-email">{c.email}</div>
                          {c.company && <div className="company-tag">🏢 {c.company}</div>}
                        </td>
                        <td>
                          <span className="role-tag">{c.category}</span>
                        </td>
                        <td className="msg-preview-cell">
                          <div className="msg-subj truncate">{c.subject}</div>
                          <div className="msg-body truncate">{c.message}</div>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <select
                            value={c.status}
                            onChange={(e) =>
                              handleUpdateContactStatus(c.id, e.target.value as ContactStatus)
                            }
                            className={`status-select status-${c.status}`}
                          >
                            <option value="new">NEW</option>
                            <option value="in_progress">IN PROGRESS</option>
                            <option value="responded">RESPONDED</option>
                            <option value="archived">ARCHIVED</option>
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
                              title="Read full inquiry"
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
        )}

        {/* ==================================================================== */}
        {/* TAB 3: EXECUTIVE TELEMETRY & SYSTEM HEALTH                           */}
        {/* ==================================================================== */}
        {activeTab === 'telemetry' && (
          <div className="tab-view-container">
            {/* Banner */}
            <div className="telemetry-banner">
              <div>
                <div className="telemetry-badge-row">
                  <span className="banner-tag">SYSTEM READINESS</span>
                  <span className="banner-date">OPENING 15 JANUARY 2027</span>
                </div>
                <h3 className="banner-title">Platform Ingestion & Inquiries Pipeline</h3>
                <p className="banner-desc">
                  All waitlist candidates and institutional contact transmissions are securely isolated and encrypted.
                </p>
              </div>

              <button onClick={() => setShowSqlModal(true)} className="schema-btn">
                <Database size={14} color="#f59e0b" />
                <span>View Supabase SQL Schema</span>
              </button>
            </div>

            {/* Distribution Charts */}
            <div className="charts-grid">
              <div className="chart-card">
                <h4 className="chart-title">
                  <Layers size={16} color="#f59e0b" />
                  <span>Waitlist Role Composition</span>
                </h4>

                <div className="bars-list">
                  <div className="bar-row">
                    <div className="bar-header">
                      <span>Banks & Financial Institutions</span>
                      <span className="mono-count">{waitlistStats?.byRole?.bank ?? 0}</span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill gold"
                        style={{
                          width: `${
                            submissions.length
                              ? Math.min(100, Math.round(((waitlistStats?.byRole?.bank ?? 0) / submissions.length) * 100))
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="bar-row">
                    <div className="bar-header">
                      <span>Fintech & Payments Infrastructure</span>
                      <span className="mono-count">{waitlistStats?.byRole?.fintech ?? 0}</span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill violet"
                        style={{
                          width: `${
                            submissions.length
                              ? Math.min(100, Math.round(((waitlistStats?.byRole?.fintech ?? 0) / submissions.length) * 100))
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="bar-row">
                    <div className="bar-header">
                      <span>Corporate Businesses & Treasury</span>
                      <span className="mono-count">{waitlistStats?.byRole?.business ?? 0}</span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill blue"
                        style={{
                          width: `${
                            submissions.length
                              ? Math.min(100, Math.round(((waitlistStats?.byRole?.business ?? 0) / submissions.length) * 100))
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="bar-row">
                    <div className="bar-header">
                      <span>Individual Early Access</span>
                      <span className="mono-count">{waitlistStats?.byRole?.individual ?? 0}</span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill white"
                        style={{
                          width: `${
                            submissions.length
                              ? Math.min(100, Math.round(((waitlistStats?.byRole?.individual ?? 0) / submissions.length) * 100))
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <h4 className="chart-title">
                  <Mail size={16} color="#8b5cf6" />
                  <span>Inquiry Topics Breakdown</span>
                </h4>

                <div className="bars-list">
                  <div className="bar-row">
                    <div className="bar-header">
                      <span>Institutional Partnerships</span>
                      <span className="mono-count">{contactStats?.byCategory?.partnership ?? 0}</span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill gold"
                        style={{
                          width: `${
                            contacts.length
                              ? Math.min(100, Math.round(((contactStats?.byCategory?.partnership ?? 0) / contacts.length) * 100))
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="bar-row">
                    <div className="bar-header">
                      <span>Sandbox & Developer APIs</span>
                      <span className="mono-count">{contactStats?.byCategory?.sandbox ?? 0}</span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill emerald"
                        style={{
                          width: `${
                            contacts.length
                              ? Math.min(100, Math.round(((contactStats?.byCategory?.sandbox ?? 0) / contacts.length) * 100))
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="bar-row">
                    <div className="bar-header">
                      <span>Integration Support</span>
                      <span className="mono-count">{contactStats?.byCategory?.integration ?? 0}</span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill blue"
                        style={{
                          width: `${
                            contacts.length
                              ? Math.min(100, Math.round(((contactStats?.byCategory?.integration ?? 0) / contacts.length) * 100))
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="bar-row">
                    <div className="bar-header">
                      <span>Compliance & NDPR Review</span>
                      <span className="mono-count">{contactStats?.byCategory?.compliance ?? 0}</span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill rose"
                        style={{
                          width: `${
                            contacts.length
                              ? Math.min(100, Math.round(((contactStats?.byCategory?.compliance ?? 0) / contacts.length) * 100))
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

      {/* ==================================================================== */}
      {/* MODAL 1: WAITLIST DOSSIER                                            */}
      {/* ==================================================================== */}
      {activeSubmission && (
        <div className="admin-modal-backdrop" onClick={() => setActiveSubmission(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setActiveSubmission(null)} className="modal-close-btn">
              <X size={18} />
            </button>

            <div className="modal-header">
              <span className="modal-tag">WAITLIST DOSSIER</span>
              <h3 className="modal-title">{activeSubmission.full_name}</h3>
              <p className="modal-sub mono">{activeSubmission.email}</p>
            </div>

            <div className="modal-meta-grid">
              <div className="meta-item">
                <span className="meta-label">REFERENCE ID</span>
                <span className="meta-val gold mono">{activeSubmission.reference_id}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">ROLE</span>
                <span className="meta-val">{activeSubmission.role}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">REGISTERED AT</span>
                <span className="meta-val mono">
                  {new Date(activeSubmission.created_at).toLocaleString()}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">STATUS</span>
                <span className="meta-val gold uppercase">{activeSubmission.status}</span>
              </div>
            </div>

            <div className="modal-section">
              <label className="section-label">Transition Status</label>
              <div className="status-btn-group">
                {(['pending', 'approved', 'contacted', 'rejected'] as WaitlistStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateWaitlistStatus(activeSubmission.id, st)}
                    className={`status-toggle-btn ${activeSubmission.status === st ? 'active' : ''}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <div className="section-label-row">
                <span className="section-label">Internal Dossier Notes</span>
                <span className="hint-label">Only visible to administrators</span>
              </div>
              <textarea
                rows={4}
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="Add meeting outcomes, corridor requirements, SLA notes..."
                className="notes-textarea"
              />
              <button
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
                    <span>Save Notes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: CONTACT INQUIRY                                             */}
      {/* ==================================================================== */}
      {activeContact && (
        <div className="admin-modal-backdrop" onClick={() => setActiveContact(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setActiveContact(null)} className="modal-close-btn">
              <X size={18} />
            </button>

            <div className="modal-header">
              <span className="modal-tag">INQUIRY • {activeContact.reference_id}</span>
              <h3 className="modal-title">{activeContact.subject}</h3>
              <p className="modal-sub">
                From <strong>{activeContact.full_name}</strong>
                {activeContact.company && ` • ${activeContact.company}`} ({activeContact.email})
              </p>
            </div>

            <div className="modal-msg-body">
              {activeContact.message}
            </div>

            <div className="modal-actions-bar">
              <a
                href={`mailto:${activeContact.email}?subject=Re: Orb Finance Inquiry [${activeContact.reference_id}] - ${encodeURIComponent(activeContact.subject)}&body=Dear ${encodeURIComponent(activeContact.full_name)},\n\nThank you for contacting Orb Finance.\n\nBest regards,\nOrb Relations Desk`}
                className="reply-email-btn"
              >
                <Send size={13} />
                <span>Reply via Email Client</span>
              </a>

              <select
                value={activeContact.status}
                onChange={(e) =>
                  handleUpdateContactStatus(activeContact.id, e.target.value as ContactStatus)
                }
                className="modal-status-select"
              >
                <option value="new">Status: NEW</option>
                <option value="in_progress">Status: IN PROGRESS</option>
                <option value="responded">Status: RESPONDED</option>
                <option value="archived">Status: ARCHIVED</option>
              </select>
            </div>

            <div className="modal-section">
              <div className="section-label-row">
                <span className="section-label">Follow-Up & Resolution Memo</span>
                <span className="hint-label">Private admin note</span>
              </div>
              <textarea
                rows={3}
                value={contactNotes}
                onChange={(e) => setContactNotes(e.target.value)}
                placeholder="Log internal action taken, assigned representative, or follow-up date..."
                className="notes-textarea"
              />
              <button
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
                    <span>Save Resolution Memo</span>
                  </>
                )}
              </button>
            </div>
          </div>
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

CREATE POLICY "Public insert waitlist" ON public.waitlist_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public insert contact" ON public.contact_inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin full waitlist" ON public.waitlist_submissions FOR ALL TO service_role USING (true);
CREATE POLICY "Admin full contact" ON public.contact_inquiries FOR ALL TO service_role USING (true);`}</pre>
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

      {/* Complete Dedicated Dashboard Stylesheet */}
      <style jsx>{`
        .admin-dashboard-root {
          min-height: 100vh;
          background: #08080c;
          color: #f8fafc;
          font-family: var(--font-sans);
          padding-bottom: 5rem;
        }

        .admin-toast {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 100;
          background: rgba(10, 10, 15, 0.95);
          border: 1px solid rgba(245, 158, 11, 0.35);
          backdrop-filter: blur(20px);
          padding: 0.85rem 1.25rem;
          border-radius: 14px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        /* Header */
        .admin-header {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(8, 8, 12, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .admin-header-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .admin-brand-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .admin-brand-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-brand-text {
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: -0.01em;
        }

        .admin-brand-muted {
          font-weight: 400;
          color: rgba(255, 255, 255, 0.5);
        }

        .supabase-status-chip {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.7rem;
          font-family: var(--font-mono);
          color: rgba(255, 255, 255, 0.7);
        }

        .pulsing-green-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }

        .pulsing-amber-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 8px #f59e0b;
        }

        /* Tab Switcher */
        .admin-tab-switcher {
          display: flex;
          align-items: center;
          padding: 3px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.45rem 0.85rem;
          border-radius: 9px;
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.6);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-btn:hover {
          color: #ffffff;
        }

        .tab-btn.active {
          background: #ffffff;
          color: #07070d;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .tab-count {
          font-size: 0.7rem;
          padding: 0.1rem 0.4rem;
          border-radius: 9999px;
          background: rgba(0, 0, 0, 0.15);
          font-family: var(--font-mono);
        }

        .tab-btn.active .tab-count {
          background: rgba(0, 0, 0, 0.12);
          color: #07070d;
        }

        /* Action Cluster */
        .admin-action-cluster {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.75rem;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .action-btn.icon-only {
          padding: 0.5rem;
        }

        .logout-btn:hover {
          background: rgba(244, 63, 94, 0.15);
          border-color: rgba(244, 63, 94, 0.3);
          color: #fb7185;
        }

        /* Main Area */
        .admin-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        .tab-view-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* KPI Grid */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .kpi-card {
          padding: 1.25rem;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
        }

        .kpi-label {
          display: block;
          font-size: 0.7rem;
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 0.5rem;
        }

        .kpi-value-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
        }

        .kpi-value {
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #ffffff;
        }

        .kpi-badge-green {
          font-size: 0.7rem;
          color: #10b981;
          font-family: var(--font-mono);
        }

        .text-gold { color: #f59e0b; }
        .text-violet { color: #8b5cf6; }
        .text-blue { color: #3b82f6; }
        .text-emerald { color: #10b981; }

        /* Controls */
        .controls-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 260px;
          max-width: 480px;
        }

        .search-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translate(0, -50%);
          color: rgba(255, 255, 255, 0.4);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.65rem 1rem 0.65rem 2.4rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-size: 0.8rem;
          font-family: var(--font-mono);
          outline: none;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          border-color: rgba(245, 158, 11, 0.6);
          background: rgba(0, 0, 0, 0.3);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .filter-select {
          padding: 0.65rem 0.9rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-size: 0.8rem;
          outline: none;
          cursor: pointer;
        }

        .filter-select option {
          background: #10121d;
          color: #ffffff;
        }

        /* Table Card */
        .table-card {
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(16px);
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.8rem;
        }

        .admin-table thead {
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .admin-table th {
          padding: 0.85rem 1.25rem;
          font-size: 0.68rem;
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 500;
        }

        .admin-table tbody tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .admin-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.035);
        }

        .admin-table td {
          padding: 1rem 1.25rem;
          vertical-align: middle;
        }

        .ref-cell {
          font-family: var(--font-mono);
          font-weight: 600;
          color: #f59e0b;
          white-space: nowrap;
        }

        .candidate-name {
          font-weight: 600;
          color: #ffffff;
        }

        .candidate-email {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.45);
          font-family: var(--font-mono);
          margin-top: 0.15rem;
        }

        .company-tag {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 0.2rem;
        }

        .role-tag {
          display: inline-block;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.72rem;
          white-space: nowrap;
        }

        .date-cell {
          font-size: 0.75rem;
          font-family: var(--font-mono);
          color: rgba(255, 255, 255, 0.5);
          white-space: nowrap;
        }

        .msg-preview-cell {
          max-width: 260px;
        }

        .msg-subj {
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
        }

        .msg-body {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.45);
          margin-top: 0.15rem;
        }

        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Status Select */
        .status-select {
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-family: var(--font-mono);
          font-weight: 600;
          border: 1px solid transparent;
          cursor: pointer;
          outline: none;
        }

        .status-select option {
          background: #0f111a;
          color: #ffffff;
        }

        .status-pending, .status-new {
          background: rgba(245, 158, 11, 0.12);
          border-color: rgba(245, 158, 11, 0.35);
          color: #f59e0b;
        }

        .status-approved, .status-responded {
          background: rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.35);
          color: #10b981;
        }

        .status-contacted, .status-in_progress {
          background: rgba(59, 130, 246, 0.12);
          border-color: rgba(59, 130, 246, 0.35);
          color: #3b82f6;
        }

        .status-rejected, .status-archived {
          background: rgba(244, 63, 94, 0.12);
          border-color: rgba(244, 63, 94, 0.35);
          color: #fb7185;
        }

        .row-action-btns {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.4rem;
        }

        .table-action-icon {
          padding: 0.45rem;
          border-radius: 8px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .table-action-icon:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }

        .table-action-icon.delete-icon:hover {
          color: #fb7185;
          background: rgba(244, 63, 94, 0.15);
        }

        .table-action-icon.reply-icon {
          color: rgba(245, 158, 11, 0.7);
        }

        .table-action-icon.reply-icon:hover {
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.15);
        }

        .empty-table-cell {
          text-align: center;
          padding: 3rem 1rem;
          color: rgba(255, 255, 255, 0.4);
        }

        /* Telemetry Tab */
        .telemetry-banner {
          padding: 1.5rem 1.75rem;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(255, 255, 255, 0.02) 60%);
          border: 1px solid rgba(245, 158, 11, 0.25);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .telemetry-badge-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.4rem;
        }

        .banner-tag {
          font-size: 0.65rem;
          font-family: var(--font-mono);
          padding: 0.15rem 0.55rem;
          border-radius: 9999px;
          background: rgba(245, 158, 11, 0.18);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #f59e0b;
          letter-spacing: 0.05em;
        }

        .banner-date {
          font-size: 0.72rem;
          font-family: var(--font-mono);
          color: rgba(255, 255, 255, 0.5);
        }

        .banner-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #ffffff;
        }

        .banner-desc {
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 0.3rem;
          max-width: 600px;
        }

        .schema-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1.1rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .schema-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 1.25rem;
        }

        .chart-card {
          padding: 1.5rem;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(16px);
        }

        .chart-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 1.25rem;
        }

        .bars-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .bar-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 0.35rem;
        }

        .mono-count {
          font-family: var(--font-mono);
          color: #ffffff;
        }

        .bar-track {
          width: 100%;
          height: 8px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.5s ease;
        }

        .bar-fill.gold { background: #f59e0b; }
        .bar-fill.violet { background: #8b5cf6; }
        .bar-fill.blue { background: #3b82f6; }
        .bar-fill.white { background: rgba(255, 255, 255, 0.7); }
        .bar-fill.emerald { background: #10b981; }
        .bar-fill.rose { background: #fb7185; }

        /* Modals */
        .admin-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .admin-modal-card {
          position: relative;
          width: 100%;
          max-width: 560px;
          border-radius: 24px;
          background: #0d0f19;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.9);
          padding: 2rem;
          max-height: 90vh;
          overflow-y: auto;
        }

        .admin-modal-card.sql-modal {
          max-width: 680px;
        }

        .modal-close-btn {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          padding: 0.4rem;
          border-radius: 50%;
        }

        .modal-close-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }

        .modal-header {
          margin-bottom: 1.5rem;
        }

        .modal-tag {
          font-size: 0.68rem;
          font-family: var(--font-mono);
          text-transform: uppercase;
          color: #f59e0b;
          letter-spacing: 0.08em;
          display: block;
          margin-bottom: 0.3rem;
        }

        .modal-title {
          font-size: 1.4rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #ffffff;
        }

        .modal-sub {
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 0.3rem;
        }

        .modal-sub.mono {
          font-family: var(--font-mono);
        }

        .modal-meta-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          margin-bottom: 1.5rem;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .meta-label {
          font-size: 0.65rem;
          font-family: var(--font-mono);
          color: rgba(255, 255, 255, 0.4);
        }

        .meta-val {
          font-size: 0.8rem;
          color: #ffffff;
        }

        .meta-val.gold { color: #f59e0b; }
        .meta-val.mono { font-family: var(--font-mono); }
        .meta-val.uppercase { text-transform: uppercase; }

        .modal-section {
          margin-bottom: 1.5rem;
        }

        .section-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 0.5rem;
          display: block;
        }

        .section-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .hint-label {
          font-size: 0.68rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .status-btn-group {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }

        .status-toggle-btn {
          padding: 0.5rem 0.25rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.72rem;
          font-family: var(--font-mono);
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .status-toggle-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }

        .status-toggle-btn.active {
          background: #f59e0b;
          border-color: #f59e0b;
          color: #07070d;
          font-weight: 700;
        }

        .notes-textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #ffffff;
          font-size: 0.8rem;
          font-family: var(--font-mono);
          outline: none;
          resize: none;
          box-sizing: border-box;
        }

        .notes-textarea:focus {
          border-color: rgba(245, 158, 11, 0.6);
        }

        .save-notes-btn {
          margin-top: 0.6rem;
          padding: 0.55rem 1rem;
          border-radius: 10px;
          background: #ffffff;
          border: none;
          color: #07070d;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }

        .save-notes-btn:hover {
          background: #f1f5f9;
        }

        .modal-msg-body {
          padding: 1.25rem;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.85rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 1.25rem;
          white-space: pre-wrap;
        }

        .modal-actions-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .reply-email-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          padding: 0.65rem 1rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #07070d;
          font-size: 0.8rem;
          font-weight: 600;
          text-decoration: none;
        }

        .reply-email-btn:hover {
          filter: brightness(1.05);
        }

        .modal-status-select {
          padding: 0.65rem 0.85rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #ffffff;
          font-size: 0.78rem;
          font-family: var(--font-mono);
          outline: none;
          cursor: pointer;
        }

        .modal-status-select option {
          background: #0f111a;
          color: #ffffff;
        }

        .sql-code-box {
          border-radius: 14px;
          background: #000000;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.85);
          max-height: 320px;
          overflow: auto;
          margin: 1.25rem 0;
        }

        .sql-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .file-hint {
          font-size: 0.72rem;
          font-family: var(--font-mono);
          color: rgba(255, 255, 255, 0.4);
        }

        .copy-sql-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1rem;
          border-radius: 10px;
          background: #f59e0b;
          border: none;
          color: #07070d;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }

        .copy-sql-btn:hover {
          background: #fbbf24;
        }

        @media (max-width: 768px) {
          .admin-header-container {
            height: auto;
            padding: 0.75rem 1rem;
            flex-direction: column;
            align-items: stretch;
          }

          .admin-brand-section {
            justify-content: space-between;
          }

          .supabase-status-chip {
            display: none;
          }

          .admin-tab-switcher {
            width: 100%;
            justify-content: center;
          }

          .admin-action-cluster {
            justify-content: flex-end;
          }

          .csv-btn {
            display: none;
          }

          .status-btn-group {
            grid-template-columns: repeat(2, 1fr);
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
