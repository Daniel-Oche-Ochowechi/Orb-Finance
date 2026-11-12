'use client';

import React, { useEffect, useRef } from 'react';

export default function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrameId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();

    let resizeTimer = 0;
    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resizeCanvas, 120);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.55 + 0.45;
        this.speedX = (Math.random() - 0.5) * 0.28;
        this.speedY = (Math.random() - 0.5) * 0.28;
        this.opacity = Math.random() * 0.42 + 0.16;
        this.color =
          Math.random() > 0.65
            ? '#e2e8f0'
            : Math.random() > 0.3
            ? '#c084fc'
            : '#ffffff';
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0) {
          this.x = 0;
          this.speedX *= -1;
        } else if (this.x > width) {
          this.x = width;
          this.speedX *= -1;
        }

        if (this.y < 0) {
          this.y = 0;
          this.speedY *= -1;
        } else if (this.y > height) {
          this.y = height;
          this.speedY *= -1;
        }
      }

      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fillStyle = this.color;
        ctx!.globalAlpha = this.opacity;
        ctx!.fill();
      }
    }

    const count = width < 768 ? 18 : 34;
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    const maxDist = 110;
    const maxDistSq = maxDist * maxDist;

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const pi = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const pj = particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.strokeStyle = '#c084fc';
            ctx.globalAlpha = (1 - dist / maxDist) * 0.075;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        if (!prefersReducedMotion) {
          particles[i].update();
        }
        particles[i].draw();
      }
    };

    const render = () => {
      if (document.hidden) {
        animationFrameId = 0;
        return;
      }
      drawFrame();
      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && !prefersReducedMotion && !animationFrameId) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.clearTimeout(resizeTimer);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="ambient-canvas-root"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
