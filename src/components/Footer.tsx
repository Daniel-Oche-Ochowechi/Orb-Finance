'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEarlyAccess } from '@/context/EarlyAccessContext';

export default function Footer() {
  const { openEarlyAccess, openContact } = useEarlyAccess();

  return (
    <footer className="footer-root">
      {/* Subtle Top Silver Horizon Illumination */}
      <div className="footer-horizon-sheen" aria-hidden="true" />
      <div className="footer-top-hairline" aria-hidden="true" />

      <div className="container footer-inner-container">
        <div className="footer-top-grid">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <Link href="/" className="footer-brand-pure" aria-label="Orb Finance — Home">
              <img
                src="/images/orb-logo-white.png"
                alt="Orb Finance"
                className="footer-brand-logo"
              />
            </Link>

            <p className="footer-tagline">
              Every currency. One orbit. Institutional settlement without borders.
            </p>

            <div className="footer-status-capsule font-mono">
              <span className="footer-status-dot" aria-hidden="true" />
              <span>LAUNCHING 15 JANUARY 2027</span>
            </div>

            <button
              onClick={() => openEarlyAccess()}
              className="footer-silver-pill-cta"
              type="button"
            >
              <span>Request early access</span>
              <span className="footer-cta-circle">
                <ArrowRight size={14} strokeWidth={2.4} />
              </span>
            </button>
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
                    type="button"
                  >
                    Early Access Register
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openContact('Partnership')}
                    className="footer-link-btn"
                    type="button"
                  >
                    Contact Desk
                  </button>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h5 className="col-header font-mono">Compliance &amp; Trust</h5>
              <ul className="links-list">
                <li><a href="#trust">NDPR Compliance</a></li>
                <li><a href="#trust">Audit Trail</a></li>
                <li><a href="#trust">Privacy Policy</a></li>
                <li><a href="#trust">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Social Pill Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-legal-group">
            <p className="copyright-notice">
              © 2026 Orb Finance. All rights reserved.
            </p>
            <span className="legal-divider" aria-hidden="true" />
            <span className="footer-corridor-tag font-mono">GLOBAL SETTLEMENT INFRASTRUCTURE</span>
          </div>

          <div className="social-links-row">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-pill">
              <span>Instagram</span>
              <ArrowUpRight size={12} />
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="footer-social-pill">
              <span>X</span>
              <ArrowUpRight size={12} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-pill">
              <span>LinkedIn</span>
              <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Big Floating Sterling Silver Display Text Below Smaller Text */}
      <div className="footer-floating-wrap" aria-hidden="true">
        <div className="footer-orbital-arc" />
        <div className="footer-floating-glow" />
        <p className="footer-floating-wordmark">ORB FINANCE</p>
      </div>

      <style jsx>{`
        .footer-root {
          background: linear-gradient(180deg, #090b10 0%, #050609 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.09);
          padding: clamp(3.75rem, 6.5vw, 5.5rem) 0 clamp(1.25rem, 2.5vw, 2rem) 0;
          position: relative;
          overflow: hidden;
          z-index: 20;
        }

        .footer-horizon-sheen {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: min(920px, 95vw);
          height: 160px;
          background: radial-gradient(ellipse at center, rgba(226, 232, 240, 0.1) 0%, transparent 72%);
          filter: blur(40px);
          pointer-events: none;
        }

        .footer-top-hairline {
          position: absolute;
          top: 0;
          left: 15%;
          right: 15%;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.32) 50%, transparent 100%);
          pointer-events: none;
        }

        .footer-inner-container {
          position: relative;
          z-index: 2;
        }

        html.light-mode .footer-root {
          background: #f1efe9;
        }

        .footer-top-grid {
          display: grid;
          grid-template-columns: 1.45fr 2.55fr;
          gap: clamp(2.25rem, 5vw, 4.5rem);
          margin-bottom: clamp(2.75rem, 5vw, 4.25rem);
        }

        .footer-brand-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1.15rem;
        }

        .footer-brand-pure {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .footer-brand-pure:hover {
          opacity: 0.88;
        }

        .footer-brand-logo {
          height: clamp(32px, 3.6vw, 40px);
          width: auto;
          display: block;
          object-fit: contain;
        }

        html.light-mode .footer-brand-logo {
          filter: invert(1);
        }

        .footer-tagline {
          font-size: 0.96rem;
          line-height: 1.6;
          color: rgba(226, 232, 240, 0.68);
          max-width: 310px;
        }

        .footer-status-capsule {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.9rem;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.12);
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: #e2e8f0;
        }

        .footer-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.65);
        }

        .footer-silver-pill-cta {
          margin-top: 0.25rem;
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%);
          color: #07080b;
          border: 1px solid rgba(255, 255, 255, 0.88);
          border-radius: 9999px;
          padding: 0.38rem 0.42rem 0.38rem 1.25rem;
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: -0.012em;
          cursor: pointer;
          box-shadow: 0 10px 26px -6px rgba(226, 232, 240, 0.22), 0 4px 12px rgba(0, 0, 0, 0.35);
          transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease, background 0.2s ease;
        }

        .footer-silver-pill-cta:hover {
          background: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 14px 32px -6px rgba(255, 255, 255, 0.32), 0 6px 16px rgba(0, 0, 0, 0.4);
        }

        .footer-cta-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #07080b;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.2s ease, color 0.2s ease;
        }

        .footer-silver-pill-cta:hover .footer-cta-circle {
          transform: translateX(2px);
          background: #141720;
          color: #e2e8f0;
        }

        .footer-nav-columns {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: clamp(1.5rem, 3vw, 2.25rem);
        }

        .col-header {
          font-size: 0.74rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #f8fafc;
          margin-bottom: 1.25rem;
        }

        .links-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .links-list a,
        .footer-link-btn {
          display: inline-block;
          font-size: 0.92rem;
          color: rgba(203, 213, 225, 0.68);
          transition: color 0.2s ease, transform 0.2s ease;
          background: transparent;
          border: none;
          padding: 0;
          text-align: left;
          font-family: var(--font-sans);
          text-decoration: none;
          cursor: pointer;
        }

        .links-list a:hover,
        .footer-link-btn:hover {
          color: #ffffff;
          transform: translateX(3px);
        }

        .footer-bottom-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 1.75rem;
          flex-wrap: wrap;
          gap: 1.25rem;
        }

        .footer-legal-group {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.9rem;
        }

        .copyright-notice {
          font-size: 0.82rem;
          color: rgba(148, 163, 184, 0.85);
        }

        .legal-divider {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(226, 232, 240, 0.35);
        }

        .footer-corridor-tag {
          font-size: 0.68rem;
          letter-spacing: 0.12em;
          color: rgba(226, 232, 240, 0.5);
        }

        .social-links-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .footer-social-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.38rem 0.85rem;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.8);
          text-decoration: none;
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
        }

        .footer-social-pill:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.28);
          color: #ffffff;
          transform: translateY(-2px);
        }

        /* Monumental Floating Silver Display Text Below Smaller Footer Text */
        .footer-floating-wrap {
          position: relative;
          margin-top: clamp(2.8rem, 5.5vw, 4.75rem);
          padding-top: clamp(1rem, 2vw, 1.75rem);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          user-select: none;
          pointer-events: none;
        }

        .footer-orbital-arc {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -44%);
          width: min(1150px, 92vw);
          height: 220px;
          border-radius: 50%;
          border-top: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 -18px 50px rgba(226, 232, 240, 0.06);
          pointer-events: none;
        }

        .footer-floating-glow {
          position: absolute;
          bottom: -25%;
          left: 50%;
          transform: translateX(-50%);
          width: 72%;
          height: 180px;
          background: radial-gradient(ellipse at center, rgba(226, 232, 240, 0.14) 0%, transparent 70%);
          filter: blur(48px);
        }

        .footer-floating-wordmark {
          position: relative;
          font-family: var(--font-sans);
          font-size: clamp(2.65rem, 15vw, 19.5rem);
          font-weight: 800;
          letter-spacing: -0.055em;
          line-height: 0.85;
          text-align: center;
          white-space: nowrap;
          margin: 0;
          padding: 0 0.5vw;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.46) 0%,
            rgba(203, 213, 225, 0.22) 52%,
            rgba(148, 163, 184, 0.035) 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        html.light-mode .footer-floating-wordmark {
          background: linear-gradient(
            180deg,
            rgba(15, 23, 42, 0.18) 0%,
            rgba(71, 85, 105, 0.1) 60%,
            rgba(15, 23, 42, 0.02) 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
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
