"use client";

import React, { useEffect, useRef } from "react";

const LERP_FACTOR = 0.085;

export default function WorksShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onScroll = () => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const totalScrollable = track.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) {
        targetProgress.current = 1;
        return;
      }

      // Scrub progress 0..1 across the pinned scroll track
      const scrolledInTrack = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolledInTrack / totalScrollable));
      targetProgress.current = progress;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    let rafId: number;

    const loop = () => {
      if (prefersReducedMotion.matches) {
        currentProgress.current = 1;
      } else {
        const diff = targetProgress.current - currentProgress.current;
        if (Math.abs(diff) > 0.0004) {
          currentProgress.current += diff * LERP_FACTOR;
        } else {
          currentProgress.current = targetProgress.current;
        }
      }

      const p = currentProgress.current;
      const diffVelocity = targetProgress.current - currentProgress.current;

      // 1. Content Choreography (Entrance, floating inertia, settled showcase)
      if (contentRef.current) {
        let cOp = 1, cTr = 0, cScale = 1;

        // Entrance Transition: 0.00 -> 0.08 (fast, crisp settlement into resting position)
        if (p < 0.08) {
          const t = Math.max(0, p / 0.08);
          cOp = 0.9 + 0.1 * t;
          cTr = (1 - t) * 14;
          cScale = 0.98 + 0.02 * t;
        }
        // Terminal Section: Remains gracefully settled and visible
        else {
          cTr = (p - 0.5) * -12;
        }

        const floatingInertia = diffVelocity * 28;
        const finalTr = cTr + floatingInertia;

        contentRef.current.style.opacity = cOp.toFixed(3);
        contentRef.current.style.transform = `translateY(${finalTr.toFixed(1)}px) scale(${cScale.toFixed(3)})`;
        contentRef.current.style.filter = "none";
      }

      // 2. Ambient Spotlight Intensity Tracking
      if (spotlightRef.current) {
        let spotOp = 1;
        if (p < 0.08) {
          const t = Math.max(0, p / 0.08);
          spotOp = 0.7 + 0.3 * t;
        }
        spotlightRef.current.style.opacity = spotOp.toFixed(3);
      }

      // 3. Black Fade Transition Overlay (Entrance from previous page)
      if (overlayRef.current) {
        let fadeOp = 0;
        if (p < 0.03) {
          fadeOp = (1 - p / 0.03) * 0.2;
        }
        overlayRef.current.style.opacity = fadeOp.toFixed(3);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={trackRef}
      id="works"
      style={{
        position: "relative",
        width: "100%",
        height: "220vh", // Scrubbing distance providing ample room to absorb & interact
        backgroundColor: "#000000",
        color: "#ffffff",
        zIndex: 20,
        boxSizing: "border-box",
      }}
    >
      {/* Pinned Sticky Stage - Full Viewport Presentation */}
      <div
        className="sticky-stage"
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
          padding: "0 clamp(38px, 6.5vw, 96px)",
          boxSizing: "border-box",
        }}
      >
        {/* =========================================================================
            1. CINEMATIC LIGHTING & TEXTURE LAYERS
            ========================================================================= */}
        {/* Top Center Spotlight (Radiant illumination source directly from the top) */}
        <div
          ref={spotlightRef}
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(1200px, 95vw)",
            height: "75vh",
            background:
              "radial-gradient(ellipse 65% 55% at 50% 12%, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 45%, rgba(0, 0, 0, 1) 78%)",
            pointerEvents: "none",
            zIndex: 1,
            opacity: 1,
          }}
        />

        {/* Ambient Core Back-Halo (Soft diffuse glow directly behind 'MY WORKS') */}
        <div
          style={{
            position: "absolute",
            top: "44%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(960px, 85vw)",
            height: "55vh",
            background:
              "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0, 0, 0, 1) 0%, rgba(61, 61, 61, 0.07) 50%, transparent 75%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Deep Dark Perimeter Vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 50%, transparent 45%, rgba(0, 0, 0, 0.85) 100%)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        {/* Analog Film Grain / Texture Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.045,
            mixBlendMode: "screen",
            zIndex: 3,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* =========================================================================
            2. HERO TYPOGRAPHY & BRANDING
            ========================================================================= */}
        <div
          ref={contentRef}
          className="works-content"
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            maxWidth: "1350px",
            width: "100%",
            boxSizing: "border-box",
            pointerEvents: "none",
            userSelect: "none",
            opacity: 1,
            transform: "translateY(0) scale(1)",
            willChange: "transform, opacity, filter",
          }}
        >
          {/* Main Title: MY WORKS */}
          <h2 className="works-main-title">
            MY WORKS
          </h2>

          {/* Subtitle 1: CRAFTING DIGITAL EXPERIENCES */}
          <p className="works-sub-upper">
            CRAFTING DIGITAL EXPERIENCES
          </p>

          {/* Subtitle 2: with passion & code. */}
          <p className="works-sub-italic">
            with passion &amp; code.
          </p>
        </div>

        {/* Subtle Fade-Through-Black Transition Overlay */}
        <div
          ref={overlayRef}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#000000",
            opacity: 0,
            pointerEvents: "none",
            zIndex: 30,
          }}
        />
      </div>

      <style jsx>{`
        .works-main-title {
          margin: 0;
          font-family: 'WorksOutfit', 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: clamp(3.8rem, 13vw, 11.5rem);
          font-weight: 900;
          letter-spacing: -0.035em;
          line-height: 0.95;
          text-transform: uppercase;
          text-align: center;
          color: #ffffff;
          filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.95))
            drop-shadow(0 0 32px rgba(255, 255, 255, 0.12));
          width: 100%;
        }

        .works-sub-upper {
          margin: 0;
          margin-top: clamp(22px, 3.4vh, 38px);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
          font-size: clamp(10.5px, 1.25vw, 15px);
          font-weight: 600;
          letter-spacing: clamp(0.34em, 0.46vw, 0.52em);
          text-transform: uppercase;
          color: #8c92a0;
          text-align: center;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.9));
        }

        .works-sub-italic {
          margin: 0;
          margin-top: clamp(6px, 1vh, 12px);
          font-family: 'Playfair Display', 'Cormorant Garamond', 'Baskerville', 'Georgia', serif;
          font-style: italic;
          font-weight: 600;
          font-size: clamp(2rem, 4.3vw, 3.8rem);
          color: #ffffff;
          letter-spacing: 0.01em;
          line-height: 1.18;
          text-align: center;
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.95), 0 0 24px rgba(255, 255, 255, 0.16);
        }

        @media (max-width: 768px) {
          .works-main-title {
            font-size: clamp(2.8rem, 15vw, 4.6rem);
            letter-spacing: -0.02em;
          }
          .works-sub-upper {
            font-size: 10px;
            letter-spacing: 0.28em;
          }
          .works-sub-italic {
            font-size: 1.7rem;
          }
        }
      `}</style>
    </section>
  );
}
