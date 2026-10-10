'use client';

import React, { useState, useEffect } from 'react';
import { useEarlyAccess } from '@/context/EarlyAccessContext';
import { X, Check, Lock, Mail, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import EmailModal from './EmailModal';
import ClassyConfetti from './ClassyConfetti';

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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

  // Generate deterministic VIP pass code
  const passId = `ORB-${role.slice(0, 3).toUpperCase()}-${Math.floor(1000 + (fullName.length * 137) % 9000)}`;

  return (
    <div className="apple-modal-scrim" onClick={closeEarlyAccess}>
      <div
        className="apple-sheet-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="apple-modal-title"
      >
        {/* Confetti Celebration on Confirmation */}
        {isSuccess && <ClassyConfetti duration={4800} />}

        {/* Mobile Pull Handle Indicator */}
        <div className="mobile-handle-bar" aria-hidden="true" />

        {/* Soft Ambient Diffusion Glow */}
        <div className="apple-specular-light" aria-hidden="true" />

        {/* Minimalist Glass Dismiss Button */}
        <button
          className="apple-dismiss-btn"
          onClick={closeEarlyAccess}
          aria-label="Close modal"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {!isSuccess ? (
          <div className="apple-sheet-layout">
            {/* Left Narrative Column (Desktop rich context / simplified on mobile) */}
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

              {/* What early access means list (Hidden on mobile for simplicity) */}
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

              {/* Discreet Privacy Note (Desktop) */}
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
                    <span className="apple-error-text">Please enter a valid work email.</span>
                  )}
                </div>

                {/* Classy Line-Based Role Selector (No Boxes) */}
                <div className="apple-input-container">
                  <label className="apple-label">I am joining as:</label>
                  <div className="classy-line-group" role="radiogroup" aria-label="I am joining as">
                    {ROLES.map((r) => {
                      const isSelected = role === r.id;
                      return (
                        <button
                          type="button"
                          key={r.id}
                          role="radio"
                          aria-checked={isSelected}
                          className={`classy-line-row ${isSelected ? 'is-active' : ''}`}
                          onClick={() => setRole(r.id)}
                        >
                          <div className="line-row-left">
                            <span className="classy-line-radio">
                              <span className="radio-center-glow" />
                            </span>
                            <span className="line-row-title">{r.label}</span>
                          </div>
                          {isSelected && (
                            <span className="line-row-tag">
                              <span className="tag-sparkle">✦</span>
                              <span>Selected</span>
                            </span>
                          )}
                          <span className="line-bottom-indicator" />
                        </button>
                      );
                    })}
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
                      <span>Securing your spot...</span>
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

                {/* Compact Mobile Privacy Note */}
                <div className="mobile-privacy-compact">
                  <Lock size={12} strokeWidth={2} />
                  <span>Discreet by design • No spam, ever</span>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Modern, Classy, Smooth Confirmation Popup */
          <div className="apple-success-view">
            {/* Pulsing Glowing Checkmark Badge */}
            <div className="apple-pass-icon-badge">
              <div className="badge-pulse-glow" aria-hidden="true" />
              <div className="apple-check-ring">
                <Check size={26} strokeWidth={3} className="check-icon-svg" />
              </div>
            </div>

            <div className="success-eyebrow">
              <Sparkles size={13} className="sparkle-gold" />
              <span>EARLY ACCESS CONFIRMED</span>
            </div>

            <h3 className="apple-success-title">
              You are in <span className="italic-accent apple-gradient-text">orbit.</span>
            </h3>
            
            <p className="apple-success-sub">
              Thank you, <strong className="text-white">{fullName}</strong>. Your reservation is locked for our launch on <strong>15 January 2027</strong>.
            </p>

            {/* Luxury VIP Orbit Protocol Access Pass */}
            <div className="apple-wallet-pass">
              <div className="pass-specular-glare" aria-hidden="true" />
              <div className="pass-watermark-orb" aria-hidden="true" />
              
              <div className="wallet-pass-header">
                <div className="wallet-brand">
                  <span className="wallet-brand-symbol" />
                  <span className="wallet-brand-name">Orb Finance</span>
                </div>
                <div className="wallet-pass-badge-wrap">
                  <span className="wallet-pass-tier">{role}</span>
                  <span className="wallet-pass-code">{passId}</span>
                </div>
              </div>

              <div className="wallet-pass-body">
                <div className="wallet-info-item">
                  <span className="wallet-label">MEMBER NAME</span>
                  <span className="wallet-value truncate">{fullName}</span>
                </div>
                <div className="wallet-info-item">
                  <span className="wallet-label">REGISTERED EMAIL</span>
                  <span className="wallet-value truncate">{email}</span>
                </div>
                <div className="wallet-info-item">
                  <span className="wallet-label">LAUNCH DATE</span>
                  <span className="wallet-value text-gold">15 January 2027</span>
                </div>
                <div className="wallet-info-item">
                  <span className="wallet-label">PROTOCOL ACCESS</span>
                  <span className="wallet-value text-emerald flex items-center gap-1">
                    <ShieldCheck size={14} /> Priority Queue
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
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
          background: rgba(0, 0, 0, 0.76);
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
          background: linear-gradient(165deg, rgba(22, 22, 32, 0.95) 0%, rgba(12, 12, 18, 0.98) 100%);
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 28px;
          max-width: 900px;
          width: 100%;
          box-shadow: 0 35px 80px rgba(0, 0, 0, 0.85), 
                      0 0 0 1px rgba(255, 255, 255, 0.08), 
                      inset 0 1px 1px rgba(255, 255, 255, 0.25);
          overflow: hidden;
          animation: appleCardPop 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .apple-specular-light {
          position: absolute;
          top: -20%;
          right: 5%;
          width: 520px;
          height: 520px;
          background: radial-gradient(
            circle,
            rgba(192, 132, 252, 0.2) 0%,
            rgba(245, 158, 11, 0.12) 40%,
            transparent 70%
          );
          filter: blur(65px);
          pointer-events: none;
          z-index: 1;
        }

        .apple-dismiss-btn {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 10;
        }

        .apple-dismiss-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.06);
        }

        .apple-sheet-layout {
          display: grid;
          grid-template-columns: 1.12fr 1.28fr;
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
          gap: 1.25rem;
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
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 0.85rem 1.15rem;
          font-family: var(--font-sans);
          font-size: 0.96rem;
          color: #ffffff;
          outline: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .apple-input-field::placeholder {
          color: rgba(255, 255, 255, 0.28);
        }

        .apple-input-field:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(192, 132, 252, 0.7);
          box-shadow: 0 0 0 4px rgba(192, 132, 252, 0.18);
        }

        .apple-input-field.apple-field-error {
          border-color: #fb7185;
          box-shadow: 0 0 0 4px rgba(251, 113, 133, 0.15);
        }

        .apple-error-text {
          font-size: 0.75rem;
          color: #fb7185;
          margin-top: 0.2rem;
        }

        /* ✨ Classy Line-Based Role Selector (In lines, not boxes) */
        .classy-line-group {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          background: transparent;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 0.15rem;
        }

        .classy-line-row {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.68rem 0.3rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          position: relative;
          text-align: left;
          font-family: var(--font-sans);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .classy-line-row:hover {
          background: rgba(255, 255, 255, 0.03);
          padding-left: 0.55rem;
        }

        .line-row-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .classy-line-radio {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
        }

        .radio-center-glow {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 8px #f59e0b;
          opacity: 0;
          transform: scale(0);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .classy-line-row.is-active .classy-line-radio {
          border-color: #f59e0b;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
        }

        .classy-line-row.is-active .radio-center-glow {
          opacity: 1;
          transform: scale(1);
        }

        .line-row-title {
          font-size: 0.9rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: -0.01em;
          transition: color 0.2s ease, font-weight 0.2s ease;
        }

        .classy-line-row:hover .line-row-title {
          color: rgba(255, 255, 255, 0.9);
        }

        .classy-line-row.is-active .line-row-title {
          color: #ffffff;
          font-weight: 600;
        }

        .line-row-tag {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: #fbbf24;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          animation: tagFade 0.25s ease;
        }

        .tag-sparkle {
          color: #f59e0b;
          font-size: 0.75rem;
        }

        .line-bottom-indicator {
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 0%;
          height: 1.5px;
          background: linear-gradient(90deg, #f59e0b 0%, #c084fc 100%);
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
          transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .classy-line-row.is-active .line-bottom-indicator {
          width: 100%;
        }

        @keyframes tagFade {
          from { opacity: 0; transform: translateX(5px); }
          to { opacity: 1; transform: translateX(0); }
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
          box-shadow: 0 8px 30px rgba(255, 255, 255, 0.38);
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

        .mobile-privacy-compact {
          display: none;
        }

        /* Modern, Classy Success View */
        .apple-success-view {
          padding: 4rem 3.5rem 3.8rem 3.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          z-index: 2;
          animation: successEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .apple-pass-icon-badge {
          position: relative;
          margin-bottom: 1.25rem;
        }

        .badge-pulse-glow {
          position: absolute;
          inset: -12px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(10px);
          animation: pulseGlow 2.5s infinite ease-in-out;
        }

        .apple-check-ring {
          position: relative;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.12) 100%);
          border: 1.5px solid rgba(16, 185, 129, 0.5);
          box-shadow: 0 0 25px rgba(16, 185, 129, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: badgePop 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        :global(.check-icon-svg) {
          color: #34d399;
          filter: drop-shadow(0 0 8px rgba(52, 211, 153, 0.6));
        }

        .success-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #f59e0b;
          margin-bottom: 0.6rem;
        }

        :global(.sparkle-gold) {
          color: #fbbf24;
        }

        .apple-success-title {
          font-size: 2.35rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          margin-bottom: 0.65rem;
        }

        .apple-success-sub {
          font-size: 1.02rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.68);
          max-width: 520px;
          margin-bottom: 2rem;
        }

        /* Apple Wallet Access Pass Card */
        .apple-wallet-pass {
          width: 100%;
          max-width: 540px;
          background: linear-gradient(145deg, rgba(30, 30, 46, 0.9) 0%, rgba(16, 16, 26, 0.95) 100%);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 22px;
          padding: 1.75rem;
          margin-bottom: 2rem;
          text-align: left;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.55), 
                      0 0 0 1px rgba(192, 132, 252, 0.15),
                      inset 0 1px 1px rgba(255, 255, 255, 0.25);
          position: relative;
          overflow: hidden;
          animation: passSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }

        .pass-specular-glare {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 45%,
            rgba(255, 255, 255, 0.05) 50%,
            transparent 55%
          );
          pointer-events: none;
        }

        .pass-watermark-orb {
          position: absolute;
          right: -25px;
          bottom: -35px;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.04);
          background: radial-gradient(circle, rgba(167, 139, 250, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .wallet-pass-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.09);
          padding-bottom: 0.95rem;
          margin-bottom: 1.25rem;
        }

        .wallet-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .wallet-brand-symbol {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 10px #f59e0b;
        }

        .wallet-brand-name {
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: #ffffff;
        }

        .wallet-pass-badge-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .wallet-pass-tier {
          font-size: 0.72rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .wallet-pass-code {
          font-family: monospace;
          font-size: 0.68rem;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.05em;
        }

        .wallet-pass-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .wallet-info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
        }

        .wallet-label {
          font-size: 0.64rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.42);
          letter-spacing: 0.06em;
        }

        .wallet-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: #ffffff;
          word-break: break-word;
        }

        .text-gold {
          color: #fbbf24;
        }

        .text-emerald {
          color: #34d399;
        }

        .apple-success-actions {
          display: flex;
          gap: 0.85rem;
          flex-wrap: wrap;
          justify-content: center;
          animation: passSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }

        .apple-secondary-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 9999px;
          padding: 0.75rem 1.45rem;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .apple-secondary-btn:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.45);
        }

        .apple-ghost-btn {
          background: transparent;
          color: rgba(255, 255, 255, 0.55);
          border: none;
          padding: 0.75rem 1.2rem;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .apple-ghost-btn:hover {
          color: #ffffff;
        }

        .mobile-handle-bar {
          display: none;
        }

        @keyframes appleFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes appleCardPop {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes mobileSheetSlideUp {
          from {
            transform: translateY(100%);
            opacity: 0.4;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes successEntrance {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes badgePop {
          0% { transform: scale(0.4); opacity: 0; }
          70% { transform: scale(1.12); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes passSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.25); opacity: 0.8; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* 📱 RESPONSIVE & MOBILE OPTIMIZATIONS */
        @media (max-width: 768px) {
          .apple-modal-scrim {
            padding: 0;
            align-items: flex-end;
            justify-content: center;
            overflow: hidden;
          }

          .apple-sheet-card {
            border-radius: 26px 26px 0 0;
            max-height: 90dvh;
            width: 100vw;
            border-bottom: none;
            border-left: none;
            border-right: none;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            box-shadow: 0 -25px 70px rgba(0, 0, 0, 0.95), inset 0 1px 1px rgba(255, 255, 255, 0.25);
            animation: mobileSheetSlideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          .mobile-handle-bar {
            display: block;
            width: 42px;
            height: 5px;
            border-radius: 9999px;
            background: rgba(255, 255, 255, 0.28);
            margin: 0.75rem auto 0.15rem auto;
          }

          .apple-dismiss-btn {
            top: 0.85rem;
            right: 1.15rem;
            width: 36px;
            height: 36px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.14);
          }

          .apple-sheet-layout {
            grid-template-columns: 1fr;
          }

          /* SIMPLIFIED MOBILE NARRATIVE */
          .apple-narrative-panel {
            padding: 1.25rem 1.35rem 0.5rem 1.35rem;
            border-right: none;
            border-bottom: none;
          }

          .apple-status-eyebrow {
            margin-bottom: 0.5rem;
            font-size: 0.75rem;
          }

          .apple-headline {
            font-size: 1.75rem;
            line-height: 1.15;
            margin-bottom: 0.4rem;
          }

          .apple-subhead {
            font-size: 0.9rem;
            line-height: 1.45;
            margin-bottom: 0;
            color: rgba(255, 255, 255, 0.6);
          }

          /* Hide long bulky perks cluster on mobile for simplicity */
          .apple-perks-group,
          .apple-privacy-guarantee {
            display: none;
          }

          /* SIMPLE MOBILE FORM */
          .apple-form-panel {
            padding: 1.15rem 1.35rem 2.5rem 1.35rem;
          }

          .apple-form-stack {
            gap: 1.1rem;
          }

          .apple-label {
            font-size: 0.8rem;
          }

          .apple-input-field {
            font-size: 16px; /* Prevents auto zoom on iOS */
            padding: 0.85rem 1rem;
            border-radius: 12px;
          }

          .classy-line-row {
            padding: 0.62rem 0.2rem;
          }

          .line-row-title {
            font-size: 0.86rem;
          }

          .apple-primary-cta {
            padding: 0.45rem 0.55rem 0.45rem 1.4rem;
            font-size: 0.98rem;
            margin-top: 0.25rem;
          }

          .apple-cta-arrow {
            width: 38px;
            height: 38px;
          }

          .mobile-privacy-compact {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.45rem;
            font-size: 0.74rem;
            color: rgba(255, 255, 255, 0.42);
            margin-top: 0.25rem;
          }

          /* MOBILE SUCCESS VIEW */
          .apple-success-view {
            padding: 1.75rem 1.25rem 2.75rem 1.25rem;
          }

          .apple-check-ring {
            width: 62px;
            height: 62px;
          }

          .apple-success-title {
            font-size: 1.85rem;
          }

          .apple-success-sub {
            font-size: 0.92rem;
            margin-bottom: 1.4rem;
          }

          .apple-wallet-pass {
            padding: 1.35rem;
            border-radius: 18px;
            margin-bottom: 1.5rem;
          }

          .wallet-pass-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
            padding-bottom: 0.75rem;
            margin-bottom: 1rem;
          }

          .wallet-pass-badge-wrap {
            width: 100%;
            justify-content: space-between;
          }

          .wallet-pass-body {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .apple-success-actions {
            flex-direction: column;
            width: 100%;
            gap: 0.65rem;
          }

          .apple-secondary-btn,
          .apple-ghost-btn {
            width: 100%;
            justify-content: center;
            padding: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}
