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
      <div className="container">
        {/* Section Header */}
        <div className="apple-inst-header">
          <span className="inst-eyebrow font-mono">BUILT FOR INSTITUTIONS</span>

          <h2 className="inst-headline">
            Engineered for banks and fintechs that <br className="hidden md:inline" />
            <span className="apple-gradient-text italic-accent">value precision.</span>
          </h2>
        </div>

        {/* 4 Luxury Apple Pro Bento Cards */}
        <div className="inst-pillars-grid">
          {INSTITUTION_PILLARS.map((pillar) => {
            const IconComponent = pillar.icon;
            return (
              <div key={pillar.num} className="inst-pillar-card glass-surface">
                <div className="card-specular-glare" aria-hidden="true" />
                
                <div className="pillar-top-row">
                  <div className="pillar-icon-box">
                    <IconComponent size={20} strokeWidth={2} />
                  </div>
                  <span className="pillar-num font-mono">{pillar.num}</span>
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
          padding: 8.5rem 0;
          position: relative;
          z-index: 2;
          overflow: hidden;
        }

        .apple-inst-ambient-glow {
          position: absolute;
          top: 35%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 950px;
          height: 520px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.14) 0%, rgba(245, 158, 11, 0.06) 45%, transparent 70%);
          filter: blur(85px);
          pointer-events: none;
          z-index: 0;
        }

        .apple-inst-header {
          text-align: center;
          max-width: 840px;
          margin: 0 auto 5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .inst-eyebrow {
          font-size: 0.74rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: #f59e0b;
          text-transform: uppercase;
          margin-bottom: 1.2rem;
          display: inline-block;
        }

        .inst-headline {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.08;
          color: #ffffff;
        }

        .apple-gradient-text {
          background: linear-gradient(135deg, #ffffff 15%, #c084fc 60%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* 4-Pillars Bento Grid */
        .inst-pillars-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          margin-bottom: 4.5rem;
          position: relative;
          z-index: 1;
        }

        .inst-pillar-card {
          position: relative;
          padding: 3.2rem 2.8rem;
          border-radius: 28px;
          background: rgba(15, 17, 28, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.11);
          backdrop-filter: blur(35px) saturate(180%);
          -webkit-backdrop-filter: blur(35px) saturate(180%);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.15);
          display: flex;
          flex-direction: column;
          gap: 1.8rem;
          overflow: hidden;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.35s ease;
        }

        .inst-pillar-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.22);
          box-shadow: 0 35px 80px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.25);
        }

        .card-specular-glare {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.35) 50%, transparent 100%);
        }

        .pillar-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pillar-icon-box {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #c084fc;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
        }

        .inst-pillar-card:hover .pillar-icon-box {
          background: rgba(192, 132, 252, 0.15);
          border-color: rgba(192, 132, 252, 0.35);
          color: #ffffff;
          transform: scale(1.05);
        }

        .pillar-num {
          font-size: 0.95rem;
          font-weight: 700;
          color: #fbbf24;
          letter-spacing: 0.08em;
        }

        .pillar-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .pillar-title {
          font-size: 1.65rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.025em;
        }

        .pillar-description {
          font-size: 1.1rem;
          line-height: 1.68;
          color: rgba(255, 255, 255, 0.68);
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
          gap: 1.15rem;
          background: linear-gradient(180deg, #ffffff 0%, #f4f4f6 100%);
          color: #07070d;
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 9999px;
          padding: 0.45rem 0.52rem 0.45rem 1.85rem;
          font-family: var(--font-sans);
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: -0.015em;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), 0 8px 24px -4px rgba(255, 255, 255, 0.18);
          transition: transform 0.3s cubic-bezier(0.19, 1, 0.22, 1), box-shadow 0.3s ease;
        }

        .apple-inst-main-btn:hover {
          background: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35),
                      0 14px 38px -4px rgba(255, 255, 255, 0.35),
                      0 4px 16px rgba(0, 0, 0, 0.3);
        }

        .apple-inst-main-btn:active {
          transform: scale(0.97) translateY(0);
        }

        .btn-arrow-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #07070d;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), 
                      background-color 0.25s ease, 
                      color 0.25s ease, 
                      border-color 0.25s ease;
        }

        .apple-inst-main-btn:hover .btn-arrow-circle {
          transform: translateX(4px) scale(1.06);
          background: #12121c;
          border-color: rgba(245, 158, 11, 0.45);
          color: #f59e0b;
        }

        .inst-discreet-note {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.45);
        }

        @keyframes pulseBeacon {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.25); }
        }

        @media (max-width: 900px) {
          .inst-pillars-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .inst-pillar-card {
            padding: 2.2rem 1.8rem;
          }
        }
      `}</style>
    </section>
  );
}
