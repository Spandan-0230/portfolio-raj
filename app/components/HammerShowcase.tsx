"use client";

import { useEffect, useRef } from "react";

const TOTAL_FRAMES = 289;
const LERP_FACTOR = 0.085;

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
  const titleRef = useRef<HTMLDivElement>(null);

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

      // Title Scroll-Driven Entrance & Exit Choreography
      if (titleRef.current) {
        const p = currentProgress.current;
        let tOp = 1;
        let tTr = 0;
        let tBl = 0;

        // Entrance Transition: 0.00 -> 0.06 (emerges smoothly from black & drifts into place)
        if (p < 0.06) {
          const t = Math.max(0, p / 0.06);
          tOp = t;
          tTr = (1 - t) * 22; // Drifts downward into resting position
          tBl = (1 - t) * 6;  // Dissolves from blur
        }
        // Main Animation Track: 0.06 -> 0.85 (pristine, 100% visible, subtle floating inertia during scroll)
        else if (p <= 0.85) {
          tOp = 1;
          const diffVelocity = targetProgress.current - currentProgress.current;
          tTr = diffVelocity * 16;
          tBl = 0;
        }
        // Exit Transition: 0.85 -> 0.96 (smoothly drifts upward and dissolves into black)
        else {
          const t = Math.min(1, Math.max(0, (p - 0.85) / 0.11));
          tOp = 1 - t;
          tTr = -t * 22; // Drifts upward
          tBl = t * 6;   // Dissolves into blur
        }

        titleRef.current.style.opacity = tOp.toFixed(3);
        titleRef.current.style.transform = `translateX(-50%) translateY(${tTr.toFixed(1)}px)`;
        titleRef.current.style.filter = `blur(${tBl.toFixed(1)}px)`;
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

        {/* Section Title: Enterprise Showcase (Persistent throughout animation with start/end transitions) */}
        <div
          ref={titleRef}
          style={{
            position: "absolute",
            top: "clamp(24px, 4.5vh, 48px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            width: "100%",
            maxWidth: "1100px",
            padding: "0 24px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            userSelect: "none",
            opacity: 0,
            willChange: "transform, opacity, filter",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "'HeroAlphabet', 'HeroOrbitron', sans-serif",
              fontSize: "clamp(2rem, 4.4vw, 3.8rem)",
              fontWeight: 800,
              letterSpacing: "0.14em",
              lineHeight: 1.12,
              textTransform: "uppercase",
              textAlign: "center",
              backgroundImage:
                "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 36%, #D2F0F7 60%, #7FE0F4 84%, #42C8E8 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
              filter:
                "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 14px rgba(56, 189, 248, 0.28))",
            }}
          >
            Ventures
          </h2>
          <p
            style={{
              marginTop: "4px",
              maxWidth: "880px",
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
              fontSize: "clamp(10.5px, 1.15vw, 15.5px)",
              fontWeight: 600,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "#CBD5E1",
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            Crafting Modern Experiences
          </p>
        </div>

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
