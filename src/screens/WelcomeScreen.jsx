import React, { useRef, useEffect, useState } from 'react';

/**
 * WelcomeScreen — 5-second splash with particles forming "10:10" then scattering.
 * Phase 1 (0–1.5s): Particles converge from random positions to form "10:10"
 * Phase 2 (1.5–3.5s): Hold shape with subtle pulse
 * Phase 3 (3.5–5s): Scatter outward + fade out
 */
export default function WelcomeScreen({ onComplete }) {
  const canvasRef = useRef(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    // Sample text pixels to get target positions
    const textCanvas = document.createElement('canvas');
    const textCtx = textCanvas.getContext('2d');
    const fontSize = Math.min(W * 0.18, 100);
    textCanvas.width = W;
    textCanvas.height = H;
    textCtx.fillStyle = '#FFFFFF';
    textCtx.font = `bold ${fontSize}px "Elm Sans", sans-serif`;
    textCtx.textAlign = 'center';
    textCtx.textBaseline = 'middle';
    textCtx.fillText('KRONOS', W / 2, H / 2 - 20);

    // Sample pixel positions
    const imageData = textCtx.getImageData(0, 0, W, H);
    const targets = [];
    const sampleStep = Math.max(3, Math.floor(fontSize / 18));

    for (let y = 0; y < H; y += sampleStep) {
      for (let x = 0; x < W; x += sampleStep) {
        const idx = (y * W + x) * 4;
        if (imageData.data[idx + 3] > 128) {
          targets.push({ x, y });
        }
      }
    }

    // Cap particle count for performance
    const MAX_PARTICLES = 400;
    const stride = Math.max(1, Math.floor(targets.length / MAX_PARTICLES));
    const sampledTargets = [];
    for (let i = 0; i < targets.length; i += stride) {
      sampledTargets.push(targets[i]);
    }

    // Create particles with random start positions
    const particles = sampledTargets.map((t) => ({
      // Start from random positions around the canvas
      sx: W / 2 + (Math.random() - 0.5) * W * 1.2,
      sy: H / 2 + (Math.random() - 0.5) * H * 1.2,
      // Target position (forming "10:10")
      tx: t.x,
      ty: t.y,
      // Scatter velocity
      vx: (t.x - W / 2) * (1.5 + Math.random()) * 0.015,
      vy: (t.y - H / 2) * (1.5 + Math.random()) * 0.015,
      // Current position
      x: 0,
      y: 0,
      // Random delay for staggered convergence
      delay: Math.random() * 0.4,
      // Size
      radius: 0.8 + Math.random() * 0.5,
    }));

    const DURATION = 5000;
    const CONVERGE_END = 1500;
    const HOLD_END = 3500;
    const startTime = performance.now();
    let animId;

    const draw = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / DURATION, 1);

      // Clear
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);

      // Global alpha for final fade
      let globalAlpha = 1;
      if (elapsed > HOLD_END) {
        globalAlpha = Math.max(0, 1 - (elapsed - HOLD_END) / (DURATION - HOLD_END));
      }

      particles.forEach((p) => {
        let px, py, alpha;

        if (elapsed < CONVERGE_END) {
          // Phase 1: Converge
          const progress = Math.max(0, Math.min(1, (elapsed / CONVERGE_END - p.delay) / (1 - p.delay)));
          const eased = easeOutCubic(progress);
          px = p.sx + (p.tx - p.sx) * eased;
          py = p.sy + (p.ty - p.sy) * eased;
          alpha = 0.3 + 0.7 * eased;
        } else if (elapsed < HOLD_END) {
          // Phase 2: Hold with subtle pulse
          const holdT = (elapsed - CONVERGE_END) / (HOLD_END - CONVERGE_END);
          const pulse = 1 + 0.008 * Math.sin(holdT * Math.PI * 4);
          px = W / 2 + (p.tx - W / 2) * pulse;
          py = (H / 2 - 20) + (p.ty - (H / 2 - 20)) * pulse;
          alpha = 1;
        } else {
          // Phase 3: Scatter
          const scatterT = (elapsed - HOLD_END) / (DURATION - HOLD_END);
          const accel = easeInCubic(scatterT);
          px = p.tx + p.vx * accel * 300;
          py = p.ty + p.vy * accel * 300;
          alpha = globalAlpha;
        }

        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 216, 255, ${alpha * globalAlpha})`;
        ctx.fill();
      });

      // "KRONOS" text below
      if (elapsed > 800) {
        const textAlpha = elapsed < CONVERGE_END
          ? Math.min(1, (elapsed - 800) / 700)
          : elapsed < HOLD_END
          ? 1
          : globalAlpha;

        ctx.save();
        ctx.globalAlpha = textAlpha;
        ctx.fillStyle = '#444444';
        ctx.font = `500 ${Math.min(14, W * 0.035)}px "Elm Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.letterSpacing = '5px';
        ctx.fillText('A T H L E T E   T I M E R', W / 2, H / 2 + fontSize * 0.8);
        ctx.restore();
      }

      if (elapsed < DURATION) {
        animId = requestAnimationFrame(draw);
      } else {
        // Animation complete
        setFadeOut(true);
        setTimeout(() => {
          onComplete?.();
        }, 400);
      }
    };

    animId = requestAnimationFrame(draw);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [onComplete]);

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInCubic(t) {
    return t * t * t;
  }

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black transition-opacity duration-400 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
    </div>
  );
}
