'use client';

import React from 'react';

const PRINCIPLES_DATA = [
  {
    num: '01',
    title: 'Designed for Nigeria. Built for the world.',
    desc: 'We begin where the need is greatest, then extend outward over the same network.',
  },
  {
    num: '02',
    title: 'Exact by design.',
    desc: 'Every movement of value is recorded in a double-entry ledger and reconciled daily. The numbers always agree.',
  },
  {
    num: '03',
    title: 'Compliance at the core.',
    desc: 'Sanctions and risk screening occur before funds move, never after.',
  },
  {
    num: '04',
    title: 'Intelligence that grows with the network.',
    desc: 'As volume builds, Orb applies increasingly capable fraud detection, pricing and liquidity planning.',
  },
];

export default function Principles() {
  return (
    <section className="page-section principles-root" id="principles">
      <div className="container">
        <div className="section-header-center">
          <span className="section-label font-mono">PRINCIPLES</span>
          <h2 className="section-headline">
            Our <span className="italic-accent gradient-shimmer">principles.</span>
          </h2>
        </div>

        <div className="principles-2x2-grid">
          {PRINCIPLES_DATA.map((p) => {
            return (
              <div key={p.num} className="principle-card glass-surface">
                <div className="principle-card-specular" aria-hidden="true" />
                
                <div className="principle-top-row">
                  <span className="principle-num font-mono">{p.num}</span>
                </div>

                <h3 className="principle-title">{p.title}</h3>
                <p className="principle-desc">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .section-header-center {
          text-align: center;
          margin-bottom: 4.5rem;
        }

        .section-label {
          font-family: var(--font-mono);
          font-size: 0.74rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: #f59e0b;
          text-transform: uppercase;
          margin-bottom: 1.1rem;
          display: inline-block;
        }

        .section-headline {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.08;
          color: #ffffff;
        }

        .principles-2x2-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .principle-card {
          position: relative;
          padding: 3rem 2.6rem;
          border-radius: 26px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .principle-card:hover {
          transform: translateY(-3px);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .principle-card-specular {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%);
        }

        .principle-top-row {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .principle-num {
          font-size: 0.95rem;
          font-weight: 700;
          color: #fbbf24;
          letter-spacing: 0.08em;
        }

        .principle-title {
          font-size: 1.45rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.02em;
          line-height: 1.3;
        }

        .principle-desc {
          font-size: 1.06rem;
          line-height: 1.68;
          color: rgba(255, 255, 255, 0.68);
        }

        @media (max-width: 860px) {
          .principles-2x2-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .principle-card {
            padding: 2.2rem 1.8rem;
          }
        }
      `}</style>
    </section>
  );
}

