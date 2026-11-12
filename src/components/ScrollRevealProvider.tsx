'use client';

import React, { useEffect } from 'react';

const REVEAL_SELECTOR = [
  '.reveal-on-scroll',
  '.hero-status-pill',
  '.hero-monumental-heading',
  '.hero-editorial-text',
  '.hero-cta-button-group',
  '.hero-countdown-island',
  '.section-label',
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
  '.perk-row',
  '.pass-container',
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
  '.footer-top-grid',
  '.footer-bottom-bar',
  '.footer-floating-wrap',
].join(', ');

const STAGGER_GRID_SELECTOR = [
  '.platform-grand-grid',
  '.steps-cards-grid',
  '.inst-pillars-grid',
  '.principles-2x2-grid',
  '.perks-list',
  '.faq-line-stack',
  '.trust-pillars-grid',
].join(', ');

export default function ScrollRevealProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const targets = document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);
    const viewportHeight = window.innerHeight;
    const timeouts: number[] = [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.add('is-revealed');
            const timerId = window.setTimeout(() => {
              el.style.willChange = 'auto';
            }, 950);
            timeouts.push(timerId);
            observer.unobserve(el);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -48px 0px',
        threshold: 0.06,
      }
    );

    let aboveFoldIndex = 0;

    targets.forEach((el) => {
      const rect = el.getBoundingClientRect();

      el.classList.add('reveal-init');

      if (rect.top < viewportHeight * 0.94 && rect.bottom > 0) {
        const delayMs = Math.min(aboveFoldIndex * 75, 360);
        aboveFoldIndex += 1;
        el.style.transitionDelay = `${delayMs}ms`;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.classList.add('is-revealed');
          });
        });
        const timerId = window.setTimeout(() => {
          el.style.willChange = 'auto';
        }, 950 + delayMs);
        timeouts.push(timerId);
        return;
      }

      const parentGrid = el.closest(STAGGER_GRID_SELECTOR);
      if (parentGrid) {
        const siblings = Array.from(parentGrid.children);
        const siblingIndex = siblings.indexOf(el);
        if (siblingIndex > 0) {
          el.style.transitionDelay = `${Math.min(siblingIndex * 0.085, 0.34)}s`;
        }
      }

      observer.observe(el);
    });

    return () => {
      observer.disconnect();
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return <>{children}</>;
}
