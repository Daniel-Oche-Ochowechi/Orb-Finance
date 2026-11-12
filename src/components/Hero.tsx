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
      {/* First Cosmic Horizon Background Image */}
      <div className="hero-bg-media" aria-hidden="true">
        <img
          src="/images/orb-hero-horizon.jpg"
          alt=""
          className="hero-bg-img"
        />
        <div className="hero-bg-scrim" />
      </div>

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

        {/* Classy Obsidian & Sterling Silver Launch Chronometer */}
        <div className="hero-countdown-island">
          <div className="countdown-specular" aria-hidden="true" />

          <div className="countdown-top-header">
            <span className="countdown-header-tag">COUNTDOWN TO LAUNCH</span>
            <span className="countdown-target-date">15 January 2027</span>
          </div>

          <div className="countdown-digit-deck">
            <div className="time-pod">
              <span className="time-num">{timeLeft.days}</span>
              <span className="time-caption">DAYS</span>
            </div>
            <div className="time-pod">
              <span className="time-num">{timeLeft.hours}</span>
              <span className="time-caption">HOURS</span>
            </div>
            <div className="time-pod">
              <span className="time-num">{timeLeft.minutes}</span>
              <span className="time-caption">MINUTES</span>
            </div>
            <div className="time-pod">
              <span className="time-num">{timeLeft.seconds}</span>
              <span className="time-caption">SECONDS</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .apple-hero-root {
          position: relative;
          padding-top: clamp(3.5rem, 7vw, 6.25rem);
          padding-bottom: clamp(4.75rem, 9.5vw, 9rem);
          overflow: hidden;
          z-index: 2;
        }

        .hero-bg-media {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .hero-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center bottom;
          opacity: 0.72;
          filter: saturate(0.95) contrast(1.06);
          transform: scale(1.03);
          animation: heroCosmicDrift 22s ease-in-out infinite alternate;
        }

        @keyframes heroCosmicDrift {
          0% {
            transform: scale(1.03) translate3d(0, 0, 0);
          }
          100% {
            transform: scale(1.07) translate3d(0, -10px, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-bg-img {
            animation: none;
          }
        }

        .hero-bg-scrim {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 75% 70% at 28% 44%, rgba(7, 8, 11, 0.74) 0%, rgba(7, 8, 11, 0.34) 55%, rgba(7, 8, 11, 0.52) 100%),
            linear-gradient(180deg, rgba(7, 8, 11, 0.72) 0%, rgba(7, 8, 11, 0.28) 42%, rgba(7, 8, 11, 0.92) 92%, #07080b 100%);
        }

        .hero-content-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          position: relative;
          z-index: 2;
          max-width: 1140px;
        }

        /* Status Eyebrow Pill */
        .hero-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          background: rgba(13, 16, 24, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          margin-bottom: clamp(1.35rem, 2.5vw, 2.2rem);
        }

        .status-beacon-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #e2e8f0;
        }

        .status-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          letter-spacing: 0.04em;
        }

        /* Monumental Headline */
        .hero-monumental-heading {
          font-size: clamp(2.5rem, 6.8vw, 6.2rem);
          font-weight: 700;
          line-height: 1.02;
          letter-spacing: -0.04em;
          margin-bottom: clamp(1.35rem, 2.4vw, 1.8rem);
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

        .apple-hero-gradient {
          position: relative;
          z-index: 1;
          background: linear-gradient(180deg, #ffffff 8%, #cbd5e1 64%, #94a3b8 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Subtitle Text */
        .hero-editorial-text {
          font-size: clamp(1.02rem, 1.8vw, 1.35rem);
          line-height: 1.6;
          max-width: 680px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: clamp(2rem, 3.8vw, 3.2rem);
          font-weight: 400;
        }

        /* Action Buttons */
        .hero-cta-button-group {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
          margin-bottom: clamp(2.8rem, 5vw, 4.5rem);
        }

        .apple-hero-primary-btn {
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%);
          color: #07080b;
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 9999px;
          padding: 0.45rem 0.52rem 0.45rem 1.7rem;
          font-family: var(--font-sans);
          font-size: 0.96rem;
          font-weight: 600;
          letter-spacing: -0.015em;
          cursor: pointer;
          box-shadow: 0 10px 28px -6px rgba(226, 232, 240, 0.22), 0 4px 14px rgba(0, 0, 0, 0.35);
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease, background 0.25s ease;
        }

        .apple-hero-primary-btn:hover {
          background: #ffffff;
          border-color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 16px 34px -6px rgba(226, 232, 240, 0.32), 0 6px 18px rgba(0, 0, 0, 0.4);
        }

        .apple-hero-primary-btn:active {
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
          transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
        }

        .apple-hero-primary-btn:hover .btn-arrow-circle {
          transform: translateX(3px);
          background: #12151f;
          border-color: rgba(226, 232, 240, 0.48);
          color: #f8fafc;
        }

        .apple-hero-secondary-btn {
          display: inline-flex;
          align-items: center;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.065) 0%, rgba(255, 255, 255, 0.025) 100%);
          color: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 9999px;
          padding: 0.85rem 1.75rem;
          font-size: 0.94rem;
          font-weight: 500;
          letter-spacing: -0.01em;
          text-decoration: none;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 14px rgba(0, 0, 0, 0.25);
          transition: background-color 0.25s ease, border-color 0.25s ease, transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .apple-hero-secondary-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(226, 232, 240, 0.35);
          transform: translateY(-2px);
        }

        .apple-hero-secondary-btn:active {
          transform: scale(0.975);
        }

        /* Refined Luxury Chronometer — Obsidian & Sterling Silver */
        .hero-countdown-island {
          position: relative;
          background: linear-gradient(
            165deg,
            rgba(16, 19, 28, 0.84) 0%,
            rgba(9, 11, 16, 0.92) 100%
          );
          backdrop-filter: blur(22px) saturate(135%);
          -webkit-backdrop-filter: blur(22px) saturate(135%);
          border: 1px solid rgba(226, 232, 240, 0.13);
          border-radius: 26px;
          padding: clamp(1.25rem, 2.4vw, 1.65rem) clamp(1.25rem, 3vw, 2.25rem)
            clamp(1.35rem, 2.6vw, 1.85rem);
          max-width: 560px;
          width: 100%;
          box-shadow:
            0 28px 64px rgba(0, 0, 0, 0.62),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .countdown-specular {
          position: absolute;
          top: 0;
          left: 12%;
          right: 12%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(226, 232, 240, 0.42) 50%,
            transparent 100%
          );
          pointer-events: none;
        }

        .countdown-top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .countdown-header-tag {
          font-family: var(--font-sans);
          font-size: 0.64rem;
          font-weight: 500;
          letter-spacing: 0.22em;
          color: rgba(203, 213, 225, 0.56);
        }

        .countdown-target-date {
          font-family: var(--font-sans);
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: rgba(241, 245, 249, 0.85);
        }

        .countdown-digit-deck {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          align-items: center;
        }

        .time-pod {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.15rem 0.25rem;
        }

        .time-pod:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 14%;
          bottom: 14%;
          width: 1px;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(226, 232, 240, 0.14) 50%,
            transparent 100%
          );
        }

        .time-num {
          font-family: var(--font-sans);
          font-size: clamp(2.05rem, 4.1vw, 3.05rem);
          font-weight: 300;
          font-variant-numeric: tabular-nums lining-nums;
          letter-spacing: -0.04em;
          line-height: 1;
          background: linear-gradient(180deg, #ffffff 18%, #cbd5e1 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .time-caption {
          font-family: var(--font-sans);
          font-size: clamp(0.54rem, 0.95vw, 0.62rem);
          font-weight: 500;
          letter-spacing: 0.22em;
          color: rgba(148, 163, 184, 0.66);
          margin-top: 0.58rem;
        }

        @media (max-width: 768px) {
          .hero-cta-button-group {
            flex-direction: column;
            align-items: stretch;
            width: 100%;
            gap: 0.85rem;
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

          .hero-countdown-island {
            border-radius: 22px;
            padding: 1.1rem 1rem 1.2rem;
          }

          .countdown-top-header {
            padding-bottom: 0.7rem;
            margin-bottom: 0.95rem;
          }

          .countdown-header-tag {
            font-size: 0.58rem;
            letter-spacing: 0.18em;
          }

          .countdown-target-date {
            font-size: 0.72rem;
          }
        }
      `}</style>
    </section>
  );
}

