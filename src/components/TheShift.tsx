'use client';

import React from 'react';

export default function TheShift() {
  return (
    <section className="apple-shift-root" id="shift">
      <div className="container">
        <div className="apple-shift-grid">
          {/* Left Column: Editorial Typography */}
          <div className="shift-editorial-col">
            <span className="shift-eyebrow font-mono">THE SHIFT</span>

            <h2 className="shift-headline">
              Money should move like <br className="hidden md:inline" />
              <span className="italic-accent apple-shimmer-text">information.</span>
            </h2>

            <p className="shift-body-text">
              Today, sending money to another country means layers of intermediaries, each adding delay and cost, and often an unclear amount arriving at the other end. Your teams spend their time connecting what should already be connected.
            </p>

            {/* Apple Quote Highlight Statement */}
            <div className="shift-statement-card">
              <div className="statement-line-accent" aria-hidden="true" />
              <div className="statement-content">
                <h3 className="statement-title">With Orb, you send in your currency. They receive in theirs.</h3>
                <p className="statement-sub">
                  The rate is shown before you commit.
                </p>
              </div>
            </div>

            {/* Subtle Minimalist Architectural Invariants */}
            <div className="shift-invariants-row font-mono">
              <div className="invariant-item">
                <span className="invariant-val">1</span>
                <span className="invariant-label">UNIFIED CONNECTION</span>
              </div>
              <div className="invariant-sep" />
              <div className="invariant-item">
                <span className="invariant-val">0.00%</span>
                <span className="invariant-label">HIDDEN FX SPREAD</span>
              </div>
              <div className="invariant-sep" />
              <div className="invariant-item">
                <span className="invariant-val">&lt; 1.2s</span>
                <span className="invariant-label">SETTLEMENT TIME</span>
              </div>
            </div>
          </div>

          {/* Right Column: Apple-Crafted Photographic Visual Frame */}
          <div className="shift-image-col">
            <div className="shift-frame-container">
              <div className="frame-specular-top" aria-hidden="true" />

              <div className="image-viewport">
                <img
                  src="/images/the-shift-visual.jpg"
                  alt="Professional engineer building with Orb Finance infrastructure"
                  className="shift-real-image"
                  loading="eager"
                />
                <div className="image-natural-scrim" aria-hidden="true" />
              </div>

              {/* Minimalist Lower-Third Glass Caption */}
              <div className="frame-caption-glass">
                <div className="caption-tag font-mono">FINANCIAL INFRASTRUCTURE</div>
                <div className="caption-headline">Built for the builders connecting Africa to the world.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .apple-shift-root {
          padding: 9rem 0;
          position: relative;
          z-index: 2;
          background: transparent;
        }

        .apple-shift-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 5rem;
          align-items: center;
        }

        /* Editorial Typography Column */
        .shift-editorial-col {
          display: flex;
          flex-direction: column;
        }

        .shift-eyebrow {
          font-size: 0.76rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: #f59e0b;
          text-transform: uppercase;
          margin-bottom: 1.2rem;
          display: inline-block;
        }

        .shift-headline {
          font-size: clamp(2.6rem, 5.2vw, 4.2rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.06;
          margin-bottom: 1.8rem;
          color: #ffffff;
        }

        .apple-shimmer-text {
          background: linear-gradient(135deg, #ffffff 20%, #c084fc 60%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .shift-body-text {
          font-size: 1.18rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2.8rem;
          max-width: 580px;
        }

        /* Statement Card */
        .shift-statement-card {
          position: relative;
          display: flex;
          align-items: stretch;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 20px;
          padding: 1.8rem 2rem;
          margin-bottom: 2.8rem;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
        }

        .statement-line-accent {
          position: absolute;
          left: 0;
          top: 15%;
          bottom: 15%;
          width: 3px;
          border-radius: 0 4px 4px 0;
          background: linear-gradient(180deg, #c084fc 0%, #f59e0b 100%);
        }

        .statement-content {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          padding-left: 0.5rem;
        }

        .statement-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.015em;
        }

        .statement-sub {
          font-size: 0.96rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.65);
        }

        /* Invariants Row */
        .shift-invariants-row {
          display: flex;
          align-items: center;
          gap: 1.8rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .invariant-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .invariant-val {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
        }

        .invariant-label {
          font-size: 0.62rem;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.45);
        }

        .invariant-sep {
          width: 1px;
          height: 28px;
          background: rgba(255, 255, 255, 0.1);
        }

        /* Right Column: Visual Frame */
        .shift-image-col {
          display: flex;
          justify-content: center;
        }

        .shift-frame-container {
          position: relative;
          width: 100%;
          max-width: 490px;
          border-radius: 32px;
          overflow: hidden;
          background: #0d0f18;
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 40px 90px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.25);
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.45s ease;
        }

        .shift-frame-container:hover {
          transform: translateY(-6px);
          box-shadow: 0 50px 110px rgba(0, 0, 0, 0.9), inset 0 1px 1px rgba(255, 255, 255, 0.35);
        }

        .frame-specular-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.45) 50%, transparent 100%);
          z-index: 4;
        }

        .image-viewport {
          position: relative;
          width: 100%;
          height: 560px;
          overflow: hidden;
        }

        .shift-real-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .shift-frame-container:hover .shift-real-image {
          transform: scale(1.03);
        }

        .image-natural-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(8, 10, 16, 0.96) 0%,
            rgba(8, 10, 16, 0.45) 30%,
            transparent 65%
          );
          pointer-events: none;
        }

        /* Lower-Third Glass Caption */
        .frame-caption-glass {
          position: absolute;
          bottom: 1.5rem;
          left: 1.5rem;
          right: 1.5rem;
          background: rgba(14, 16, 26, 0.82);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 1.25rem 1.4rem;
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
          z-index: 3;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .caption-tag {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #fbbf24;
        }

        .caption-headline {
          font-size: 0.98rem;
          font-weight: 600;
          color: #ffffff;
          line-height: 1.45;
        }

        @media (max-width: 992px) {
          .apple-shift-grid {
            grid-template-columns: 1fr;
            gap: 3.5rem;
          }
          .shift-frame-container {
            max-width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
