'use client';

import React from 'react';
import { useEarlyAccess } from '@/context/EarlyAccessContext';
import { ArrowRight, Lock, Sparkles, ShieldCheck } from 'lucide-react';

const EARLY_ACCESS_PERKS = [
  {
    title: 'First in line.',
    desc: 'Connect as soon as we open.',
  },
  {
    title: 'Sandbox access.',
    desc: 'Build and test ahead of launch.',
  },
  {
    title: 'A direct line to our team.',
    desc: 'Discuss integration and pricing before the doors open.',
  },
];

export default function EarlyAccessTeaser() {
  const { openEarlyAccess } = useEarlyAccess();

  return (
    <section className="early-teaser-root" id="early-access">
      <div className="container">
        <div className="teaser-glass-card glass-surface">
          <div className="card-top-specular" aria-hidden="true" />
          <div className="card-ambient-glow" aria-hidden="true" />

          <div className="teaser-layout-grid">
            {/* Left Narrative Column */}
            <div className="teaser-narrative-col">
              <div className="teaser-eyebrow-wrap">
                <span className="teaser-amber-dot" />
                <span className="teaser-eyebrow font-mono">EARLY ACCESS</span>
              </div>

              <h2 className="teaser-headline">
                Reserve your place <br />
                <span className="italic-accent teaser-gradient-shimmer">in orbit.</span>
              </h2>

              <p className="teaser-lead">
                Orb Finance opens <strong>15 January 2027</strong>. Join the list and we will write to you before launch with your access details.
              </p>

              {/* What Early Access Means Deck */}
              <div className="teaser-perks-stack">
                <div className="perks-heading font-mono">WHAT EARLY ACCESS MEANS</div>
                <div className="perks-list">
                  {EARLY_ACCESS_PERKS.map((perk, idx) => (
                    <div key={idx} className="perk-row">
                      <span className="perk-index font-mono">0{idx + 1}</span>
                      <div className="perk-body">
                        <strong className="perk-title">{perk.title}</strong>
                        <span className="perk-desc">{perk.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Pass / Action Card */}
            <div className="teaser-action-col">
              <div className="pass-container">
                <div className="pass-specular" aria-hidden="true" />
                <div className="pass-watermark-glow" aria-hidden="true" />
                
                <div className="pass-top-meta font-mono">
                  <div className="pass-brand-tag">
                    <span className="pass-brand-dot" />
                    <span>ORB PROTOCOL</span>
                  </div>
                  <span className="pass-tier-tag">VIP PASS</span>
                </div>

                <div className="pass-main-block">
                  <span className="pass-label font-mono">LAUNCH DATE</span>
                  <div className="pass-date-val font-mono">15 January 2027</div>
                  <p className="pass-note">
                    Early access members receive sandbox credentials and private integration keys before general availability.
                  </p>
                </div>

                <button
                  onClick={() => openEarlyAccess()}
                  className="apple-pass-cta-btn"
                  type="button"
                >
                  <span>Request early access</span>
                  <span className="btn-arrow-bubble">
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </span>
                </button>

                <div className="pass-discreet-footer font-mono">
                  <Lock size={12} className="lock-icon" />
                  <span>Discreet by design • We only write about Orb</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .early-teaser-root {
          padding: 8rem 0;
          position: relative;
          z-index: 2;
        }

        .teaser-glass-card {
          position: relative;
          background: linear-gradient(155deg, rgba(20, 22, 34, 0.85) 0%, rgba(10, 11, 18, 0.95) 100%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 32px;
          padding: 4.5rem 4rem;
          overflow: hidden;
          box-shadow: 0 35px 80px rgba(0, 0, 0, 0.65), 
                      0 0 0 1px rgba(255, 255, 255, 0.06),
                      inset 0 1px 1px rgba(255, 255, 255, 0.2);
        }

        .card-ambient-glow {
          position: absolute;
          top: -30%;
          right: 5%;
          width: 500px;
          height: 500px;
          background: radial-gradient(
            circle,
            rgba(167, 139, 250, 0.15) 0%,
            rgba(245, 158, 11, 0.08) 40%,
            transparent 70%
          );
          filter: blur(70px);
          pointer-events: none;
        }

        .card-top-specular {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.35) 50%, transparent 100%);
        }

        .teaser-layout-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 4.5rem;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        /* Left Narrative Column */
        .teaser-narrative-col {
          display: flex;
          flex-direction: column;
        }

        .teaser-eyebrow-wrap {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.2rem;
        }

        .teaser-amber-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 8px #f59e0b;
        }

        .teaser-eyebrow {
          font-size: 0.74rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: #fbbf24;
          text-transform: uppercase;
        }

        .teaser-headline {
          font-size: clamp(2.3rem, 4.2vw, 3.6rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.1;
          margin-bottom: 1.25rem;
          color: #ffffff;
        }

        .teaser-gradient-shimmer {
          background: linear-gradient(135deg, #ffffff 20%, #c084fc 60%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .teaser-lead {
          font-size: 1.12rem;
          line-height: 1.68;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2.8rem;
          max-width: 520px;
        }

        .teaser-lead strong {
          color: #ffffff;
        }

        /* Perks Deck */
        .teaser-perks-stack {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 1.8rem;
        }

        .perks-heading {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.4);
        }

        .perks-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .perk-row {
          display: flex;
          align-items: baseline;
          gap: 1.15rem;
        }

        .perk-index {
          font-size: 0.8rem;
          font-weight: 600;
          color: #fbbf24;
          flex-shrink: 0;
        }

        .perk-body {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .perk-title {
          font-size: 1rem;
          font-weight: 600;
          color: #ffffff;
        }

        .perk-desc {
          font-size: 0.92rem;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.5;
        }

        /* Right Pass Card */
        .pass-container {
          position: relative;
          background: linear-gradient(145deg, rgba(26, 28, 44, 0.9) 0%, rgba(13, 14, 22, 0.96) 100%);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 24px;
          padding: 2.8rem 2.4rem;
          display: flex;
          flex-direction: column;
          gap: 1.8rem;
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.55), 
                      0 0 0 1px rgba(192, 132, 252, 0.12),
                      inset 0 1px 1px rgba(255, 255, 255, 0.22);
          overflow: hidden;
        }

        .pass-specular {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.35) 50%, transparent 100%);
        }

        .pass-watermark-glow {
          position: absolute;
          bottom: -40px;
          right: -40px;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(167, 139, 250, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .pass-top-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 1rem;
        }

        .pass-brand-tag {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 600;
        }

        .pass-brand-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 6px #f59e0b;
        }

        .pass-tier-tag {
          color: #fbbf24;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.25);
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
          font-weight: 600;
        }

        .pass-main-block {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .pass-label {
          font-size: 0.66rem;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.45);
          font-weight: 600;
        }

        .pass-date-val {
          font-size: 2.1rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #ffffff;
        }

        .pass-note {
          font-size: 0.92rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.65);
          margin-top: 0.25rem;
        }

        /* Apple CTA Button */
        .apple-pass-cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(180deg, #ffffff 0%, #f4f4f6 100%);
          color: #07070d;
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 9999px;
          padding: 0.45rem 0.5rem 0.45rem 1.65rem;
          font-family: var(--font-sans);
          font-size: 0.98rem;
          font-weight: 600;
          letter-spacing: -0.015em;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), 0 8px 24px -4px rgba(255, 255, 255, 0.18);
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
        }

        .apple-pass-cta-btn:hover {
          background: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35),
                      0 14px 36px -4px rgba(255, 255, 255, 0.35),
                      0 4px 16px rgba(0, 0, 0, 0.3);
        }

        .apple-pass-cta-btn:active {
          transform: scale(0.975) translateY(0);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
        }

        .btn-arrow-bubble {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #07070d;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
                      background-color 0.25s ease, 
                      color 0.25s ease, 
                      border-color 0.25s ease;
        }

        .apple-pass-cta-btn:hover .btn-arrow-bubble {
          transform: translateX(3px) scale(1.04);
          background: #141420;
          border-color: rgba(245, 158, 11, 0.45);
          color: #f59e0b;
        }

        .pass-discreet-footer {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.45);
        }

        .lock-icon {
          flex-shrink: 0;
        }

        /* 📱 RESPONSIVE & MOBILE STYLING */
        @media (max-width: 992px) {
          .early-teaser-root {
            padding: 5.5rem 0;
          }

          .teaser-layout-grid {
            grid-template-columns: 1fr;
            gap: 2.75rem;
          }

          .teaser-glass-card {
            padding: 2.75rem 1.75rem;
            border-radius: 26px;
          }

          .pass-container {
            padding: 2.2rem 1.6rem;
            border-radius: 20px;
          }
        }

        @media (max-width: 768px) {
          .early-teaser-root {
            padding: 4rem 0;
          }

          .teaser-glass-card {
            padding: 2rem 1.25rem;
            border-radius: 22px;
          }

          .teaser-headline {
            font-size: 1.85rem;
            line-height: 1.15;
            margin-bottom: 0.85rem;
          }

          .teaser-lead {
            font-size: 0.98rem;
            line-height: 1.55;
            margin-bottom: 2rem;
          }

          .teaser-perks-stack {
            padding-top: 1.35rem;
            gap: 0.9rem;
          }

          .perk-row {
            gap: 0.85rem;
          }

          .perk-title {
            font-size: 0.94rem;
          }

          .perk-desc {
            font-size: 0.86rem;
          }

          .pass-container {
            padding: 1.75rem 1.25rem;
            border-radius: 18px;
            gap: 1.35rem;
          }

          .pass-date-val {
            font-size: 1.75rem;
          }

          .pass-note {
            font-size: 0.86rem;
            line-height: 1.5;
          }

          .apple-pass-cta-btn {
            font-size: 0.96rem;
            padding: 0.45rem 0.55rem 0.45rem 1.4rem;
          }

          .btn-arrow-bubble {
            width: 36px;
            height: 36px;
          }

          .pass-discreet-footer {
            font-size: 0.68rem;
          }
        }

        @media (max-width: 480px) {
          .pass-top-meta {
            flex-direction: row;
            justify-content: space-between;
          }

          .apple-pass-cta-btn {
            font-size: 0.92rem;
            padding: 0.4rem 0.5rem 0.4rem 1.25rem;
          }
        }
      `}</style>
    </section>
  );
}
