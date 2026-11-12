'use client';

import React from 'react';
import Link from 'next/link';
import { useEarlyAccess } from '@/context/EarlyAccessContext';

export default function Footer() {
  const { openEarlyAccess, openContact } = useEarlyAccess();

  return (
    <footer className="footer-root">
      <div className="container">
        <div className="footer-top-grid">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <Link href="/" className="footer-brand-pure" aria-label="Orb Finance — Home">
              <span className="brand-dot" aria-hidden="true" />
              <span className="brand-wordmark-orb">ORB</span>
              <span className="brand-wordmark-finance font-mono">FINANCE</span>
            </Link>

            <p className="footer-tagline">
              Every currency. One orbit.<br />
              <span className="text-gold font-mono text-sm">Opening 15 January 2027</span>
            </p>
          </div>

          {/* Navigation Links Columns */}
          <div className="footer-nav-columns">
            <div className="footer-col">
              <h5 className="col-header font-mono">Platform</h5>
              <ul className="links-list">
                <li><a href="#platform">Cross-border Transfers</a></li>
                <li><a href="#platform">Domestic Transfers</a></li>
                <li><a href="#platform">Bill Payments</a></li>
                <li><a href="#how-it-works">API Sandbox</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5 className="col-header font-mono">Company</h5>
              <ul className="links-list">
                <li><a href="#institutions">Partners</a></li>
                <li><a href="#principles">Principles</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li>
                  <button
                    onClick={() => openEarlyAccess()}
                    className="footer-link-btn"
                  >
                    Request Early Access
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openContact('Partnership')}
                    className="footer-link-btn"
                  >
                    Contact Desk
                  </button>
                </li>
              </ul>
            </div>


            <div className="footer-col">
              <h5 className="col-header font-mono">Compliance & Trust</h5>
              <ul className="links-list">
                <li><a href="#trust">NDPR Compliance</a></li>
                <li><a href="#trust">Audit Trail</a></li>
                <li><a href="#trust">Privacy Policy</a></li>
                <li><a href="#trust">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="copyright-notice">
            © 2026 Orb Finance. All rights reserved.
          </p>
          <div className="social-links-row">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <span>·</span>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer">X (Twitter)</a>
            <span>·</span>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-root {
          background: rgba(6, 6, 10, 0.96);
          border-top: 1px solid var(--glass-border);
          padding: clamp(3.25rem, 6vw, 5rem) 0 clamp(1.75rem, 3vw, 2.5rem) 0;
          position: relative;
          z-index: 20;
        }

        html.light-mode .footer-root {
          background: #f1efe9;
        }

        .footer-top-grid {
          display: grid;
          grid-template-columns: 1.4fr 2.6fr;
          gap: clamp(2rem, 4.5vw, 4rem);
          margin-bottom: clamp(2.5rem, 4.5vw, 4rem);
        }

        .footer-brand-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1.25rem;
        }

        .footer-brand-pure {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        .brand-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #fbbf24;
          box-shadow: 0 0 10px rgba(251, 191, 36, 0.65);
          flex-shrink: 0;
        }

        .brand-wordmark-orb {
          font-family: var(--font-sans);
          font-size: 1.65rem;
          font-weight: 800;
          letter-spacing: -0.05em;
          color: #ffffff;
          line-height: 1;
        }

        .brand-wordmark-finance {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          color: rgba(255, 255, 255, 0.6);
          padding-top: 0.1em;
        }

        html.light-mode .brand-wordmark-orb {
          color: #0f172a;
        }

        html.light-mode .brand-wordmark-finance {
          color: #475569;
        }

        .footer-tagline {
          font-size: 0.98rem;
          line-height: 1.6;
        }

        .text-gold {
          color: var(--aurora-gold);
        }

        .footer-nav-columns {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
          gap: clamp(1.5rem, 3vw, 2rem);
        }

        .col-header {
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
        }

        .links-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .links-list a,
        .footer-link-btn {
          font-size: 0.92rem;
          color: var(--text-secondary);
          transition: color 0.2s ease;
          background: transparent;
          border: none;
          padding: 0;
          text-align: left;
          font-family: var(--font-sans);
          cursor: pointer;
        }

        .links-list a:hover,
        .footer-link-btn:hover {
          color: var(--text-primary);
        }

        .footer-bottom-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--glass-border);
          padding-top: 2rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .copyright-notice {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .social-links-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .social-links-row a:hover {
          color: var(--text-primary);
        }

        @media (max-width: 900px) {
          .footer-top-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}
