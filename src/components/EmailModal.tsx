'use client';

import React, { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { buildWaitlistEmailCopy } from '@/lib/email/waitlistTemplate';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  role?: string;
  referenceId?: string;
  emailSent?: boolean;
  sentAt?: string;
}

export default function EmailModal({
  isOpen,
  onClose,
  userName,
  userEmail,
  role = 'Bank',
  referenceId = 'ORB-REG-0001',
  emailSent = false,
  sentAt,
}: EmailModalProps) {
  const emailCopy = useMemo(
    () =>
      buildWaitlistEmailCopy({
        fullName: userName || 'Adebayo Adeleke',
        email: userEmail || 'adebayo@institution.com',
        role,
        referenceId,
        launchDate: '15 January 2027',
      }),
    [userName, userEmail, role, referenceId]
  );

  const formattedDate = useMemo(() => {
    const d = sentAt ? new Date(sentAt) : new Date();
    if (Number.isNaN(d.getTime())) return 'Just now';
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      hour12: false,
    }) + ' UTC';
  }, [sentAt]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="email-modal-backdrop" onClick={onClose}>
              <motion.div
                style={{ width: '100%', maxWidth: '660px' }}
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 18, scale: 0.965 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.965 }}
                transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.8 }}
              >
                <div
                  className="email-modal-card"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Waitlist confirmation email"
                >
        {/* Top Header */}
        <div className="modal-header-bar">
          <div className="modal-header-info">
            <div className="modal-badge-row">
              <span className="modal-badge font-mono">
                {emailSent ? 'DISPATCHED TO INBOX' : 'CONFIRMATION EMAIL PREVIEW'}
              </span>
              {emailSent && (
                <span className="modal-sent-pill font-mono">
                  <CheckCircle2 size={11} />
                  <span>SENT</span>
                </span>
              )}
            </div>
            <h4 className="modal-subject-title">{emailCopy.subject}</h4>
          </div>
          <button
            className="modal-close-icon-btn"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Envelope Metadata */}
        <div className="envelope-metadata-bar">
          <div>
            <span className="meta-key">From:</span>{' '}
            <span className="meta-val">Orb Finance &lt;hello@orbfinance.com&gt;</span>
          </div>
          <div>
            <span className="meta-key">To:</span>{' '}
            <span className="meta-val">
              {emailCopy.fullName} &lt;{emailCopy.email}&gt;
            </span>
          </div>
          <div>
            <span className="meta-key">Date:</span>{' '}
            <span className="meta-val">{formattedDate}</span>
          </div>
        </div>

        {/* Classy Editorial Stationery Email View */}
        <div className="modal-body-scroll">
          <div className="stationery-canvas">
            <div className="stationery-sheet">
              {/* Centered Obsidian Masthead */}
              <div className="sheet-masthead">
                <img
                  src="/images/orb-logo-white.png"
                  alt="Orb Finance"
                  className="sheet-masthead-logo"
                />
                <span className="sheet-masthead-rule" aria-hidden="true" />
                <span className="sheet-masthead-tag">PRIORITY REGISTER</span>
              </div>

              {/* Letter Content */}
              <div className="sheet-body">
                <p className="sheet-kicker">RESERVATION CONFIRMED</p>
                <h3 className="sheet-headline">
                  You are in <span className="sheet-headline-italic">orbit.</span>
                </h3>

                <p className="sheet-greeting">{emailCopy.greeting}</p>
                <p className="sheet-prose">{emailCopy.openingParagraph}</p>
                <p className="sheet-prose">{emailCopy.networkParagraph}</p>
                <p className="sheet-prose">{emailCopy.nextStepsParagraph}</p>

                {/* Ledger Confirmation Slip */}
                <div className="ledger-slip">
                  <div className="ledger-slip-head">
                    <span className="ledger-slip-title font-mono">RECORD OF REGISTRATION</span>
                    <span className="ledger-slip-ref font-mono">{emailCopy.referenceId}</span>
                  </div>
                  <div className="ledger-slip-rows">
                    <div className="ledger-row">
                      <span className="ledger-key font-mono">APPLICANT</span>
                      <span className="ledger-val">{emailCopy.fullName}</span>
                    </div>
                    <div className="ledger-row">
                      <span className="ledger-key font-mono">EMAIL</span>
                      <span className="ledger-val ledger-val-break">{emailCopy.email}</span>
                    </div>
                    <div className="ledger-row">
                      <span className="ledger-key font-mono">CATEGORY</span>
                      <span className="ledger-val">{emailCopy.roleLabel}</span>
                    </div>
                    <div className="ledger-row">
                      <span className="ledger-key font-mono">OPENING DATE</span>
                      <span className="ledger-val">{emailCopy.launchDate}</span>
                    </div>
                    <div className="ledger-row ledger-row-last">
                      <span className="ledger-key font-mono">STATUS</span>
                      <span className="ledger-val ledger-val-status">
                        <span className="status-dot-green" aria-hidden="true" />
                        Confirmed &middot; Priority Queue
                      </span>
                    </div>
                  </div>
                </div>

                <p className="sheet-closing-note">{emailCopy.closingNote}</p>

                <div className="sheet-signoff">
                  <p className="sheet-tagline">{emailCopy.tagline}</p>
                  <p className="sheet-team">{emailCopy.signoff}</p>
                </div>
              </div>

              {/* Stationery Footer */}
              <div className="sheet-footer">
                <img
                  src="/images/orb-logo-black.png"
                  alt="Orb Finance"
                  className="sheet-footer-logo"
                />
                <p className="sheet-footer-brand">
                  Orb Finance &nbsp;&middot;&nbsp; Opening {emailCopy.launchDate}
                </p>
                <p className="sheet-footer-meta">
                  Sent to {emailCopy.email} following your early access registration (
                  {emailCopy.referenceId}).
                </p>
                <p className="sheet-footer-copy">&copy; 2026 Orb Finance. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>

              {/* Footer */}
              <div className="modal-footer-bar">
                <button className="close-preview-btn" onClick={onClose} type="button">
                  <span>Close</span>
                </button>
              </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .email-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(5, 6, 9, 0.84);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 3000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .email-modal-card {
          background: linear-gradient(165deg, #131621 0%, #0b0d12 100%);
          border: 1px solid rgba(255, 255, 255, 0.11);
          border-radius: 24px;
          max-width: 660px;
          width: 100%;
          max-height: 90dvh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 28px 64px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }

        .modal-header-bar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          flex-shrink: 0;
        }

        .modal-badge-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.35rem;
        }

        .modal-badge {
          font-size: 0.68rem;
          color: #e2e8f0;
          letter-spacing: 0.14em;
        }

        .modal-sent-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.64rem;
          color: #34d399;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 0.12rem 0.5rem;
          border-radius: 9999px;
          letter-spacing: 0.08em;
        }

        .modal-subject-title {
          font-size: 1.02rem;
          font-weight: 600;
          color: #f8fafc;
          letter-spacing: -0.015em;
          margin: 0;
        }

        .modal-close-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .modal-close-icon-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.14);
        }

        .envelope-metadata-bar {
          padding: 0.85rem 1.5rem;
          background: rgba(255, 255, 255, 0.015);
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          font-size: 0.78rem;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.62);
          flex-shrink: 0;
        }

        .meta-key {
          color: rgba(255, 255, 255, 0.42);
          font-weight: 600;
          margin-right: 0.25rem;
        }

        .meta-val {
          color: rgba(255, 255, 255, 0.85);
        }

        .modal-body-scroll {
          overflow-y: auto;
          background: #eef1f5;
          flex: 1;
        }

        .stationery-canvas {
          padding: 1.75rem 1.5rem;
        }

        .stationery-sheet {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          text-align: left;
          color: #0b0d13;
        }

        .sheet-masthead {
          background: linear-gradient(180deg, #111520 0%, #090b10 100%);
          padding: 1.85rem 1.9rem 1.55rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 0.72rem;
        }

        .sheet-masthead-logo {
          height: 40px;
          width: auto;
          display: block;
          object-fit: contain;
        }

        .sheet-masthead-rule {
          width: 40px;
          height: 1px;
          background: #334155;
        }

        .sheet-masthead-tag {
          font-size: 0.58rem;
          font-weight: 500;
          letter-spacing: 0.24em;
          color: #94a3b8;
        }

        .sheet-body {
          padding: 2rem 1.9rem 1.75rem 1.9rem;
        }

        .sheet-kicker {
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          color: #64748b;
          margin: 0 0 0.65rem 0;
        }

        .sheet-headline {
          font-size: 1.65rem;
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: -0.03em;
          color: #0b0d13;
          margin: 0 0 1.4rem 0;
        }

        .sheet-headline-italic {
          font-style: italic;
          font-weight: 300;
          color: #475569;
        }

        .sheet-greeting {
          font-size: 0.92rem;
          font-weight: 600;
          color: #0b0d13;
          margin: 0 0 0.9rem 0;
        }

        .sheet-prose {
          font-size: 0.9rem;
          line-height: 1.7;
          color: #334155;
          margin: 0 0 0.9rem 0;
        }

        .ledger-slip {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin: 1.5rem 0;
          overflow: hidden;
        }

        .ledger-slip-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.7rem 1.1rem;
          background: #f1f5f9;
          border-bottom: 1px solid #e2e8f0;
        }

        .ledger-slip-title {
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: #64748b;
        }

        .ledger-slip-ref {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: #0b0d13;
        }

        .ledger-slip-rows {
          padding: 0.2rem 1.1rem;
        }

        .ledger-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.62rem 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .ledger-row-last {
          border-bottom: none;
        }

        .ledger-key {
          font-size: 0.64rem;
          letter-spacing: 0.08em;
          color: #64748b;
          flex-shrink: 0;
        }

        .ledger-val {
          font-size: 0.82rem;
          font-weight: 600;
          color: #0b0d13;
          text-align: right;
        }

        .ledger-val-break {
          font-weight: 500;
          color: #1e293b;
          word-break: break-all;
        }

        .ledger-val-status {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #15803d;
        }

        .status-dot-green {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #15803d;
          display: inline-block;
        }

        .sheet-closing-note {
          font-size: 0.8rem;
          line-height: 1.6;
          color: #6b7280;
          margin: 0 0 1.4rem 0;
        }

        .sheet-signoff {
          border-top: 1px solid #e2e8f0;
          padding-top: 1.2rem;
        }

        .sheet-tagline {
          font-size: 0.86rem;
          font-style: italic;
          color: #475569;
          margin: 0 0 0.25rem 0;
        }

        .sheet-team {
          font-size: 0.86rem;
          font-weight: 600;
          color: #0b0d13;
          margin: 0;
        }

        .sheet-footer {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 1.35rem 1.9rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .sheet-footer-logo {
          height: 22px;
          width: auto;
          display: block;
          margin-bottom: 0.65rem;
          opacity: 0.78;
        }

        .sheet-footer-brand {
          font-size: 0.72rem;
          font-weight: 600;
          color: #334155;
          margin: 0 0 0.3rem 0;
        }

        .sheet-footer-meta {
          font-size: 0.68rem;
          line-height: 1.5;
          color: #64748b;
          margin: 0 0 0.2rem 0;
        }

        .sheet-footer-copy {
          font-size: 0.68rem;
          color: #94a3b8;
          margin: 0;
        }

        .modal-footer-bar {
          display: flex;
          justify-content: flex-end;
          padding: 0.9rem 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          flex-shrink: 0;
        }

        .close-preview-btn {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 9999px;
          padding: 0.55rem 1.3rem;
          font-family: var(--font-sans);
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-preview-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.28);
        }

        @media (max-width: 640px) {
          .email-modal-backdrop {
            padding: 0;
            align-items: flex-end;
          }

          .email-modal-card {
            border-radius: 22px 22px 0 0;
            max-height: 90dvh;
          }

          .stationery-canvas {
            padding: 1rem;
          }

          .sheet-masthead,
          .sheet-body,
          .sheet-footer {
            padding-left: 1.25rem;
            padding-right: 1.25rem;
          }

          .ledger-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.2rem;
          }

          .ledger-val {
            text-align: left;
          }
        }
      `}</style>
    </>
  );
}
