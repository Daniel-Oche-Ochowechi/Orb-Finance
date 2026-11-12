'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useEarlyAccess } from '@/context/EarlyAccessContext';

export default function ClosingCta() {
  const { openEarlyAccess, openContact } = useEarlyAccess();

  return (
    <section className="closing-cta-root" id="closing-cta">
      {/* Third Orbital Earth Background Image */}
      <div className="closing-bg-media" aria-hidden="true">
        <img
          src="/images/orb-orbital-earth.jpg"
          alt=""
          className="closing-bg-img"
        />
        <div className="closing-bg-scrim" />
      </div>

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
            onClick={() => openContact('Partnership')}
            className="apple-closing-secondary-btn"
            type="button"
          >
            <span>Contact us</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .closing-cta-root {
          padding: clamp(5.5rem, 10vw, 10rem) 0 clamp(6rem, 10.5vw, 10.5rem) 0;
          position: relative;
          overflow: hidden;
          z-index: 2;
        }

        .closing-bg-media {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .closing-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 46%;
          opacity: 0.68;
          filter: saturate(0.95) contrast(1.06);
          transform: scale(1.02);
        }

        .closing-bg-scrim {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 65% 65% at 50% 48%, rgba(7, 8, 11, 0.58) 0%, rgba(7, 8, 11, 0.36) 55%, rgba(7, 8, 11, 0.85) 100%),
            linear-gradient(180deg, #07080b 0%, rgba(7, 8, 11, 0.2) 28%, rgba(7, 8, 11, 0.35) 75%, #06070a 100%);
        }

        .text-center {
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .closing-badge-row {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.74rem;
          letter-spacing: 0.14em;
          color: #f8fafc;
          background: rgba(13, 16, 24, 0.76);
          border: 1px solid rgba(226, 232, 240, 0.32);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 0.38rem 1rem;
          border-radius: 9999px;
          margin-bottom: 1.6rem;
        }

        .closing-beacon-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #e2e8f0;
        }

        .closing-headline {
          font-size: clamp(2.15rem, 6.2vw, 5.4rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.06;
          margin-bottom: clamp(0.95rem, 1.8vw, 1.25rem);
          color: #ffffff;
        }

        .closing-sub {
          font-size: clamp(0.98rem, 2vw, 1.3rem);
          color: rgba(255, 255, 255, 0.7);
          max-width: 580px;
          margin: 0 auto clamp(2rem, 3.5vw, 3rem) auto;
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
          gap: 1.1rem;
          background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%);
          color: #07080b;
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 9999px;
          padding: 0.45rem 0.52rem 0.45rem 1.75rem;
          font-family: var(--font-sans);
          font-size: 0.98rem;
          font-weight: 600;
          letter-spacing: -0.015em;
          cursor: pointer;
          box-shadow: 0 10px 28px -6px rgba(226, 232, 240, 0.22), 0 4px 14px rgba(0, 0, 0, 0.35);
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease, background 0.25s ease;
        }

        .apple-closing-primary-btn:hover {
          background: #ffffff;
          border-color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 16px 34px -6px rgba(226, 232, 240, 0.32), 0 6px 18px rgba(0, 0, 0, 0.4);
        }

        .apple-closing-primary-btn:active {
          transform: scale(0.97) translateY(0);
        }

        .btn-arrow-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #07080b;
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
                      background-color 0.25s ease,
                      color 0.25s ease,
                      border-color 0.25s ease;
        }

        .apple-closing-primary-btn:hover .btn-arrow-circle {
          transform: translateX(3px);
          background: #12151f;
          border-color: rgba(226, 232, 240, 0.48);
          color: #f8fafc;
        }

        .apple-closing-secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.065) 0%, rgba(255, 255, 255, 0.025) 100%);
          color: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 9999px;
          padding: 0.85rem 1.8rem;
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: -0.01em;
          cursor: pointer;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 14px rgba(0, 0, 0, 0.25);
          transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .apple-closing-secondary-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1.5px);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28), 
                      0 8px 24px rgba(0, 0, 0, 0.4), 
                      0 0 18px rgba(255, 255, 255, 0.08);
        }

        .apple-closing-secondary-btn:active {
          transform: scale(0.975);
        }

        /* 📱 RESPONSIVE & MOBILE STYLING */
        @media (max-width: 768px) {
          .closing-sub {
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
