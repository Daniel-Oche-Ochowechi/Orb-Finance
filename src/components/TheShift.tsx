'use client';

import React from 'react';

export default function TheShift() {
  return (
    <section className="apple-shift-root" id="shift">
      <div className="container">
        <div className="apple-shift-grid">
          {/* Left Column: Editorial Typography */}
          <div className="shift-editorial-col">
            <div className="shift-eyebrow-row">
              <span className="shift-eyebrow-rule" aria-hidden="true" />
              <span className="shift-eyebrow">THE SHIFT</span>
            </div>

            <h2 className="shift-headline">
              Money should move like <br className="hidden md:inline" />
              <span className="italic-accent apple-shimmer-text">information.</span>
            </h2>

            <p className="shift-body-text">
              Today, sending money to another country means layers of intermediaries, each adding delay and cost, and often an unclear amount arriving at the other end. Your teams spend their time connecting what should already be connected.
            </p>

            {/* Editorial Statement Panel */}
            <div className="shift-statement-card">
              <div className="statement-specular" aria-hidden="true" />
              <div className="statement-content">
                <h3 className="statement-title">
                  With Orb, you send in your currency. They receive in theirs.
                </h3>
                <p className="statement-sub">
                  The rate is shown before you commit.
                </p>
              </div>
            </div>

            {/* Luxury Architectural Invariants */}
            <div className="shift-invariants-row">
              <div className="invariant-item">
                <span className="invariant-val">1</span>
                <span className="invariant-label">UNIFIED CONNECTION</span>
              </div>
              <div className="invariant-item">
                <span className="invariant-val">0.00%</span>
                <span className="invariant-label">HIDDEN FX SPREAD</span>
              </div>
              <div className="invariant-item">
                <span className="invariant-val">&lt; 1.2s</span>
                <span className="invariant-label">SETTLEMENT TIME</span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Photographic Frame */}
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

              {/* Integrated Gallery Editorial Caption (No Floating Box-in-Box) */}
              <div className="frame-caption-glass">
                <div className="caption-tag">FINANCIAL INFRASTRUCTURE</div>
                <div className="caption-headline">
                  Built for the builders connecting Africa to the world.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .apple-shift-root {
          padding: clamp(5rem, 9vw, 9rem) 0;
          position: relative;
          z-index: 2;
          background: transparent;
        }

        .apple-shift-grid {
          display: grid;
          grid-template-columns: 1.12fr 1fr;
          gap: clamp(2.5rem, 5.5vw, 5.5rem);
          align-items: center;
        }

        /* Editorial Typography Column */
        .shift-editorial-col {
          display: flex;
          flex-direction: column;
        }

        .shift-eyebrow-row {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.35rem;
        }

        .shift-eyebrow-rule {
          width: 24px;
          height: 1px;
          background: linear-gradient(90deg, rgba(226, 232, 240, 0.75), rgba(226, 232, 240, 0.15));
        }

        .shift-eyebrow {
          font-family: var(--font-sans);
          font-size: 0.66rem;
          font-weight: 500;
          letter-spacing: 0.24em;
          color: rgba(203, 213, 225, 0.66);
          text-transform: uppercase;
        }

        .shift-headline {
          font-size: clamp(2.55rem, 5vw, 4.15rem);
          font-weight: 600;
          letter-spacing: -0.038em;
          line-height: 1.07;
          margin-bottom: 1.65rem;
          color: #ffffff;
        }

        .apple-shimmer-text {
          font-weight: 300;
          background: linear-gradient(180deg, #ffffff 15%, #cbd5e1 85%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .shift-body-text {
          font-size: clamp(1.04rem, 1.4vw, 1.16rem);
          line-height: 1.72;
          color: rgba(226, 232, 240, 0.66);
          margin-bottom: 2.5rem;
          max-width: 560px;
          font-weight: 400;
        }

        /* Editorial Statement Card */
        .shift-statement-card {
          position: relative;
          background: linear-gradient(
            165deg,
            rgba(16, 19, 28, 0.76) 0%,
            rgba(9, 11, 16, 0.88) 100%
          );
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(226, 232, 240, 0.12);
          border-radius: 24px;
          padding: 1.65rem 2rem;
          margin-bottom: 2.6rem;
          box-shadow: 0 24px 54px rgba(0, 0, 0, 0.52), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }

        .statement-specular {
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(226, 232, 240, 0.36) 50%,
            transparent 100%
          );
          pointer-events: none;
        }

        .statement-content {
          display: flex;
          flex-direction: column;
          gap: 0.42rem;
          padding-left: 1.1rem;
          border-left: 1px solid rgba(226, 232, 240, 0.28);
        }

        .statement-title {
          font-size: clamp(1.08rem, 1.5vw, 1.24rem);
          font-weight: 500;
          color: #f8fafc;
          letter-spacing: -0.015em;
          line-height: 1.4;
        }

        .statement-sub {
          font-size: 0.92rem;
          line-height: 1.55;
          color: rgba(203, 213, 225, 0.62);
          font-weight: 400;
        }

        /* Architectural Metrics Row */
        .shift-invariants-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.75rem;
          padding-top: 1.65rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .invariant-item {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          padding-right: 0.75rem;
        }

        .invariant-item:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 12%;
          bottom: 12%;
          width: 1px;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(226, 232, 240, 0.14) 50%,
            transparent 100%
          );
        }

        .invariant-item:not(:first-child) {
          padding-left: clamp(0.45rem, 1.5vw, 1rem);
        }

        .invariant-val {
          font-family: var(--font-sans);
          font-size: clamp(1.55rem, 2.5vw, 2.15rem);
          font-weight: 300;
          font-variant-numeric: tabular-nums lining-nums;
          letter-spacing: -0.03em;
          line-height: 1;
          background: linear-gradient(180deg, #ffffff 18%, #cbd5e1 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .invariant-label {
          font-family: var(--font-sans);
          font-size: 0.58rem;
          font-weight: 500;
          letter-spacing: 0.2em;
          color: rgba(148, 163, 184, 0.65);
        }

        /* Right Column: Gallery Frame */
        .shift-image-col {
          display: flex;
          justify-content: center;
        }

        .shift-frame-container {
          position: relative;
          width: 100%;
          max-width: 490px;
          border-radius: 30px;
          overflow: hidden;
          background: #0b0d13;
          border: 1px solid rgba(226, 232, 240, 0.14);
          box-shadow: 0 36px 80px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.4s ease,
            box-shadow 0.55s ease;
        }

        .shift-frame-container:hover {
          transform: translateY(-5px);
          border-color: rgba(226, 232, 240, 0.28);
          box-shadow: 0 44px 96px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.16);
        }

        .frame-specular-top {
          position: absolute;
          top: 0;
          left: 14%;
          right: 14%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(226, 232, 240, 0.42) 50%,
            transparent 100%
          );
          z-index: 4;
          pointer-events: none;
        }

        .image-viewport {
          position: relative;
          width: 100%;
          height: clamp(380px, 50vw, 560px);
          overflow: hidden;
        }

        .shift-real-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
          filter: contrast(1.04) brightness(0.95);
          transition: transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .shift-frame-container:hover .shift-real-image {
          transform: scale(1.03);
        }

        .image-natural-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(7, 8, 12, 0.94) 0%,
            rgba(7, 8, 12, 0.56) 28%,
            rgba(7, 8, 12, 0.08) 62%,
            transparent 100%
          );
          pointer-events: none;
        }

        /* Integrated Editorial Caption */
        .frame-caption-glass {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: clamp(1.35rem, 2.8vw, 2rem) clamp(1.4rem, 3vw, 2.15rem);
          border-top: 1px solid rgba(226, 232, 240, 0.1);
          background: linear-gradient(
            180deg,
            rgba(9, 11, 16, 0.25) 0%,
            rgba(9, 11, 16, 0.88) 100%
          );
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 3;
          display: flex;
          flex-direction: column;
          gap: 0.42rem;
        }

        .caption-tag {
          font-family: var(--font-sans);
          font-size: 0.6rem;
          font-weight: 500;
          letter-spacing: 0.22em;
          color: rgba(203, 213, 225, 0.65);
        }

        .caption-headline {
          font-size: clamp(0.94rem, 1.35vw, 1.06rem);
          font-weight: 400;
          color: #f8fafc;
          line-height: 1.48;
          letter-spacing: -0.01em;
        }

        @media (max-width: 992px) {
          .apple-shift-grid {
            grid-template-columns: 1fr;
            gap: clamp(2.25rem, 5vw, 3.5rem);
          }
          .shift-frame-container {
            max-width: 100%;
          }
        }

        @media (max-width: 540px) {
          .shift-statement-card {
            padding: 1.35rem 1.4rem;
            border-radius: 20px;
          }
          .shift-invariants-row {
            gap: 0.45rem;
          }
          .invariant-val {
            font-size: 1.38rem;
          }
          .invariant-label {
            font-size: 0.52rem;
            letter-spacing: 0.14em;
          }
        }
      `}</style>
    </section>
  );
}
