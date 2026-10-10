'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useEarlyAccess } from '@/context/EarlyAccessContext';

interface NavItem {
  label: string;
  href: string;
  id: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Platform', href: '#platform', id: 'platform' },
  { label: 'How it works', href: '#how-it-works', id: 'how-it-works' },
  { label: 'Partners', href: '#institutions', id: 'institutions' },
  { label: 'Principles', href: '#principles', id: 'principles' },
  { label: 'FAQ', href: '#faq', id: 'faq' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const { openEarlyAccess } = useEarlyAccess();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      // Active Section Spy
      const sections = NAV_ITEMS.map((item) => document.getElementById(item.id));
      const scrollPosition = currentScrollY + 160;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section) {
          const top = section.offsetTop;
          const height = section.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(NAV_ITEMS[i].id);
            break;
          }
        }
      }

      if (currentScrollY < 150) {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className={`top-announcement-bar ${isScrolled ? 'faded' : ''}`}>
        <div className="announcement-content font-mono">
          <span className="announcement-beacon" />
          <span>Orb Finance opens <strong>15 January 2027</strong>.</span>
          <button
            onClick={() => openEarlyAccess()}
            className="announcement-cta"
            type="button"
          >
            <span>Request early access</span>
            <span className="cta-arrow">→</span>
          </button>
        </div>
      </div>

      {/* Sticky Full-Width Apple Navigation Bar */}
      <header className={`sticky-nav-header ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="nav-container">
          {/* Brand Wordmark: Clean, Monolithic 'ORB' */}
          <a href="#" onClick={scrollToTop} className="nav-brand-wordmark" aria-label="Orb Home">
            <span>ORB</span>
          </a>

          {/* Desktop Navigation Links — Pure Unboxed Typography */}
          <nav className="nav-links-deck" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`unboxed-nav-link ${isActive ? 'is-active' : ''}`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="nav-active-dot" aria-hidden="true" />}
                </a>
              );
            })}
          </nav>

          {/* Right Action Button */}
          <div className="nav-right-actions">
            <button
              onClick={() => openEarlyAccess()}
              className="apple-pill-btn"
              type="button"
            >
              <span>Request early access</span>
              <span className="btn-arrow-dot">
                <ArrowRight size={15} strokeWidth={2.5} />
              </span>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              className="nav-mobile-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              type="button"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Overlay */}
      {mobileOpen && (
        <div className="fullscreen-mobile-menu" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          {/* Top Bar inside Fullscreen Overlay */}
          <div className="mobile-menu-header">
            <a
              href="#"
              onClick={(e) => {
                setMobileOpen(false);
                scrollToTop(e);
              }}
              className="mobile-brand"
            >
              <span>ORB</span>
            </a>
            <button
              className="mobile-close-btn"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              type="button"
            >
              <X size={26} />
            </button>
          </div>

          {/* Main Navigation Stack */}
          <div className="mobile-menu-body">
            <div className="mobile-eyebrow font-mono">
              <span className="mobile-pulse-dot" />
              <span>NAVIGATION</span>
            </div>

            <nav className="mobile-fullscreen-nav">
              {NAV_ITEMS.map((item, idx) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`mobile-fullscreen-link ${isActive ? 'active' : ''}`}
                    style={{ animationDelay: `${0.04 * (idx + 1)}s` }}
                  >
                    <span className="link-idx font-mono">0{idx + 1}</span>
                    <span className="link-title">{item.label}</span>
                    <ArrowRight className="link-arrow" size={20} />
                  </a>
                );
              })}
            </nav>

            {/* Bottom Footer Actions */}
            <div className="mobile-menu-footer">
              <div className="mobile-launch-tag font-mono">
                <span>LAUNCHING 15 JANUARY 2027</span>
              </div>
              <button
                className="mobile-cta-fullwidth"
                onClick={() => {
                  setMobileOpen(false);
                  openEarlyAccess();
                }}
                type="button"
              >
                <span>Request early access</span>
                <span className="mobile-cta-arrow">
                  <ArrowRight size={16} strokeWidth={2.5} />
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Top Announcement */
        .top-announcement-bar {
          background: rgba(12, 14, 24, 0.95);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0.55rem 1.5rem;
          text-align: center;
          position: relative;
          z-index: 101;
          transition: transform 0.3s ease, opacity 0.3s ease, height 0.3s ease;
        }

        .top-announcement-bar.faded {
          display: none;
        }

        .announcement-content {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.75);
        }

        .announcement-beacon {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 8px #f59e0b;
        }

        .announcement-content strong {
          color: #ffffff;
          font-weight: 600;
        }

        .announcement-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: transparent;
          border: none;
          color: #fbbf24;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-left: 0.35rem;
        }

        .announcement-cta:hover .cta-arrow {
          transform: translateX(3px);
        }

        .cta-arrow {
          transition: transform 0.2s ease;
        }

        /* Sticky Full-Width Header */
        .sticky-nav-header {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          width: 100%;
          background: rgba(6, 6, 10, 0.75);
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .sticky-nav-header.is-scrolled {
          background: rgba(6, 6, 10, 0.88);
          border-bottom-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        .nav-container {
          max-width: 1220px;
          margin: 0 auto;
          padding: 1.1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Brand Wordmark */
        .nav-brand-wordmark {
          font-family: var(--font-sans);
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.05em;
          color: #ffffff;
          text-decoration: none;
          line-height: 1;
          transition: opacity 0.2s ease;
        }

        .nav-brand-wordmark:hover {
          opacity: 0.85;
        }

        /* Pure Unboxed Links Deck */
        .nav-links-deck {
          display: flex;
          align-items: center;
          gap: 2.4rem;
        }

        .unboxed-nav-link {
          position: relative;
          font-family: var(--font-sans);
          font-size: 0.94rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.65);
          text-decoration: none;
          background: transparent;
          border: none;
          padding: 0.4rem 0;
          transition: color 0.2s ease;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
        }

        .unboxed-nav-link:hover {
          color: #ffffff;
        }

        .unboxed-nav-link.is-active {
          color: #ffffff;
          font-weight: 600;
        }

        .nav-active-dot {
          position: absolute;
          bottom: -4px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #fbbf24;
          box-shadow: 0 0 6px #fbbf24;
        }

        /* Right Actions */
        .nav-right-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .apple-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          background: linear-gradient(180deg, #ffffff 0%, #f4f4f6 100%);
          color: #07070d;
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 9999px;
          padding: 0.42rem 0.48rem 0.42rem 1.45rem;
          font-family: var(--font-sans);
          font-size: 0.92rem;
          font-weight: 600;
          letter-spacing: -0.012em;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), 0 6px 18px -4px rgba(255, 255, 255, 0.15);
          transition: transform 0.3s cubic-bezier(0.19, 1, 0.22, 1), box-shadow 0.3s ease;
        }

        .apple-pill-btn:hover {
          background: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35),
                      0 10px 28px -4px rgba(255, 255, 255, 0.3),
                      0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .apple-pill-btn:active {
          transform: scale(0.97) translateY(0);
        }

        .btn-arrow-dot {
          width: 32px;
          height: 32px;
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

        .apple-pill-btn:hover .btn-arrow-dot {
          transform: translateX(3px) scale(1.06);
          background: #12121c;
          border-color: rgba(245, 158, 11, 0.45);
          color: #f59e0b;
        }

        /* Mobile Trigger */
        .nav-mobile-toggle {
          display: none;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          color: #ffffff;
          cursor: pointer;
          padding: 0.55rem;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
        }

        .nav-mobile-toggle:active {
          background: rgba(255, 255, 255, 0.14);
        }

        /* Fullscreen Mobile Menu Takeover */
        .fullscreen-mobile-menu {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100dvh;
          z-index: 9999;
          background: rgba(6, 6, 10, 0.97);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          display: flex;
          flex-direction: column;
          padding: 1.2rem 1.75rem 2.5rem;
          animation: mobileFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          overflow-y: auto;
        }

        @keyframes mobileFadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .mobile-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          flex-shrink: 0;
        }

        .mobile-brand {
          font-family: var(--font-sans);
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.05em;
          color: #ffffff;
          text-decoration: none;
        }

        .mobile-close-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.2s ease;
        }

        .mobile-close-btn:active {
          transform: scale(0.92);
          background: rgba(255, 255, 255, 0.16);
        }

        .mobile-menu-body {
          display: flex;
          flex-direction: column;
          flex: 1;
          justify-content: space-between;
          padding-top: 2rem;
        }

        .mobile-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 1.5rem;
        }

        .mobile-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fbbf24;
          box-shadow: 0 0 6px #fbbf24;
        }

        .mobile-fullscreen-nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .mobile-fullscreen-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          text-decoration: none;
          color: rgba(255, 255, 255, 0.75);
          transition: color 0.2s ease, transform 0.2s ease;
          animation: slideInLink 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes slideInLink {
          from {
            opacity: 0;
            transform: translateX(-16px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .mobile-fullscreen-link:active,
        .mobile-fullscreen-link.active {
          color: #ffffff;
        }

        .link-idx {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.35);
          width: 32px;
        }

        .link-title {
          font-family: var(--font-sans);
          font-size: 1.85rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          flex: 1;
        }

        .link-arrow {
          color: rgba(255, 255, 255, 0.3);
          transition: transform 0.2s ease, color 0.2s ease;
        }

        .mobile-fullscreen-link:active .link-arrow,
        .mobile-fullscreen-link.active .link-arrow {
          color: #fbbf24;
          transform: translateX(4px);
        }

        .mobile-menu-footer {
          margin-top: 3rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .mobile-launch-tag {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.45);
          letter-spacing: 0.12em;
          text-align: center;
        }

        .mobile-cta-fullwidth {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          color: #000000;
          border: none;
          border-radius: 9999px;
          padding: 0.5rem 0.6rem 0.5rem 1.6rem;
          font-family: var(--font-sans);
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 25px rgba(255, 255, 255, 0.25);
          transition: transform 0.2s ease;
        }

        .mobile-cta-fullwidth:active {
          transform: scale(0.98);
        }

        .mobile-cta-arrow {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #000000;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .nav-links-deck {
            display: none;
          }

          .apple-pill-btn {
            display: none;
          }

          .nav-mobile-toggle {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
