'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Building2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Briefcase,
  Terminal,
  Scale,
} from 'lucide-react';
import { useEarlyAccess } from '@/context/EarlyAccessContext';
import { ContactCategory } from '@/lib/supabase/types';

const CATEGORIES: { id: ContactCategory; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'Partnership', label: 'Institutional Partnership', icon: Briefcase },
  { id: 'Institutional Sandbox', label: 'Sandbox & API Keys', icon: Terminal },
  { id: 'Integration Support', label: 'Integration Support', icon: Building2 },
  { id: 'Compliance', label: 'Compliance & Legal', icon: Scale },
  { id: 'General', label: 'General Inquiry', icon: HelpCircle },
];

export default function ContactModal() {
  const { isContactOpen, closeContact, initialContactCategory } = useEarlyAccess();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState<ContactCategory>('Partnership');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    referenceId: string;
    message: string;
  } | null>(null);

  // Sync initial category when opening modal
  useEffect(() => {
    if (initialContactCategory) {
      const match = CATEGORIES.find((c) => c.id === initialContactCategory);
      if (match) setCategory(match.id);
    }
  }, [initialContactCategory, isContactOpen]);

  // Lock body scroll when modal open
  useEffect(() => {
    if (isContactOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setTimeout(() => {
        setError(null);
        setSuccessData(null);
        setFullName('');
        setEmail('');
        setCompany('');
        setSubject('');
        setMessage('');
      }, 300);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isContactOpen]);

  if (!isContactOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please provide your full official name.');
      return;
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid official email address.');
      return;
    }

    if (!message.trim() || message.trim().length < 5) {
      setError('Please write a brief message outlining your request.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          company: company.trim() || null,
          category,
          subject: subject.trim() || `${category} Inquiry from ${fullName.trim()}`,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit inquiry. Please try again.');
      }

      setSuccessData({
        referenceId: data.referenceId,
        message: data.message,
      });
    } catch (err: any) {
      setError(err.message || 'Transmission error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-modal-backdrop" onClick={closeContact}>
      <div className="contact-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="ambient-gold-glow" />
        <div className="ambient-violet-glow" />

        <button onClick={closeContact} className="modal-close-icon" aria-label="Close modal">
          <X size={18} />
        </button>

        {successData ? (
          <div className="success-view">
            <div className="success-icon-ring">
              <CheckCircle2 size={32} />
            </div>

            <div className="success-header">
              <span className="success-tag">TRANSMISSION LOGGED</span>
              <h3 className="success-title">Inquiry Dispatched</h3>
              <p className="success-desc">{successData.message}</p>
            </div>

            <div className="ref-display-card">
              <span className="ref-title">Institutional Reference ID</span>
              <span className="ref-code">{successData.referenceId}</span>
            </div>

            <p className="success-note">
              A copy has been routed to our global partnerships desk. Our team typically responds within 24 business hours.
            </p>

            <button onClick={closeContact} className="success-done-btn">
              Done
            </button>
          </div>
        ) : (
          <div className="form-view">
            <div className="form-header">
              <div className="header-chips">
                <span className="tag-direct">DIRECT LINE</span>
                <span className="tag-date">LAUNCHING 15 JAN 2027</span>
              </div>
              <h3 className="modal-heading">Contact Orb Institutional Desk</h3>
              <p className="modal-subheading">
                Direct contact for partner discussions, FX liquidity routing, sandbox credentials, or compliance reviews.
              </p>
            </div>

            {error && (
              <div className="error-banner">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div>
                <label className="field-label">Topic of inquiry</label>
                <div className="category-grid">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`category-pill ${isSelected ? 'active' : ''}`}
                      >
                        <Icon size={13} color={isSelected ? '#f59e0b' : 'rgba(255,255,255,0.4)'} />
                        <span className="category-label">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="input-row-two">
                <div className="field-group">
                  <label className="field-label">Full name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="modal-input"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Official email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. elena@company.com"
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="input-row-two">
                <div className="field-group">
                  <label className="field-label">Company / Organization</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Citadel FX Bank"
                    className="modal-input"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Subject (optional)</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. API Integration Review"
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Message / Requirements *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detail your request, estimated transfer corridors, or questions ahead of our January 15, 2027 opening..."
                  className="modal-textarea"
                />
              </div>

              <div className="submit-section">
                <button type="submit" disabled={isSubmitting} className="submit-inquiry-btn">
                  {isSubmitting ? (
                    <>
                      <div className="btn-spinner" />
                      <span>Transmitting encrypted inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Transmit Inquiry</span>
                    </>
                  )}
                </button>
              </div>

              <div className="footer-notice">
                <div className="security-notice">
                  <ShieldCheck size={13} color="#10b981" />
                  <span>NDPR & Bank-grade encrypted transmission</span>
                </div>
                <span className="ref-tag">Ref: ORB-DIRECT</span>
              </div>
            </form>
          </div>
        )}
      </div>

      <style jsx>{`
        .contact-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 999;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem;
          font-family: var(--font-sans);
        }

        .contact-modal-card {
          position: relative;
          width: 100%;
          max-width: 580px;
          border-radius: 24px;
          background: #0d0e17;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.9);
          padding: 2rem;
          color: #ffffff;
          overflow: hidden;
          max-height: 92vh;
          overflow-y: auto;
        }

        .ambient-gold-glow {
          position: absolute;
          top: -60px;
          left: -60px;
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .ambient-violet-glow {
          position: absolute;
          bottom: -60px;
          right: -60px;
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .modal-close-icon {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          padding: 0.4rem;
          border-radius: 50%;
          transition: all 0.15s ease;
        }

        .modal-close-icon:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }

        /* Success View */
        .success-view {
          padding: 1.5rem 0;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .success-icon-ring {
          margin: 0 auto;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #10b981;
        }

        .success-header {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .success-tag {
          font-size: 0.68rem;
          font-family: var(--font-mono);
          text-transform: uppercase;
          color: #f59e0b;
          letter-spacing: 0.08em;
        }

        .success-title {
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #ffffff;
        }

        .success-desc {
          font-size: 0.82rem;
          color: rgba(255, 255, 255, 0.7);
          max-width: 420px;
          margin: 0 auto;
          line-height: 1.5;
        }

        .ref-display-card {
          padding: 1rem;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          max-width: 320px;
          margin: 0 auto;
          width: 100%;
        }

        .ref-title {
          display: block;
          font-size: 0.65rem;
          font-family: var(--font-mono);
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 0.25rem;
        }

        .ref-code {
          font-family: var(--font-mono);
          font-size: 1.1rem;
          font-weight: 700;
          color: #f59e0b;
          letter-spacing: 0.05em;
        }

        .success-note {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.4);
          line-height: 1.5;
        }

        .success-done-btn {
          width: 100%;
          padding: 0.8rem;
          border-radius: 12px;
          background: #ffffff;
          border: none;
          color: #07070d;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }

        /* Form View */
        .form-header {
          margin-bottom: 1.5rem;
        }

        .header-chips {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .tag-direct {
          font-size: 0.65rem;
          font-family: var(--font-mono);
          padding: 0.15rem 0.55rem;
          border-radius: 9999px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #f59e0b;
        }

        .tag-date {
          font-size: 0.7rem;
          font-family: var(--font-mono);
          color: rgba(255, 255, 255, 0.4);
        }

        .modal-heading {
          font-size: 1.45rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #ffffff;
        }

        .modal-subheading {
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 0.35rem;
          line-height: 1.5;
        }

        .error-banner {
          margin-bottom: 1rem;
          padding: 0.65rem 0.85rem;
          border-radius: 10px;
          background: rgba(244, 63, 94, 0.12);
          border: 1px solid rgba(244, 63, 94, 0.25);
          color: #fb7185;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.4rem;
        }

        .category-pill {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 0.65rem;
          border-radius: 10px;
          font-size: 0.72rem;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          color: rgba(255, 255, 255, 0.65);
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .category-pill:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.06);
        }

        .category-pill.active {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        .category-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .input-row-two {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .field-label {
          font-size: 0.72rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.6);
        }

        .modal-input {
          width: 100%;
          padding: 0.65rem 0.85rem;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-size: 0.78rem;
          outline: none;
          box-sizing: border-box;
          transition: all 0.15s ease;
        }

        .modal-input:focus {
          border-color: rgba(245, 158, 11, 0.6);
          background: rgba(0, 0, 0, 0.3);
        }

        .modal-textarea {
          width: 100%;
          padding: 0.65rem 0.85rem;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-size: 0.78rem;
          outline: none;
          resize: none;
          box-sizing: border-box;
          line-height: 1.5;
        }

        .modal-textarea:focus {
          border-color: rgba(245, 158, 11, 0.6);
          background: rgba(0, 0, 0, 0.3);
        }

        .submit-section {
          padding-top: 0.35rem;
        }

        .submit-inquiry-btn {
          width: 100%;
          padding: 0.8rem 1.25rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border: none;
          color: #07070d;
          font-weight: 600;
          font-size: 0.82rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 10px 25px rgba(245, 158, 11, 0.2);
          transition: all 0.2s ease;
        }

        .submit-inquiry-btn:hover {
          filter: brightness(1.06);
          transform: translateY(-1px);
        }

        .submit-inquiry-btn:active {
          transform: scale(0.99);
        }

        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid #000000;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .footer-notice {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.68rem;
          color: rgba(255, 255, 255, 0.4);
          padding-top: 0.25rem;
        }

        .security-notice {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .ref-tag {
          font-family: var(--font-mono);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
          .input-row-two {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
