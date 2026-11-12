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
          <div className="principles-eyebrow-row">
            <span className="principles-eyebrow-rule" aria-hidden="true" />
            <span className="section-label">PRINCIPLES</span>
            <span className="principles-eyebrow-rule" aria-hidden="true" />
          </div>
          <h2 className="section-headline">
            Our <span className="italic-accent gradient-shimmer">principles.</span>
          </h2>
        </div>

        <div className="principles-2x2-grid">
          {PRINCIPLES_DATA.map((p) => {
            return (
              <div key={p.num} className="principle-card">
                <div className="principle-card-specular" aria-hidden="true" />

                <div className="principle-top-row">
                  <span className="principle-num">{p.num}</span>
                </div>

                <h3 className="principle-title">{p.title}</h3>
                <p className="principle-desc">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .principles-root {
          padding: clamp(5rem, 9vw, 9rem) 0;
          position: relative;
          z-index: 2;
        }

        .section-header-center {
          text-align: center;
          max-width: 720px;
          margin: 0 auto clamp(2.8rem, 5vw, 4.5rem);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .principles-eyebrow-row {
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1.2rem;
        }

        .principles-eyebrow-rule {
          width: 24px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(226, 232, 240, 0.55));
        }

        .principles-eyebrow-rule:last-child {
          background: linear-gradient(90deg, rgba(226, 232, 240, 0.55), transparent);
        }

        .section-label {
          font-family: var(--font-sans);
          font-size: 0.66rem;
          font-weight: 500;
          letter-spacing: 0.24em;
          color: rgba(203, 213, 225, 0.66);
          text-transform: uppercase;
        }

        .section-headline {
          font-size: clamp(2.4rem, 4.8vw, 3.9rem);
          font-weight: 600;
          letter-spacing: -0.038em;
          line-height: 1.07;
          color: #ffffff;
        }

        .gradient-shimmer {
          font-weight: 300;
          background: linear-gradient(180deg, #ffffff 14%, #cbd5e1 85%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .principles-2x2-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: clamp(1.35rem, 2.4vw, 2rem);
        }

        .principle-card {
          position: relative;
          padding: clamp(1.75rem, 3vw, 2.6rem) clamp(1.45rem, 2.8vw, 2.45rem);
          border-radius: 28px;
          background: linear-gradient(
            165deg,
            rgba(16, 19, 28, 0.88) 0%,
            rgba(9, 11, 16, 0.94) 100%
          );
          border: 1px solid rgba(226, 232, 240, 0.12);
          box-shadow: 0 24px 56px rgba(0, 0, 0, 0.56), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.3s ease,
            box-shadow 0.4s ease;
        }

        .principle-card:hover {
          transform: translateY(-4px);
          border-color: rgba(226, 232, 240, 0.26);
          box-shadow: 0 32px 68px rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.14);
        }

        .principle-card-specular {
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

        .principle-top-row {
          display: flex;
          align-items: center;
          padding-bottom: 0.85rem;
          margin-bottom: 0.4rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .principle-num {
          font-family: var(--font-sans);
          font-size: 1.02rem;
          font-weight: 300;
          color: rgba(241, 245, 249, 0.82);
          letter-spacing: 0.06em;
        }

        .principle-title {
          font-size: clamp(1.3rem, 1.8vw, 1.5rem);
          font-weight: 550;
          color: #ffffff;
          letter-spacing: -0.025em;
          line-height: 1.32;
        }

        .principle-desc {
          font-size: 0.98rem;
          line-height: 1.66;
          color: rgba(203, 213, 225, 0.66);
          font-weight: 400;
        }

        @media (max-width: 860px) {
          .principles-2x2-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

