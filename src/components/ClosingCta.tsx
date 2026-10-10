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
          Join us on 15 January 2027.
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
          padding: 9.5rem 0 10rem 0;
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
            rgba(139, 92, 246, 0.28) 0%,
            rgba(245, 158, 11, 0.16) 45%,
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
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          color: #fbbf24;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
          padding: 0.3rem 0.85rem;
          border-radius: 9999px;
          margin-bottom: 1.6rem;
        }

        .closing-beacon-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 6px #f59e0b;
        }

        .closing-headline {
          font-size: clamp(3.4rem, 7vw, 5.8rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.05;
          margin-bottom: 1.4rem;
          color: #ffffff;
        }

        .closing-sub {
          font-size: clamp(1.15rem, 2vw, 1.4rem);
          color: rgba(255, 255, 255, 0.68);
          max-width: 620px;
          margin: 0 auto 3.5rem auto;
          line-height: 1.6;
        }

        .closing-buttons-cluster {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .apple-closing-primary-btn {
          display: inline-flex;
          align-items: center;
          gap: 1.15rem;
          background: #ffffff;
          color: #000000;
          border: none;
          border-radius: 9999px;
          padding: 0.45rem 0.55rem 0.45rem 1.8rem;
          font-family: var(--font-sans);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 25px rgba(255, 255, 255, 0.22);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .apple-closing-primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 35px rgba(255, 255, 255, 0.4);
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
          transition: transform 0.25s ease, background-color 0.25s ease;
        }

        .apple-closing-primary-btn:hover .btn-arrow-circle {
          transform: translateX(3px);
          background: #7c3aed;
        }

        .apple-closing-secondary-btn {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 9999px;
          padding: 0.85rem 1.8rem;
          font-size: 0.96rem;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(16px);
          transition: all 0.25s ease;
        }

        .apple-closing-secondary-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
        }
      `}</style>
    </section>
  );
}
