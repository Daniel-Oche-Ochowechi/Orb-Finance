'use client';

import React from 'react';
import { X, Mail, CheckCircle2 } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
}

export default function EmailModal({ isOpen, onClose, userName, userEmail }: EmailModalProps) {
  if (!isOpen) return null;

  const firstName = userName.split(' ')[0] || userName || 'Partner';

  return (
    <div className="email-modal-backdrop" onClick={onClose}>
      <div className="email-modal-card glass-surface" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="modal-header-bar">
          <div className="modal-header-info">
            <span className="modal-badge font-mono">AUTOMATED EMAIL DISPATCH</span>
            <h4 className="modal-subject-title">Subject: You are in orbit</h4>
          </div>
          <button className="modal-close-icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Mock Client Email Container */}
        <div className="modal-body-content">
          <div className="email-envelope-view">
            <div className="envelope-metadata">
              <div><strong>From:</strong> Orb Finance &lt;hello@orbfinance.com&gt;</div>
              <div><strong>To:</strong> {userName || 'Adebayo Adeleke'} &lt;{userEmail || 'adebayo@fintech.co'}&gt;</div>
              <div><strong>Date:</strong> 09 October 2026, 14:15:00 UTC</div>
            </div>

            <div className="envelope-letter-body">
              <p>Dear {firstName},</p>
              <p>Thank you for requesting early access to Orb Finance.</p>
              <p>
                We are building a single network for sending money across borders: you send in your currency, and they receive in theirs. We open on <strong>15 January 2027</strong>, and you will hear from us before then with your details.
              </p>
              <p>
                If you represent a bank or fintech and wish to talk sooner, simply reply to this message.
              </p>
              <div className="envelope-signoff">
                <p className="italic-accent">Every currency. One orbit.</p>
                <p><strong>The Orb Finance team</strong></p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer-bar">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <span>Dismiss Simulation</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .email-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(16px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: modalFadeIn 0.25s ease-out;
        }

        .email-modal-card {
          background: #0f0f1c;
          border: 1px solid var(--glass-border-bright);
          border-radius: var(--radius-xl);
          max-width: 580px;
          width: 100%;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.85);
          overflow: hidden;
        }

        .modal-header-bar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1.5rem 1.75rem;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid var(--glass-border);
        }

        .modal-badge {
          font-size: 0.7rem;
          color: var(--aurora-gold);
          letter-spacing: 0.12em;
          display: block;
          margin-bottom: 0.3rem;
        }

        .modal-subject-title {
          font-size: 1.15rem;
        }

        .modal-close-icon-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.35rem;
          transition: color 0.2s ease;
        }

        .modal-close-icon-btn:hover {
          color: var(--text-primary);
        }

        .modal-body-content {
          padding: 1.75rem;
        }

        .email-envelope-view {
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 1.5rem;
        }

        .envelope-metadata {
          font-size: 0.84rem;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.85rem;
          margin-bottom: 1.25rem;
          line-height: 1.6;
        }

        .envelope-letter-body p {
          font-size: 0.96rem;
          line-height: 1.65;
          margin-bottom: 1rem;
        }

        .envelope-signoff {
          margin-top: 1.5rem;
        }

        .modal-footer-bar {
          display: flex;
          justify-content: flex-end;
          padding: 1rem 1.75rem;
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid var(--glass-border);
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 640px) {
          .email-modal-backdrop {
            padding: 1rem;
            align-items: flex-end;
          }

          .email-modal-card {
            border-radius: 24px 24px 0 0;
            max-height: 85dvh;
            overflow-y: auto;
          }

          .modal-header-bar {
            padding: 1.25rem 1.25rem;
          }

          .modal-body-content {
            padding: 1.25rem;
          }

          .email-envelope-view {
            padding: 1.15rem;
          }

          .modal-footer-bar {
            padding: 0.85rem 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
