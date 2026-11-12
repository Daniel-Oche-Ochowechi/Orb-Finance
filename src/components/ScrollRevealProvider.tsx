'use client';

import React, { useEffect } from 'react';

const REVEAL_SELECTOR = [
  '.reveal-on-scroll',
  '.section-headline',
  '.section-subtext',
  '.shift-eyebrow',
  '.shift-headline',
  '.shift-body-text',
  '.shift-statement-card',
  '.shift-invariants-row',
  '.shift-frame-container',
  '.platform-eyebrow',
  '.platform-headline',
  '.platform-subhead',
  '.grand-bento-card',
  '.step-box',
  '.developer-terminal',
  '.inst-eyebrow',
  '.inst-headline',
  '.inst-pillar-card',
  '.inst-footer-action-wrap',
  '.principle-card',
  '.teaser-glass-card',
  '.faq-eyebrow',
  '.faq-headline',
  '.faq-subhead',
  '.faq-row-item',
  '.trust-eyebrow',
  '.trust-headline',
  '.trust-lead-text',
  '.trust-bento-card',
  '.closing-badge-row',
  '.closing-headline',
  '.closing-sub',
  '.closing-buttons-cluster',
].join(', ');

const STAGGER_GRID_SELECTOR = [
  '.platform-grand-grid',
  '.steps-cards-grid',
  '.inst-pillars-grid',
  '.principles-2x2-grid',
  '.faq-line-stack',
  '.trust-pillars-grid',
].join(', ');

export default function ScrollRevealProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const targets = document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);
    const viewportHeight = window.innerHeight;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.add('is-revealed');
            // Release GPU hint after transition completes so idle layers stay light
            window.setTimeout(() => {
              el.style.willChange = 'auto';
            }, 800);
            observer.unobserve(el);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -32px 0px',
        threshold: 0.05,
      }
    );

    targets.forEach((el) => {
      const rect = el.getBoundingClientRect();

      // If already visible above fold on load, reveal immediately without pop
      if (rect.top < viewportHeight * 0.96 && rect.bottom > 0) {
        el.classList.add('reveal-init', 'is-revealed');
        return;
      }

      el.classList.add('reveal-init');

      const parentGrid = el.closest(STAGGER_GRID_SELECTOR);
      if (parentGrid) {
        const siblings = Array.from(parentGrid.children);
        const siblingIndex = siblings.indexOf(el);
        if (siblingIndex > 0) {
          el.style.transitionDelay = `${Math.min(siblingIndex * 0.065, 0.28)}s`;
        }
      }

      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}
