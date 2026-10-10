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
} from 'lucide-react';
import { WaitlistSubmission, WaitlistStats, WaitlistStatus } from '@/lib/supabase/types';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data State
  const [submissions, setSubmissions] = useState<WaitlistSubmission[]>([]);
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Detail Modal State
  const [activeSubmission, setActiveSubmission] = useState<WaitlistSubmission | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show toast utility
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Check existing session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        setIsAuthenticated(Boolean(data.authenticated));
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch Submissions & Stats
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRole !== 'all') params.append('role', selectedRole);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const [subRes, statsRes] = await Promise.all([
        fetch(`/api/admin/submissions?${params.toString()}`),
        fetch('/api/admin/stats'),
      ]);

      if (subRes.status === 401 || statsRes.status === 401) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const subData = await subRes.json();
      const statsData = await statsRes.json();

      if (subData.success) {
        setSubmissions(subData.data);
      }
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRole, selectedStatus, searchQuery]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Invalid passcode.');
        setIsLoggingIn(false);
        return;
      }

      setIsAuthenticated(true);
      setPasscode('');
    } catch {
      setAuthError('Connection error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
  };

  // Update Status
  const handleStatusChange = async (id: string, newStatus: WaitlistStatus) => {
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        if (activeSubmission && activeSubmission.id === id) {
          setActiveSubmission((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        showToast(`Status updated to ${newStatus}`);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Save Notes
  const handleSaveNotes = async () => {
    if (!activeSubmission) return;
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/submissions/${activeSubmission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editNotes }),
      });

      if (res.ok) {
        setActiveSubmission((prev) => (prev ? { ...prev, notes: editNotes } : null));
        setSubmissions((prev) =>
          prev.map((item) => (item.id === activeSubmission.id ? { ...item, notes: editNotes } : item))
        );
        showToast('Notes saved successfully');
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Delete Submission
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this waitlist entry?')) return;
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((item) => item.id !== id));
        if (activeSubmission?.id === id) {
          setActiveSubmission(null);
        }
        showToast('Submission removed');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete submission:', err);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (selectedRole !== 'all') params.append('role', selectedRole);
    if (selectedStatus !== 'all') params.append('status', selectedStatus);
    window.open(`/api/admin/export?${params.toString()}`, '_blank');
  };

  // Role icon helper
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Bank':
        return <Building2 size={14} className="text-amber-400" />;
      case 'Fintech or payments company':
        return <CreditCard size={14} className="text-purple-400" />;
      case 'Business':
        return <Briefcase size={14} className="text-emerald-400" />;
      default:
        return <User size={14} className="text-blue-400" />;
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: WaitlistStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="status-badge approved">
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case 'contacted':
        return (
          <span className="status-badge contacted">
            <MessageSquare size={12} /> Contacted
          </span>
        );
      case 'rejected':
        return (
          <span className="status-badge rejected">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="status-badge pending">
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  // 1. Initial Loading State
  if (isAuthenticated === null) {
    return (
      <div className="admin-auth-scrim">
        <div className="admin-spinner" />
        <style jsx>{`
          .admin-auth-scrim {
            min-height: 100vh;
            background: #07070d;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .admin-spinner {
            width: 32px;
            height: 32px;
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-top-color: #f59e0b;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 2. Authentication Gate View
  if (!isAuthenticated) {
    return (
      <div className="admin-login-screen">
        <div className="login-ambient-aura" aria-hidden="true" />
        
        <div className="login-card-container">
          <div className="login-header">
            <div className="login-shield-badge">
              <Shield size={24} className="text-amber" />
            </div>
            <h1 className="login-title">Orb Protocol Vault</h1>
            <p className="login-subtitle">
              Secured Administrative Console & Supabase Waitlist Portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="admin-passcode" className="form-label">
                <Lock size={13} /> Security Passcode
              </label>
              <input
                id="admin-passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter master passcode..."
                className="passcode-input"
                autoFocus
                required
              />
            </div>

            {authError && (
              <div className="login-error-pill">
                <AlertCircle size={14} />
                <span>{authError}</span>
              </div>
            )}

            <button type="submit" disabled={isLoggingIn} className="login-submit-btn">
              {isLoggingIn ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Enter Dashboard</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="login-footer-hint">
            <span>Default environment key: <code>orb-admin-2027</code></span>
          </div>
        </div>

        <style jsx>{`
          .admin-login-screen {
            min-height: 100vh;
            background: #06060c;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            position: relative;
            overflow: hidden;
            font-family: var(--font-sans);
          }

          .login-ambient-aura {
            position: absolute;
            top: -20%;
            left: 50%;
            transform: translateX(-50%);
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(124, 58, 237, 0.08) 40%, transparent 70%);
            filter: blur(80px);
            pointer-events: none;
          }

          .login-card-container {
            width: 100%;
            max-width: 440px;
            background: linear-gradient(175deg, rgba(22, 22, 34, 0.95) 0%, rgba(12, 12, 18, 0.98) 100%);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 24px;
            padding: 2.8rem 2.2rem;
            box-shadow: 0 35px 80px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.2);
            position: relative;
            z-index: 2;
          }

          .login-header {
            text-align: center;
            margin-bottom: 2rem;
          }

          .login-shield-badge {
            width: 54px;
            height: 54px;
            border-radius: 16px;
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid rgba(245, 158, 11, 0.25);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.25rem;
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.15);
          }

          .login-title {
            font-size: 1.6rem;
            font-weight: 700;
            letter-spacing: -0.025em;
            color: #ffffff;
            margin-bottom: 0.4rem;
          }

          .login-subtitle {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.55);
            line-height: 1.45;
          }

          .login-form {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.45rem;
          }

          .form-label {
            font-size: 0.8rem;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.75);
            display: flex;
            align-items: center;
            gap: 0.4rem;
          }

          .passcode-input {
            width: 100%;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 12px;
            padding: 0.85rem 1.15rem;
            font-family: var(--font-sans);
            font-size: 0.95rem;
            color: #ffffff;
            outline: none;
            transition: all 0.2s ease;
          }

          .passcode-input:focus {
            border-color: rgba(245, 158, 11, 0.6);
            background: rgba(255, 255, 255, 0.07);
            box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
          }

          .login-error-pill {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fca5a5;
            padding: 0.65rem 0.85rem;
            border-radius: 10px;
            font-size: 0.8rem;
          }

          .login-submit-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            width: 100%;
            background: linear-gradient(180deg, #ffffff 0%, #f4f4f6 100%);
            color: #07070d;
            border: none;
            border-radius: 12px;
            padding: 0.85rem 1.5rem;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
            transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
            margin-top: 0.5rem;
          }

          .login-submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 28px rgba(255, 255, 255, 0.35);
          }

          .login-footer-hint {
            margin-top: 1.75rem;
            text-align: center;
            font-size: 0.76rem;
            color: rgba(255, 255, 255, 0.4);
          }

          .login-footer-hint code {
            background: rgba(255, 255, 255, 0.08);
            padding: 0.15rem 0.4rem;
            border-radius: 4px;
            color: #f59e0b;
            font-family: monospace;
          }
        `}</style>
      </div>
    );
  }

  // 3. Authenticated Admin Dashboard
  return (
    <div className="admin-dashboard-root">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast-pill">
          <Check size={14} className="text-emerald" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="admin-top-nav">
        <div className="admin-nav-container">
          <div className="admin-brand">
            <span className="admin-brand-beacon" />
            <span className="admin-brand-name">Orb Finance</span>
            <span className="admin-badge font-mono">ADMIN VAULT</span>
          </div>

          <div className="admin-nav-actions">
            {stats?.isLiveSupabase ? (
              <div className="supabase-status-pill live">
                <Database size={13} />
                <span>Supabase PostgreSQL Live</span>
              </div>
            ) : (
              <div className="supabase-status-pill local" title="Configure .env.local with Supabase credentials for production sync">
                <Database size={13} />
                <span>Local Store (Supabase Ready)</span>
              </div>
            )}

            <button onClick={fetchData} className="admin-icon-btn" title="Refresh data">
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>

            <button onClick={handleExportCsv} className="admin-pill-btn secondary">
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button onClick={handleLogout} className="admin-icon-btn logout" title="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="admin-main-container">
        {/* Metrics Telemetry HUD */}
        <section className="metrics-grid">
          {/* Metric 1: Total Signups */}
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">TOTAL WAITLIST SIGNUPS</span>
              <span className="metric-growth font-mono">LAUNCH: 15 JAN 2027</span>
            </div>
            <div className="metric-value">{stats ? stats.totalSubmissions : '—'}</div>
            <div className="metric-footer">
              <span>{stats ? stats.last24hCount : 0} registered in last 24h</span>
            </div>
          </div>

          {/* Metric 2: Institutional Breakdown */}
          <div className="metric-card span-2">
            <div className="metric-header">
              <span className="metric-label">MEMBERSHIP CATEGORY BREAKDOWN</span>
            </div>
            <div className="roles-progress-row">
              <div className="role-stat-item">
                <div className="role-stat-top">
                  <span className="role-dot bank" />
                  <span className="role-name">Banks</span>
                  <span className="role-count font-mono">{stats?.byRole.bank || 0}</span>
                </div>
              </div>
              <div className="role-stat-item">
                <div className="role-stat-top">
                  <span className="role-dot fintech" />
                  <span className="role-name">Fintechs</span>
                  <span className="role-count font-mono">{stats?.byRole.fintech || 0}</span>
                </div>
              </div>
              <div className="role-stat-item">
                <div className="role-stat-top">
                  <span className="role-dot business" />
                  <span className="role-name">Business</span>
                  <span className="role-count font-mono">{stats?.byRole.business || 0}</span>
                </div>
              </div>
              <div className="role-stat-item">
                <div className="role-stat-top">
                  <span className="role-dot individual" />
                  <span className="role-name">Individual</span>
                  <span className="role-count font-mono">{stats?.byRole.individual || 0}</span>
                </div>
              </div>
            </div>
            {/* Visual Progress Bar */}
            <div className="progress-bar-track">
              {stats && stats.totalSubmissions > 0 && (
                <>
                  <div
                    className="progress-fill bank"
                    style={{ width: `${(stats.byRole.bank / stats.totalSubmissions) * 100}%` }}
                    title={`Banks: ${stats.byRole.bank}`}
                  />
                  <div
                    className="progress-fill fintech"
                    style={{ width: `${(stats.byRole.fintech / stats.totalSubmissions) * 100}%` }}
                    title={`Fintechs: ${stats.byRole.fintech}`}
                  />
                  <div
                    className="progress-fill business"
                    style={{ width: `${(stats.byRole.business / stats.totalSubmissions) * 100}%` }}
                    title={`Businesses: ${stats.byRole.business}`}
                  />
                  <div
                    className="progress-fill individual"
                    style={{ width: `${(stats.byRole.individual / stats.totalSubmissions) * 100}%` }}
                    title={`Individuals: ${stats.byRole.individual}`}
                  />
                </>
              )}
            </div>
          </div>

          {/* Metric 3: Protocol Queue Status */}
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">STATUS PIPELINE</span>
            </div>
            <div className="status-mini-grid">
              <div className="status-mini-item">
                <span className="text-white font-mono font-bold">{stats?.byStatus.pending || 0}</span>
                <span className="text-muted">Pending</span>
              </div>
              <div className="status-mini-item">
                <span className="text-emerald font-mono font-bold">{stats?.byStatus.approved || 0}</span>
                <span className="text-muted">Approved</span>
              </div>
              <div className="status-mini-item">
                <span className="text-amber font-mono font-bold">{stats?.byStatus.contacted || 0}</span>
                <span className="text-muted">Contacted</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filter and Search Bar */}
        <section className="controls-bar-frame">
          <div className="search-input-wrap">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, or ORB- pass ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="filters-cluster">
            {/* Role Filter Tabs */}
            <div className="role-filter-pills">
              {['all', 'Bank', 'Fintech or payments company', 'Business', 'Individual'].map((r) => {
                const label = r === 'Fintech or payments company' ? 'Fintech' : r === 'all' ? 'All Roles' : r;
                return (
                  <button
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className={`filter-pill-btn ${selectedRole === r ? 'active' : ''}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="status-dropdown-select"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="contacted">Contacted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </section>

        {/* Submissions Table / List */}
        <section className="table-card-frame">
          <div className="table-header-bar">
            <span className="table-title">
              REGISTERED CANDIDATES ({submissions.length})
            </span>
          </div>

          <div className="table-responsive-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Pass Token</th>
                  <th>Candidate</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length > 0 ? (
                  submissions.map((sub) => (
                    <tr
                      key={sub.id}
                      onClick={() => {
                        setActiveSubmission(sub);
                        setEditNotes(sub.notes || '');
                      }}
                      className="cursor-pointer hover-row"
                    >
                      <td>
                        <span className="token-mono font-mono">{sub.reference_id}</span>
                      </td>
                      <td>
                        <div className="candidate-cell">
                          <span className="candidate-name">{sub.full_name}</span>
                          <span className="candidate-email">{sub.email}</span>
                        </div>
                      </td>
                      <td>
                        <div className="role-badge-cell">
                          {getRoleIcon(sub.role)}
                          <span>{sub.role === 'Fintech or payments company' ? 'Fintech' : sub.role}</span>
                        </div>
                      </td>
                      <td>
                        <div onClick={(e) => e.stopPropagation()}>
                          <select
                            value={sub.status}
                            onChange={(e) => handleStatusChange(sub.id, e.target.value as WaitlistStatus)}
                            className={`inline-status-select ${sub.status}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="contacted">Contacted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <span className="date-cell font-mono">
                          {new Date(sub.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="action-buttons-cell" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setActiveSubmission(sub);
                              setEditNotes(sub.notes || '');
                            }}
                            className="table-action-btn inspect"
                            title="Inspect details"
                          >
                            <ExternalLink size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="table-action-btn delete"
                            title="Delete entry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="empty-table-cell">
                      <div className="empty-state">
                        <Clock size={28} className="empty-icon" />
                        <p className="empty-title">No submissions found</p>
                        <p className="empty-desc">
                          {searchQuery
                            ? `No records matching "${searchQuery}"`
                            : 'Waitlist candidates will appear here as soon as they register.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Submission Detail Modal */}
      {activeSubmission && (
        <div className="modal-scrim-overlay" onClick={() => setActiveSubmission(null)}>
          <div className="detail-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <div className="modal-top-title">
                <span className="pass-pill font-mono">{activeSubmission.reference_id}</span>
                <h3>Candidate Inspection</h3>
              </div>
              <button onClick={() => setActiveSubmission(null)} className="modal-close-btn">
                <X size={16} />
              </button>
            </div>

            <div className="modal-content-grid">
              {/* Candidate Info Card */}
              <div className="info-section">
                <div className="info-field">
                  <span className="info-label">FULL NAME</span>
                  <span className="info-value-lg">{activeSubmission.full_name}</span>
                </div>
                <div className="info-field">
                  <span className="info-label">WORK EMAIL</span>
                  <span className="info-value">{activeSubmission.email}</span>
                </div>
                <div className="info-field">
                  <span className="info-label">MEMBERSHIP CATEGORY</span>
                  <div className="info-role-badge">
                    {getRoleIcon(activeSubmission.role)}
                    <span>{activeSubmission.role}</span>
                  </div>
                </div>
                <div className="info-field">
                  <span className="info-label">REGISTRATION TIMESTAMP</span>
                  <span className="info-value font-mono">
                    {new Date(activeSubmission.created_at).toUTCString()}
                  </span>
                </div>
                {activeSubmission.ip_address && (
                  <div className="info-field">
                    <span className="info-label">IP ADDRESS & USER AGENT</span>
                    <span className="info-value-sm font-mono text-muted">
                      {activeSubmission.ip_address} • {activeSubmission.user_agent?.slice(0, 45)}...
                    </span>
                  </div>
                )}
              </div>

              {/* Status and Notes Section */}
              <div className="actions-section">
                <div className="info-field">
                  <span className="info-label">CURRENT STATUS</span>
                  <div className="status-selector-row">
                    {(['pending', 'approved', 'contacted', 'rejected'] as WaitlistStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(activeSubmission.id, st)}
                        className={`status-btn-choice ${st} ${activeSubmission.status === st ? 'active' : ''}`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="info-field notes-field">
                  <span className="info-label">
                    <Edit3 size={12} /> INTERNAL ADMIN NOTES
                  </span>
                  <textarea
                    rows={4}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add private internal notes (e.g. VIP routing, volume expectations, follow-up schedule)..."
                    className="notes-textarea"
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="save-notes-btn"
                  >
                    {isSavingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styled JSX for Dashboard */}
      <style jsx>{`
        .admin-dashboard-root {
          min-height: 100vh;
          background: #07070e;
          color: #ffffff;
          font-family: var(--font-sans);
          padding-bottom: 5rem;
        }

        .admin-toast-pill {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          background: rgba(22, 22, 34, 0.95);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #ffffff;
          padding: 0.65rem 1.15rem;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          z-index: 200;
          animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes toastIn {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Top Nav */
        .admin-top-nav {
          background: rgba(14, 14, 22, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .admin-nav-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .admin-brand-beacon {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 10px #f59e0b;
        }

        .admin-brand-name {
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .admin-badge {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.25);
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }

        .admin-nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .supabase-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.76rem;
          font-weight: 600;
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
        }

        .supabase-status-pill.live {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #34d399;
        }

        .supabase-status-pill.local {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.25);
          color: #fbbf24;
        }

        .admin-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .admin-icon-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        .admin-icon-btn.logout:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .admin-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.84rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .admin-pill-btn.secondary {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        .admin-pill-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
        }

        /* Main Body */
        .admin-main-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        /* Metrics HUD Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1.6fr 1fr;
          gap: 1.25rem;
        }

        .metric-card {
          background: linear-gradient(175deg, rgba(22, 22, 34, 0.75) 0%, rgba(12, 12, 20, 0.85) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          padding: 1.5rem 1.65rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .metric-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.85rem;
        }

        .metric-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.45);
        }

        .metric-growth {
          font-size: 0.65rem;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }

        .metric-value {
          font-size: 2.6rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          color: #ffffff;
          margin-bottom: 0.6rem;
        }

        .metric-footer {
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .roles-progress-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .role-stat-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .role-stat-top {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .role-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .role-dot.bank { background: #f59e0b; }
        .role-dot.fintech { background: #c084fc; }
        .role-dot.business { background: #34d399; }
        .role-dot.individual { background: #60a5fa; }

        .role-name {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .role-count {
          font-size: 0.85rem;
          font-weight: 700;
          color: #ffffff;
          margin-left: auto;
        }

        .progress-bar-track {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 9999px;
          overflow: hidden;
          display: flex;
        }

        .progress-fill.bank { background: #f59e0b; }
        .progress-fill.fintech { background: #c084fc; }
        .progress-fill.business { background: #34d399; }
        .progress-fill.individual { background: #60a5fa; }

        .status-mini-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          text-align: center;
          margin-top: 0.5rem;
        }

        .status-mini-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 0.75rem 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .status-mini-item span:first-child {
          font-size: 1.25rem;
        }

        .status-mini-item span:last-child {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.45);
        }

        /* Controls / Search Bar */
        .controls-bar-frame {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .search-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 280px;
        }

        :global(.search-icon) {
          position: absolute;
          left: 1rem;
          color: rgba(255, 255, 255, 0.4);
          pointer-events: none;
        }

        .admin-search-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.75rem 2.4rem 0.75rem 2.6rem;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          color: #ffffff;
          outline: none;
          transition: all 0.2s ease;
        }

        .admin-search-input:focus {
          border-color: rgba(245, 158, 11, 0.5);
          background: rgba(255, 255, 255, 0.07);
        }

        .clear-search-btn {
          position: absolute;
          right: 0.75rem;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
        }

        .filters-cluster {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .role-filter-pills {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 0.2rem;
          gap: 0.2rem;
        }

        .filter-pill-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.55);
          font-size: 0.78rem;
          font-weight: 500;
          padding: 0.4rem 0.75rem;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .filter-pill-btn:hover {
          color: #ffffff;
        }

        .filter-pill-btn.active {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-weight: 600;
        }

        .status-dropdown-select {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border-radius: 10px;
          padding: 0.65rem 1rem;
          font-size: 0.82rem;
          outline: none;
          cursor: pointer;
        }

        .status-dropdown-select option {
          background: #0f1018;
          color: #ffffff;
        }

        /* Table Card Frame */
        .table-card-frame {
          background: linear-gradient(175deg, rgba(20, 20, 30, 0.8) 0%, rgba(10, 10, 16, 0.95) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
        }

        .table-header-bar {
          padding: 1.25rem 1.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .table-title {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.5);
        }

        .table-responsive-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .admin-data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.88rem;
        }

        .admin-data-table th {
          padding: 0.9rem 1.75rem;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .admin-data-table td {
          padding: 1.1rem 1.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.8);
        }

        .admin-data-table tr.hover-row:hover {
          background: rgba(255, 255, 255, 0.025);
        }

        .token-mono {
          font-size: 0.78rem;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
        }

        .candidate-cell {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .candidate-name {
          font-weight: 600;
          color: #ffffff;
        }

        .candidate-email {
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.45);
        }

        .role-badge-cell {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.82rem;
          color: rgba(255, 255, 255, 0.75);
        }

        /* Inline Status Select */
        .inline-status-select {
          border-radius: 9999px;
          padding: 0.25rem 0.65rem;
          font-size: 0.74rem;
          font-weight: 600;
          border: 1px solid transparent;
          outline: none;
          cursor: pointer;
        }

        .inline-status-select.pending {
          background: rgba(245, 158, 11, 0.12);
          border-color: rgba(245, 158, 11, 0.3);
          color: #fbbf24;
        }

        .inline-status-select.approved {
          background: rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.3);
          color: #34d399;
        }

        .inline-status-select.contacted {
          background: rgba(59, 130, 246, 0.12);
          border-color: rgba(59, 130, 246, 0.3);
          color: #60a5fa;
        }

        .inline-status-select.rejected {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.3);
          color: #f87171;
        }

        .inline-status-select option {
          background: #0d0e16;
          color: #ffffff;
        }

        .date-cell {
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.45);
        }

        .action-buttons-cell {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }

        .table-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .table-action-btn.inspect:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        .table-action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .empty-table-cell {
          padding: 4rem 2rem;
          text-align: center;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        :global(.empty-icon) {
          color: rgba(255, 255, 255, 0.2);
          margin-bottom: 0.5rem;
        }

        .empty-title {
          font-size: 1rem;
          font-weight: 600;
          color: #ffffff;
        }

        .empty-desc {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.45);
          max-width: 400px;
        }

        /* Detail Modal Scrim */
        .modal-scrim-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(25px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: modalFadeIn 0.25s ease;
        }

        .detail-modal-card {
          width: 100%;
          max-width: 780px;
          background: linear-gradient(165deg, rgba(24, 24, 36, 0.98) 0%, rgba(12, 12, 18, 0.99) 100%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 24px;
          padding: 2.2rem;
          box-shadow: 0 35px 80px rgba(0, 0, 0, 0.85);
        }

        .modal-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 1.25rem;
          margin-bottom: 1.75rem;
        }

        .modal-top-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .modal-top-title h3 {
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0;
        }

        .pass-pill {
          font-size: 0.78rem;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.25);
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
        }

        .modal-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .modal-close-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.15);
        }

        .modal-content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .info-section, .actions-section {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .info-field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .info-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.4);
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .info-value-lg {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
        }

        .info-value {
          font-size: 0.95rem;
          color: #ffffff;
        }

        .info-value-sm {
          font-size: 0.78rem;
          line-height: 1.4;
        }

        .info-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.88rem;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
          width: fit-content;
        }

        .status-selector-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .status-btn-choice {
          padding: 0.6rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.82rem;
          font-weight: 600;
          text-transform: capitalize;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .status-btn-choice.active.pending {
          background: rgba(245, 158, 11, 0.2);
          border-color: #f59e0b;
          color: #fbbf24;
        }

        .status-btn-choice.active.approved {
          background: rgba(16, 185, 129, 0.2);
          border-color: #10b981;
          color: #34d399;
        }

        .status-btn-choice.active.contacted {
          background: rgba(59, 130, 246, 0.2);
          border-color: #3b82f6;
          color: #60a5fa;
        }

        .status-btn-choice.active.rejected {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
          color: #f87171;
        }

        .notes-textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          font-family: var(--font-sans);
          font-size: 0.88rem;
          color: #ffffff;
          outline: none;
          resize: vertical;
        }

        .notes-textarea:focus {
          border-color: rgba(245, 158, 11, 0.5);
          background: rgba(255, 255, 255, 0.07);
        }

        .save-notes-btn {
          margin-top: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #ffffff;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          align-self: flex-end;
          transition: all 0.2s ease;
        }

        .save-notes-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 900px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          .modal-content-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
