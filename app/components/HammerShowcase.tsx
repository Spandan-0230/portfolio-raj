"use client";

import { useEffect, useRef } from "react";

const TOTAL_FRAMES = 289;
const LERP_FACTOR = 0.085;

// ============================================================================
// LIGHTING & AMBIENCE ADJUSTMENT CONTROLS
// Adjust these parameters to fine-tune the spotlight intensity, spread, and darkness
// ============================================================================
export const HAMMER_LIGHTING_CONFIG = {
  // Vignette / Background darkness outside the spotlight (0 = no darkness, 1 = pitch black)
  outerDarkness: 1,
  // Darkness inside the center spotlight (0 = completely untouched bright natural canvas, 0.2 = subtly dimmed)
  centerDarkness: 0,
  // Center spotlight radius (percentage of viewport diagonal: e.g. "32%", "40%", "50%")
  spotlightRadius: "38%",
  // Falloff / transition softness from bright center to dark outer (percentage: e.g. "72%", "85%")
  falloffRadius: "90%",
  // Ambient radial glow boost in the middle to enhance natural illumination (0 = disabled, 0.25 = subtle soft ambient)
  centerGlowIntensity: 0,
};

// Persistent frame cache (outside component lifecycle)
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

  img.src = `/hammer_frames/frame_${String(i).padStart(5, "0")}.webp`;
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

  return null;
}

export default function HammerShowcase() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const targetFrame = useRef(1);
  const currentFrame = useRef(1);
  const targetFade = useRef(1);
  const currentFade = useRef(1);
  const lastDrawnFrame = useRef(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let rafId: number;

    const updateSize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    const draw = () => {
      const img = getNearestFrame(currentFrame.current);
      if (!img) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;

      // Aspect-fill covering entire viewport
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, cw, ch);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    // 1. Initial critical load
    loadFrame(1, () => {
      updateSize();
      draw();
    });

    // 2. Preload first 30 frames
    for (let i = 2; i <= Math.min(30, TOTAL_FRAMES); i++) {
      loadFrame(i);
    }

    // 3. Preload milestone keyframes across the sequence
    for (let i = 35; i <= TOTAL_FRAMES; i += 10) {
      loadFrame(i);
    }

    // 4. Fill remaining frames in background waves
    let nextIdx = 1;
    const loadRemaining = () => {
      let count = 0;
      while (nextIdx <= TOTAL_FRAMES && count < 8) {
        loadFrame(nextIdx);
        count++;
        nextIdx++;
      }
      if (nextIdx <= TOTAL_FRAMES) {
        setTimeout(loadRemaining, 30);
      }
    };
    setTimeout(loadRemaining, 60);

    // Scroll calculation with frame scrubbing
    const onScroll = () => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const totalTrackScroll = track.offsetHeight - window.innerHeight;
      if (totalTrackScroll <= 0) return;

      const scrolledInTrack = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolledInTrack / totalTrackScroll));
      targetProgress.current = progress;

      // Cinematic Fade-through-black transitions:
      // Start: Emerges from black as track pins into viewport (0.00 -> 0.05)
      // Main: Crystal clear 3D sequence (0.05 -> 0.85)
      // End: Fades smoothly through black (0.85 -> 0.96)
      const START_FADE_END = 0.05;
      const END_FADE_START = 0.85;
      const END_FADE_END = 0.96;

      if (progress < START_FADE_END) {
        targetFade.current = 1 - progress / START_FADE_END;
      } else if (progress > END_FADE_START) {
        targetFade.current = Math.min(1, (progress - END_FADE_START) / (END_FADE_END - END_FADE_START));
      } else {
        targetFade.current = 0;
      }

      // Frame scrubbing: holds frame 1 briefly (0.00 -> 0.02)
      // then scrubs smoothly through frames 1..289 up to 0.88 progress
      const FRAME_START_PROGRESS = 0.02;
      const FRAME_MAX_PROGRESS = 0.88;
      if (progress <= FRAME_START_PROGRESS) {
        targetFrame.current = 1;
      } else {
        const frameProgress = Math.min(
          1,
          (progress - FRAME_START_PROGRESS) / (FRAME_MAX_PROGRESS - FRAME_START_PROGRESS)
        );
        targetFrame.current = 1 + frameProgress * (TOTAL_FRAMES - 1);
      }

      // Proximity preloading near current target frame
      const center = Math.round(targetFrame.current);
      for (let i = Math.max(1, center - 20); i <= Math.min(TOTAL_FRAMES, center + 20); i++) {
        loadFrame(i);
      }
    };

    const onResize = () => {
      updateSize();
      draw();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });

    updateSize();
    onScroll();

    // Persistent RAF animation loop
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const loop = () => {
      if (prefersReducedMotion.matches) {
        currentFrame.current = targetFrame.current;
        currentFade.current = targetFade.current;
        currentProgress.current = targetProgress.current;
      } else {
        // Frame interpolation lerp
        const diffFrame = targetFrame.current - currentFrame.current;
        if (Math.abs(diffFrame) > 0.0005) {
          currentFrame.current += diffFrame * LERP_FACTOR;
        } else {
          currentFrame.current = targetFrame.current;
        }

        // Fade interpolation lerp
        const diffFade = targetFade.current - currentFade.current;
        if (Math.abs(diffFade) > 0.001) {
          currentFade.current += diffFade * 0.15;
        } else {
          currentFade.current = targetFade.current;
        }

        // Progress lerp
        const diffProg = targetProgress.current - currentProgress.current;
        if (Math.abs(diffProg) > 0.0005) {
          currentProgress.current += diffProg * LERP_FACTOR;
        } else {
          currentProgress.current = targetProgress.current;
        }
      }

      // Update black fade overlay
      if (overlayRef.current) {
        overlayRef.current.style.opacity = currentFade.current.toFixed(4);
      }

      // Redraw canvas frame
      const rounded = Math.round(currentFrame.current);
      if (rounded !== lastDrawnFrame.current || frameLoaded[rounded]) {
        draw();
        lastDrawnFrame.current = rounded;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return (
    <section
      ref={trackRef}
      id="hammer"
      style={{
        position: "relative",
        width: "100%",
        height: "450vh", // Smooth scrubbing distance for 289 frames
        backgroundColor: "#000000",
        zIndex: 20,
      }}
    >
      {/* Pinned Sticky Stage - Full Viewport Presentation */}
      <div
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Full-bleed Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
          }}
        />

        {/* Dynamic Dark Vignette Overlay with Bright Spotlight Center */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 10,
            background: `radial-gradient(circle at 50% 52%, rgba(0, 0, 0, ${HAMMER_LIGHTING_CONFIG.centerDarkness}) 0%, rgba(0, 0, 0, ${HAMMER_LIGHTING_CONFIG.centerDarkness}) ${HAMMER_LIGHTING_CONFIG.spotlightRadius}, rgba(0, 0, 0, ${HAMMER_LIGHTING_CONFIG.outerDarkness * 0.7}) ${HAMMER_LIGHTING_CONFIG.falloffRadius}, rgba(0, 0, 0, ${HAMMER_LIGHTING_CONFIG.outerDarkness}) 100%)`,
          }}
        />

        {/* Ambient Center Lighting Soft Bloom (Configurable) */}
        {HAMMER_LIGHTING_CONFIG.centerGlowIntensity > 0 && (
          <div
            style={{
              position: "absolute",
              top: "52%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(680px, 80vw)",
              height: "min(680px, 80vh)",
              borderRadius: "50%",
              pointerEvents: "none",
              zIndex: 11,
              background: `radial-gradient(circle, rgba(186, 230, 253, ${HAMMER_LIGHTING_CONFIG.centerGlowIntensity * 0.35}) 0%, rgba(56, 189, 248, ${HAMMER_LIGHTING_CONFIG.centerGlowIntensity * 0.15}) 40%, transparent 70%)`,
              mixBlendMode: "screen",
            }}
          />
        )}

        {/* Fade-Through-Black Overlay */}
        <div
          ref={overlayRef}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#000000",
            opacity: 1,
            pointerEvents: "none",
            zIndex: 25,
          }}
        />
      </div>
    </section>
  );
}
