"use client";

import React, { useEffect, useRef, useState } from "react";

const TOTAL_FRAMES = 101;
const LERP_FACTOR = 0.085; // Organic neck muscle inertia

// Persistent frame cache (outside component lifecycle to survive re-renders)
const frameCache: (HTMLImageElement | null)[] = new Array(TOTAL_FRAMES + 1).fill(null);
const frameLoaded: boolean[] = new Array(TOTAL_FRAMES + 1).fill(false);
const frameLoading: boolean[] = new Array(TOTAL_FRAMES + 1).fill(false);

function loadFrame(i: number, onLoaded?: () => void) {
  if (i < 1 || i > TOTAL_FRAMES) return;
  if (frameLoaded[i] && frameCache[i]) {
    if (onLoaded) onLoaded();
    return;
  }
  if (frameLoading[i]) return;

  frameLoading[i] = true;
  const img = new Image();

  img.onload = () => {
    frameCache[i] = img;
    frameLoaded[i] = true;
    frameLoading[i] = false;
    if (onLoaded) onLoaded();
  };

  img.onerror = () => {
    frameLoading[i] = false;
  };

  img.src = `/head_frames/frame_${String(i).padStart(5, "0")}.webp`;
}

function getNearestFrame(target: number): HTMLImageElement | null {
  const idx = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(target)));
  if (frameLoaded[idx] && frameCache[idx]) {
    return frameCache[idx];
  }

  for (let d = 1; d < TOTAL_FRAMES; d++) {
    const prev = idx - d;
    if (prev >= 1 && frameLoaded[prev] && frameCache[prev]) {
      return frameCache[prev];
    }
    const next = idx + d;
    if (next <= TOTAL_FRAMES && frameLoaded[next] && frameCache[next]) {
      return frameCache[next];
    }
  }

  // Fallback to center frame (51) or first frame
  return frameCache[51] || frameCache[1] || null;
}

function renderImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number
) {
  const iw = img.naturalWidth || 1920;
  const ih = img.naturalHeight || 1080;

  // Fit within canvas while preserving aspect ratio, perfectly respecting margin pillars
  const scale = Math.min(canvasW / iw, canvasH / ih);
  const rw = Math.round(iw * scale);
  const rh = Math.round(ih * scale);
  const ox = Math.round((canvasW - rw) / 2);
  const oy = Math.round((canvasH - rh) / 2);

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvasW, canvasH);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, ox, oy, rw, rh);
}

export default function HeadTrackingSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Normalized progress: 0.0 (full left) -> 0.5 (center) -> 1.0 (full right)
  // Default to 0.5 (looking straight ahead at the user)
  const targetProgress = useRef<number>(0.5);
  const currentProgress = useRef<number>(0.5);
  const lastDrawnFrame = useRef<number>(-1);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Mouse & Touch Tracking (calibrated strictly to inner margin viewport)
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const viewport = viewportRef.current || containerRef.current;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      if (rect.width <= 0) return;

      const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      targetProgress.current = normX;
      if (!hasInteracted) setHasInteracted(true);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const viewport = viewportRef.current || containerRef.current;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      if (rect.width <= 0) return;

      const touchX = e.touches[0].clientX;
      const normX = Math.max(0, Math.min(1, (touchX - rect.left) / rect.width));
      targetProgress.current = normX;
      if (!hasInteracted) setHasInteracted(true);
    };

    const onMouseLeave = () => {
      // Gently return to center gaze when mouse leaves the viewport
      targetProgress.current = 0.5;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [hasInteracted]);

  // Canvas Lifecycle & 60fps Smooth Damping Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let rafId: number;

    const updateSize = () => {
      const viewport = viewportRef.current || containerRef.current;
      if (!viewport) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = viewport.clientWidth;
      const h = viewport.clientHeight;
      if (w <= 0 || h <= 0) return;

      const targetW = Math.round(w * dpr);
      const targetH = Math.round(h * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        lastDrawnFrame.current = -1; // Force redraw on resize
      }
    };

    const draw = (frameIdx: number) => {
      const img = getNearestFrame(frameIdx);
      if (img) {
        renderImage(ctx, img, canvas.width, canvas.height);
        lastDrawnFrame.current = frameIdx;
      }
    };

    // 1. Immediately load and draw the Center frame (Frame 51) so there is zero flash
    loadFrame(51, () => {
      updateSize();
      draw(51);
    });

    // 2. Preload near-center frames first (frames 35 to 65)
    for (let i = 35; i <= 65; i++) {
      loadFrame(i);
    }

    // 3. Preload all remaining frames in background batches
    let batchIdx = 1;
    const preloadRest = () => {
      let count = 0;
      while (batchIdx <= TOTAL_FRAMES && count < 8) {
        loadFrame(batchIdx);
        batchIdx++;
        count++;
      }
      if (batchIdx <= TOTAL_FRAMES) {
        setTimeout(preloadRest, 30);
      }
    };
    setTimeout(preloadRest, 50);

    const onResize = () => {
      updateSize();
      const currentIntFrame = Math.round(1 + currentProgress.current * (TOTAL_FRAMES - 1));
      draw(currentIntFrame);
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });

    updateSize();

    // 4. Smooth Animation Loop with Organic Inertia
    const loop = () => {
      const diff = targetProgress.current - currentProgress.current;
      currentProgress.current += diff * LERP_FACTOR;

      // Progress 0.0 -> Frame 1, 0.5 -> Frame 51, 1.0 -> Frame 101
      const frameFloat = 1 + currentProgress.current * (TOTAL_FRAMES - 1);
      const frameInt = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(frameFloat)));

      if (frameInt !== lastDrawnFrame.current) {
        draw(frameInt);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      id="character"
      className="head-tracking-section"
      aria-label="Interactive Character Showcase"
    >
      <div ref={viewportRef} className="head-tracking-viewport">
        <canvas
          ref={canvasRef}
          className="head-tracking-canvas"
        />

        {/* Subtle Interactive Instruction Pill */}
        <div
          className={`interaction-hint ${hasInteracted ? "faded" : ""}`}
          aria-hidden="true"
        >
          <span className="hint-bullet" />
          <span className="hint-text">Move cursor to track</span>
        </div>
      </div>

      <style jsx>{`
        .head-tracking-section {
          position: relative;
          width: 100%;
          height: 100vh;
          background-color: #000000;
          overflow: hidden;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-left: var(--margin-pillar-width, clamp(48px, 6.5vw, 102px));
          padding-right: var(--margin-pillar-width, clamp(48px, 6.5vw, 102px));
          box-sizing: border-box;
        }

        .head-tracking-viewport {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .head-tracking-canvas {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none;
          user-select: none;
        }

        .interaction-hint {
          position: absolute;
          bottom: clamp(28px, 4.5vh, 44px);
          left: 50%;
          transform: translateX(-50%);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: rgba(255, 255, 255, 0.75);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: clamp(11px, 0.95vw, 13px);
          font-weight: 400;
          letter-spacing: 0.05em;
          pointer-events: none;
          user-select: none;
          transition: opacity 0.8s ease, transform 0.8s ease;
          z-index: 10;
        }

        .interaction-hint.faded {
          opacity: 0;
          transform: translate(-50%, 10px);
        }

        .hint-bullet {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 8px #ffffff;
          animation: pulseBullet 2s infinite ease-in-out;
        }

        @keyframes pulseBullet {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }
      `}</style>
    </section>
  );
}
