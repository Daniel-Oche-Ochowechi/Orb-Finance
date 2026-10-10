'use client';

import React, { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let animationId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;

      if (glow) {
        glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="cursor-glow-halo"
      aria-hidden="true"
      style={{
        position: 'fixed',
        width: '580px',
        height: '580px',
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(147, 51, 234, 0.12) 0%, rgba(245, 158, 11, 0.06) 40%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 1,
        transition: 'opacity 0.3s ease',
        opacity: 0.75,
      }}
    />
  );
}
