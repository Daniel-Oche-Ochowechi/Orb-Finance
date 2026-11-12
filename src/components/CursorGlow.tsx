'use client';

import React, { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isFinePointer || prefersReducedMotion) {
      glow.style.display = 'none';
      return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let animationId = 0;

    const animate = () => {
      const dx = mouseX - currentX;
      const dy = mouseY - currentY;

      currentX += dx * 0.1;
      currentY += dy * 0.1;

      glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

      // Sleep RAF loop once cursor halo settles so idle CPU/GPU usage drops to zero
      if (Math.abs(dx) > 0.25 || Math.abs(dy) > 0.25) {
        animationId = requestAnimationFrame(animate);
      } else {
        animationId = 0;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!animationId) {
        animationId = requestAnimationFrame(animate);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="cursor-glow-halo"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '560px',
        height: '560px',
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(147, 51, 234, 0.11) 0%, rgba(226, 232, 240, 0.055) 40%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 1,
        willChange: 'transform',
        opacity: 0.75,
      }}
    />
  );
}
