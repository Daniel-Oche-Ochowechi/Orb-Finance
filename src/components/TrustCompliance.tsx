'use client';

import React from 'react';
import { ShieldCheck, Lock, Scale } from 'lucide-react';

const TRUST_PILLARS = [
  {
    num: '01',
    icon: ShieldCheck,
    title: 'Licensed institutional rails',
    desc: 'Delivered in direct partnership with regulated commercial banks and licensed payment infrastructure.',
  },
  {
    num: '02',
    icon: Lock,
    title: 'Sovereign data privacy',
    desc: 'Handled in strict compliance with Nigerian data protection requirements and industry-standard transport security.',
  },
  {
    num: '03',
    icon: Scale,
    title: 'Complete audit trail',
    desc: 'Every atomic transaction generates a deterministic double-entry ledger record reconciled daily.',
  },
];

export default function TrustCompliance() {
  return (
    <section className="apple-trust-root" id="trust">
      <div className="container">
        {/* Section Header */}
        <div className="trust-header-center">
          <div className="trust-eyebrow-row">
            <span className="trust-eyebrow-rule" aria-hidden="true" />
            <span className="trust-eyebrow">TRUST &amp; COMPLIANCE</span>
            <span className="trust-eyebrow-rule" aria-hidden="true" />
          </div>

          <h2 className="trust-headline">
            Institutional integrity. <br className="hidden md:inline" />
            <span className="italic-accent apple-shimmer-text">By design.</span>
          </h2>

          <p className="trust-lead-text">
            Orb delivers payments and settlement in partnership with licensed institutions. Data is handled in line with Nigerian data-protection requirements, and every transaction leaves a complete audit trail.
          </p>
        </div>

        {/* 3-Column Architectural Deck */}
        <div className="trust-pillars-grid">
          {TRUST_PILLARS.map((pillar) => {
            const IconComponent = pillar.icon;
            return (
              <div key={pillar.num} className="trust-bento-card">
                <div className="card-specular-edge" aria-hidden="true" />

                <div className="card-top-row">
                  <span className="trust-num">{pillar.num}</span>
                  <span className="trust-icon-plain" aria-hidden="true">
                    <IconComponent size={16} strokeWidth={1.65} />
                  </span>
                </div>

                <div className="card-body">
                  <h3 className="card-title">{pillar.title}</h3>
                  <p className="card-desc">{pillar.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .apple-trust-root {
          padding: clamp(5rem, 9vw, 9rem) 0;
          position: relative;
          z-index: 2;
        }

        .trust-header-center {
          text-align: center;
          max-width: 760px;
          margin: 0 auto clamp(2.8rem, 5vw, 4.75rem) auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .trust-eyebrow-row {
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1.2rem;
        }

        .trust-eyebrow-rule {
          width: 24px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(226, 232, 240, 0.55));
        }

        .trust-eyebrow-rule:last-child {
          background: linear-gradient(90deg, rgba(226, 232, 240, 0.55), transparent);
        }

        .trust-eyebrow {
          font-family: var(--font-sans);
          font-size: 0.66rem;
          font-weight: 500;
          letter-spacing: 0.24em;
          color: rgba(203, 213, 225, 0.66);
          text-transform: uppercase;
        }

        .trust-headline {
          font-size: clamp(2.4rem, 4.9vw, 3.9rem);
          font-weight: 600;
          letter-spacing: -0.038em;
          line-height: 1.07;
          margin-bottom: 1.3rem;
          color: #ffffff;
        }

        .apple-shimmer-text {
          font-weight: 300;
          background: linear-gradient(180deg, #ffffff 14%, #cbd5e1 85%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .trust-lead-text {
          font-size: clamp(1rem, 1.4vw, 1.14rem);
          line-height: 1.68;
          color: rgba(226, 232, 240, 0.64);
          max-width: 660px;
          font-weight: 400;
        }

        /* 3-Column Architectural Grid */
        .trust-pillars-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(1.35rem, 2.4vw, 2rem);
          position: relative;
          z-index: 1;
        }

        .trust-bento-card {
          position: relative;
          padding: clamp(1.7rem, 3vw, 2.45rem) clamp(1.45rem, 2.6vw, 2.15rem);
          border-radius: 28px;
          background: linear-gradient(
            165deg,
            rgba(16, 19, 28, 0.88) 0%,
            rgba(9, 11, 16, 0.94) 100%
          );
          border: 1px solid rgba(226, 232, 240, 0.12);
          box-shadow: 0 24px 56px rgba(0, 0, 0, 0.56), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.3s ease,
            box-shadow 0.4s ease;
        }

        .trust-bento-card:hover {
          transform: translateY(-4px);
          border-color: rgba(226, 232, 240, 0.26);
          box-shadow: 0 32px 68px rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.14);
        }

        .card-specular-edge {
          position: absolute;
          top: 0;
          left: 14%;
          right: 14%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(226, 232, 240, 0.36) 50%,
            transparent 100%
          );
          pointer-events: none;
        }

        .card-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .trust-icon-plain {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: rgba(203, 213, 225, 0.54);
          transition: color 0.25s ease;
        }

        .trust-bento-card:hover .trust-icon-plain {
          color: #ffffff;
        }

        .trust-num {
          font-family: var(--font-sans);
          font-size: 1.02rem;
          font-weight: 300;
          color: rgba(241, 245, 249, 0.82);
          letter-spacing: 0.06em;
        }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .card-title {
          font-size: clamp(1.25rem, 1.7vw, 1.42rem);
          font-weight: 550;
          color: #ffffff;
          letter-spacing: -0.025em;
          line-height: 1.28;
        }

        .card-desc {
          font-size: 0.96rem;
          line-height: 1.66;
          color: rgba(203, 213, 225, 0.66);
          font-weight: 400;
        }

        @media (max-width: 992px) {
          .trust-pillars-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

