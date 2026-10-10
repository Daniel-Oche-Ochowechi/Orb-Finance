'use client';

import React, { useState } from 'react';
import { ArrowRight, Lock, Sparkles, Mail, Check, ShieldCheck } from 'lucide-react';
import EmailModal from './EmailModal';
import ClassyConfetti from './ClassyConfetti';

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
    }, 700);
  };

  const handleReset = () => {
    setFullName('');
    setEmail('');
    setRole('Bank');
    setIsSuccess(false);
  };

  const passId = `ORB-${role.slice(0, 3).toUpperCase()}-${Math.floor(1000 + (fullName.length * 137) % 9000)}`;

  return (
    <section className="page-section early-access-root" id="early-access">
      <div className="container">
        <div className="access-card-frame glass-surface">
          {/* Confetti Celebration on Confirmation */}
          {isSuccess && <ClassyConfetti duration={4800} />}

          {/* Ambient Glow Aura */}
          <div className="access-aura-light" aria-hidden="true" />

          <div className="access-layout-split">
            {/* Left Column: Context & Perks */}
            <div className="access-narrative-col">
              <div className="access-status-eyebrow">
                <span className="amber-glow-dot" />
                <span>Opening 15 January 2027</span>
              </div>
              
              <h2 className="access-main-title">
                Reserve your place <br />
                <span className="italic-accent gradient-shimmer">in orbit.</span>
              </h2>
              
              <p className="access-sub-text">
                Join the list and we will write to you before launch with your access details.
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
                <Lock size={14} className="lock-glyph" />
                <span>Discreet by design. We will only write to you about Orb Finance.</span>
              </div>
            </div>

            {/* Right Column: Interactive Form / Classy Confirmation */}
            <div className="access-form-col">
              {!isSuccess ? (
                <form className="waitlist-interactive-form" onSubmit={handleSubmit} noValidate>
                  <div className="input-group">
                    <label htmlFor="form-fullname" className="input-label">Full name</label>
                    <input
                      id="form-fullname"
                      type="text"
                      className={`text-field ${nameError ? 'input-invalid' : ''}`}
                      placeholder="Adebayo Adeleke"
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
                      placeholder="adebayo@institution.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError(false);
                      }}
                      autoComplete="email"
                    />
                    {emailError && (
                      <span className="error-message">Please enter a valid work email.</span>
                    )}
                  </div>

                  {/* 🍎 Apple-Grade Line Selector */}
                  <div className="input-group">
                    <label className="input-label">I am joining as</label>
                    <div className="apple-line-list" role="radiogroup" aria-label="I am joining as">
                      {ROLES.map((r) => {
                        const isSelected = role === r.id;
                        return (
                          <button
                            type="button"
                            key={r.id}
                            role="radio"
                            aria-checked={isSelected}
                            className={`apple-line-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => setRole(r.id)}
                          >
                            <span className="apple-line-text">{r.label}</span>
                            <span className="apple-line-check-slot">
                              {isSelected && (
                                <Check size={14} strokeWidth={2.6} className="apple-check-glyph" />
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {generalError && (
                    <div className="general-error-box">
                      Something went wrong. Please try again.
                    </div>
                  )}

                  <button
                    type="submit"
                    className="submit-cta-pill"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="spinner-wrapper">
                        <span className="spinner-orbit" />
                        <span>Securing your spot...</span>
                      </div>
                    ) : (
                      <>
                        <span>Request early access</span>
                        <span className="cta-arrow-circle">
                          <ArrowRight size={15} strokeWidth={2.5} />
                        </span>
                      </>
                    )}
                  </button>

                  <div className="mobile-form-privacy">
                    <Lock size={12} />
                    <span>Discreet by design • No spam, ever</span>
                  </div>
                </form>
              ) : (
                /* Classy, Modern Orbit Confirmation State */
                <div className="success-orbit-view">
                  <div className="success-icon-badge">
                    <div className="badge-halo" aria-hidden="true" />
                    <div className="badge-ring">
                      <Check size={26} strokeWidth={3} className="text-emerald" />
                    </div>
                  </div>

                  <div className="success-status-pill">
                    <Sparkles size={13} className="text-gold" />
                    <span>EARLY ACCESS CONFIRMED</span>
                  </div>

                  <h3 className="success-statement-title">
                    You are in <span className="italic-accent gradient-shimmer">orbit.</span>
                  </h3>
                  
                  <p className="success-body-message">
                    Thank you, <strong className="text-white">{fullName}</strong>. Your reservation is confirmed for our launch on <strong>15 January 2027</strong>.
                  </p>

                  {/* VIP Access Pass */}
                  <div className="vip-access-pass">
                    <div className="pass-specular-sheen" aria-hidden="true" />
                    
                    <div className="vip-pass-top">
                      <div className="pass-brand">
                        <span className="amber-glow-dot" />
                        <span className="pass-brand-text">Orb Finance</span>
                      </div>
                      <div className="pass-tier-badge">
                        <span>{role}</span>
                        <span className="pass-code-mono">{passId}</span>
                      </div>
                    </div>

                    <div className="vip-pass-grid">
                      <div className="pass-cell">
                        <span className="cell-label">MEMBER NAME</span>
                        <span className="cell-value truncate">{fullName}</span>
                      </div>
                      <div className="pass-cell">
                        <span className="cell-label">REGISTERED EMAIL</span>
                        <span className="cell-value truncate">{email}</span>
                      </div>
                      <div className="pass-cell">
                        <span className="cell-label">LAUNCH DATE</span>
                        <span className="cell-value text-gold">15 January 2027</span>
                      </div>
                      <div className="pass-cell">
                        <span className="cell-label">PROTOCOL ACCESS</span>
                        <span className="cell-value text-emerald flex items-center gap-1">
                          <ShieldCheck size={14} /> Priority Queue
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="success-actions-row">
                    <button
                      className="preview-email-btn"
                      onClick={() => setShowEmailModal(true)}
                    >
                      <Mail size={15} strokeWidth={2} />
                      <span>Preview Confirmation Email</span>
                    </button>
                    <button
                      className="reset-ghost-btn"
                      onClick={handleReset}
                    >
                      <span>Submit another inquiry</span>
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
          background: linear-gradient(145deg, rgba(22, 22, 34, 0.9) 0%, rgba(12, 12, 20, 0.95) 100%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 28px;
          padding: 3.5rem 3.5rem;
          overflow: hidden;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.2);
        }

        .access-aura-light {
          position: absolute;
          top: -30%;
          right: 15%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(167, 139, 250, 0.18) 0%, rgba(245, 158, 11, 0.1) 40%, transparent 70%);
          filter: blur(65px);
          pointer-events: none;
        }

        .access-layout-split {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 3.5rem;
          position: relative;
          z-index: 2;
          align-items: center;
        }

        .access-status-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 1.25rem;
        }

        .amber-glow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 8px #f59e0b;
        }

        .access-main-title {
          font-size: clamp(2.3rem, 4vw, 3.2rem);
          line-height: 1.12;
          letter-spacing: -0.035em;
          margin-bottom: 1.15rem;
        }

        .access-sub-text {
          font-size: 1.05rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.65);
          margin-bottom: 2rem;
        }

        .perks-cluster {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-bottom: 2rem;
        }

        .perks-heading {
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 0.25rem;
        }

        .perk-entry {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          font-size: 0.92rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
        }

        .perk-entry strong {
          color: #ffffff;
        }

        .perk-bullet {
          color: #f59e0b;
          font-size: 0.85rem;
          margin-top: 0.1rem;
        }

        .discreet-guarantee {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.45);
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .lock-glyph {
          color: rgba(255, 255, 255, 0.45);
          flex-shrink: 0;
        }

        .access-form-col {
          background: rgba(14, 14, 22, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 22px;
          padding: 2.25rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);
        }

        .input-group {
          margin-bottom: 1.25rem;
        }

        .input-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 0.4rem;
        }

        .text-field {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 0.85rem 1.15rem;
          font-family: var(--font-sans);
          font-size: 0.95rem;
          color: #ffffff;
          outline: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .text-field:focus {
          border-color: rgba(192, 132, 252, 0.7);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 4px rgba(192, 132, 252, 0.18);
        }

        .text-field.input-invalid {
          border-color: #fb7185;
          box-shadow: 0 0 0 4px rgba(251, 113, 133, 0.15);
        }

        .error-message {
          display: block;
          font-size: 0.75rem;
          color: #fb7185;
          margin-top: 0.25rem;
        }

        /* 🍎 Apple-Grade Clean Line Selector */
        .apple-line-list {
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          overflow: hidden;
        }

        .apple-line-item {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0.72rem 0.65rem;
          font-family: var(--font-sans);
          font-size: 0.92rem;
          color: rgba(255, 255, 255, 0.65);
          cursor: pointer;
          transition: background-color 0.18s ease, color 0.18s ease;
          text-align: left;
        }

        .apple-line-item:last-child {
          border-bottom: none;
        }

        .apple-line-item:hover {
          background: rgba(255, 255, 255, 0.045);
          color: rgba(255, 255, 255, 0.92);
        }

        .apple-line-item.selected {
          color: #ffffff;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.06);
        }

        .apple-line-text {
          letter-spacing: -0.01em;
        }

        .apple-line-check-slot {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        :global(.apple-check-glyph) {
          color: #f59e0b;
          animation: checkPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes checkPop {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .general-error-box {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
          padding: 0.75rem;
          border-radius: 12px;
          font-size: 0.82rem;
          margin-bottom: 1rem;
        }

        .submit-cta-pill {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          background: #ffffff;
          color: #000000;
          border: none;
          border-radius: 9999px;
          padding: 0.45rem 0.55rem 0.45rem 1.6rem;
          font-family: var(--font-sans);
          font-size: 0.96rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 0.5rem;
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .submit-cta-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(255, 255, 255, 0.38);
        }

        .submit-cta-pill:active {
          transform: scale(0.985);
        }

        .cta-arrow-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #000000;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, background-color 0.2s ease;
        }

        .submit-cta-pill:hover .cta-arrow-circle {
          transform: translateX(3px);
          background: #7c3aed;
        }

        .spinner-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.45rem 0;
          font-size: 0.85rem;
        }

        .spinner-orbit {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: #000000;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .mobile-form-privacy {
          display: none;
        }

        /* Success Orbit View */
        .success-orbit-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1.5rem 0.5rem;
          animation: fadeIn 0.4s ease;
        }

        .success-icon-badge {
          position: relative;
          margin-bottom: 1.25rem;
        }

        .badge-halo {
          position: absolute;
          inset: -10px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(10px);
        }

        .badge-ring {
          position: relative;
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%);
          border: 1.5px solid rgba(16, 185, 129, 0.5);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .text-emerald {
          color: #34d399;
        }

        .text-gold {
          color: #fbbf24;
        }

        .success-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #f59e0b;
          margin-bottom: 0.5rem;
        }

        .success-statement-title {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          margin-bottom: 0.6rem;
        }

        .success-body-message {
          font-size: 0.98rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.65);
          margin-bottom: 1.75rem;
        }

        /* VIP Access Pass */
        .vip-access-pass {
          width: 100%;
          background: linear-gradient(145deg, rgba(28, 28, 42, 0.9) 0%, rgba(14, 14, 22, 0.95) 100%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 1.75rem;
          text-align: left;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
        }

        .pass-specular-sheen {
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.04) 50%, transparent 60%);
          pointer-events: none;
        }

        .vip-pass-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 0.85rem;
          margin-bottom: 1.15rem;
        }

        .pass-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pass-brand-text {
          font-size: 0.85rem;
          font-weight: 700;
          color: #ffffff;
        }

        .pass-tier-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pass-tier-badge span:first-child {
          font-size: 0.7rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.2rem 0.55rem;
          border-radius: 9999px;
          color: #ffffff;
        }

        .pass-code-mono {
          font-family: monospace;
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.45);
        }

        .vip-pass-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.15rem;
        }

        .pass-cell {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          min-width: 0;
        }

        .cell-label {
          font-size: 0.62rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 0.06em;
        }

        .cell-value {
          font-size: 0.92rem;
          font-weight: 600;
          color: #ffffff;
        }

        .success-actions-row {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
        }

        .preview-email-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 9999px;
          padding: 0.7rem 1.35rem;
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .preview-email-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .reset-ghost-btn {
          background: transparent;
          color: rgba(255, 255, 255, 0.55);
          border: none;
          padding: 0.7rem 1.1rem;
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .reset-ghost-btn:hover {
          color: #ffffff;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* 📱 RESPONSIVE & MOBILE DESIGN */
        @media (max-width: 992px) {
          .access-layout-split {
            grid-template-columns: 1fr;
            gap: 2.25rem;
          }
          .access-card-frame {
            padding: 2rem 1.35rem;
            border-radius: 22px;
          }
        }

        @media (max-width: 768px) {
          .access-main-title {
            font-size: 1.85rem;
            margin-bottom: 0.5rem;
          }
          
          .access-sub-text {
            font-size: 0.92rem;
            margin-bottom: 1.25rem;
          }

          /* Hide repetitive perks cluster on mobile for a clean, fast experience */
          .perks-cluster,
          .discreet-guarantee {
            display: none;
          }

          .access-form-col {
            padding: 1.35rem 1.15rem;
            border-radius: 18px;
          }

          .text-field {
            font-size: 16px; /* Prevents auto zoom */
            padding: 0.85rem 1rem;
          }

          .apple-line-item {
            padding: 0.65rem 0.45rem;
            font-size: 0.88rem;
          }

          .submit-cta-pill {
            font-size: 0.96rem;
            padding: 0.45rem 0.55rem 0.45rem 1.35rem;
          }

          .mobile-form-privacy {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.45rem;
            font-size: 0.74rem;
            color: rgba(255, 255, 255, 0.45);
            margin-top: 0.85rem;
          }

          .vip-pass-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .success-actions-row {
            flex-direction: column;
          }

          .preview-email-btn,
          .reset-ghost-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
