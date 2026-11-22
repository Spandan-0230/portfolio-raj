"use client";

import React, { useEffect, useRef } from "react";

interface SmokeBurstProps {
  isActive: boolean;
}

type ParticleType = "dark_smoke" | "mid_ash" | "white_steam" | "turbulent_wisp";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  growthRate: number;
  alpha: number;
  maxAlpha: number;
  decayRate: number;
  rotation: number;
  angularVelocity: number;
  scaleX: number;
  scaleY: number;
  delay: number;
  life: number;
  type: ParticleType;
  highlightColor: { r: number; g: number; b: number };
  baseColor: { r: number; g: number; b: number };
  shadowColor: { r: number; g: number; b: number };
}

export default function SmokeBurst({ isActive }: SmokeBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!isActive) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // High-resolution canvas rendering
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = rect.width || 360;
    const h = rect.height || 380;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.scale(dpr, dpr);

    const originX = w * 0.5;
    const originY = h * 0.76; // Base launch plane near robot feet

    // -----------------------------------------------------------------
    // BUILD REALISTIC BLACK & WHITE MULTI-LAYER SMOKE VOLUMES
    // -----------------------------------------------------------------
    const particles: Particle[] = [];

    // Layer 1: Deep Dark Charcoal / Black Soot (dense shadow base & perimeter swirls)
    const DARK_COUNT = 24;
    for (let i = 0; i < DARK_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / DARK_COUNT + (Math.random() - 0.5) * 0.6;
      const speed = 1.0 + Math.random() * 2.4;
      const vx = Math.cos(angle) * speed * 1.4;
      const vy = Math.sin(angle) * speed * 0.65 - (0.4 + Math.random() * 1.2);

      const tone = Math.floor(14 + Math.random() * 24); // 14 to 38: deep charcoal/black
      const midTone = tone + 22;

      particles.push({
        x: originX + (Math.random() - 0.5) * 32,
        y: originY + (Math.random() - 0.5) * 18,
        vx,
        vy,
        radius: 18 + Math.random() * 20,
        maxRadius: 85 + Math.random() * 45,
        growthRate: 1.5 + Math.random() * 1.8,
        alpha: 0,
        maxAlpha: 0.88 + Math.random() * 0.12,
        decayRate: 0.010 + Math.random() * 0.010,
        rotation: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 0.04,
        scaleX: 0.88 + Math.random() * 0.28,
        scaleY: 0.72 + Math.random() * 0.38,
        delay: Math.random() * 6,
        life: 0,
        type: "dark_smoke",
        highlightColor: { r: midTone + 20, g: midTone + 22, b: midTone + 28 },
        baseColor: { r: midTone, g: midTone + 2, b: midTone + 6 },
        shadowColor: { r: tone, g: tone + 1, b: tone + 3 },
      });
    }

    // Layer 2: Mid-Tone Smoky Ash (slate grey, gives density & volume between dark & light)
    const MID_COUNT = 22;
    for (let i = 0; i < MID_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / MID_COUNT + (Math.random() - 0.5) * 0.8;
      const speed = 1.4 + Math.random() * 2.8;
      const vx = Math.cos(angle) * speed * 1.3;
      const vy = Math.sin(angle) * speed * 0.75 - (0.8 + Math.random() * 1.6);

      const tone = Math.floor(115 + Math.random() * 40); // 115 to 155: mid ash grey

      particles.push({
        x: originX + (Math.random() - 0.5) * 26,
        y: originY + (Math.random() - 0.5) * 16,
        vx,
        vy,
        radius: 16 + Math.random() * 18,
        maxRadius: 80 + Math.random() * 40,
        growthRate: 1.6 + Math.random() * 1.9,
        alpha: 0,
        maxAlpha: 0.78 + Math.random() * 0.18,
        decayRate: 0.011 + Math.random() * 0.011,
        rotation: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 0.045,
        scaleX: 0.92 + Math.random() * 0.24,
        scaleY: 0.78 + Math.random() * 0.34,
        delay: 2 + Math.random() * 7,
        life: 0,
        type: "mid_ash",
        highlightColor: { r: 210, g: 215, b: 228 },
        baseColor: { r: tone, g: tone + 3, b: tone + 8 },
        shadowColor: { r: 32, g: 35, b: 44 },
      });
    }

    // Layer 3: Brilliant Pure White & Silver Steam Plumes (high-contrast billows & highlights)
    const WHITE_COUNT = 26;
    for (let i = 0; i < WHITE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / WHITE_COUNT + (Math.random() - 0.5) * 0.9;
      const speed = 1.3 + Math.random() * 3.0;
      const vx = Math.cos(angle) * speed * 1.25;
      const vy = Math.sin(angle) * speed * 0.8 - (1.1 + Math.random() * 1.9); // Stronger upward lift

      particles.push({
        x: originX + (Math.random() - 0.5) * 24,
        y: originY + (Math.random() - 0.5) * 14,
        vx,
        vy,
        radius: 15 + Math.random() * 20,
        maxRadius: 90 + Math.random() * 45,
        growthRate: 1.8 + Math.random() * 2.0,
        alpha: 0,
        maxAlpha: 0.84 + Math.random() * 0.16,
        decayRate: 0.012 + Math.random() * 0.011,
        rotation: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 0.05,
        scaleX: 0.95 + Math.random() * 0.22,
        scaleY: 0.82 + Math.random() * 0.32,
        delay: 3 + Math.random() * 8,
        life: 0,
        type: "white_steam",
        highlightColor: { r: 255, g: 255, b: 255 },
        baseColor: { r: 238, g: 242, b: 250 },
        shadowColor: { r: 55, g: 60, b: 72 }, // Volumetric bottom shadow on white cloud
      });
    }

    // Layer 4: Turbulent High-Velocity Wisps & Debris Specks (fast curls shooting laterally)
    const WISP_COUNT = 18;
    for (let i = 0; i < WISP_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / WISP_COUNT + (Math.random() - 0.5) * 0.5;
      const speed = 2.8 + Math.random() * 4.2;
      const vx = Math.cos(angle) * speed * 1.6;
      const vy = Math.sin(angle) * speed * 0.5 - (0.5 + Math.random() * 1.2);
      const isWhite = i % 2 === 0;

      particles.push({
        x: originX + (Math.random() - 0.5) * 16,
        y: originY + (Math.random() - 0.5) * 10,
        vx,
        vy,
        radius: 6 + Math.random() * 8,
        maxRadius: 28 + Math.random() * 18,
        growthRate: 0.8 + Math.random() * 1.0,
        alpha: 0,
        maxAlpha: 0.92,
        decayRate: 0.022 + Math.random() * 0.016,
        rotation: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 0.08,
        scaleX: 1.4 + Math.random() * 0.6,
        scaleY: 0.45 + Math.random() * 0.3,
        delay: Math.random() * 4,
        life: 0,
        type: "turbulent_wisp",
        highlightColor: isWhite ? { r: 255, g: 255, b: 255 } : { r: 80, g: 85, b: 95 },
        baseColor: isWhite ? { r: 240, g: 245, b: 255 } : { r: 25, g: 28, b: 35 },
        shadowColor: isWhite ? { r: 110, g: 115, b: 125 } : { r: 10, g: 12, b: 16 },
      });
    }

    // Sort particles so deep dark soot renders behind, and crisp white plumes roll over the front
    particles.sort((a, b) => {
      const order = { dark_smoke: 1, mid_ash: 2, white_steam: 3, turbulent_wisp: 4 };
      return order[a.type] - order[b.type];
    });

    // Dual Shockwave parameters
    let whiteShockwaveRadius = 6;
    let whiteShockwaveAlpha = 0.95;

    let darkShockwaveRadius = 4;
    let darkShockwaveAlpha = 0.85;

    // High-contrast center launch flash
    let flashAlpha = 0.90;

    let rafId: number;

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // -------------------------------------------------------------
      // 1. SECONDARY DARK CARBON / DUST SHOCKWAVE (Floor Displacement)
      // -------------------------------------------------------------
      if (darkShockwaveAlpha > 0.01) {
        darkShockwaveRadius += 3.8;
        darkShockwaveAlpha *= 0.93;

        ctx.save();
        ctx.translate(originX, originY + 12);
        ctx.scale(1.0, 0.42);
        ctx.beginPath();
        ctx.arc(0, 0, darkShockwaveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(18, 20, 26, ${darkShockwaveAlpha.toFixed(3)})`;
        ctx.lineWidth = Math.max(1.5, 9 - darkShockwaveRadius * 0.05);
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      }

      // -------------------------------------------------------------
      // 2. PRIMARY WHITE ELECTRIC / VAPOR SHOCKWAVE RING
      // -------------------------------------------------------------
      if (whiteShockwaveAlpha > 0.01) {
        whiteShockwaveRadius += 4.5;
        whiteShockwaveAlpha *= 0.91;

        ctx.save();
        ctx.translate(originX, originY + 12);
        ctx.scale(1.0, 0.42);
        ctx.beginPath();
        ctx.arc(0, 0, whiteShockwaveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${whiteShockwaveAlpha.toFixed(3)})`;
        ctx.lineWidth = Math.max(1, 6 - whiteShockwaveRadius * 0.04);
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.restore();
      }

      // -------------------------------------------------------------
      // 3. HIGH-CONTRAST CENTRAL LAUNCH FLASH
      // -------------------------------------------------------------
      if (flashAlpha > 0.01) {
        flashAlpha *= 0.86;
        const flashGrad = ctx.createRadialGradient(
          originX,
          originY,
          0,
          originX,
          originY,
          105
        );
        flashGrad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha.toFixed(3)})`);
        flashGrad.addColorStop(0.32, `rgba(230, 238, 255, ${(flashAlpha * 0.65).toFixed(3)})`);
        flashGrad.addColorStop(0.68, `rgba(45, 50, 62, ${(flashAlpha * 0.40).toFixed(3)})`);
        flashGrad.addColorStop(1, "rgba(12, 14, 20, 0)");

        ctx.fillStyle = flashGrad;
        ctx.beginPath();
        ctx.arc(originX, originY, 105, 0, Math.PI * 2);
        ctx.fill();
      }

      // -------------------------------------------------------------
      // 4. VOLUMETRIC BLACK & WHITE SMOKE PARTICLES
      // -------------------------------------------------------------
      let anyAlive = false;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        if (p.life < p.delay) {
          anyAlive = true;
          continue;
        }

        // Rapid opaque billow formation, followed by smooth dissipation
        if (p.alpha < p.maxAlpha && p.life < p.delay + 11) {
          p.alpha = Math.min(p.maxAlpha, p.alpha + 0.14);
        } else {
          p.alpha = Math.max(0, p.alpha - p.decayRate);
        }

        if (p.alpha > 0.005) {
          anyAlive = true;

          // Drag, air resistance, and natural upward thermal plume
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.94;
          p.vy *= 0.955;
          p.vy -= 0.045; // Gentle upward thermal lift

          // Radial volume expansion
          if (p.radius < p.maxRadius) {
            p.radius += p.growthRate;
          }

          p.rotation += p.angularVelocity;

          // -----------------------------------------------------------
          // DIRECTIONAL 3D VOLUMETRIC LIGHTING & SELF-SHADOWING
          // -----------------------------------------------------------
          // Offset the radial gradient focal point relative to the particle's
          // rotation to simulate light catching the top/rim while casting deep
          // shadows underneath.
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(p.scaleX, p.scaleY);

          const lightOffsetDist = p.radius * 0.28;
          const lx = -lightOffsetDist * 0.7;
          const ly = -lightOffsetDist * 0.7;

          const grad = ctx.createRadialGradient(
            lx,
            ly,
            p.radius * 0.06,
            0,
            0,
            p.radius
          );

          const { r: hr, g: hg, b: hb } = p.highlightColor;
          const { r: br, g: bg, b: bb } = p.baseColor;
          const { r: sr, g: sg, b: sb } = p.shadowColor;

          grad.addColorStop(0, `rgba(${hr}, ${hg}, ${hb}, ${p.alpha.toFixed(3)})`);
          grad.addColorStop(0.38, `rgba(${br}, ${bg}, ${bb}, ${(p.alpha * 0.82).toFixed(3)})`);
          grad.addColorStop(0.72, `rgba(${sr}, ${sg}, ${sb}, ${(p.alpha * 0.45).toFixed(3)})`);
          grad.addColorStop(1, `rgba(${sr}, ${sg}, ${sb}, 0)`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      // Continue animation until all smoke and shockwaves dissipate
      if (
        anyAlive ||
        whiteShockwaveAlpha > 0.01 ||
        darkShockwaveAlpha > 0.01 ||
        flashAlpha > 0.01
      ) {
        rafId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      if (ctx) ctx.clearRect(0, 0, w, h);
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="smoke-burst-canvas"
      aria-hidden="true"
    />
  );
}
