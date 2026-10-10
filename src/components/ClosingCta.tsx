'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useEarlyAccess } from '@/context/EarlyAccessContext';

export default function ClosingCta() {
  const { openEarlyAccess } = useEarlyAccess();

  return (
    <section className="closing-cta-root" id="closing-cta">
      {/* Aurora Radial Halo */}
      <div className="closing-aura-glow" aria-hidden="true" />

      <div className="container text-center">
        <div className="closing-badge-row font-mono">
          <span className="closing-beacon-dot" />
          <span>OPENING 15 JANUARY 2027</span>
        </div>

        <h2 className="closing-headline">
          Step into <span className="italic-accent gradient-shimmer">orbit.</span>
        </h2>
        
        <p className="closing-sub">
          Orb Finance opens <strong>15 January 2027</strong>. Connect as soon as we launch.
        </p>

        <div className="closing-buttons-cluster">
          <button
            onClick={() => openEarlyAccess()}
            className="apple-closing-primary-btn"
            type="button"
          >
            <span>Request early access</span>
            <span className="btn-arrow-circle">
              <ArrowRight size={16} strokeWidth={2.5} />
            </span>
          </button>
          
          <button
            onClick={() => openEarlyAccess('Business')}
            className="apple-closing-secondary-btn"
            type="button"
          >
            <span>Contact us</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .closing-cta-root {
          padding: 8.5rem 0 9.5rem 0;
          position: relative;
          overflow: hidden;
          z-index: 2;
        }

        .closing-aura-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 900px;
          height: 520px;
          background: radial-gradient(
            circle,
            rgba(139, 92, 246, 0.25) 0%,
            rgba(245, 158, 11, 0.14) 45%,
            transparent 72%
          );
          filter: blur(85px);
          pointer-events: none;
          z-index: 0;
        }

        .text-center {
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .closing-badge-row {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.74rem;
          letter-spacing: 0.14em;
          color: #fbbf24;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.22);
          padding: 0.35rem 0.95rem;
          border-radius: 9999px;
          margin-bottom: 1.6rem;
        }

        .closing-beacon-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 8px #f59e0b;
        }

        .closing-headline {
          font-size: clamp(2.8rem, 6.5vw, 5.4rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.05;
          margin-bottom: 1.25rem;
          color: #ffffff;
        }

        .closing-sub {
          font-size: clamp(1.05rem, 2vw, 1.3rem);
          color: rgba(255, 255, 255, 0.7);
          max-width: 580px;
          margin: 0 auto 3rem auto;
          line-height: 1.6;
        }

        .closing-sub strong {
          color: #ffffff;
        }

        .closing-buttons-cluster {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .apple-closing-primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.25rem;
          background: #ffffff;
          color: #000000;
          border: none;
          border-radius: 9999px;
          padding: 0.45rem 0.55rem 0.45rem 1.85rem;
          font-family: var(--font-sans);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 25px rgba(255, 255, 255, 0.22);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .apple-closing-primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 35px rgba(255, 255, 255, 0.38);
        }

        .apple-closing-primary-btn:active {
          transform: scale(0.985);
        }

        .btn-arrow-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #000000;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, background-color 0.2s ease;
        }

        .apple-closing-primary-btn:hover .btn-arrow-circle {
          transform: translateX(3px);
          background: #7c3aed;
        }

        .apple-closing-secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.06);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 9999px;
          padding: 0.85rem 1.85rem;
          font-size: 0.96rem;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(16px);
          transition: all 0.2s ease;
        }

        .apple-closing-secondary-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.28);
          transform: translateY(-1px);
        }

        /* 📱 RESPONSIVE & MOBILE STYLING */
        @media (max-width: 768px) {
          .closing-cta-root {
            padding: 5rem 0 6rem 0;
          }

          .closing-headline {
            font-size: clamp(2.1rem, 8.5vw, 2.75rem);
            line-height: 1.1;
            margin-bottom: 1rem;
          }

          .closing-sub {
            font-size: 1rem;
            margin-bottom: 2.2rem;
            padding: 0 0.5rem;
          }

          .closing-buttons-cluster {
            flex-direction: column;
            gap: 0.85rem;
            width: 100%;
            max-width: 360px;
            margin: 0 auto;
          }

          .apple-closing-primary-btn {
            width: 100%;
            padding: 0.45rem 0.55rem 0.45rem 1.45rem;
            font-size: 0.98rem;
          }

          .apple-closing-secondary-btn {
            width: 100%;
            padding: 0.82rem 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}
