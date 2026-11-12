'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { useEarlyAccess } from '@/context/EarlyAccessContext';

interface DropdownLink {
  label: string;
  description: string;
  href?: string;
  action?: 'early-access' | 'contact';
  badge?: string;
}

interface NavItem {
  label: string;
  href: string;
  id: string;
  ctaLabel?: string;
  dropdown?: DropdownLink[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Platform',
    href: '#platform',
    id: 'platform',
    ctaLabel: 'Explore full platform',
    dropdown: [
      {
        label: 'Cross-border transfers',
        description: 'Upfront FX rates and transparent global payouts.',
        href: '#platform',
        badge: 'Multi-currency',
      },
      {
        label: 'Domestic transfers',
        description: 'Deterministic Naira rails with real-time status.',
        href: '#platform',
      },
      {
        label: 'Bill payments',
        description: 'Embedded electricity, airtime, data, and TV rails.',
        href: '#platform',
      },
      {
        label: 'The shift',
        description: 'Single-layer settlement beyond correspondent chains.',
        href: '#shift',
      },
    ],
  },
  {
    label: 'How it works',
    href: '#how-it-works',
    id: 'how-it-works',
    ctaLabel: 'Explore API flow',
    dropdown: [
      {
        label: 'Three-step settlement flow',
        description: 'Single integration, locked FX, and hop-level visibility.',
        href: '#how-it-works',
      },
      {
        label: 'Interactive API sandbox',
        description: 'Live cURL, Node, Python, and signed HMAC webhooks.',
        href: '#how-it-works',
        badge: 'Sandbox',
      },
    ],
  },
  {
    label: 'Partners',
    href: '#institutions',
    id: 'institutions',
    ctaLabel: 'Explore partner rails',
    dropdown: [
      {
        label: 'Built for institutions',
        description: 'Partner console and agreed corridor economics.',
        href: '#institutions',
      },
      {
        label: 'Trust & compliance',
        description: 'Licensed bank partners and daily ledger audits.',
        href: '#trust',
      },
      {
        label: 'Contact Institutional Desk',
        description: 'Corridor liquidity, sandbox keys, and compliance docs.',
        action: 'contact',
      },
    ],
  },
  { label: 'Principles', href: '#principles', id: 'principles' },
  { label: 'FAQ', href: '#faq', id: 'faq' },
];

export default function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const [pinnedDropdown, setPinnedDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMobileGroup, setExpandedMobileGroup] = useState<string | null>('platform');

  const openDropdown = pinnedDropdown ?? hoveredDropdown;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const headerRef = useRef<HTMLElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const { openEarlyAccess, openContact } = useEarlyAccess();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closeAllDropdowns = useCallback(() => {
    clearCloseTimer();
    setHoveredDropdown(null);
    setPinnedDropdown(null);
  }, [clearCloseTimer]);

  const scheduleDropdownClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setHoveredDropdown(null);
    }, 150);
  }, [clearCloseTimer]);

  // Throttled scroll state (zero layout reads per scroll frame)
  useEffect(() => {
    let rafId = 0;

    const syncScrollState = () => {
      rafId = 0;
      const y = window.scrollY;
      setIsScrolled((prev) => {
        const next = y > 24;
        return prev === next ? prev : next;
      });
      if (y < 140) {
        setActiveSection((prev) => (prev === '' ? prev : ''));
      }
    };

    const handleScroll = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(syncScrollState);
    };

    syncScrollState();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Section Spy via IntersectionObserver (no forced reflows during scroll)
  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (sections.length === 0) return;

    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        if (window.scrollY < 140) {
          setActiveSection('');
          return;
        }

        let bestId = '';
        let bestRatio = 0;
        for (const item of NAV_ITEMS) {
          const ratio = ratios.get(item.id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = item.id;
          }
        }
        if (bestId) {
          setActiveSection(bestId);
        }
      },
      {
        rootMargin: '-28% 0px -52% 0px',
        threshold: [0, 0.15, 0.35, 0.6],
      }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  // Close desktop dropdown on outside click or Escape, and clean up hover timers
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        closeAllDropdowns();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllDropdowns();
        setMobileOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMobileOpen(false);
      } else {
        closeAllDropdowns();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      clearCloseTimer();
    };
  }, [clearCloseTimer, closeAllDropdowns]);

  // Lock body scroll only while mobile dropdown is open
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const scrollToHref = (href: string) => {
    document.body.style.overflow = '';
    closeAllDropdowns();
    setMobileOpen(false);

    const targetId = href.replace('#', '');
    window.requestAnimationFrame(() => {
      const element = document.getElementById(targetId);
      if (element) {
        const headerOffset = 84;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    scrollToHref(href);
  };

  const handleDropdownItemSelect = (sub: DropdownLink) => {
    document.body.style.overflow = '';
    closeAllDropdowns();
    setMobileOpen(false);

    if (sub.action === 'contact') {
      openContact('Partnership');
      return;
    }
    if (sub.action === 'early-access') {
      openEarlyAccess();
      return;
    }
    if (sub.href) {
      scrollToHref(sub.href);
    }
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    closeAllDropdowns();
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="top-announcement-bar">
        <div className="announcement-content font-mono">
          <span className="announcement-beacon" />
          <span>
            Orb Finance opens <strong>15 January 2027</strong>.
          </span>
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
      <header ref={headerRef} className={`sticky-nav-header ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="nav-container">
          {/* Brand Logo */}
          <a
            href="#"
            onClick={scrollToTop}
            className="nav-brand-wordmark"
            aria-label="Orb Finance — Every currency. One orbit."
          >
            <img
              src="/images/orb-logo-white.png"
              alt="Orb Finance"
              className="nav-brand-logo"
            />
          </a>

          {/* Desktop Navigation Links with Interactive Dropdown Panels */}
          <nav className="nav-links-deck" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              const isDropdownOpen = openDropdown === item.id;
              const showNavDot = (openDropdown ?? activeSection) === item.id;

              if (item.dropdown && item.dropdown.length > 0) {
                return (
                  <div
                    key={item.id}
                    className="nav-dropdown-item"
                    onMouseEnter={() => {
                      clearCloseTimer();
                      setHoveredDropdown(item.id);
                      if (pinnedDropdown && pinnedDropdown !== item.id) {
                        setPinnedDropdown(null);
                      }
                    }}
                    onMouseLeave={scheduleDropdownClose}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                        setHoveredDropdown((prev) => (prev === item.id ? null : prev));
                        setPinnedDropdown((prev) => (prev === item.id ? null : prev));
                      }
                    }}
                  >
                    <button
                      type="button"
                      className={`unboxed-nav-link nav-dropdown-trigger ${
                        isActive || isDropdownOpen ? 'is-active' : ''
                      }`}
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="menu"
                      onClick={() => {
                        clearCloseTimer();
                        if (pinnedDropdown === item.id) {
                          setPinnedDropdown(null);
                          setHoveredDropdown(null);
                        } else {
                          setPinnedDropdown(item.id);
                          setHoveredDropdown(item.id);
                        }
                      }}
                    >
                      <span className="trigger-label-row">
                        <span>{item.label}</span>
                        <span
                          className={`nav-chevron ${isDropdownOpen ? 'is-rotated' : ''}`}
                          aria-hidden="true"
                        >
                          <ChevronDown size={14} strokeWidth={2.2} />
                        </span>
                      </span>
                      {showNavDot && (
                        <motion.span
                          layoutId="headerNavDot"
                          style={{
                            position: 'absolute',
                            bottom: '-4px',
                            left: 0,
                            right: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                          }}
                          transition={{ type: 'spring', stiffness: 460, damping: 32 }}
                          aria-hidden="true"
                        >
                          <span className="nav-active-dot" />
                        </motion.span>
                      )}
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <div className="desktop-dropdown-slot">
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.97 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <div
                              className="desktop-dropdown-card"
                              role="menu"
                              aria-label={`${item.label} navigation`}
                            >
                              <div className="dropdown-links-list">
                                {item.dropdown.map((sub) => (
                                  <button
                                    key={sub.label}
                                    type="button"
                                    role="menuitem"
                                    className="dropdown-sub-item"
                                    onClick={() => handleDropdownItemSelect(sub)}
                                  >
                                    <span className="sub-copy">
                                      <span className="sub-title-row">
                                        <span className="sub-title">{sub.label}</span>
                                        {sub.badge && (
                                          <span className="sub-badge font-mono">{sub.badge}</span>
                                        )}
                                      </span>
                                      <span className="sub-desc">{sub.description}</span>
                                    </span>
                                  </button>
                                ))}
                              </div>

                              <div className="dropdown-card-footer">
                                <button
                                  type="button"
                                  className="dropdown-overview-link"
                                  onClick={() => scrollToHref(item.href)}
                                >
                                  {item.ctaLabel || `View ${item.label}`}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  onMouseEnter={() => {
                    closeAllDropdowns();
                  }}
                  className={`unboxed-nav-link ${isActive ? 'is-active' : ''}`}
                >
                  <span>{item.label}</span>
                  {showNavDot && (
                    <motion.span
                      layoutId="headerNavDot"
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                      }}
                      transition={{ type: 'spring', stiffness: 460, damping: 32 }}
                      aria-hidden="true"
                    >
                      <span className="nav-active-dot" />
                    </motion.span>
                  )}
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

            {/* Mobile Nav Dropdown Trigger */}
            <button
              className={`nav-mobile-toggle ${mobileOpen ? 'is-open' : ''}`}
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              type="button"
            >
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        {/* Hairline Scroll Progress */}
        <div className="nav-scroll-progress" aria-hidden="true">
          <motion.div
            style={{
              scaleX,
              transformOrigin: '0% 50%',
              width: '100%',
              height: '100%',
              background: '#e2e8f0',
            }}
          />
        </div>
      </header>

      {/* Full-Screen Responsive Dropdown Navigation Portal */}
      {isMounted &&
        createPortal(
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Mobile Navigation"
                style={{
                  position: 'fixed',
                  inset: 0,
                  width: '100vw',
                  height: '100dvh',
                  zIndex: 2000,
                }}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="mobile-fullscreen-overlay">
                  <div className="mobile-fs-topbar">
                    <a
                      href="#"
                      onClick={scrollToTop}
                      className="nav-brand-wordmark"
                      aria-label="Orb Finance — Back to top"
                    >
                      <img
                        src="/images/orb-logo-white.png"
                        alt="Orb Finance"
                        className="nav-brand-logo"
                      />
                    </a>

                    <button
                      type="button"
                      className="mobile-fs-close"
                      onClick={() => setMobileOpen(false)}
                      aria-label="Close navigation menu"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="mobile-fs-scroll">
                    <div className="mobile-fs-inner">
                      <div className="mobile-panel-top">
                        <span className="mobile-eyebrow font-mono">NAVIGATION</span>
                        <span className="mobile-date-tag font-mono">15 JAN 2027</span>
                      </div>

                      <nav className="mobile-nav-list" aria-label="Mobile sections">
                        {NAV_ITEMS.map((item, idx) => {
                          const isActive = activeSection === item.id;
                          const hasSub = Boolean(item.dropdown && item.dropdown.length > 0);
                          const isExpanded = expandedMobileGroup === item.id;

                          return (
                            <div key={item.id} className="mobile-nav-group">
                              {hasSub ? (
                                <button
                                  type="button"
                                  className={`mobile-row-btn ${
                                    isActive || isExpanded ? 'is-highlighted' : ''
                                  }`}
                                  onClick={() =>
                                    setExpandedMobileGroup((prev) =>
                                      prev === item.id ? null : item.id
                                    )
                                  }
                                  aria-expanded={isExpanded}
                                >
                                  <span className="mobile-row-left">
                                    <span className="link-idx font-mono">0{idx + 1}</span>
                                    <span className="link-title">{item.label}</span>
                                  </span>
                                  <span
                                    className={`mobile-group-toggle ${
                                      isExpanded ? 'is-expanded' : ''
                                    }`}
                                    aria-hidden="true"
                                  >
                                    <ChevronDown size={17} />
                                  </span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className={`mobile-row-btn ${isActive ? 'is-highlighted' : ''}`}
                                  onClick={() => scrollToHref(item.href)}
                                >
                                  <span className="mobile-row-left">
                                    <span className="link-idx font-mono">0{idx + 1}</span>
                                    <span className="link-title">{item.label}</span>
                                  </span>
                                  <span className="mobile-group-go" aria-hidden="true">
                                    <ArrowRight size={16} />
                                  </span>
                                </button>
                              )}

                              {hasSub && item.dropdown && (
                                <AnimatePresence initial={false}>
                                  {isExpanded && (
                                    <motion.div
                                      style={{ overflow: 'hidden' }}
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                      <div className="mobile-sub-list">
                                        {item.dropdown.map((sub) => (
                                          <button
                                            key={sub.label}
                                            type="button"
                                            className="mobile-sub-item"
                                            onClick={() => handleDropdownItemSelect(sub)}
                                          >
                                            <span className="mobile-sub-text">
                                              <span className="mobile-sub-title-row">
                                                <span className="mobile-sub-title">{sub.label}</span>
                                                {sub.badge && (
                                                  <span className="sub-badge font-mono">
                                                    {sub.badge}
                                                  </span>
                                                )}
                                              </span>
                                              <span className="mobile-sub-desc">
                                                {sub.description}
                                              </span>
                                            </span>
                                          </button>
                                        ))}

                                        <button
                                          type="button"
                                          className="mobile-overview-link"
                                          onClick={() => scrollToHref(item.href)}
                                        >
                                          {item.ctaLabel || `View ${item.label}`}
                                        </button>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              )}
                            </div>
                          );
                        })}
                      </nav>
                    </div>
                  </div>

                  <div className="mobile-fs-footer">
                    <div className="mobile-fs-footer-inner">
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
                          <ArrowRight size={15} strokeWidth={2.5} />
                        </span>
                      </button>

                      <button
                        className="mobile-secondary-btn"
                        onClick={() => {
                          setMobileOpen(false);
                          openContact('Partnership');
                        }}
                        type="button"
                      >
                        <span>Contact Institutional Desk</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      <style jsx>{`
        /* Top Announcement */
        .top-announcement-bar {
          background: rgba(12, 14, 24, 0.95);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0.55rem clamp(1rem, 3vw, 1.5rem);
          text-align: center;
          position: relative;
          z-index: 90;
        }

        .announcement-content {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.35rem 0.75rem;
          font-size: clamp(0.72rem, 1.6vw, 0.8rem);
          color: rgba(255, 255, 255, 0.75);
        }

        .announcement-beacon {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #e2e8f0;
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
          color: #e2e8f0;
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

        /* Sticky Full-Width Header — Solid Opaque Obsidian */
        .sticky-nav-header {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          width: 100%;
          background: #090a0e;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          transition: background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .sticky-nav-header.is-scrolled {
          background: #07080b;
          border-bottom-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
        }

        .nav-scroll-progress {
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 1.5px;
          pointer-events: none;
          overflow: hidden;
        }

        .nav-container {
          max-width: 1220px;
          margin: 0 auto;
          padding: clamp(0.8rem, 1.8vw, 1.08rem) clamp(1.1rem, 4vw, 2rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        /* Brand Logo */
        .nav-brand-wordmark {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          line-height: 1;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .nav-brand-wordmark:hover {
          opacity: 0.88;
        }

        .nav-brand-logo {
          height: clamp(26px, 2.8vw, 31px);
          width: auto;
          display: block;
          object-fit: contain;
        }

        /* Pure Unboxed Links Deck */
        .nav-links-deck {
          display: flex;
          align-items: center;
          gap: clamp(1.35rem, 2.6vw, 2.4rem);
        }

        .nav-dropdown-item {
          position: relative;
          display: flex;
          align-items: center;
        }

        .unboxed-nav-link {
          position: relative;
          font-family: var(--font-sans);
          font-size: 0.94rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.68);
          text-decoration: none;
          background: transparent;
          border: none;
          padding: 0.45rem 0;
          transition: color 0.2s ease;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        }

        .unboxed-nav-link:hover,
        .unboxed-nav-link.is-active {
          color: #ffffff;
        }

        .unboxed-nav-link.is-active {
          font-weight: 600;
        }

        .trigger-label-row {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
        }

        .nav-chevron {
          display: inline-flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.48);
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease;
        }

        .unboxed-nav-link:hover .nav-chevron,
        .nav-chevron.is-rotated {
          color: #e2e8f0;
        }

        .nav-chevron.is-rotated {
          transform: rotate(180deg);
        }

        .nav-active-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #e2e8f0;
        }

        /* Desktop Anchored Dropdown Panel — Solid Opaque Obsidian */
        .desktop-dropdown-slot {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          padding-top: 0.75rem;
          z-index: 1100;
        }

        .desktop-dropdown-card {
          position: relative;
          width: min(308px, 86vw);
          background: #0b0d13;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 20px;
          padding: 0.45rem;
          box-shadow: 0 24px 56px rgba(0, 0, 0, 0.88), inset 0 1px 0 rgba(255, 255, 255, 0.06);
          overflow: hidden;
        }

        .dropdown-links-list {
          display: flex;
          flex-direction: column;
          gap: 0.12rem;
        }

        .dropdown-sub-item {
          width: 100%;
          display: flex;
          flex-direction: column;
          padding: 0.65rem 0.82rem;
          border-radius: 13px;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.18s ease;
        }

        .dropdown-sub-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .sub-copy {
          display: flex;
          flex-direction: column;
          gap: 0.16rem;
          width: 100%;
          min-width: 0;
        }

        .sub-title-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .sub-title {
          font-family: var(--font-sans);
          font-size: 0.86rem;
          font-weight: 550;
          letter-spacing: -0.01em;
          color: rgba(255, 255, 255, 0.92);
          line-height: 1.3;
          transition: color 0.18s ease;
        }

        .dropdown-sub-item:hover .sub-title {
          color: #ffffff;
        }

        .sub-badge {
          font-size: 0.62rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: rgba(203, 213, 225, 0.52);
          background: transparent;
          border: none;
          padding: 0;
        }

        .sub-desc {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          line-height: 1.42;
          color: rgba(255, 255, 255, 0.46);
          transition: color 0.18s ease;
        }

        .dropdown-sub-item:hover .sub-desc {
          color: rgba(255, 255, 255, 0.64);
        }

        .dropdown-card-footer {
          margin-top: 0.32rem;
          padding: 0.54rem 0.82rem 0.36rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .dropdown-overview-link {
          width: 100%;
          display: block;
          text-align: left;
          background: transparent;
          border: none;
          padding: 0.15rem 0;
          color: rgba(226, 232, 240, 0.66);
          font-family: var(--font-sans);
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.18s ease;
        }

        .dropdown-overview-link:hover {
          color: #ffffff;
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
          background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%);
          color: #07080b;
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 9999px;
          padding: 0.42rem 0.5rem 0.42rem 1.4rem;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: -0.012em;
          cursor: pointer;
          box-shadow: 0 8px 22px -6px rgba(226, 232, 240, 0.2), 0 3px 10px rgba(0, 0, 0, 0.3);
          transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease;
        }

        .apple-pill-btn:hover {
          background: #ffffff;
          border-color: #ffffff;
          transform: translateY(-1.5px);
          box-shadow: 0 12px 28px -6px rgba(226, 232, 240, 0.28), 0 4px 14px rgba(0, 0, 0, 0.35);
        }

        .apple-pill-btn:active {
          transform: scale(0.975) translateY(0);
        }

        .btn-arrow-dot {
          width: 31px;
          height: 31px;
          border-radius: 50%;
          background: #07080b;
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
            background-color 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease;
        }

        .apple-pill-btn:hover .btn-arrow-dot {
          transform: translateX(3px) scale(1.06);
          background: #12121c;
          border-color: rgba(226, 232, 240, 0.45);
          color: #cbd5e1;
        }

        /* Mobile Trigger */
        .nav-mobile-toggle {
          display: none;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 50%;
          color: #ffffff;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }

        .nav-mobile-toggle.is-open {
          background: #171a24;
          border-color: rgba(226, 232, 240, 0.4);
          color: #e2e8f0;
        }

        .nav-mobile-toggle:active {
          transform: scale(0.94);
        }

        /* Full-Screen Responsive Dropdown Overlay — Solid Opaque Obsidian */
        .mobile-fullscreen-overlay {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #090a0e;
        }

        .mobile-fs-topbar {
          position: relative;
          width: 100%;
          max-width: 1220px;
          margin: 0 auto;
          padding: clamp(0.85rem, 2vw, 1.15rem) clamp(1.1rem, 4vw, 2rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #090a0e;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          flex-shrink: 0;
        }

        .mobile-fs-close {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #141720;
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }

        .mobile-fs-close:hover {
          background: #1c202c;
          border-color: rgba(226, 232, 240, 0.45);
          color: #e2e8f0;
        }

        .mobile-fs-close:active {
          transform: scale(0.94);
        }

        .mobile-fs-scroll {
          position: relative;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          background: #090a0e;
        }

        .mobile-fs-inner {
          width: 100%;
          max-width: 680px;
          margin: 0 auto;
          padding: clamp(1rem, 3vh, 1.75rem) clamp(1.1rem, 4vw, 2rem) 2rem;
        }

        .mobile-panel-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.85rem;
          margin-bottom: 0.45rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .mobile-eyebrow {
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.46);
        }

        .mobile-date-tag {
          font-size: 0.66rem;
          letter-spacing: 0.12em;
          color: #e2e8f0;
          background: #14120e;
          border: 1px solid rgba(226, 232, 240, 0.26);
          padding: 0.18rem 0.55rem;
          border-radius: 6px;
        }

        .mobile-nav-list {
          display: flex;
          flex-direction: column;
        }

        .mobile-nav-group {
          border-bottom: 1px solid rgba(255, 255, 255, 0.075);
        }

        .mobile-nav-group:last-child {
          border-bottom: none;
        }

        .mobile-row-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: clamp(0.95rem, 2.2vh, 1.2rem) 0.25rem;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.84);
          text-align: left;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .mobile-row-btn:hover,
        .mobile-row-btn.is-highlighted {
          color: #ffffff;
        }

        .mobile-row-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .link-idx {
          font-size: 0.74rem;
          color: #e2e8f0;
          opacity: 0.85;
          width: 24px;
        }

        .link-title {
          font-family: var(--font-sans);
          font-size: clamp(1.18rem, 4.4vw, 1.45rem);
          font-weight: 600;
          letter-spacing: -0.025em;
        }

        .mobile-group-toggle,
        .mobile-group-go {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: #141720;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.72);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
            background-color 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease;
        }

        .mobile-group-toggle.is-expanded {
          transform: rotate(180deg);
          background: #171a22;
          border-color: rgba(226, 232, 240, 0.34);
          color: #ffffff;
        }

        .mobile-sub-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0.2rem 0 1.05rem 1.15rem;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          margin-left: 0.55rem;
        }

        .mobile-overview-link {
          display: inline-block;
          align-self: flex-start;
          padding: 0.45rem 0.65rem 0.2rem;
          margin-top: 0.15rem;
          background: transparent;
          border: none;
          color: rgba(226, 232, 240, 0.72);
          font-family: var(--font-sans);
          font-size: 0.78rem;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: color 0.18s ease;
        }

        .mobile-overview-link:hover {
          color: #ffffff;
        }

        .mobile-sub-item {
          width: 100%;
          display: flex;
          flex-direction: column;
          padding: 0.62rem 0.65rem;
          border-radius: 12px;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.18s ease;
        }

        .mobile-sub-item:active,
        .mobile-sub-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .mobile-sub-text {
          display: flex;
          flex-direction: column;
          gap: 0.14rem;
          width: 100%;
          min-width: 0;
        }

        .mobile-sub-title-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.48rem;
          flex-wrap: wrap;
        }

        .mobile-sub-title {
          font-family: var(--font-sans);
          font-size: 0.89rem;
          font-weight: 550;
          letter-spacing: -0.01em;
          color: rgba(255, 255, 255, 0.92);
        }

        .mobile-sub-desc {
          font-family: var(--font-sans);
          font-size: 0.76rem;
          line-height: 1.42;
          color: rgba(255, 255, 255, 0.48);
        }

        .mobile-fs-footer {
          position: relative;
          flex-shrink: 0;
          background: #08090d;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.95rem clamp(1.1rem, 4vw, 2rem)
            calc(clamp(0.95rem, 2.5vh, 1.35rem) + env(safe-area-inset-bottom, 0px));
        }

        .mobile-fs-footer-inner {
          width: 100%;
          max-width: 680px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .mobile-cta-fullwidth {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%);
          color: #07080b;
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 9999px;
          padding: 0.45rem 0.5rem 0.45rem 1.4rem;
          font-family: var(--font-sans);
          font-size: 0.96rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 22px -6px rgba(226, 232, 240, 0.22);
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .mobile-cta-fullwidth:hover {
          background: #ffffff;
        }

        .mobile-cta-fullwidth:active {
          transform: scale(0.98);
        }

        .mobile-cta-arrow {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #07080b;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          background: #12151f;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.9);
          border-radius: 9999px;
          padding: 0.72rem 1.25rem;
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }

        .mobile-secondary-btn:hover {
          background: #171a24;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .unboxed-nav-link:focus-visible,
        .dropdown-overview-link:focus-visible,
        .dropdown-sub-item:focus-visible,
        .nav-mobile-toggle:focus-visible,
        .mobile-fs-close:focus-visible,
        .mobile-row-btn:focus-visible,
        .mobile-overview-link:focus-visible,
        .mobile-sub-item:focus-visible,
        .mobile-cta-fullwidth:focus-visible,
        .mobile-secondary-btn:focus-visible {
          outline: 2px solid rgba(226, 232, 240, 0.75);
          outline-offset: 2px;
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
