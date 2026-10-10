'use client';

import React, { useState, useEffect } from 'react';
import { useEarlyAccess } from '@/context/EarlyAccessContext';
import { X, Check, Lock, Mail, ArrowRight, Shield } from 'lucide-react';
import EmailModal from './EmailModal';

const ROLES = [
  { id: 'Bank', label: 'Bank' },
  { id: 'Fintech or payments company', label: 'Fintech / Payments' },
  { id: 'Business', label: 'Business' },
  { id: 'Individual', label: 'Individual' },
];

export default function EarlyAccessModal() {
  const { isOpen, initialRole, closeEarlyAccess } = useEarlyAccess();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Bank');

  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [generalError, setGeneralError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeEarlyAccess();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeEarlyAccess]);

  if (!isOpen) return null;

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

  return (
    <div className="apple-modal-scrim" onClick={closeEarlyAccess}>
      <div
        className="apple-sheet-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="apple-modal-title"
      >
        {/* Soft Ambient Apple Diffusion Light */}
        <div className="apple-specular-light" aria-hidden="true" />

        {/* Minimalist Apple Glass Dismiss Button */}
        <button
          className="apple-dismiss-btn"
          onClick={closeEarlyAccess}
          aria-label="Close"
        >
          <X size={15} strokeWidth={2.5} />
        </button>

        {!isSuccess ? (
          <div className="apple-sheet-layout">
            {/* Left Narrative Column */}
            <div className="apple-narrative-panel">
              <div className="apple-status-eyebrow">
                <span className="apple-amber-dot" />
                <span>Opening 15 January 2027</span>
              </div>

              <h2 id="apple-modal-title" className="apple-headline">
                Reserve your place <br />
                <span className="italic-accent apple-gradient-text">in orbit.</span>
              </h2>

              <p className="apple-subhead">
                Join the list and we will write to you before launch with your access details.
              </p>

              {/* What early access means list */}
              <div className="apple-perks-group">
                <h4 className="apple-perks-title">What early access means</h4>
                <div className="apple-perk-item">
                  <span className="apple-perk-bullet">✦</span>
                  <p><strong>First in line.</strong> Connect as soon as we open.</p>
                </div>
                <div className="apple-perk-item">
                  <span className="apple-perk-bullet">✦</span>
                  <p><strong>Sandbox access.</strong> Build and test ahead of launch.</p>
                </div>
                <div className="apple-perk-item">
                  <span className="apple-perk-bullet">✦</span>
                  <p><strong>A direct line to our team.</strong> Discuss integration and pricing before the doors open.</p>
                </div>
              </div>

              {/* Discreet Privacy Note */}
              <div className="apple-privacy-guarantee">
                <Lock size={13} strokeWidth={2} className="apple-lock-icon" />
                <span>Discreet by design. We will only write to you about Orb Finance.</span>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="apple-form-panel">
              <form onSubmit={handleSubmit} noValidate className="apple-form-stack">
                {/* Full Name */}
                <div className="apple-input-container">
                  <label htmlFor="apple-name" className="apple-label">
                    Full name
                  </label>
                  <input
                    id="apple-name"
                    type="text"
                    className={`apple-input-field ${nameError ? 'apple-field-error' : ''}`}
                    placeholder="Adebayo Adeleke"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (nameError) setNameError(false);
                    }}
                    autoComplete="name"
                    autoFocus
                  />
                  {nameError && (
                    <span className="apple-error-text">Please enter your full name.</span>
                  )}
                </div>

                {/* Email Address */}
                <div className="apple-input-container">
                  <label htmlFor="apple-email" className="apple-label">
                    Work email address
                  </label>
                  <input
                    id="apple-email"
                    type="email"
                    className={`apple-input-field ${emailError ? 'apple-field-error' : ''}`}
                    placeholder="adebayo@institution.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(false);
                    }}
                    autoComplete="email"
                  />
                  {emailError && (
                    <span className="apple-error-text">Please enter a valid email address.</span>
                  )}
                </div>

                {/* Segmented Apple Role Selector */}
                <div className="apple-input-container">
                  <label className="apple-label">I am joining as:</label>
                  <div className="apple-segmented-grid">
                    {ROLES.map((r) => (
                      <button
                        type="button"
                        key={r.id}
                        className={`apple-segment-pill ${role === r.id ? 'is-active' : ''}`}
                        onClick={() => setRole(r.id)}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {generalError && (
                  <div className="apple-general-error">
                    Something went wrong. Please try again.
                  </div>
                )}

                {/* Apple Iconic Pill CTA */}
                <button
                  type="submit"
                  className="apple-primary-cta"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="apple-spinner-wrap">
                      <span className="apple-spinner-ring" />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <>
                      <span>Request early access</span>
                      <span className="apple-cta-arrow">
                        <ArrowRight size={15} strokeWidth={2.5} />
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Apple Wallet / VIP Pass Success View */
          <div className="apple-success-view">
            <div className="apple-pass-icon-badge">
              <div className="apple-check-ring">
                <Check size={28} strokeWidth={3} className="text-emerald" />
              </div>
            </div>

            <h3 className="apple-success-title">You are in orbit.</h3>
            <p className="apple-success-sub">
              Thank you, <strong className="text-white">{fullName}</strong>. We will be in touch before launch with your early access details.
            </p>

            {/* Apple Wallet Style Access Pass */}
            <div className="apple-wallet-pass">
              <div className="pass-specular-glare" aria-hidden="true" />
              
              <div className="wallet-pass-header">
                <div className="wallet-brand">
                  <span className="wallet-brand-symbol" />
                  <span className="wallet-brand-name">Orb Finance</span>
                </div>
                <span className="wallet-pass-tier">{role}</span>
              </div>

              <div className="wallet-pass-body">
                <div className="wallet-info-item">
                  <span className="wallet-label">MEMBER</span>
                  <span className="wallet-value">{fullName}</span>
                </div>
                <div className="wallet-info-item">
                  <span className="wallet-label">EMAIL</span>
                  <span className="wallet-value">{email}</span>
                </div>
                <div className="wallet-info-item">
                  <span className="wallet-label">ACCESS DATE</span>
                  <span className="wallet-value text-gold">15 January 2027</span>
                </div>
                <div className="wallet-info-item">
                  <span className="wallet-label">STATUS</span>
                  <span className="wallet-value text-emerald">Confirmed</span>
                </div>
              </div>
            </div>

            <div className="apple-success-actions">
              <button
                className="apple-secondary-btn"
                onClick={() => setShowEmailModal(true)}
              >
                <Mail size={15} strokeWidth={2} />
                <span>Preview Confirmation Email</span>
              </button>
              <button
                className="apple-ghost-btn"
                onClick={handleReset}
              >
                <span>Submit another inquiry</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        userName={fullName}
        userEmail={email}
      />

      <style jsx>{`
        .apple-modal-scrim {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: appleFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .apple-sheet-card {
          position: relative;
          background: rgba(18, 18, 26, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 28px;
          max-width: 920px;
          width: 100%;
          box-shadow: 0 35px 80px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.2);
          overflow: hidden;
          animation: appleCardPop 0.32s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .apple-specular-light {
          position: absolute;
          top: -20%;
          right: 5%;
          width: 500px;
          height: 500px;
          background: radial-gradient(
            circle,
            rgba(167, 139, 250, 0.22) 0%,
            rgba(245, 158, 11, 0.12) 35%,
            transparent 70%
          );
          filter: blur(60px);
          pointer-events: none;
        }

        .apple-dismiss-btn {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .apple-dismiss-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.18);
          transform: scale(1.05);
        }

        .apple-sheet-layout {
          display: grid;
          grid-template-columns: 1.15fr 1.25fr;
          position: relative;
          z-index: 2;
        }

        /* Left Panel */
        .apple-narrative-panel {
          padding: 3.5rem 3rem;
          background: rgba(255, 255, 255, 0.015);
          border-right: 1px solid rgba(255, 255, 255, 0.07);
          display: flex;
          flex-direction: column;
        }

        .apple-status-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 1.25rem;
          letter-spacing: -0.01em;
        }

        .apple-amber-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 8px #f59e0b;
        }

        .apple-headline {
          font-size: 2.35rem;
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1.1;
          margin-bottom: 1rem;
        }

        .apple-gradient-text {
          background: linear-gradient(135deg, #ffffff 20%, #c084fc 65%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .apple-subhead {
          font-size: 1.02rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.65);
          margin-bottom: 2.2rem;
        }

        .apple-perks-group {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-bottom: 2rem;
        }

        .apple-perks-title {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 0.3rem;
        }

        .apple-perk-item {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          font-size: 0.92rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
        }

        .apple-perk-item strong {
          color: #ffffff;
        }

        .apple-perk-bullet {
          color: #f59e0b;
          font-size: 0.85rem;
          margin-top: 0.1rem;
        }

        .apple-privacy-guarantee {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.45);
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          margin-top: auto;
        }

        .apple-lock-icon {
          color: rgba(255, 255, 255, 0.45);
          flex-shrink: 0;
        }

        /* Right Form Panel */
        .apple-form-panel {
          padding: 3.5rem 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .apple-form-stack {
          display: flex;
          flex-direction: column;
          gap: 1.35rem;
        }

        .apple-input-container {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .apple-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          letter-spacing: -0.01em;
        }

        .apple-input-field {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 14px;
          padding: 0.85rem 1.15rem;
          font-family: var(--font-sans);
          font-size: 0.96rem;
          color: #ffffff;
          outline: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .apple-input-field::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }

        .apple-input-field:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(167, 139, 250, 0.6);
          box-shadow: 0 0 0 4px rgba(167, 139, 250, 0.18);
        }

        .apple-input-field.apple-field-error {
          border-color: #fb7185;
        }

        .apple-error-text {
          font-size: 0.75rem;
          color: #fb7185;
          margin-top: 0.2rem;
        }

        /* Apple Liquid Segmented Control */
        .apple-segmented-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          background: rgba(0, 0, 0, 0.25);
          padding: 0.35rem;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.07);
        }

        .apple-segment-pill {
          background: transparent;
          border: none;
          border-radius: 12px;
          padding: 0.65rem 0.5rem;
          font-family: var(--font-sans);
          font-size: 0.82rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: center;
        }

        .apple-segment-pill:hover {
          color: #ffffff;
        }

        .apple-segment-pill.is-active {
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2);
        }

        .apple-general-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.82rem;
        }

        /* Apple Iconic Pill Button */
        .apple-primary-cta {
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

        .apple-primary-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(255, 255, 255, 0.35);
        }

        .apple-primary-cta:active {
          transform: scale(0.985);
        }

        .apple-cta-arrow {
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

        .apple-primary-cta:hover .apple-cta-arrow {
          transform: translateX(3px);
          background: #7c3aed;
        }

        .apple-spinner-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.45rem 0;
          font-size: 0.85rem;
        }

        .apple-spinner-ring {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: #000000;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Apple Success View */
        .apple-success-view {
          padding: 4.5rem 3.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .apple-pass-icon-badge {
          margin-bottom: 1.5rem;
        }

        .apple-check-ring {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: scaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .apple-success-title {
          font-size: 2.3rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          margin-bottom: 0.65rem;
        }

        .apple-success-sub {
          font-size: 1.05rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.65);
          max-width: 520px;
          margin-bottom: 2.2rem;
        }

        /* Apple Wallet Access Pass Card */
        .apple-wallet-pass {
          width: 100%;
          max-width: 540px;
          background: linear-gradient(145deg, rgba(28, 28, 40, 0.9), rgba(16, 16, 24, 0.95));
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 20px;
          padding: 1.6rem;
          margin-bottom: 2.2rem;
          text-align: left;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
        }

        .wallet-pass-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 0.85rem;
          margin-bottom: 1.25rem;
        }

        .wallet-brand {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .wallet-brand-symbol {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 8px #f59e0b;
        }

        .wallet-brand-name {
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .wallet-pass-tier {
          font-size: 0.72rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.08);
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
          color: #ffffff;
        }

        .wallet-pass-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .wallet-info-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .wallet-label {
          font-size: 0.65rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 0.06em;
        }

        .wallet-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: #ffffff;
        }

        .text-gold {
          color: #f59e0b;
        }

        .text-emerald {
          color: #34d399;
        }

        .apple-success-actions {
          display: flex;
          gap: 0.85rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .apple-secondary-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
          padding: 0.65rem 1.35rem;
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .apple-secondary-btn:hover {
          background: rgba(255, 255, 255, 0.14);
          transform: translateY(-1px);
        }

        .apple-ghost-btn {
          background: transparent;
          color: rgba(255, 255, 255, 0.55);
          border: none;
          padding: 0.65rem 1.2rem;
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .apple-ghost-btn:hover {
          color: #ffffff;
        }

        @keyframes appleFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes appleCardPop {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes scaleUp {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 860px) {
          .apple-sheet-layout {
            grid-template-columns: 1fr;
          }
          .apple-narrative-panel {
            padding: 2.5rem 1.75rem 1.75rem 1.75rem;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          }
          .apple-form-panel {
            padding: 2rem 1.75rem 2.5rem 1.75rem;
          }
          .apple-success-view {
            padding: 3.5rem 1.75rem;
          }
          .wallet-pass-body {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
