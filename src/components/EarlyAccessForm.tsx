'use client';

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Lock, Sparkles, Mail } from 'lucide-react';
import EmailModal from './EmailModal';

const ROLES = [
  { id: 'Bank', label: 'Bank' },
  { id: 'Fintech or payments company', label: 'Fintech / Payments' },
  { id: 'Business', label: 'Business' },
  { id: 'Individual', label: 'Individual' },
];

export default function EarlyAccessForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Bank');

  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [generalError, setGeneralError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(false);
    setEmailError(false);
    setGeneralError(false);

    let hasErr = false;

    if (!fullName.trim()) {
      setNameError(true);
      hasErr = true;
    }

    if (!email.trim() || !validateEmail(email)) {
      setEmailError(true);
      hasErr = true;
    }

    if (hasErr) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 850);
  };

  const handleReset = () => {
    setFullName('');
    setEmail('');
    setRole('Bank');
    setIsSuccess(false);
  };

  return (
    <section className="page-section early-access-root" id="early-access">
      <div className="container">
        <div className="access-card-frame glass-surface">
          {/* Ambient Glow Aura */}
          <div className="access-aura-light" aria-hidden="true" />

          <div className="access-layout-split">
            {/* Left Column: Context & Perks */}
            <div className="access-narrative-col">
              <span className="section-label">EARLY ACCESS</span>
              <h2 className="access-main-title">
                Reserve your place <br />
                <span className="italic-accent gradient-shimmer">in orbit.</span>
              </h2>
              <p className="access-sub-text">
                Orb opens on <strong>15 January 2027</strong>. Join the list and we will write to you before launch with your access details.
              </p>

              <div className="perks-cluster">
                <h4 className="perks-heading font-mono">What early access means</h4>
                <div className="perk-entry">
                  <span className="perk-bullet">✦</span>
                  <p><strong>First in line.</strong> Connect as soon as we open.</p>
                </div>
                <div className="perk-entry">
                  <span className="perk-bullet">✦</span>
                  <p><strong>Sandbox access.</strong> Build and test ahead of launch.</p>
                </div>
                <div className="perk-entry">
                  <span className="perk-bullet">✦</span>
                  <p><strong>A direct line to our team.</strong> Discuss integration and pricing before the doors open.</p>
                </div>
              </div>

              <div className="discreet-guarantee">
                <Lock size={15} className="lock-glyph" />
                <span>Discreet by design. We will only write to you about Orb Finance.</span>
              </div>
            </div>

            {/* Right Column: Stateful Form / Ticket Generation */}
            <div className="access-form-col">
              {!isSuccess ? (
                <form className="waitlist-interactive-form" onSubmit={handleSubmit} noValidate>
                  <div className="input-group">
                    <label htmlFor="form-fullname" className="input-label">Full name</label>
                    <input
                      id="form-fullname"
                      type="text"
                      className={`text-field ${nameError ? 'input-invalid' : ''}`}
                      placeholder="e.g. Adebayo Adeleke"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (nameError) setNameError(false);
                      }}
                      autoComplete="name"
                    />
                    {nameError && (
                      <span className="error-message">Please enter your full name.</span>
                    )}
                  </div>

                  <div className="input-group">
                    <label htmlFor="form-email" className="input-label">Work email address</label>
                    <input
                      id="form-email"
                      type="email"
                      className={`text-field ${emailError ? 'input-invalid' : ''}`}
                      placeholder="e.g. adebayo@institution.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError(false);
                      }}
                      autoComplete="email"
                    />
                    {emailError && (
                      <span className="error-message">Please enter a valid email address.</span>
                    )}
                  </div>

                  <div className="input-group">
                    <label className="input-label">I am joining as:</label>
                    <div className="role-options-grid">
                      {ROLES.map((r) => (
                        <button
                          type="button"
                          key={r.id}
                          className={`role-select-btn ${role === r.id ? 'active' : ''}`}
                          onClick={() => setRole(r.id)}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {generalError && (
                    <div className="general-error-box">
                      Something went wrong. Please try again.
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary w-full submit-cta-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="spinner-orbit" />
                    ) : (
                      <>
                        <span>Request early access</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Success Orbit State */
                <div className="success-orbit-view">
                  <div className="success-icon-badge">
                    <CheckCircle2 size={36} className="text-emerald" />
                  </div>
                  <h3 className="success-statement-title">You are in orbit.</h3>
                  <p className="success-body-message">
                    Thank you, <strong className="text-white">{fullName}</strong>. We will be in touch before launch with your early access details.
                  </p>

                  <div className="ticket-summary-box">
                    <div className="summary-line">
                      <span className="summary-k font-mono">REGISTRATION:</span>
                      <span className="summary-v">{email}</span>
                    </div>
                    <div className="summary-line">
                      <span className="summary-k font-mono">CATEGORY:</span>
                      <span className="summary-v">{role}</span>
                    </div>
                    <div className="summary-line">
                      <span className="summary-k font-mono">LAUNCH DATE:</span>
                      <span className="summary-v text-gold font-mono">15 January 2027</span>
                    </div>
                  </div>

                  <div className="success-actions-row">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowEmailModal(true)}
                    >
                      <Mail size={15} />
                      <span>Preview Confirmation Email</span>
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={handleReset}
                    >
                      <span>Submit Another Inquiry</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        userName={fullName}
        userEmail={email}
      />

      <style jsx>{`
        .access-card-frame {
          position: relative;
          background: linear-gradient(135deg, rgba(147, 51, 234, 0.12), rgba(245, 158, 11, 0.08));
          border-radius: var(--radius-xl);
          padding: 4rem;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
        }

        .access-aura-light {
          position: absolute;
          top: -40%;
          left: 20%;
          width: 550px;
          height: 550px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
        }

        .access-layout-split {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 4rem;
          position: relative;
          z-index: 2;
        }

        .access-main-title {
          font-size: clamp(2.4rem, 4vw, 3.4rem);
          line-height: 1.1;
          margin-bottom: 1.25rem;
        }

        .access-sub-text {
          font-size: 1.15rem;
          line-height: 1.65;
          margin-bottom: 2rem;
        }

        .perks-cluster {
          margin-bottom: 2rem;
        }

        .perks-heading {
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .perk-entry {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.85rem;
          font-size: 0.96rem;
          color: var(--text-secondary);
        }

        .perk-entry strong {
          color: var(--text-primary);
        }

        .perk-bullet {
          color: var(--aurora-gold);
        }

        .discreet-guarantee {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.82rem;
          color: var(--text-muted);
          padding-top: 1.5rem;
          border-top: 1px solid var(--glass-border);
        }

        .lock-glyph {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .access-form-col {
          background: rgba(13, 13, 23, 0.75);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          padding: 2.5rem;
        }

        html.light-mode .access-form-col {
          background: rgba(255, 255, 255, 0.9);
        }

        .input-group {
          margin-bottom: 1.4rem;
        }

        .input-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.45rem;
        }

        .text-field {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 0.9rem 1.25rem;
          font-family: var(--font-sans);
          font-size: 0.95rem;
          color: var(--text-primary);
          outline: none;
          transition: all 0.2s ease;
        }

        html.light-mode .text-field {
          background: rgba(0, 0, 0, 0.03);
        }

        .text-field:focus {
          border-color: var(--aurora-violet);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
        }

        .text-field.input-invalid {
          border-color: #fb7185;
        }

        .error-message {
          display: block;
          font-size: 0.78rem;
          color: #fb7185;
          margin-top: 0.35rem;
        }

        .role-options-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.6rem;
        }

        .role-select-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          padding: 0.65rem 0.5rem;
          font-family: var(--font-sans);
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .role-select-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.08);
        }

        .role-select-btn.active {
          background: rgba(139, 92, 246, 0.2);
          border-color: var(--aurora-violet);
          color: #ffffff;
          box-shadow: 0 0 12px rgba(139, 92, 246, 0.3);
        }

        .general-error-box {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #fca5a5;
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
        }

        .submit-cta-btn {
          padding: 0.95rem;
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        .spinner-orbit {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .w-full {
          width: 100%;
        }

        /* Success View */
        .success-orbit-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1.5rem 0;
        }

        .success-icon-badge {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .success-statement-title {
          font-size: 1.85rem;
          margin-bottom: 0.75rem;
        }

        .success-body-message {
          font-size: 1.05rem;
          line-height: 1.6;
          margin-bottom: 1.75rem;
        }

        .ticket-summary-box {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          margin-bottom: 1.75rem;
          text-align: left;
        }

        .summary-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
        }

        .summary-line:last-child {
          margin-bottom: 0;
        }

        .summary-k {
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .summary-v {
          font-weight: 600;
          color: var(--text-primary);
        }

        .text-gold {
          color: var(--aurora-gold);
        }

        .success-actions-row {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 992px) {
          .access-layout-split {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .access-card-frame {
            padding: 2.5rem 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}
