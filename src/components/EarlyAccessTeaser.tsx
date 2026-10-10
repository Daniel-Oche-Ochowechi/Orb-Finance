'use client';

import React from 'react';
import { useEarlyAccess } from '@/context/EarlyAccessContext';
import { ArrowRight, Lock } from 'lucide-react';

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

          <div className="teaser-layout-grid">
            {/* Left Narrative Column */}
            <div className="teaser-narrative-col">
              <span className="teaser-eyebrow font-mono">EARLY ACCESS</span>

              <h2 className="teaser-headline">
                Reserve your place <br />
                <span className="italic-accent teaser-gradient-shimmer">in orbit.</span>
              </h2>

              <p className="teaser-lead">
                Orb opens on <strong>15 January 2027</strong>. Join the list and we will write to you before launch with your access details.
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
                
                <div className="pass-top-meta font-mono">
                  <span>ORB</span>
                  <span className="pass-tier-tag">EARLY ACCESS</span>
                </div>

                <div className="pass-main-block">
                  <span className="pass-label font-mono">LAUNCH DATE</span>
                  <div className="pass-date-val font-mono">15 January 2027</div>
                  <p className="pass-note">
                    Early access members hear from us first with onboarding details and sandbox staging keys.
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
                  <span>Discreet by design. We will only write to you about Orb Finance.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .early-teaser-root {
          padding: 8.5rem 0;
          position: relative;
          z-index: 2;
        }

        .teaser-glass-card {
          position: relative;
          background: rgba(14, 16, 26, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 32px;
          padding: 4.8rem 4.2rem;
          overflow: hidden;
          box-shadow: 0 35px 80px rgba(0, 0, 0, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.16);
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
          grid-template-columns: 1.2fr 1fr;
          gap: 4.5rem;
          align-items: center;
        }

        /* Left Narrative Column */
        .teaser-narrative-col {
          display: flex;
          flex-direction: column;
        }

        .teaser-eyebrow {
          font-size: 0.74rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: #f59e0b;
          text-transform: uppercase;
          margin-bottom: 1.2rem;
          display: inline-block;
        }

        .teaser-headline {
          font-size: clamp(2.4rem, 4.4vw, 3.8rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.08;
          margin-bottom: 1.35rem;
          color: #ffffff;
        }

        .teaser-gradient-shimmer {
          background: linear-gradient(135deg, #ffffff 20%, #c084fc 60%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .teaser-lead {
          font-size: 1.15rem;
          line-height: 1.68;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 3rem;
          max-width: 540px;
        }

        .teaser-lead strong {
          color: #ffffff;
        }

        /* Perks Deck */
        .teaser-perks-stack {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 2rem;
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
          gap: 1.1rem;
        }

        .perk-row {
          display: flex;
          align-items: baseline;
          gap: 1.25rem;
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
          gap: 0.2rem;
        }

        .perk-title {
          font-size: 1.02rem;
          font-weight: 600;
          color: #ffffff;
        }

        .perk-desc {
          font-size: 0.94rem;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.55;
        }

        /* Right Pass Card */
        .pass-container {
          position: relative;
          background: rgba(10, 12, 20, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 26px;
          padding: 3rem 2.6rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.18);
          overflow: hidden;
        }

        .pass-specular {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
        }

        .pass-top-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.5);
        }

        .pass-tier-tag {
          color: #fbbf24;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
        }

        .pass-main-block {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .pass-label {
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.45);
        }

        .pass-date-val {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #ffffff;
        }

        .pass-note {
          font-size: 0.92rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.65);
          margin-top: 0.4rem;
        }

        /* Apple CTA Button */
        .apple-pass-cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          color: #000000;
          border: none;
          border-radius: 9999px;
          padding: 0.45rem 0.55rem 0.45rem 1.65rem;
          font-family: var(--font-sans);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 22px rgba(255, 255, 255, 0.22);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
        }

        .apple-pass-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(255, 255, 255, 0.4);
        }

        .btn-arrow-bubble {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #000000;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s ease, background-color 0.25s ease;
        }

        .apple-pass-cta-btn:hover .btn-arrow-bubble {
          transform: translateX(3px);
          background: #7c3aed;
        }

        .pass-discreet-footer {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .lock-icon {
          flex-shrink: 0;
        }

        @media (max-width: 992px) {
          .teaser-layout-grid {
            grid-template-columns: 1fr;
            gap: 3.5rem;
          }
          .teaser-glass-card {
            padding: 3rem 1.8rem;
          }
          .pass-container {
            padding: 2.2rem 1.8rem;
          }
        }
      `}</style>
    </section>
  );
}

