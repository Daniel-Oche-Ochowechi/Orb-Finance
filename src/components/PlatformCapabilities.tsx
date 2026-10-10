'use client';

import React from 'react';

const CAPABILITIES = [
  {
    num: '01',
    title: 'Cross-border transfers',
    desc: 'Send your local currency to a person in another country. They receive the equivalent amount in their own local currency, at a rate and fee you can see before you confirm.',
    image: '/images/global-settlement-globe.png',
    alt: 'Global Settlement Globe with Orbiting Currency Coins',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    badge: 'Transparent Upfront FX',
  },
  {
    num: '02',
    title: 'Domestic transfers',
    desc: 'Precise, dependable movement of Naira within Nigeria, with a clear status at every step.',
    image: '/images/naira-orbit.png',
    alt: 'Chrome Naira Orbiting Earth',
    glowColor: 'rgba(139, 92, 246, 0.3)',
    badge: 'Real-Time Verification',
  },
  {
    num: '03',
    title: 'Bill payments',
    desc: 'Electricity, airtime, data and television, available inside your own product.',
    image: '/images/bill-payment-globe.png',
    alt: 'Global Bill Payment Globe with Floating Glass Tiles',
    glowColor: 'rgba(236, 72, 153, 0.3)',
    badge: 'Direct Product Integration',
  },
];

export default function PlatformCapabilities() {
  return (
    <section className="apple-platform-root" id="platform">
      <div className="container">
        {/* Section Header */}
        <div className="platform-header-wrap">
          <span className="platform-eyebrow">THE PLATFORM</span>
          <h2 className="platform-headline">
            One integration. <br />
            <span className="italic-accent apple-gradient-text">Three capabilities.</span>
          </h2>
          <p className="platform-subhead">
            Engineered to streamline domestic velocity, local utility orchestration, and borderless multi-currency settlement.
          </p>
        </div>

        {/* 3-Column Grand Scale Immersive Cards */}
        <div className="platform-grand-grid">
          {CAPABILITIES.map((cap) => (
            <div key={cap.num} className="grand-bento-card">
              {/* Top Specular Bevel Edge */}
              <div className="card-specular-edge" aria-hidden="true" />
              
              {/* Ambient Radial Color Bloom behind the Globe */}
              <div
                className="card-bloom-halo"
                style={{ background: cap.glowColor }}
                aria-hidden="true"
              />

              {/* Floating Top Telemetry Pill */}
              <div className="card-top-pill">
                <span className="pill-pulse-dot" />
                <span className="pill-text font-mono">{cap.badge}</span>
              </div>

              {/* Massive 3D Artwork Chamber */}
              <div className="card-grand-canvas">
                <img
                  src={cap.image}
                  alt={cap.alt}
                  className="grand-globe-image"
                  loading="eager"
                />
              </div>

              {/* Deep Apple Scrim Gradient */}
              <div className="card-deep-scrim" aria-hidden="true" />

              {/* Text Overlay on Lower Third */}
              <div className="card-typography-overlay">
                <div className="step-num-line font-mono">
                  <span>{cap.num}</span>
                  <span className="step-dash">—</span>
                </div>
                <h3 className="card-headline-title">{cap.title}</h3>
                <p className="card-headline-desc">{cap.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .apple-platform-root {
          padding: 8.5rem 0;
          position: relative;
          z-index: 2;
        }

        .platform-header-wrap {
          text-align: center;
          max-width: 780px;
          margin: 0 auto 5.5rem auto;
        }

        .platform-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          color: #f59e0b;
          text-transform: uppercase;
          margin-bottom: 0.85rem;
          display: inline-block;
        }

        .platform-headline {
          font-size: clamp(2.6rem, 5vw, 4rem);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1.06;
          margin-bottom: 1.35rem;
        }

        .apple-gradient-text {
          background: linear-gradient(135deg, #ffffff 20%, #c084fc 65%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .platform-subhead {
          font-size: 1.15rem;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.65);
        }

        /* Grand Scale Grid */
        .platform-grand-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2.2rem;
        }

        .grand-bento-card {
          position: relative;
          background: #090a12;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 36px;
          height: 650px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
          box-shadow: 0 35px 80px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.22);
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s ease, box-shadow 0.45s ease;
          cursor: default;
        }

        .grand-bento-card:hover {
          transform: translateY(-10px) scale(1.02);
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 45px 100px rgba(0, 0, 0, 0.85), inset 0 1px 1px rgba(255, 255, 255, 0.35);
        }

        .card-specular-edge {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.45) 50%, transparent 100%);
          z-index: 6;
        }

        .card-bloom-halo {
          position: absolute;
          top: 18%;
          left: 50%;
          transform: translateX(-50%);
          width: 360px;
          height: 360px;
          border-radius: 50%;
          filter: blur(85px);
          opacity: 0.35;
          pointer-events: none;
          z-index: 1;
          transition: opacity 0.4s ease;
        }

        .grand-bento-card:hover .card-bloom-halo {
          opacity: 0.55;
        }

        /* Top Floating Pill */
        .card-top-pill {
          position: absolute;
          top: 1.6rem;
          left: 1.6rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(10, 11, 18, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
          padding: 0.4rem 0.95rem;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: 5;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
        }

        .pill-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }

        .pill-text {
          font-size: 0.74rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: 0.04em;
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
          padding-top: 2.5rem;
          z-index: 2;
          transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .grand-bento-card:hover .card-grand-canvas {
          transform: scale(1.08) translateY(-6px);
        }

        .grand-globe-image {
          width: 96%;
          height: 85%;
          max-width: 420px;
          object-fit: contain;
          filter: drop-shadow(0 30px 45px rgba(0, 0, 0, 0.85));
        }

        /* Deep Scrim for Ultimate Readability */
        .card-deep-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(7, 8, 14, 0.98) 0%,
            rgba(7, 8, 14, 0.88) 32%,
            rgba(7, 8, 14, 0.25) 65%,
            transparent 100%
          );
          z-index: 3;
          pointer-events: none;
        }

        /* Text Overlay on Lower Third */
        .card-typography-overlay {
          position: relative;
          z-index: 4;
          padding: 2.2rem 2.4rem;
          display: flex;
          flex-direction: column;
        }

        .step-num-line {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 0.75rem;
          letter-spacing: 0.06em;
        }

        .step-dash {
          color: rgba(255, 255, 255, 0.4);
        }

        .card-headline-title {
          font-size: clamp(2rem, 2.5vw, 2.35rem);
          font-weight: 700;
          letter-spacing: -0.035em;
          color: #ffffff;
          margin-bottom: 0.75rem;
          line-height: 1.12;
        }

        .card-headline-desc {
          font-size: 1rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.7);
        }

        @media (max-width: 1024px) {
          .platform-grand-grid {
            grid-template-columns: 1fr;
            gap: 2.8rem;
          }
          .grand-bento-card {
            height: 580px;
          }
        }
      `}</style>
    </section>
  );
}
