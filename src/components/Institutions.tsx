'use client';

import React from 'react';
import { ArrowRight, Terminal, Layers, Scale, Play } from 'lucide-react';
import { useEarlyAccess } from '@/context/EarlyAccessContext';

interface InstitutionPillar {
  num: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const INSTITUTION_PILLARS: InstitutionPillar[] = [
  {
    num: '01',
    title: 'A refined API.',
    description: 'Clean endpoints, signed requests and webhooks that retry until delivered.',
    icon: Terminal,
  },
  {
    num: '02',
    title: 'A partner console.',
    description: 'History, statements and access keys, together in one place.',
    icon: Layers,
  },
  {
    num: '03',
    title: 'Transparent economics.',
    description: 'Fees and exchange margins are agreed in advance and visible on every quote.',
    icon: Scale,
  },
  {
    num: '04',
    title: 'Sandbox first.',
    description: 'Your engineers can test the complete flow before a contract is signed.',
    icon: Play,
  },
];

export default function Institutions() {
  const { openEarlyAccess } = useEarlyAccess();

  return (
    <section className="apple-inst-root" id="institutions">
      {/* Second Cosmic Eclipse Background Image */}
      <div className="inst-bg-media" aria-hidden="true">
        <img
          src="/images/orb-eclipse-planet.jpg"
          alt=""
          className="inst-bg-img"
        />
        <div className="inst-bg-scrim" />
      </div>

      <div className="container">
        {/* Section Header */}
        <div className="apple-inst-header">
          <div className="inst-eyebrow-row">
            <span className="inst-eyebrow-rule" aria-hidden="true" />
            <span className="inst-eyebrow">BUILT FOR INSTITUTIONS</span>
            <span className="inst-eyebrow-rule" aria-hidden="true" />
          </div>

          <h2 className="inst-headline">
            Engineered for banks and fintechs that <br className="hidden md:inline" />
            <span className="apple-gradient-text italic-accent">value precision.</span>
          </h2>
        </div>

        {/* 4 Architectural Pillar Cards */}
        <div className="inst-pillars-grid">
          {INSTITUTION_PILLARS.map((pillar) => {
            const IconComponent = pillar.icon;
            return (
              <div key={pillar.num} className="inst-pillar-card">
                <div className="card-specular-glare" aria-hidden="true" />

                <div className="pillar-top-row">
                  <span className="pillar-num">{pillar.num}</span>
                  <span className="pillar-icon-plain" aria-hidden="true">
                    <IconComponent size={16} strokeWidth={1.65} />
                  </span>
                </div>

                <div className="pillar-body">
                  <h3 className="pillar-title">{pillar.title}</h3>
                  <p className="pillar-description">{pillar.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="inst-footer-action-wrap">
          <button
            onClick={() => openEarlyAccess('Bank')}
            className="apple-inst-main-btn"
            type="button"
          >
            <span>Request sandbox access</span>
            <span className="btn-arrow-circle">
              <ArrowRight size={16} strokeWidth={2.5} />
            </span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .apple-inst-root {
          padding: clamp(5rem, 9vw, 9rem) 0;
          position: relative;
          z-index: 2;
          overflow: hidden;
        }

        .inst-bg-media {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .inst-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 48%;
          opacity: 0.62;
          filter: saturate(0.95) contrast(1.05);
          transform: scale(1.04);
        }

        .inst-bg-scrim {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 65% at 50% 50%, rgba(7, 8, 11, 0.3) 0%, rgba(7, 8, 11, 0.78) 78%, #07080b 100%),
            linear-gradient(180deg, #07080b 0%, rgba(7, 8, 11, 0.22) 26%, rgba(7, 8, 11, 0.25) 74%, #07080b 100%);
        }

        .apple-inst-header {
          text-align: center;
          max-width: 840px;
          margin: 0 auto clamp(2.75rem, 5vw, 5rem);
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .inst-eyebrow-row {
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1.2rem;
        }

        .inst-eyebrow-rule {
          width: 24px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(226, 232, 240, 0.55));
        }

        .inst-eyebrow-rule:last-child {
          background: linear-gradient(90deg, rgba(226, 232, 240, 0.55), transparent);
        }

        .inst-eyebrow {
          font-family: var(--font-sans);
          font-size: 0.66rem;
          font-weight: 500;
          letter-spacing: 0.24em;
          color: rgba(203, 213, 225, 0.66);
          text-transform: uppercase;
        }

        .inst-headline {
          font-size: clamp(2.25rem, 4.9vw, 3.9rem);
          font-weight: 600;
          letter-spacing: -0.038em;
          line-height: 1.07;
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

        /* 4-Pillars Architectural Grid */
        .inst-pillars-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: clamp(1.35rem, 2.4vw, 2rem);
          margin-bottom: clamp(2.8rem, 4.5vw, 4.5rem);
          position: relative;
          z-index: 2;
        }

        .inst-headline .italic-accent {
          font-weight: 300;
        }

        .inst-pillar-card {
          position: relative;
          padding: clamp(1.75rem, 3vw, 2.65rem) clamp(1.45rem, 2.8vw, 2.45rem);
          border-radius: 28px;
          background: linear-gradient(
            165deg,
            rgba(16, 19, 28, 0.84) 0%,
            rgba(9, 11, 16, 0.92) 100%
          );
          backdrop-filter: blur(20px) saturate(135%);
          -webkit-backdrop-filter: blur(20px) saturate(135%);
          border: 1px solid rgba(226, 232, 240, 0.12);
          box-shadow: 0 24px 56px rgba(0, 0, 0, 0.56), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.3s ease,
            box-shadow 0.4s ease;
        }

        .inst-pillar-card:hover {
          transform: translateY(-4px);
          border-color: rgba(226, 232, 240, 0.26);
          box-shadow: 0 32px 68px rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.14);
        }

        .card-specular-glare {
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

        .pillar-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .pillar-icon-plain {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: rgba(203, 213, 225, 0.54);
          transition: color 0.25s ease;
        }

        .inst-pillar-card:hover .pillar-icon-plain {
          color: #ffffff;
        }

        .pillar-num {
          font-family: var(--font-sans);
          font-size: 1.02rem;
          font-weight: 300;
          color: rgba(241, 245, 249, 0.82);
          letter-spacing: 0.06em;
        }

        .pillar-body {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .pillar-title {
          font-size: clamp(1.32rem, 1.85vw, 1.55rem);
          font-weight: 550;
          color: #ffffff;
          letter-spacing: -0.025em;
        }

        .pillar-description {
          font-size: 0.98rem;
          line-height: 1.66;
          color: rgba(203, 213, 225, 0.66);
          font-weight: 400;
        }

        /* Central Action Bar */
        .inst-footer-action-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .apple-inst-main-btn {
          display: inline-flex;
          align-items: center;
          gap: 1.05rem;
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

        .apple-inst-main-btn:hover {
          background: #ffffff;
          border-color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 16px 34px -6px rgba(226, 232, 240, 0.32), 0 6px 18px rgba(0, 0, 0, 0.4);
        }

        .apple-inst-main-btn:active {
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

        .apple-inst-main-btn:hover .btn-arrow-circle {
          transform: translateX(3px);
          background: #12151f;
          border-color: rgba(226, 232, 240, 0.48);
          color: #f8fafc;
        }

        .inst-discreet-note {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.45);
        }

        @media (max-width: 900px) {
          .inst-pillars-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
