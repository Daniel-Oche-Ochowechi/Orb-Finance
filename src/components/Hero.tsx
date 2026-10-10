'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useEarlyAccess } from '@/context/EarlyAccessContext';

export default function Hero() {
  const { openEarlyAccess } = useEarlyAccess();

  const [timeLeft, setTimeLeft] = useState({
    days: '000',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  useEffect(() => {
    const target = new Date('2027-01-15T00:00:00Z').getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: '000', hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(d).padStart(3, '0'),
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="apple-hero-root" id="hero">
      {/* Ambient Aurora Light Plume */}
      <div className="apple-hero-aurora" aria-hidden="true" />
      <div className="apple-hero-sub-glow" aria-hidden="true" />

      <div className="container hero-content-wrapper">
        {/* Status Eyebrow */}
        <div className="hero-status-pill">
          <span className="status-beacon-dot" />
          <span className="status-label font-mono">Opening 15 January 2027</span>
        </div>

        {/* Hero Main Headline */}
        <h1 className="hero-monumental-heading">
          <span className="heading-row-top">Every currency.</span>
          <span className="heading-row-bottom">
            <span className="wireframe-orbital-cluster" aria-hidden="true">
              <span className="orbital-ring ring-1" />
              <span className="orbital-ring ring-2" />
              <span className="orbital-ring ring-3" />
            </span>
            <span className="apple-hero-gradient italic-accent">One orbit.</span>
          </span>
        </h1>

        {/* Editorial Subtitle */}
        <p className="hero-editorial-text">
          Send your local currency to someone in another country, and they receive the equivalent in theirs. Orb is the settlement layer that makes it work for banks, fintechs and the people they serve, through a single, elegant integration.
        </p>

        {/* Action Button Group */}
        <div className="hero-cta-button-group">
          <button
            onClick={() => openEarlyAccess()}
            className="apple-hero-primary-btn"
            type="button"
          >
            <span>Request early access</span>
            <span className="btn-arrow-circle">
              <ArrowRight size={16} strokeWidth={2.5} />
            </span>
          </button>

          <a href="#platform" className="apple-hero-secondary-btn">
            <span>Explore the platform</span>
          </a>
        </div>

        {/* Apple-Grade Countdown Island */}
        <div className="hero-countdown-island glass-surface">
          <div className="countdown-specular" aria-hidden="true" />

          <div className="countdown-top-header">
            <div className="countdown-beacon-wrap">
              <span className="countdown-pulse-dot" />
              <span className="countdown-header-tag font-mono">COUNTDOWN TO LAUNCH</span>
            </div>
            <span className="countdown-target-date font-mono">15 January 2027</span>
          </div>

          <div className="countdown-digit-deck">
            <div className="time-pod">
              <span className="time-num font-mono">{timeLeft.days}</span>
              <span className="time-caption font-mono">DAYS</span>
            </div>
            <span className="time-colon font-mono">:</span>
            <div className="time-pod">
              <span className="time-num font-mono">{timeLeft.hours}</span>
              <span className="time-caption font-mono">HOURS</span>
            </div>
            <span className="time-colon font-mono">:</span>
            <div className="time-pod">
              <span className="time-num font-mono">{timeLeft.minutes}</span>
              <span className="time-caption font-mono">MINUTES</span>
            </div>
            <span className="time-colon font-mono">:</span>
            <div className="time-pod">
              <span className="time-num font-mono">{timeLeft.seconds}</span>
              <span className="time-caption font-mono">SECONDS</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .apple-hero-root {
          position: relative;
          padding-top: 5.5rem;
          padding-bottom: 8.5rem;
          overflow: hidden;
          z-index: 2;
        }

        /* Ambient Aurora Lighting */
        .apple-hero-aurora {
          position: absolute;
          top: -20%;
          right: -10%;
          width: 80vw;
          height: 90vh;
          background: radial-gradient(
            circle at 70% 40%,
            rgba(245, 158, 11, 0.2) 0%,
            rgba(225, 29, 72, 0.18) 28%,
            rgba(139, 92, 246, 0.28) 55%,
            transparent 75%
          );
          filter: blur(85px);
          opacity: 0.85;
          pointer-events: none;
          z-index: 0;
          animation: slowHeroAura 18s ease-in-out infinite alternate;
        }

        .apple-hero-sub-glow {
          position: absolute;
          bottom: 10%;
          left: -10%;
          width: 50vw;
          height: 60vh;
          background: radial-gradient(
            circle,
            rgba(124, 58, 237, 0.12) 0%,
            transparent 70%
          );
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }

        .hero-content-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          position: relative;
          z-index: 1;
          max-width: 1140px;
        }

        /* Status Eyebrow Pill */
        .hero-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.38rem 1rem;
          border-radius: 9999px;
          margin-bottom: 2.2rem;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .status-beacon-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 8px #f59e0b;
          animation: pulseBeacon 2s infinite;
        }

        .status-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          letter-spacing: 0.04em;
        }

        /* Monumental Headline */
        .hero-monumental-heading {
          font-size: clamp(3.2rem, 7vw, 6.4rem);
          font-weight: 700;
          line-height: 1.04;
          letter-spacing: -0.04em;
          margin-bottom: 1.8rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          color: #ffffff;
        }

        .heading-row-bottom {
          display: inline-flex;
          align-items: center;
          position: relative;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        /* Wireframe Orbital Rings */
        .wireframe-orbital-cluster {
          position: absolute;
          left: -20px;
          top: 50%;
          transform: translateY(-50%) rotate(-15deg);
          width: 280px;
          height: 110px;
          pointer-events: none;
          z-index: 0;
          opacity: 0.45;
        }

        .orbital-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px dashed rgba(192, 132, 252, 0.4);
          animation: spinOrbitalRings 30s linear infinite;
        }

        .ring-1 { transform: scale(1); animation-duration: 35s; }
        .ring-2 { transform: scale(0.82) rotate(25deg); border-color: rgba(245, 158, 11, 0.35); animation-duration: 25s; }
        .ring-3 { transform: scale(0.64) rotate(-35deg); border-color: rgba(236, 72, 153, 0.3); animation-duration: 40s; }

        .apple-hero-gradient {
          position: relative;
          z-index: 1;
          background: linear-gradient(135deg, #ffffff 15%, #c084fc 55%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Subtitle Text */
        .hero-editorial-text {
          font-size: clamp(1.15rem, 1.8vw, 1.35rem);
          line-height: 1.6;
          max-width: 680px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 3.2rem;
          font-weight: 400;
        }

        /* Action Buttons */
        .hero-cta-button-group {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
          margin-bottom: 4.5rem;
        }

        .apple-hero-primary-btn {
          display: inline-flex;
          align-items: center;
          gap: 1.1rem;
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

        .apple-hero-primary-btn:hover {
          background: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35),
                      0 14px 38px -4px rgba(255, 255, 255, 0.35),
                      0 4px 16px rgba(0, 0, 0, 0.3);
        }

        .apple-hero-primary-btn:active {
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

        .apple-hero-primary-btn:hover .btn-arrow-circle {
          transform: translateX(4px) scale(1.06);
          background: #12121c;
          border-color: rgba(245, 158, 11, 0.45);
          color: #f59e0b;
        }

        .apple-hero-secondary-btn {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 9999px;
          padding: 0.85rem 1.85rem;
          font-size: 0.96rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          text-decoration: none;
          backdrop-filter: blur(16px);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 2px 8px rgba(0, 0, 0, 0.25);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .apple-hero-secondary-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1.5px);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28), 
                      0 8px 24px rgba(0, 0, 0, 0.4), 
                      0 0 18px rgba(255, 255, 255, 0.08);
        }

        .apple-hero-secondary-btn:active {
          transform: scale(0.975);
        }

        /* Apple Glass Countdown HUD */
        .hero-countdown-island {
          position: relative;
          background: rgba(14, 16, 26, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.11);
          border-radius: 26px;
          padding: 1.8rem 2.4rem;
          backdrop-filter: blur(35px) saturate(180%);
          -webkit-backdrop-filter: blur(35px) saturate(180%);
          max-width: 620px;
          width: 100%;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.15);
          overflow: hidden;
        }

        .countdown-specular {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
        }

        .countdown-top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.2rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .countdown-beacon-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .countdown-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 8px #f59e0b;
          animation: pulseBeacon 2s infinite;
        }

        .countdown-header-tag {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.5);
        }

        .countdown-target-date {
          font-size: 0.74rem;
          color: #fbbf24;
          font-weight: 600;
        }

        .countdown-digit-deck {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .time-pod {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 65px;
        }

        .time-num {
          font-size: clamp(2rem, 3.4vw, 2.75rem);
          font-weight: 700;
          color: #ffffff;
          line-height: 1;
        }

        .time-caption {
          font-size: 0.65rem;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.45);
          margin-top: 0.5rem;
        }

        .time-colon {
          font-size: 1.8rem;
          color: rgba(255, 255, 255, 0.22);
          margin-bottom: 1.1rem;
        }

        @keyframes slowHeroAura {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, 20px) scale(1.06); }
          100% { transform: translate(15px, -15px) scale(0.96); }
        }

        @keyframes spinOrbitalRings {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulseBeacon {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }

        @media (max-width: 768px) {
          .apple-hero-root {
            padding-top: 2.75rem;
            padding-bottom: 4.5rem;
          }

          .hero-status-pill {
            margin-bottom: 1.6rem;
          }

          .hero-monumental-heading {
            font-size: clamp(3.4rem, 12vw, 4.4rem);
            line-height: 0.98;
            letter-spacing: -0.045em;
            margin-bottom: 1.5rem;
          }

          .hero-editorial-text {
            font-size: 1.15rem;
            line-height: 1.55;
            margin-bottom: 2.4rem;
          }

          .hero-cta-button-group {
            flex-direction: column;
            align-items: stretch;
            width: 100%;
            gap: 0.85rem;
            margin-bottom: 3.2rem;
          }

          .apple-hero-primary-btn {
            justify-content: space-between;
            padding: 0.5rem 0.6rem 0.5rem 1.6rem;
            font-size: 1.05rem;
          }

          .apple-hero-secondary-btn {
            justify-content: center;
            padding: 0.9rem;
          }

          /* Unboxed Countdown in Mobile View */
          .hero-countdown-island {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }

          .countdown-specular {
            display: none;
          }

          .countdown-top-header {
            padding-bottom: 0.6rem;
            margin-bottom: 0.85rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }

          .time-pod {
            min-width: 44px;
          }

          .time-num {
            font-size: 2.2rem;
          }

          .time-caption {
            font-size: 0.58rem;
            letter-spacing: 0.12em;
          }

          .time-colon {
            font-size: 1.5rem;
            margin-bottom: 0.9rem;
          }
        }
      `}</style>
    </section>
  );
}

