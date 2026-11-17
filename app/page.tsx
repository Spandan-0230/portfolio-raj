"use client";

import { useEffect, useRef } from "react";

const TOTAL_FRAMES = 331;
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

  img.src = `/webp_frames/frame_${String(i).padStart(5, "0")}.webp`;
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

  return frameCache[1] || null;
}

function renderImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number
) {
  const iw = img.naturalWidth || 1920;
  const ih = img.naturalHeight || 1080;

  const scale = Math.max(canvasW / iw, canvasH / ih);
  const rw = iw * scale;
  const rh = ih * scale;
  const ox = (canvasW - rw) / 2;
  const oy = (canvasH - rh) / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, ox, oy, rw, rh);
}

export default function Home() {
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const targetFrame = useRef<number>(1);
  const currentFrame = useRef<number>(1);
  const lastDrawnFrame = useRef<number>(-1);

  const targetFade = useRef<number>(0);
  const currentFade = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let rafId: number;

    const updateSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      const targetW = Math.round(w * dpr);
      const targetH = Math.round(h * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    };

    const draw = () => {
      const img = getNearestFrame(currentFrame.current);
      if (img) {
        renderImage(ctx, img, canvas.width, canvas.height);
      }
    };

    // 1. Load frame 1 immediately and draw
    loadFrame(1, () => {
      updateSize();
      draw();
    });

    // 2. Preload first 30 frames
    for (let i = 2; i <= Math.min(30, TOTAL_FRAMES); i++) {
      loadFrame(i);
    }

    // 3. Preload milestone keyframes across the sequence
    for (let i = 35; i <= TOTAL_FRAMES; i += 12) {
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

    // Scroll calculation with fade-through-black mapping
    const onScroll = () => {
      const track = trackRef.current;
      if (!track) return;

      const totalTrackScroll = track.offsetHeight - window.innerHeight;
      if (totalTrackScroll <= 0) return;

      const scrolled = window.scrollY;
      const progress = Math.max(0, Math.min(1, scrolled / totalTrackScroll));

      // Frames 1..331 play from progress 0.0 to 0.82
      const FRAME_MAX_PROGRESS = 0.82;
      const frameProgress = Math.min(1, progress / FRAME_MAX_PROGRESS);
      targetFrame.current = 1 + frameProgress * (TOTAL_FRAMES - 1);

      // Fade through black starting at 78% progress, reaching pitch black at 95%
      const FADE_START = 0.78;
      const FADE_END = 0.95;
      if (progress <= FADE_START) {
        targetFade.current = 0;
      } else if (progress >= FADE_END) {
        targetFade.current = 1;
      } else {
        targetFade.current = (progress - FADE_START) / (FADE_END - FADE_START);
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
          currentFade.current += diffFade * 0.1;
        } else {
          currentFade.current = targetFade.current;
        }
      }

      // Update black fade overlay
      if (overlay) {
        overlay.style.opacity = currentFade.current.toFixed(4);
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
    <div
      style={{
        backgroundColor: "#000000",
        color: "#ffffff",
        minHeight: "100vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Scroll Animation Canvas Track */}
      <div
        ref={trackRef}
        style={{
          position: "relative",
          width: "100%",
          height: "550vh",
          backgroundColor: "#000000",
        }}
      >
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

          {/* Fade-Through-Black Overlay */}
          <div
            ref={overlayRef}
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#000000",
              opacity: 0,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* New Page / Portfolio Content Below */}
      <section
        id="content"
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#000000",
          color: "#ffffff",
          zIndex: 10,
          boxSizing: "border-box",
          padding: "120px 24px 160px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0) 70%)",
            pointerEvents: "none",
            borderRadius: "50%",
          }}
        />

        <div
          style={{
            maxWidth: "960px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "32px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Minimalist Pill Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "9999px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              backdropFilter: "blur(12px)",
              fontSize: "11px",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#a1a1aa",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#ffffff",
                boxShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
              }}
            />
            Portfolio // 2026
          </div>

          {/* Cinematic Title */}
          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 68px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              margin: 0,
              background: "linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.6) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Engineering Intuition Through Motion
          </h1>

          {/* Minimal Subtitle */}
          <p
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              color: "#a1a1aa",
              maxWidth: "640px",
              lineHeight: 1.6,
              margin: 0,
              fontWeight: 300,
            }}
          >
            Crafting high-fidelity interactive digital experiences, real-time graphics, and
            ultra-responsive web architectures.
          </p>

          {/* Minimalist Cards Showcase */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "20px",
              width: "100%",
              marginTop: "48px",
              textAlign: "left",
            }}
          >
            <div
              style={{
                padding: "28px",
                borderRadius: "16px",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                transition: "border-color 0.3s ease",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  color: "#71717a",
                  letterSpacing: "0.2em",
                }}
              >
                01 // INTERACTION
              </span>
              <h3 style={{ fontSize: "18px", fontWeight: 600, margin: 0, color: "#ffffff" }}>
                Fluid Motion Design
              </h3>
              <p style={{ fontSize: "13px", color: "#a1a1aa", lineHeight: 1.5, margin: 0 }}>
                Scroll-driven visual narratives, canvas acceleration, and sub-pixel interpolations.
              </p>
            </div>

            <div
              style={{
                padding: "28px",
                borderRadius: "16px",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  color: "#71717a",
                  letterSpacing: "0.2em",
                }}
              >
                02 // ARCHITECTURE
              </span>
              <h3 style={{ fontSize: "18px", fontWeight: 600, margin: 0, color: "#ffffff" }}>
                Next-Gen Performance
              </h3>
              <p style={{ fontSize: "13px", color: "#a1a1aa", lineHeight: 1.5, margin: 0 }}>
                Optimized frame caching, zero layout shifts, and high-DPR multi-threaded rendering.
              </p>
            </div>

            <div
              style={{
                padding: "28px",
                borderRadius: "16px",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  color: "#71717a",
                  letterSpacing: "0.2em",
                }}
              >
                03 // CRAFTSMANSHIP
              </span>
              <h3 style={{ fontSize: "18px", fontWeight: 600, margin: 0, color: "#ffffff" }}>
                Bespoke Experiences
              </h3>
              <p style={{ fontSize: "13px", color: "#a1a1aa", lineHeight: 1.5, margin: 0 }}>
                Every interaction tailored with surgical precision, mathematical curves, and elegance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
