'use client';

import React, { useEffect } from 'react';

export default function ScrollRevealProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const targets = document.querySelectorAll<HTMLElement>(
      '.reveal-on-scroll, .section-headline, .section-subtext, .grand-bento-card, .step-box, .inst-pillar-card, .principle-card, .trust-bento-card, .faq-line-row, .shift-frame-container, .hero-countdown-island, .apple-pass-card, .closing-monolith-box'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.1,
      }
    );

    targets.forEach((el, index) => {
      // Add base reveal class if not present
      if (!el.classList.contains('reveal-init')) {
        el.classList.add('reveal-init');
      }

      // If item is inside a grid/deck, assign natural micro-stagger
      const parentGrid = el.closest('.principles-grid, .steps-deck, .inst-pillars-grid, .faq-lines-deck, .trust-bento-grid');
      if (parentGrid) {
        const siblings = Array.from(parentGrid.children);
        const siblingIndex = siblings.indexOf(el);
        if (siblingIndex > 0) {
          el.style.transitionDelay = `${Math.min(siblingIndex * 0.1, 0.4)}s`;
        }
      }

      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}
