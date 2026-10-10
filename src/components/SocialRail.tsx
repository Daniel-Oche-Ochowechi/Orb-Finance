'use client';

import React from 'react';
import { Instagram, Linkedin } from 'lucide-react';

export default function SocialRail() {
  return (
    <aside className="social-rail-dock" aria-label="Social connections">
      <a
        href="https://instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        className="social-icon-circle"
        aria-label="Instagram"
      >
        <Instagram size={16} />
      </a>

      <a
        href="https://x.com"
        target="_blank"
        rel="noopener noreferrer"
        className="social-icon-circle"
        aria-label="X (formerly Twitter)"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      <a
        href="https://linkedin.com"
        target="_blank"
        rel="noopener noreferrer"
        className="social-icon-circle"
        aria-label="LinkedIn"
      >
        <Linkedin size={16} />
      </a>

      <div className="social-dock-line" />

      <style jsx>{`
        .social-rail-dock {
          position: fixed;
          left: 2rem;
          bottom: 3.5rem;
          z-index: 30;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }

        .social-icon-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: all 0.25s ease;
          backdrop-filter: blur(8px);
        }

        .social-icon-circle:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px) scale(1.1);
          box-shadow: 0 0 15px rgba(167, 139, 250, 0.4);
        }

        .social-dock-line {
          width: 1px;
          height: 48px;
          background: linear-gradient(180deg, var(--glass-border), transparent);
        }

        @media (max-width: 1024px) {
          .social-rail-dock {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}
