"use client";

import React, { useRef } from "react";

export default function StageFour() {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={trackRef}
      id="stage4"
      style={{
        position: "relative",
        width: "100%",
        height: "220vh", // Scrubbing distance providing ample room to absorb
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
            CINEMATIC LIGHTING & TEXTURE LAYERS (Identical to Page 3)
            ========================================================================= */}
        {/* Top Center Spotlight (Radiant illumination source directly from the top) */}
        <div
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

        {/* Ambient Core Back-Halo (Exact same lighting matching Page 3: 0.07 tuning) */}
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
      </div>
    </section>
  );
}
