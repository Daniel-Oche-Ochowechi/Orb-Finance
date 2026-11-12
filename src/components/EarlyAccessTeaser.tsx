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
                Orb Finance opens <strong>Q2 (15 April 2027)</strong>. Join the list and we will write to you before launch with your access details.
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
                  <div className="pass-date-val font-mono">Q2 · 15 April 2027</div>
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
          padding: clamp(4rem, 8vw, 8rem) 0;
          position: relative;
          z-index: 2;
        }

        .teaser-glass-card {
          position: relative;
          background: linear-gradient(155deg, #12151f 0%, #0a0c11 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 28px;
          padding: clamp(1.85rem, 4.8vw, 4.5rem) clamp(1.25rem, 4.2vw, 4rem);
          overflow: hidden;
          box-shadow: 0 28px 64px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .card-ambient-glow {
          display: none;
        }

        .card-top-specular {
          display: none;
        }

        .teaser-layout-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: clamp(2rem, 4.5vw, 4.5rem);
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
          background: #e2e8f0;
        }

        .teaser-eyebrow {
          font-size: 0.74rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: #e2e8f0;
          text-transform: uppercase;
        }

        .teaser-headline {
          font-size: clamp(1.85rem, 4.2vw, 3.6rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.1;
          margin-bottom: clamp(0.85rem, 1.5vw, 1.25rem);
          color: #ffffff;
        }

        .teaser-gradient-shimmer {
          position: relative;
          z-index: 1;
          background: linear-gradient(180deg, #ffffff 8%, #cbd5e1 64%, #94a3b8 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .teaser-lead {
          font-size: clamp(0.96rem, 1.5vw, 1.12rem);
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: clamp(1.75rem, 3vw, 2.8rem);
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
          color: #e2e8f0;
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
          background: linear-gradient(155deg, #161925 0%, #0d0f16 100%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 26px;
          padding: 2.6rem 2.3rem;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.55),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .pass-specular {
          display: none;
        }

        .pass-watermark-glow {
          position: absolute;
          bottom: -45px;
          right: -45px;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(226, 232, 240, 0.09) 0%, transparent 70%);
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
          background: #e2e8f0;
        }

        .pass-tier-tag {
          color: #f8fafc;
          background: rgba(226, 232, 240, 0.12);
          border: 1px solid rgba(226, 232, 240, 0.28);
          padding: 0.25rem 0.7rem;
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

        /* Warm Ivory CTA Button */
        .apple-pass-cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%);
          color: #07080b;
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 9999px;
          padding: 0.45rem 0.5rem 0.45rem 1.65rem;
          font-family: var(--font-sans);
          font-size: 0.96rem;
          font-weight: 600;
          letter-spacing: -0.015em;
          cursor: pointer;
          box-shadow: 0 10px 28px -6px rgba(226, 232, 240, 0.22), 0 4px 14px rgba(0, 0, 0, 0.35);
          transition: all 0.28s cubic-bezier(0.22, 1, 0.36, 1);
          width: 100%;
        }

        .apple-pass-cta-btn:hover {
          background: #ffffff;
          border-color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 16px 34px -6px rgba(226, 232, 240, 0.32), 0 6px 18px rgba(0, 0, 0, 0.4);
        }

        .apple-pass-cta-btn:active {
          transform: scale(0.975) translateY(0);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
        }

        .btn-arrow-bubble {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #07080b;
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                      background-color 0.25s ease,
                      color 0.25s ease,
                      border-color 0.25s ease;
        }

        .apple-pass-cta-btn:hover .btn-arrow-bubble {
          transform: translateX(3px);
          background: #12151f;
          border-color: rgba(226, 232, 240, 0.48);
          color: #f8fafc;
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
          .teaser-layout-grid {
            grid-template-columns: 1fr;
            gap: clamp(1.75rem, 4.5vw, 2.75rem);
          }

          .pass-container {
            padding: clamp(1.5rem, 3.5vw, 2.2rem) clamp(1.25rem, 3vw, 1.6rem);
            border-radius: 20px;
          }
        }

        @media (max-width: 768px) {
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
            gap: 1.35rem;
          }

          .pass-date-val {
            font-size: clamp(1.5rem, 5vw, 1.85rem);
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
