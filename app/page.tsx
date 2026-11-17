"use client";

import { useEffect, useRef } from "react";
import LanguageShowcase from "./components/LanguageShowcase";
import GithubActivity from "./components/GithubActivity";
import HammerShowcase from "./components/HammerShowcase";
import SmoothScrollDamper from "./components/SmoothScrollDamper";
import ScrollPrompt from "./components/ScrollPrompt";

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

  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const text3Ref = useRef<HTMLDivElement>(null);

  const targetFrame = useRef<number>(1);
  const currentFrame = useRef<number>(1);
  const lastDrawnFrame = useRef<number>(-1);

  const targetFade = useRef<number>(1);
  const currentFade = useRef<number>(1);
  const targetProgress = useRef<number>(0);
  const currentProgress = useRef<number>(0);

  useEffect(() => {
    // 0. Force scroll to top on every reload or navigation / redirect
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
      }
      const resetTop = () => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      };
      resetTop();
      requestAnimationFrame(resetTop);
      if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname);
      }
    }

    const onBeforeUnload = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener("beforeunload", onBeforeUnload);

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

    // Scroll calculation with frame & text choreographies
    const onScroll = () => {
      const track = trackRef.current;
      if (!track) return;

      const totalTrackScroll = track.offsetHeight - window.innerHeight;
      if (totalTrackScroll <= 0) return;

      const scrolled = window.scrollY;
      const progress = Math.max(0, Math.min(1, scrolled / totalTrackScroll));
      targetProgress.current = progress;

      // 1. Black fade transitions:
      // Start: Screen is black at progress 0, smoothly fades out to clear by progress 0.04 as user scrolls
      // Main: Screen is crystal clear (progress 0.04 -> 0.78)
      // End: Fades smoothly through black (progress 0.78 -> 0.88) to transition seamlessly into page 2
      const START_FADE_END = 0.04;
      const END_FADE_START = 0.78;
      const END_FADE_END = 0.88;

      if (progress < START_FADE_END) {
        targetFade.current = 1 - progress / START_FADE_END;
      } else if (progress > END_FADE_START) {
        targetFade.current = Math.min(1, (progress - END_FADE_START) / (END_FADE_END - END_FADE_START));
      } else {
        targetFade.current = 0;
      }

      // 2. Frame-to-frame scrubbing:
      // Holds frame 1 while emerging from black (0.00 -> 0.02),
      // then scrubs seamlessly through frames 1..331 up to 0.82 progress.
      const FRAME_START_PROGRESS = 0.02;
      const FRAME_MAX_PROGRESS = 0.82;
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

        // Progress lerp for text choreography
        const diffProg = targetProgress.current - currentProgress.current;
        if (Math.abs(diffProg) > 0.0005) {
          currentProgress.current += diffProg * LERP_FACTOR;
        } else {
          currentProgress.current = targetProgress.current;
        }
      }

      const p = currentProgress.current;

      // Choreograph 3 Hero Sequence Phases:
      // Phase 1: SPANDAN BOLE (Delayed with a clean gap after "Welcome" clears: 0.06 -> 0.28)
      // Gap: 0.00 -> 0.06 (Allows "Welcome" to dissolve completely into clear scene)
      // Fade in smoothly: 0.06 -> 0.11, hold until 0.22, then fade & blur out to 0.28
      let t1Op = 0, t1Tr = 0, t1Bl = 0;
      if (p < 0.06) {
        t1Op = 0;
        t1Tr = 18;
        t1Bl = 5;
      } else if (p < 0.11) {
        const t = (p - 0.06) / 0.05;
        t1Op = t;
        t1Tr = (1 - t) * 18;
        t1Bl = (1 - t) * 5;
      } else if (p <= 0.22) {
        t1Op = 1;
        t1Tr = 0;
        t1Bl = 0;
      } else if (p < 0.28) {
        const t = (p - 0.22) / 0.06;
        t1Op = 1 - t;
        t1Tr = -t * 26;
        t1Bl = t * 6;
      } else {
        t1Op = 0;
      }

      if (text1Ref.current) {
        text1Ref.current.style.opacity = t1Op.toFixed(3);
        text1Ref.current.style.transform = `translateY(${t1Tr.toFixed(1)}px)`;
        text1Ref.current.style.filter = `blur(${t1Bl.toFixed(1)}px)`;
      }

      // Phase 2: SOFTWARE DEVELOPER (0.28 -> 0.55)
      // Smooth fade-in + drift up (0.28 -> 0.36), hold until 0.47, fade-out (0.47 -> 0.55)
      let t2Op = 0, t2Tr = 0, t2Bl = 0;
      if (p < 0.28) {
        t2Op = 0;
      } else if (p < 0.36) {
        const t = (p - 0.28) / 0.08;
        t2Op = t;
        t2Tr = (1 - t) * 26;
        t2Bl = (1 - t) * 6;
      } else if (p <= 0.47) {
        t2Op = 1;
        t2Tr = 0;
        t2Bl = 0;
      } else if (p < 0.55) {
        const t = (p - 0.47) / 0.08;
        t2Op = 1 - t;
        t2Tr = -t * 26;
        t2Bl = t * 6;
      } else {
        t2Op = 0;
      }

      if (text2Ref.current) {
        text2Ref.current.style.opacity = t2Op.toFixed(3);
        text2Ref.current.style.transform = `translateY(${t2Tr.toFixed(1)}px)`;
        text2Ref.current.style.filter = `blur(${t2Bl.toFixed(1)}px)`;
      }

      // Phase 3: AI ENGINEER (0.55 -> 0.78)
      // Smooth fade-in + drift up (0.55 -> 0.63), hold until 0.72, fade-out (0.72 -> 0.78)
      let t3Op = 0, t3Tr = 0, t3Bl = 0;
      if (p < 0.55) {
        t3Op = 0;
      } else if (p < 0.63) {
        const t = (p - 0.55) / 0.08;
        t3Op = t;
        t3Tr = (1 - t) * 26;
        t3Bl = (1 - t) * 6;
      } else if (p <= 0.72) {
        t3Op = 1;
        t3Tr = 0;
        t3Bl = 0;
      } else if (p < 0.78) {
        const t = (p - 0.72) / 0.06;
        t3Op = 1 - t;
        t3Tr = -t * 26;
        t3Bl = t * 6;
      } else {
        t3Op = 0;
      }

      if (text3Ref.current) {
        text3Ref.current.style.opacity = t3Op.toFixed(3);
        text3Ref.current.style.transform = `translateY(${t3Tr.toFixed(1)}px)`;
        text3Ref.current.style.filter = `blur(${t3Bl.toFixed(1)}px)`;
      }



      // Update black fade overlay directly from currentFade
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
      window.removeEventListener("beforeunload", onBeforeUnload);
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
        id="hero"
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

          {/* =========================================================================
              HERO TEXT 1: SPANDAN BOLE (Phase 1 - Initial Landing)
              ========================================================================= */}
          <div
            ref={text1Ref}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "0 24px",
              zIndex: 15,
              opacity: 0,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {/* Name with S·H·A·G·A Octagonal Chamfered Alphabet Design & Black/White Dual-Tone */}
            <h1
              style={{
                margin: 0,
                fontFamily: "'HeroAlphabet', 'HeroOrbitron', sans-serif",
                fontSize: "clamp(2.8rem, 7.5vw, 7.2rem)",
                fontWeight: 800,
                letterSpacing: "0.14em",
                lineHeight: 1.08,
                textTransform: "uppercase",
                backgroundImage:
                  "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 36%, #A1A1AA 58%, #3F3F46 78%, #09090B 94%, #000000 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              <span style={{ display: "block" }}>SPANDAN B</span>

            </h1>

            {/* Subtitle / Capabilities */}
            <p
              style={{
                marginTop: "0px",
                maxWidth: "680px",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: "clamp(10px, 1.1vw, 30px)",
                letterSpacing: "0.28em",
                color: "rgba(255, 255, 255, 0.45)",
                lineHeight: 1.6,
              }}
            >
              STUDENT | BACHELOR OF COMPUTER SCIENCE
            </p>
          </div>

          {/* =========================================================================
              HERO TEXT 2: SOFTWARE DEVELOPER (Phase 2 - After Further Scroll)
              ========================================================================= */}
          <div
            ref={text2Ref}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "0 24px",
              zIndex: 15,
              opacity: 0,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {/* Title: SOFTWARE DEVELOPER with S·H·A·G·A Octagonal Alphabet & Cyan Accent */}
            <h1
              style={{
                margin: 0,
                fontFamily: "'HeroAlphabet', 'HeroOrbitron', sans-serif",
                fontSize: "clamp(2.5rem, 6.8vw, 6.6rem)",
                fontWeight: 800,
                letterSpacing: "0.14em",
                lineHeight: 1.08,
                textTransform: "uppercase",
                backgroundImage:
                  "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 36%, #D2F0F7 60%, #7FE0F4 84%, #42C8E8 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
                filter:
                  "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 10px rgba(56, 189, 248, 0.18))",
              }}
            >
              <br></br>
              <span style={{ display: "block" }}>SOFTWARE DEV</span>
            </h1>

            {/* Subtitle / Capabilities */}
            <p
              style={{
                marginTop: "0px",
                maxWidth: "780px",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: "clamp(10px, 1.1vw, 30px)",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.45)",
                lineHeight: 1.6,
              }}
            >
              Website | Windows | Android  · AI Incite Full-Stack Integration
            </p>
          </div>

          {/* =========================================================================
              HERO TEXT 3: AI ENGINEER (Phase 3 - Deep Sequence)
              ========================================================================= */}
          <div
            ref={text3Ref}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "0 24px",
              zIndex: 15,
              opacity: 0,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {/* Title: AI ENGINEER with S·H·A·G·A Octagonal Alphabet & Cyan Accent */}
            <h1
              style={{
                margin: 0,
                fontFamily: "'HeroAlphabet', 'HeroOrbitron', sans-serif",
                fontSize: "clamp(2.8rem, 7.6vw, 7.4rem)",
                fontWeight: 800,
                letterSpacing: "0.14em",
                lineHeight: 1.08,
                textTransform: "uppercase",
                backgroundImage:
                  "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 36%, #D2F0F7 60%, #7FE0F4 84%, #42C8E8 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
                filter:
                  "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 10px rgba(56, 189, 248, 0.18))",
              }}
            >
              <br></br>
              <span style={{ display: "block" }}>AI ENGINEER</span>
            </h1>

            {/* Subtitle / Capabilities */}
            <p
              style={{
                marginTop: "0px",
                maxWidth: "680px",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: "clamp(10px, 1.1vw, 30px)",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.45)",
                lineHeight: 1.6,
              }}
            >
              AI Tools | Loop Engineering | Prompt Engineering
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

          {/* Scroll To Explore Prompt (Prominently displayed at the very start, smoothly removed on scroll) */}
          <ScrollPrompt />
        </div>
      </div>

      {/* Page 2: GitHub Contribution Activity Section */}
      <GithubActivity />

      {/* Page 3: Hammer 3D Canvas Scroll Animation */}
      <HammerShowcase />

      {/* Page 4: Languages Showcase Section */}
      <LanguageShowcase />

      {/* Smooth Page-Wise Scroll Damper with Haptic Feedback */}
      <SmoothScrollDamper />
    </div>
  );
}
