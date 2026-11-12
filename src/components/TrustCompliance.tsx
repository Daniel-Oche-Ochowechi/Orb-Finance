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
          <span className="trust-eyebrow font-mono">TRUST & COMPLIANCE</span>
          
          <h2 className="trust-headline">
            Institutional integrity. <br className="hidden md:inline" />
            <span className="italic-accent apple-shimmer-text">By design.</span>
          </h2>

          <p className="trust-lead-text">
            Orb delivers payments and settlement in partnership with licensed institutions. Data is handled in line with Nigerian data-protection requirements, and every transaction leaves a complete audit trail.
          </p>
        </div>

        {/* 3-Column Apple Pro Bento Deck */}
        <div className="trust-pillars-grid">
          {TRUST_PILLARS.map((pillar) => {
            const IconComponent = pillar.icon;
            return (
              <div key={pillar.num} className="trust-bento-card glass-surface">
                <div className="card-specular-edge" aria-hidden="true" />

                <div className="card-top-row">
                  <div className="trust-icon-box">
                    <IconComponent size={20} strokeWidth={2} />
                  </div>
                  <span className="trust-num font-mono">{pillar.num}</span>
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
          padding: clamp(4.5rem, 8.5vw, 8.5rem) 0;
          position: relative;
          z-index: 2;
        }

        .trust-header-center {
          text-align: center;
          max-width: 800px;
          margin: 0 auto clamp(2.75rem, 5vw, 5rem) auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .trust-eyebrow {
          font-size: 0.74rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: #f59e0b;
          text-transform: uppercase;
          margin-bottom: 1.2rem;
          display: inline-block;
        }

        .trust-headline {
          font-size: clamp(2.2rem, 5vw, 4rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.08;
          margin-bottom: 1.35rem;
          color: #ffffff;
        }

        .apple-shimmer-text {
          background: linear-gradient(135deg, #ffffff 20%, #c084fc 60%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .trust-lead-text {
          font-size: clamp(1rem, 1.8vw, 1.15rem);
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.68);
          max-width: 680px;
        }

        /* 3-Column Bento Grid */
        .trust-pillars-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(1.25rem, 2.4vw, 2rem);
          position: relative;
          z-index: 1;
        }

        .trust-bento-card {
          position: relative;
          padding: clamp(1.85rem, 3.4vw, 3.2rem) clamp(1.45rem, 2.8vw, 2.4rem);
          border-radius: clamp(22px, 2.4vw, 28px);
          background: rgba(14, 16, 26, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.11);
          backdrop-filter: blur(20px) saturate(165%);
          -webkit-backdrop-filter: blur(20px) saturate(165%);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.16);
          display: flex;
          flex-direction: column;
          gap: clamp(1.25rem, 2.2vw, 2rem);
          overflow: hidden;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.35s ease;
        }

        .trust-bento-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.22);
          box-shadow: 0 35px 80px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.25);
        }

        .card-specular-edge {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.35) 50%, transparent 100%);
        }

        .card-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .trust-icon-box {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #c084fc;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
        }

        .trust-bento-card:hover .trust-icon-box {
          background: rgba(192, 132, 252, 0.15);
          border-color: rgba(192, 132, 252, 0.35);
          color: #ffffff;
          transform: scale(1.05);
        }

        .trust-num {
          font-size: 0.95rem;
          font-weight: 700;
          color: #fbbf24;
          letter-spacing: 0.08em;
        }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .card-title {
          font-size: 1.45rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.02em;
          line-height: 1.25;
        }

        .card-desc {
          font-size: 1.05rem;
          line-height: 1.68;
          color: rgba(255, 255, 255, 0.68);
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

