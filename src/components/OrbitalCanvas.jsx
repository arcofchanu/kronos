import React, { useRef, useEffect, useCallback } from 'react';

const PARTICLE_COUNT = 14;
const PARTICLE_RADIUS = 3.5;
const WORK_COLOR = '#FFFFFF';
const REST_COLOR = '#C8A86B';
const TRANSITION_DURATION = 600; // ms

/**
 * OrbitalCanvas — HTML5 Canvas particle system.
 *
 * WORK: particles orbit in a circle, speeding up as time depletes.
 * REST: particles decelerate, form static circle, breathe, amber color.
 * PAUSED: particles freeze.
 * BURST: on round complete, particles burst outward then re-form.
 */
export default function OrbitalCanvas({
  phase = 'work',       // 'work' | 'rest' | 'idle'
  progress = 0,          // 0→1 how much of current phase elapsed
  isPaused = false,
  isComplete = false,
  onTapPause,
  size,                  // canvas dimensions
}) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    angle: 0,
    speed: 0.4,
    targetSpeed: 0.4,
    particleColor: WORK_COLOR,
    targetColor: WORK_COLOR,
    colorTransition: 1,
    phase: 'work',
    isPaused: false,
    isComplete: false,
    burstProgress: -1, // -1 = no burst, 0→1 = bursting
    burstParticles: [],
    lastTimestamp: 0,
    opacity: 1,
  });

  // Update refs when props change
  useEffect(() => {
    const s = stateRef.current;

    if (phase !== s.phase) {
      const prevPhase = s.phase;
      s.phase = phase;

      if (phase === 'rest') {
        s.targetSpeed = 0;
        s.targetColor = REST_COLOR;
        s.colorTransition = 0;
      } else if (phase === 'work') {
        s.targetSpeed = 0.4;
        s.targetColor = WORK_COLOR;
        s.colorTransition = 0;

        // If coming from rest, trigger a small scatter
        if (prevPhase === 'rest') {
          s.burstProgress = 0;
          s.burstParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
            angle: (i / PARTICLE_COUNT) * Math.PI * 2,
            radiusOffset: 0,
            velocityOut: 30 + Math.random() * 20,
          }));
        }
      }
    }

    s.isPaused = isPaused;

    if (isComplete && !s.isComplete) {
      s.isComplete = true;
      s.burstProgress = 0;
      s.burstParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        angle: (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.3,
        radiusOffset: 0,
        velocityOut: 50 + Math.random() * 40,
      }));
    } else if (!isComplete) {
      s.isComplete = false;
      s.opacity = 1;
    }
  }, [phase, isPaused, isComplete]);

  // Update speed based on progress
  useEffect(() => {
    if (stateRef.current.phase === 'work') {
      stateRef.current.targetSpeed = 0.4 + progress * 0.8;
    }
  }, [progress]);

  const lerpColor = useCallback((color1, color2, t) => {
    // Parse hex to RGB
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);

    return `rgb(${r},${g},${b})`;
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;

    const draw = (timestamp) => {
      const s = stateRef.current;
      const delta = s.lastTimestamp ? (timestamp - s.lastTimestamp) / 1000 : 0.016;
      s.lastTimestamp = timestamp;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const orbitRadius = w * 0.46;

      // Trail fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, w, h);

      if (s.isComplete) {
        // Burst and fade out
        if (s.burstProgress >= 0 && s.burstProgress < 1) {
          s.burstProgress += delta * 1.25;
          s.opacity = Math.max(0, 1 - s.burstProgress);

          ctx.globalAlpha = s.opacity;
          s.burstParticles.forEach((p) => {
            const r = orbitRadius + p.velocityOut * s.burstProgress * 3;
            const x = cx + Math.cos(p.angle) * r;
            const y = cy + Math.sin(p.angle) * r;

            ctx.beginPath();
            ctx.arc(x, y, PARTICLE_RADIUS * (1 - s.burstProgress * 0.5), 0, Math.PI * 2);
            ctx.fillStyle = s.particleColor;
            ctx.fill();
          });
          ctx.globalAlpha = 1;
        }
        animId = requestAnimationFrame(draw);
        return;
      }

      if (s.isPaused) {
        // Draw particles frozen in current position
        const currentColor = s.phase === 'rest' ? REST_COLOR : WORK_COLOR;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const a = s.angle + (i / PARTICLE_COUNT) * Math.PI * 2;
          const x = cx + Math.cos(a) * orbitRadius;
          const y = cy + Math.sin(a) * orbitRadius;

          ctx.beginPath();
          ctx.arc(x, y, PARTICLE_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = currentColor;
          ctx.fill();
        }
        animId = requestAnimationFrame(draw);
        return;
      }

      // Color transition
      if (s.colorTransition < 1) {
        s.colorTransition = Math.min(1, s.colorTransition + delta / (TRANSITION_DURATION / 1000));
      }
      s.particleColor = lerpColor(
        s.phase === 'rest' ? WORK_COLOR : REST_COLOR,
        s.targetColor,
        s.colorTransition
      );

      // Speed interpolation
      const speedDiff = s.targetSpeed - s.speed;
      s.speed += speedDiff * Math.min(1, delta * 3);

      // Handle burst animation
      if (s.burstProgress >= 0 && s.burstProgress < 1) {
        s.burstProgress += delta * 2.5;

        s.burstParticles.forEach((p) => {
          const burstOut = s.burstProgress < 0.4;
          let r;
          if (burstOut) {
            r = orbitRadius + p.velocityOut * (s.burstProgress / 0.4);
          } else {
            const reformT = (s.burstProgress - 0.4) / 0.6;
            const maxR = orbitRadius + p.velocityOut;
            r = maxR + (orbitRadius - maxR) * reformT;
          }

          const x = cx + Math.cos(p.angle + s.angle) * r;
          const y = cy + Math.sin(p.angle + s.angle) * r;

          ctx.beginPath();
          ctx.arc(x, y, PARTICLE_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = s.particleColor;
          ctx.fill();
        });

        if (s.burstProgress >= 1) {
          s.burstProgress = -1;
        }
      } else if (s.phase === 'rest') {
        // REST: static circle with breathing pulse
        const pulse = 1 + 0.03 * Math.sin(timestamp / 1000 * Math.PI);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const a = (i / PARTICLE_COUNT) * Math.PI * 2;
          const x = cx + Math.cos(a) * orbitRadius * pulse;
          const y = cy + Math.sin(a) * orbitRadius * pulse;

          ctx.beginPath();
          ctx.arc(x, y, PARTICLE_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = s.particleColor;
          ctx.fill();
        }
      } else {
        // WORK: rotating orbit
        s.angle += s.speed * delta;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const a = s.angle + (i / PARTICLE_COUNT) * Math.PI * 2;
          const x = cx + Math.cos(a) * orbitRadius;
          const y = cy + Math.sin(a) * orbitRadius;

          ctx.beginPath();
          ctx.arc(x, y, PARTICLE_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = s.particleColor;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [lerpColor]);

  // Handle canvas sizing
  const canvasSize = size || 280;
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  return (
    <div
      className="relative cursor-pointer"
      style={{ width: canvasSize, height: canvasSize }}
      onClick={(e) => {
        // Only trigger tap-pause if clicking on the canvas area, not on child buttons
        if (e.target === e.currentTarget || e.target === canvasRef.current) {
          onTapPause?.();
        }
      }}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize * dpr}
        height={canvasSize * dpr}
        style={{
          width: canvasSize,
          height: canvasSize,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onTapPause?.();
        }}
      />
      {/* Timer number overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {/* Children (timer display) will be rendered here by parent */}
      </div>
    </div>
  );
}
