'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'ribbon' | 'circle' | 'star' | 'diamond';
  rotation: number;
  rotationSpeed: number;
  tilt: number;
  tiltSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  opacity: number;
  decay: number;
  scaleX: number;
}

const LUXURY_PALETTE = [
  '#FFFFFF', // Pure White
  '#F8FAFC', // Frost White
  '#E2E8F0', // Sterling Silver
  '#CBD5E1', // Brushed Platinum
  '#94A3B8', // Muted Chrome
  '#34D399', // Crisp Emerald
  '#10B981', // Emerald Mint
];

export default function ClassyConfetti({ duration = 4500 }: { duration?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];
    const startTime = performance.now();

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };

    resize();
    window.addEventListener('resize', resize);

    const rect = canvas.getBoundingClientRect();
    const originX = rect.width / 2;
    const originY = Math.min(rect.height * 0.35, 180);

    const particleCount = 110;
    const shapes: ('ribbon' | 'circle' | 'star' | 'diamond')[] = ['ribbon', 'ribbon', 'diamond', 'star', 'circle'];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 4 + Math.random() * 9.5;
      // Bias upward burst
      const vx = Math.cos(angle) * speed * 1.25;
      const vy = -Math.abs(Math.sin(angle)) * speed * 1.5 - (2 + Math.random() * 4);

      particles.push({
        x: originX + (Math.random() - 0.5) * 40,
        y: originY + (Math.random() - 0.5) * 30,
        vx,
        vy,
        size: 5 + Math.random() * 8,
        color: LUXURY_PALETTE[Math.floor(Math.random() * LUXURY_PALETTE.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 7,
        tilt: Math.random() * 360,
        tiltSpeed: 0.08 + Math.random() * 0.12,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.04 + Math.random() * 0.06,
        opacity: 1,
        decay: 0.003 + Math.random() * 0.004,
        scaleX: 1,
      });
    }

    const drawStar = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      for (let i = 0; i < 4; i++) {
        c.lineTo(Math.cos(((18 + i * 90) * Math.PI) / 180) * size, -Math.sin(((18 + i * 90) * Math.PI) / 180) * size);
        c.lineTo(Math.cos(((63 + i * 90) * Math.PI) / 180) * (size * 0.35), -Math.sin(((63 + i * 90) * Math.PI) / 180) * (size * 0.35));
      }
      c.closePath();
      c.fill();
    };

    const drawDiamond = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      c.moveTo(0, -size);
      c.lineTo(size * 0.6, 0);
      c.lineTo(0, size);
      c.lineTo(-size * 0.6, 0);
      c.closePath();
      c.fill();
    };

    const render = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const r = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Physics
        p.vx *= 0.985; // air resistance
        p.vy += 0.22;  // smooth luxury gravity
        p.x += p.vx + Math.sin(p.wobble) * 0.8;
        p.y += p.vy;

        p.wobble += p.wobbleSpeed;
        p.rotation += p.rotationSpeed;
        p.tilt += p.tiltSpeed;
        p.scaleX = Math.cos(p.tilt);

        if (progress > 0.65) {
          p.opacity = Math.max(0, p.opacity - p.decay * 3.5);
        }

        if (p.opacity <= 0.01 || p.y > r.height + 40) {
          continue;
        }

        aliveCount++;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.scale(p.scaleX, 1);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        // Subtle specular glow on metallic particles
        if (p.color === '#FFFFFF' || p.color === '#FDE68A') {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
        }

        if (p.shape === 'ribbon') {
          ctx.fillRect(-p.size * 0.7, -p.size * 0.35, p.size * 1.4, p.size * 0.7);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'star') {
          drawStar(ctx, p.size * 0.75);
        } else if (p.shape === 'diamond') {
          drawDiamond(ctx, p.size * 0.8);
        }

        ctx.restore();
      }

      if (aliveCount > 0 && progress < 1) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [duration]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="classy-confetti-canvas"
        aria-hidden="true"
      />
      <style jsx>{`
        .classy-confetti-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 25;
        }
      `}</style>
    </>
  );
}

