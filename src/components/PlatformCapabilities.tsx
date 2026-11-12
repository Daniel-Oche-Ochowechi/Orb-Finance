'use client';

import React from 'react';

const CAPABILITIES = [
  {
    num: '01',
    title: 'Cross-border transfers',
    desc: 'Send your local currency to a person in another country. They receive the equivalent amount in their own local currency, at a rate and fee you can see before you confirm.',
    image: '/images/global-settlement-globe.png',
    alt: 'Global Settlement Globe with Orbiting Currency Coins',
    glowColor: 'rgba(226, 232, 240, 0.28)',
    badge: 'Transparent Upfront FX',
  },
  {
    num: '02',
    title: 'Domestic transfers',
    desc: 'Precise, dependable movement of Naira within Nigeria, with a clear status at every step.',
    image: '/images/naira-orbit.png',
    alt: 'Chrome Naira Orbiting Earth',
    glowColor: 'rgba(203, 213, 225, 0.28)',
    badge: 'Real-Time Verification',
  },
  {
    num: '03',
    title: 'Bill payments',
    desc: 'Electricity, airtime, data and television, available inside your own product.',
    image: '/images/bill-payment-globe.png',
    alt: 'Global Bill Payment Globe with Floating Glass Tiles',
    glowColor: 'rgba(241, 245, 249, 0.28)',
    badge: 'Direct Product Integration',
  },
];

export default function PlatformCapabilities() {
  return (
    <section className="apple-platform-root" id="platform">
      <div className="container">
        {/* Section Header */}
        <div className="platform-header-wrap">
          <div className="platform-eyebrow-row">
            <span className="platform-eyebrow-rule" aria-hidden="true" />
            <span className="platform-eyebrow">THE PLATFORM</span>
            <span className="platform-eyebrow-rule" aria-hidden="true" />
          </div>
          <h2 className="platform-headline">
            One integration. <br />
            <span className="italic-accent apple-gradient-text">Three capabilities.</span>
          </h2>
          <p className="platform-subhead">
            Engineered to streamline domestic velocity, local utility orchestration, and borderless multi-currency settlement.
          </p>
        </div>

        {/* 3-Column Architectural Capability Cards */}
        <div className="platform-grand-grid">
          {CAPABILITIES.map((cap) => (
            <div key={cap.num} className="grand-bento-card">
              {/* Top Specular Bevel Edge */}
              <div className="card-specular-edge" aria-hidden="true" />

              {/* Quiet Architectural Top Header Row */}
              <div className="card-top-meta">
                <span className="card-num">{cap.num}</span>
                <span className="card-badge-text">{cap.badge}</span>
              </div>

              {/* 3D Artwork Chamber */}
              <div className="card-grand-canvas">
                <img
                  src={cap.image}
                  alt={cap.alt}
                  className="grand-globe-image"
                  loading="eager"
                />
              </div>

              {/* Deep Obsidian Scrim Gradient */}
              <div className="card-deep-scrim" aria-hidden="true" />

              {/* Editorial Overlay on Lower Third */}
              <div className="card-typography-overlay">
                <h3 className="card-headline-title">{cap.title}</h3>
                <p className="card-headline-desc">{cap.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .apple-platform-root {
          padding: clamp(5rem, 9vw, 9rem) 0;
          position: relative;
          z-index: 2;
        }

        .platform-header-wrap {
          text-align: center;
          max-width: 740px;
          margin: 0 auto clamp(3rem, 5.5vw, 5rem) auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .platform-eyebrow-row {
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1.2rem;
        }

        .platform-eyebrow-rule {
          width: 24px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(226, 232, 240, 0.55));
        }

        .platform-eyebrow-rule:last-child {
          background: linear-gradient(90deg, rgba(226, 232, 240, 0.55), transparent);
        }

        .platform-eyebrow {
          font-family: var(--font-sans);
          font-size: 0.66rem;
          font-weight: 500;
          letter-spacing: 0.24em;
          color: rgba(203, 213, 225, 0.66);
          text-transform: uppercase;
        }

        .platform-headline {
          font-size: clamp(2.55rem, 4.9vw, 4rem);
          font-weight: 600;
          letter-spacing: -0.038em;
          line-height: 1.07;
          margin-bottom: 1.35rem;
          color: #ffffff;
        }

        .apple-gradient-text {
          position: relative;
          z-index: 1;
          background: linear-gradient(180deg, #ffffff 8%, #cbd5e1 64%, #94a3b8 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .platform-subhead {
          font-size: clamp(1.02rem, 1.4vw, 1.14rem);
          line-height: 1.68;
          color: rgba(226, 232, 240, 0.64);
          max-width: 620px;
          font-weight: 400;
        }

        .platform-headline .italic-accent {
          font-weight: 300;
        }

        /* Grand Scale Grid */
        .platform-grand-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(1.4rem, 2.4vw, 2rem);
        }

        .grand-bento-card {
          position: relative;
          background: linear-gradient(
            165deg,
            rgba(16, 19, 28, 0.9) 0%,
            rgba(9, 11, 16, 0.96) 100%
          );
          border: 1px solid rgba(226, 232, 240, 0.12);
          border-radius: 30px;
          height: clamp(440px, 44vw, 600px);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
          box-shadow: 0 28px 64px rgba(0, 0, 0, 0.62), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.35s ease,
            box-shadow 0.45s ease;
          cursor: default;
        }

        .grand-bento-card:hover {
          transform: translateY(-5px);
          border-color: rgba(226, 232, 240, 0.28);
          box-shadow: 0 38px 82px rgba(0, 0, 0, 0.78), inset 0 1px 0 rgba(255, 255, 255, 0.14);
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
            rgba(226, 232, 240, 0.38) 50%,
            transparent 100%
          );
          z-index: 6;
          pointer-events: none;
        }

        /* Quiet Top Architectural Metadata Row */
        .card-top-meta {
          position: absolute;
          top: 1.55rem;
          left: 1.75rem;
          right: 1.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          z-index: 5;
        }

        .card-num {
          font-family: var(--font-sans);
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          color: rgba(226, 232, 240, 0.56);
        }

        .card-badge-text {
          font-family: var(--font-sans);
          font-size: 0.64rem;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(203, 213, 225, 0.68);
        }

        /* Massive 3D Artwork Canvas Filling the Card */
        .card-grand-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 3.4rem;
          z-index: 2;
          transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .grand-bento-card:hover .card-grand-canvas {
          transform: scale(1.06) translateY(-5px);
        }

        .grand-globe-image {
          width: 92%;
          height: 78%;
          max-width: 400px;
          object-fit: contain;
          filter: drop-shadow(0 30px 45px rgba(0, 0, 0, 0.85));
        }

        /* Deep Scrim for Ultimate Readability */
        .card-deep-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(7, 8, 13, 0.98) 0%,
            rgba(7, 8, 13, 0.88) 34%,
            rgba(7, 8, 13, 0.24) 66%,
            transparent 100%
          );
          z-index: 3;
          pointer-events: none;
        }

        /* Editorial Lower-Third Overlay */
        .card-typography-overlay {
          position: relative;
          z-index: 4;
          padding: 2rem 2.15rem 2.2rem;
          display: flex;
          flex-direction: column;
          border-top: 1px solid rgba(255, 255, 255, 0.055);
        }

        .card-headline-title {
          font-size: clamp(1.65rem, 2.2vw, 2.05rem);
          font-weight: 550;
          letter-spacing: -0.03em;
          color: #ffffff;
          margin-bottom: 0.65rem;
          line-height: 1.15;
        }

        .card-headline-desc {
          font-size: 0.95rem;
          line-height: 1.62;
          color: rgba(203, 213, 225, 0.66);
          font-weight: 400;
        }

        @media (max-width: 1024px) {
          .platform-grand-grid {
            grid-template-columns: 1fr;
            gap: clamp(1.5rem, 4vw, 2.25rem);
          }
          .grand-bento-card {
            height: clamp(400px, 95vw, 520px);
          }
        }
      `}</style>
    </section>
  );
}
