"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import PureImagePopup from "./PureImagePopup";
import BioSyncGalleryModal from "./BioSyncGalleryModal";
import { StageFiveLeftPane, StageFiveRightPane } from "./FloatViewShowcase";
import { StageSixLeftPane, StageSixRightPane } from "./LedgerShowcase";

interface ProjectImage {
  id: number;
  filename: string;
  src: string;
  title: string;
  subtitle: string;
  aspect: "portrait" | "landscape";
  width: number;
  height: number;
}

const BIOSYNC_IMAGES: ProjectImage[] = [
  {
    id: 1,
    filename: "1.png",
    src: "/projects/biosync/1.png",
    title: "Vitals Overview",
    subtitle: "Real-time biometric dashboard & daily health telemetry",
    aspect: "portrait",
    width: 540,
    height: 1155,
  },
  {
    id: 2,
    filename: "2.png",
    src: "/projects/biosync/2.png",
    title: "Cardio Analytics",
    subtitle: "Continuous heart rate zones & pulse variability",
    aspect: "portrait",
    width: 540,
    height: 1158,
  },
  {
    id: 3,
    filename: "3.png",
    src: "/projects/biosync/3.png",
    title: "Sync & Sensors",
    subtitle: "Multi-sensor BLE pairing & live data streaming",
    aspect: "portrait",
    width: 540,
    height: 1152,
  },
  {
    id: 4,
    filename: "4.png",
    src: "/projects/biosync/4.png",
    title: "Activity Tracking",
    subtitle: "Caloric expenditure, steps & metabolic targets",
    aspect: "portrait",
    width: 540,
    height: 1115,
  },
  {
    id: 5,
    filename: "5.png",
    src: "/projects/biosync/5.png",
    title: "Sleep Intelligence",
    subtitle: "Circadian phases, REM monitoring & recovery score",
    aspect: "portrait",
    width: 540,
    height: 1110,
  },
  {
    id: 6,
    filename: "6.png",
    src: "/projects/biosync/6.png",
    title: "Clinical Dashboard",
    subtitle: "Comprehensive health informatics & trends view",
    aspect: "landscape",
    width: 1080,
    height: 752,
  },
  {
    id: 7,
    filename: "7.png",
    src: "/projects/biosync/7.png",
    title: "Diagnostic Report",
    subtitle: "Detailed physiological summary & health export",
    aspect: "portrait",
    width: 913,
    height: 1280,
  },
  {
    id: 8,
    filename: "8.png",
    src: "/projects/biosync/8.png",
    title: "Telemetry Console",
    subtitle: "Sensor diagnostics, firmware status & battery levels",
    aspect: "landscape",
    width: 1080,
    height: 825,
  },
];

// Language / Tech Stack distribution data for BioSync
interface LanguageItem {
  id: string;
  name: string;
  shortName: string;
  pct: number;
  color: string;
  icon: React.ReactNode;
}

const LANG_DATA: LanguageItem[] = [
  {
    id: "kotlin",
    name: "Kotlin",
    shortName: "Kotlin",
    pct: 98.4,
    color: "#A97BFF",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M24 24H0V0H24L12 12L24 24Z" fill="#7F52FF" />
        <path d="M0 24L12 12L0 0V24Z" fill="#A855F7" />
        <path d="M12 12L24 0H0L12 12Z" fill="#C084FC" />
      </svg>
    ),
  },
  {
    id: "html",
    name: "HTML",
    shortName: "HTML",
    pct: 1.6,
    color: "#E34C26",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="#E34C26">
        <path d="M3 2l1.6 18.2L12 22l7.4-1.8L21 2H3zm14.8 6.4h-7.6l.2 2.2h7.2l-.6 6.8-4.6 1.3-4.6-1.3-.3-3.7h2.2l.2 1.8 2.5.7 2.5-.7.3-3.2H6.9l-.6-6.4h11.7l-.2 2.2z" />
      </svg>
    ),
  },
];

// Helper functions for Donut Chart geometry
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeDonutSegment(
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const startOuter = polarToCartesian(x, y, outerRadius, endAngle);
  const endOuter = polarToCartesian(x, y, outerRadius, startAngle);
  const startInner = polarToCartesian(x, y, innerRadius, endAngle);
  const endInner = polarToCartesian(x, y, innerRadius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${startOuter.x.toFixed(2)} ${startOuter.y.toFixed(2)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${endOuter.x.toFixed(2)} ${endOuter.y.toFixed(2)}`,
    `L ${endInner.x.toFixed(2)} ${endInner.y.toFixed(2)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${startInner.x.toFixed(2)} ${startInner.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

// Custom 4-triangle cross bullet icon (#be2bde, no outer glow)
function FeatureBulletIcon() {
  return (
    <span className="feature-bullet" aria-hidden="true">
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="#be2bde"
        xmlns="http://www.w3.org/2000/svg"
        className="feature-bullet-svg"
      >
        <polygon points="8.6,2.5 15.4,2.5 12,9.5" />
        <polygon points="8.6,21.5 15.4,21.5 12,14.5" />
        <polygon points="2.5,8.6 2.5,15.4 9.5,12" />
        <polygon points="21.5,8.6 21.5,15.4 14.5,12" />
      </svg>
    </span>
  );
}

export default function ProjectsShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);

  // Elevator Scroll Animation Layer Refs
  const stage4LeftRef = useRef<HTMLDivElement>(null);
  const stage4RightRef = useRef<HTMLDivElement>(null);
  const stage5LeftRef = useRef<HTMLDivElement>(null);
  const stage5RightRef = useRef<HTMLDivElement>(null);
  const stage6LeftRef = useRef<HTMLDivElement>(null);
  const stage6RightRef = useRef<HTMLDivElement>(null);
  const stage6MoreProjectsRef = useRef<HTMLDivElement>(null);
  const targetProgress = useRef<number>(0);
  const currentProgress = useRef<number>(0);
  const rafId = useRef<number | null>(null);

  // Active hovered language index for Donut Chart
  const [activeLang, setActiveLang] = useState<number | null>(null);

  // Precomputed start and end angles for donut slices
  const donutSlices = useMemo(() => {
    let currentAngle = 0;
    const gap = 1.4; // Subtle gap between slices for sleek segmentation
    return LANG_DATA.map((item) => {
      const sweep = (item.pct / 100) * 360;
      const startAngle = currentAngle + gap / 2;
      const endAngle = currentAngle + sweep - gap / 2;
      currentAngle += sweep;
      return {
        ...item,
        startAngle,
        endAngle,
      };
    });
  }, []);

  // Smooth Elevator Scroll Transition: Stage Four -> Stage Five -> Stage Six
  const [popupImg, setPopupImg] = useState<{ src: string; alt: string } | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  // The center vertical divider line stays 100% stationary, while both left and right sides move UPWARD on scroll.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateScrollProgress = () => {
      const rect = track.getBoundingClientRect();
      const winH = window.innerHeight;
      const totalScroll = rect.height - winH;
      if (totalScroll <= 0) {
        targetProgress.current = 0;
        return;
      }
      const scrolled = Math.max(0, -rect.top);
      targetProgress.current = Math.max(0, Math.min(1, scrolled / totalScroll));
    };

    const renderLoop = () => {
      const diff = targetProgress.current - currentProgress.current;
      if (Math.abs(diff) > 0.0001) {
        currentProgress.current += diff * 0.18;
      } else {
        currentProgress.current = targetProgress.current;
      }

      const p = currentProgress.current;

      // 3-Stage Partitioning:
      // Zone 1: p <= 0.12 -> Stage 4 Resting View
      // Zone 2: 0.12 < p < 0.44 -> Transition 1 (Stage 4 lifts upward to -115vh, Stage 5 lifts up to 0vh)
      // Zone 3: 0.44 <= p <= 0.56 -> Stage 5 Resting View
      // Zone 4: 0.56 < p < 0.88 -> Transition 2 (Stage 5 lifts upward to -115vh, Stage 6 lifts up to 0vh)
      // Zone 5: p >= 0.88 -> Stage 6 Resting View

      let s4Y = 0;
      let s4Opacity = 1;
      let s5Y = 115;
      let s5Opacity = 0;
      let s6Y = 115;
      let s6Opacity = 0;

      if (p <= 0.12) {
        s4Y = 0;
        s4Opacity = 1;
        s5Y = 115;
        s5Opacity = 0;
        s6Y = 115;
        s6Opacity = 0;
      } else if (p < 0.44) {
        const norm1 = (p - 0.12) / 0.32;
        const ease1 = norm1 < 0.5 ? 4 * norm1 * norm1 * norm1 : 1 - Math.pow(-2 * norm1 + 2, 3) / 2;
        s4Y = -115 * ease1;
        s4Opacity = Math.max(0, 1 - ease1 * 1.25);
        s5Y = 115 * (1 - ease1);
        s5Opacity = Math.min(1, Math.max(0, (ease1 - 0.08) * 1.25));
        s6Y = 115;
        s6Opacity = 0;
      } else if (p <= 0.56) {
        s4Y = -115;
        s4Opacity = 0;
        s5Y = 0;
        s5Opacity = 1;
        s6Y = 115;
        s6Opacity = 0;
      } else if (p < 0.88) {
        const norm2 = (p - 0.56) / 0.32;
        const ease2 = norm2 < 0.5 ? 4 * norm2 * norm2 * norm2 : 1 - Math.pow(-2 * norm2 + 2, 3) / 2;
        s4Y = -115;
        s4Opacity = 0;
        s5Y = -115 * ease2;
        s5Opacity = Math.max(0, 1 - ease2 * 1.25);
        s6Y = 115 * (1 - ease2);
        s6Opacity = Math.min(1, Math.max(0, (ease2 - 0.08) * 1.25));
      } else {
        s4Y = -115;
        s4Opacity = 0;
        s5Y = -115;
        s5Opacity = 0;
        s6Y = 0;
        s6Opacity = 1;
      }

      const isStage4Active = p < 0.28;
      const isStage5Active = p >= 0.28 && p < 0.72;
      const isStage6Active = p >= 0.72;

      // Apply transforms and opacities to Stage 4 layers
      if (stage4LeftRef.current) {
        stage4LeftRef.current.style.transform = `translate3d(0, ${s4Y}vh, 0)`;
        stage4LeftRef.current.style.opacity = `${s4Opacity}`;
        stage4LeftRef.current.style.pointerEvents = isStage4Active ? "auto" : "none";
        stage4LeftRef.current.style.visibility = s4Opacity > 0.005 ? "visible" : "hidden";
      }
      if (stage4RightRef.current) {
        stage4RightRef.current.style.transform = `translate3d(0, ${s4Y}vh, 0)`;
        stage4RightRef.current.style.opacity = `${s4Opacity}`;
        stage4RightRef.current.style.pointerEvents = isStage4Active ? "auto" : "none";
        stage4RightRef.current.style.visibility = s4Opacity > 0.005 ? "visible" : "hidden";
      }

      // Apply transforms and opacities to Stage 5 layers
      if (stage5LeftRef.current) {
        stage5LeftRef.current.style.transform = `translate3d(0, ${s5Y}vh, 0)`;
        stage5LeftRef.current.style.opacity = `${s5Opacity}`;
        stage5LeftRef.current.style.pointerEvents = isStage5Active ? "auto" : "none";
        stage5LeftRef.current.style.visibility = s5Opacity > 0.005 ? "visible" : "hidden";
      }
      if (stage5RightRef.current) {
        stage5RightRef.current.style.transform = `translate3d(0, ${s5Y}vh, 0)`;
        stage5RightRef.current.style.opacity = `${s5Opacity}`;
        stage5RightRef.current.style.pointerEvents = isStage5Active ? "auto" : "none";
        stage5RightRef.current.style.visibility = s5Opacity > 0.005 ? "visible" : "hidden";
      }

      // Apply transforms and opacities to Stage 6 layers
      if (stage6LeftRef.current) {
        stage6LeftRef.current.style.transform = `translate3d(0, ${s6Y}vh, 0)`;
        stage6LeftRef.current.style.opacity = `${s6Opacity}`;
        stage6LeftRef.current.style.pointerEvents = isStage6Active ? "auto" : "none";
        stage6LeftRef.current.style.visibility = s6Opacity > 0.005 ? "visible" : "hidden";
      }
      if (stage6RightRef.current) {
        stage6RightRef.current.style.transform = `translate3d(0, ${s6Y}vh, 0)`;
        stage6RightRef.current.style.opacity = `${s6Opacity}`;
        stage6RightRef.current.style.pointerEvents = isStage6Active ? "auto" : "none";
        stage6RightRef.current.style.visibility = s6Opacity > 0.005 ? "visible" : "hidden";
      }
      if (stage6MoreProjectsRef.current) {
        stage6MoreProjectsRef.current.style.transform = `translate3d(-50%, ${s6Y}vh, 0)`;
        stage6MoreProjectsRef.current.style.opacity = `${s6Opacity}`;
        stage6MoreProjectsRef.current.style.pointerEvents = isStage6Active ? "auto" : "none";
        stage6MoreProjectsRef.current.style.visibility = s6Opacity > 0.005 ? "visible" : "hidden";
      }

      rafId.current = requestAnimationFrame(renderLoop);
    };

    updateScrollProgress();
    currentProgress.current = targetProgress.current;
    rafId.current = requestAnimationFrame(renderLoop);

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // The 3 prominent featured portrait screenshots for the top row (1.png, 2.png, 5.png)
  const featuredImages = [
    BIOSYNC_IMAGES[0], // 1.png
    BIOSYNC_IMAGES[1], // 2.png
    BIOSYNC_IMAGES[4], // 5.png
  ];

  // Remaining images reserved for "See more" (3.png, 4.png, 6.png, 7.png, 8.png)
  const remainingImages = BIOSYNC_IMAGES.filter(
    (img) => img.filename !== "1.png" && img.filename !== "2.png" && img.filename !== "5.png"
  );

  return (
    <section
      ref={trackRef}
      id="stage4"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "540vh",
        backgroundColor: "#000000",
        color: "#ffffff",
        zIndex: 20,
        boxSizing: "border-box",
      }}
    >
      {/* Stage Five Viewport Anchor (Allows smooth scroll snapping & hash navigation) */}
      <div
        id="stage5"
        style={{
          position: "absolute",
          top: "180vh",
          height: "180vh",
          width: "100%",
          pointerEvents: "none",
        }}
      />
      {/* Stage Six Viewport Anchor */}
      <div
        id="stage6"
        style={{
          position: "absolute",
          top: "360vh",
          height: "180vh",
          width: "100%",
          pointerEvents: "none",
        }}
      />
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
          boxSizing: "border-box",
        }}
      >
        {/* =========================================================================
            CINEMATIC LIGHTING & TEXTURE LAYERS (Identical to Page 3)
            ========================================================================= */}
        {/* Top Center Spotlight */}
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

        {/* Ambient Core Back-Halo (Matching Page 3 tuned 0.07 opacity) */}
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
            STAGE CONTENT CONTAINER (Left Photos Showcase + Divider + Right Title)
            ========================================================================= */}
        <div className="stage-content-wrapper">
          {/* -------------------------------------------------------------
              LEFT: Photo Showcase with Symmetric Alignment (Dual Layer: Stage 4 & Stage 5)
              ------------------------------------------------------------- */}
          <div className="showcase-left-pane">
            {/* Stage Four Left Layer (BioSync) */}
            <div ref={stage4LeftRef} className="project-layer-pane">
              <div className="portrait-showcase-container">
                {/* GitHub Repo Button (Positioned just above the middle phone) */}
                <div className="github-link-container">
                  <a
                    href="https://github.com/Spandan-0230/BioSync"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-repo-link"
                    title="Open GitHub/Spandan-0230/BioSync"
                  >
                    <svg
                      className="github-icon"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                    <span className="github-link-text">GitHub/BioSync</span>
                  </a>
                </div>

                {/* 3 Tall Portrait Smartphone Blocks (1.png, 2.png, 5.png) */}
                <div className="portrait-top-row">
                  {featuredImages.map((img) => {
                    return (
                      <div
                        key={img.id}
                        className="portrait-device-card"
                        onClick={() => setPopupImg({ src: img.src, alt: img.title })}
                      >
                        <div className="device-screen-inner">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.src}
                            alt={img.title}
                            className="device-img"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* See More Action (Matching provided UI: text + down chevron) */}
                <div className="see-more-container">
                  <button
                    type="button"
                    className="see-more-btn"
                    title="See more BioSync screenshots"
                    onClick={() => setIsGalleryOpen(true)}
                  >
                    <span className="see-more-text">See more</span>
                    <svg
                      className="see-more-icon"
                      width="14"
                      height="9"
                      viewBox="0 0 14 9"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M1.5 1.5L7 7L12.5 1.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Stage Five Left Layer (FloatView) */}
            <div ref={stage5LeftRef} className="project-layer-pane layer-absolute layer-hidden">
              <StageFiveLeftPane />
            </div>

            {/* Stage Six Left Layer (Ledger Website) */}
            <div ref={stage6LeftRef} className="project-layer-pane layer-absolute layer-hidden">
              <StageSixLeftPane />
            </div>
          </div>

          {/* -------------------------------------------------------------
              CENTER: Elegant Vertical Divider Line "|" with Stage 6 "See more projects"
              ------------------------------------------------------------- */}
          <div className="center-divider-wrapper">
            <div className="center-divider" aria-hidden="true" />
            <div
              ref={stage6MoreProjectsRef}
              className="see-more-projects-layer"
            >
              <a
                href="https://github.com/Spandan-0230?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
                className="see-more-projects-link"
                title="View all repositories on GitHub"
              >
                <span className="see-more-projects-text">See more projects</span>
                <svg
                  width="11"
                  height="13"
                  viewBox="0 0 24 26"
                  fill="currentColor"
                  className="see-more-projects-arrow"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M0 0L24 13L0 26L12 13Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* -------------------------------------------------------------
              RIGHT: Project Title, Description & Language Distribution Stats (Dual Layer)
              ------------------------------------------------------------- */}
          <div className="showcase-right-pane">
            {/* Stage Four Right Layer (BioSync) */}
            <div ref={stage4RightRef} className="project-layer-pane">
              <div className="project-header-group">
                <h1 className="project-title-italic">
                  Bio<span className="neon-sync-text">Sync</span>
                </h1>
                <div className="project-desc-text">
                  <br></br>
                  Offline-first Android fitness &amp; nutrient tracker in Kotlin &amp;  Features daily macro/hydration/step logging, historical stats &amp; streaks, interactive home widgets, persistent custom notifications, and live background step sync in a true-black OLED UI.

                  <ul className="feature-list">
                    <li className="feature-item">
                      <FeatureBulletIcon />
                      <span className="feature-text">🧬 Multi-Stage Biometric Onboarding &amp; Calibration</span>
                    </li>
                    <li className="feature-item">
                      <FeatureBulletIcon />
                      <span className="feature-text">📊 Live Telemetry Dashboard &amp; Quick-Action Logging</span>
                    </li>
                    <li className="feature-item">
                      <FeatureBulletIcon />
                      <span className="feature-text">📱 Custom Android Home Screen Widget</span>
                    </li>
                    <li className="feature-item">
                      <FeatureBulletIcon />
                      <span className="feature-text">📳 Smart Notifications &amp; Local-First Storage</span>
                    </li>
                    <br></br>
                  </ul>
                </div>
              </div>

              {/* Circular Stats & Language Distribution Breakdown */}
              <div className="stats-showcase-box">
                {/* Circular Donut Chart */}
                <div className="donut-chart-wrapper">
                  <svg width="124" height="124" viewBox="0 0 100 100" className="donut-svg">
                    {donutSlices.map((slice, idx) => {
                      const isHovered = activeLang === idx;
                      return (
                        <path
                          key={slice.id}
                          d={describeDonutSegment(
                            50,
                            50,
                            isHovered ? 29 : 31,
                            isHovered ? 47 : 44,
                            slice.startAngle,
                            slice.endAngle
                          )}
                          fill={slice.color}
                          className={`donut-path ${isHovered ? "active-slice" : ""}`}
                          onMouseEnter={() => setActiveLang(idx)}
                          onMouseLeave={() => setActiveLang(null)}
                        />
                      );
                    })}
                  </svg>

                  {/* Donut Center Info */}
                  <div className="donut-center-info">
                    {activeLang !== null ? (
                      <>
                        <span className="donut-center-val" style={{ color: LANG_DATA[activeLang].color }}>
                          {LANG_DATA[activeLang].pct}%
                        </span>
                        <span className="donut-center-label">{LANG_DATA[activeLang].shortName}</span>
                      </>
                    ) : (
                      <span className="donut-center-val">100%</span>
                    )}
                  </div>
                </div>

                {/* Languages Section: GitHub-Style Progress Bar + Languages Row */}
                <div className="project-lang-section">
                  {/* GitHub-style multi-color progress bar */}
                  <div className="project-lang-progress-bar">
                    {LANG_DATA.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          width: `${item.pct}%`,
                          backgroundColor: item.color,
                          height: "100%",
                        }}
                        title={`${item.name} ${item.pct}%`}
                      />
                    ))}
                  </div>

                  {/* Languages Row: Kotlin 98.4%, HTML 1.6% */}
                  <div className="project-lang-row">
                    {LANG_DATA.map((item, idx) => {
                      const isHovered = activeLang === idx;
                      return (
                        <div
                          key={item.id}
                          className={`project-lang-item ${isHovered ? "active-item" : ""}`}
                          onMouseEnter={() => setActiveLang(idx)}
                          onMouseLeave={() => setActiveLang(null)}
                        >
                          <span className="lang-icon-wrapper">{item.icon}</span>
                          <span className="lang-name-text">{item.name}</span>
                          <span className="lang-pct-text">{item.pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Stage Five Right Layer (FloatView) */}
            <div ref={stage5RightRef} className="project-layer-pane layer-absolute layer-hidden">
              <StageFiveRightPane />
            </div>

            {/* Stage Six Right Layer (Ledger Website) */}
            <div ref={stage6RightRef} className="project-layer-pane layer-absolute layer-hidden">
              <StageSixRightPane />
            </div>
          </div>
        </div>
      </div>

      {/* Pure Image Pop-up (No UI elements, no background block) */}
      <PureImagePopup
        isOpen={popupImg !== null}
        onClose={() => setPopupImg(null)}
        src={popupImg?.src || ""}
        alt={popupImg?.alt || ""}
      />

      {/* BioSync Scrollable Gallery Modal (See more: 3 images per row, last 2 centered) */}
      <BioSyncGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={BIOSYNC_IMAGES}
      />

      {/* =========================================================================
          COMPONENT STYLES (Clean, Symmetric, Responsive)
          ========================================================================= */}
      <style jsx>{`
        .sticky-stage {
          --stage-col-gap: clamp(24px, 2.6vw, 50px);
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding-top: clamp(24px, 3.8vh, 48px);
          padding-bottom: 0;
          padding-left: calc(var(--margin-pillar-width, clamp(48px, 6.5vw, 102px)) + var(--stage-col-gap));
          padding-right: calc(var(--margin-pillar-width, clamp(48px, 6.5vw, 102px)) + var(--stage-col-gap));
          box-sizing: border-box;
        }

        .stage-content-wrapper {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          width: fit-content;
          gap: var(--stage-col-gap);
          box-sizing: border-box;
          margin-top: clamp(6px, 1.5vh, 18px);
        }

        /* -------------------------------------------------------------
           LEFT COLUMN: Photo Showcase
           ------------------------------------------------------------- */
        .showcase-left-pane {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          height: clamp(390px, min(50vh, 29vw), 490px);
        }

        /* Portrait View Layout */
        .portrait-showcase-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        /* Top Row: 3 Tall Portrait Smartphone Blocks (Dead-center aligned to the center-divider line) */
        .portrait-top-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: clamp(12px, 1.4vw, 18px);
        }

        .portrait-device-card {
          position: relative;
          height: clamp(370px, min(48vh, 27vw), 470px);
          aspect-ratio: 540 / 1155;
          background: #000000;
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          border-radius: 24px;
          overflow: hidden;
          cursor: zoom-in;
          box-shadow: 0 18px 48px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
        }

        .portrait-device-card:hover {
          border-color: rgba(255, 255, 255, 0.7);
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 24px 56px rgba(0, 0, 0, 0.95), 0 0 22px rgba(255, 255, 255, 0.18);
        }

        .device-screen-inner {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #000000;
          border-radius: 24px;
        }

        .device-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
        }

        /* GitHub Repo Link (Positioned absolutely above the middle phone) */
        .github-link-container {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          white-space: nowrap;
        }

        .github-repo-link {
          text-decoration: none;
          background: transparent;
          border: none;
          padding: 6px 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: transform 0.2s ease;
        }

        .github-link-text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: 0.01em;

          /* High-Contrast Diagonal Chrome Reflective Sheen Sweep (Matching Scroll To Explore) */
          background: linear-gradient(
            115deg,
            rgba(255, 255, 255, 0.28) 0%,
            rgba(255, 255, 255, 0.38) 38%,
            rgba(255, 255, 255, 0.9) 48%,
            #ffffff 50%,
            rgba(255, 255, 255, 0.9) 52%,
            rgba(255, 255, 255, 0.38) 62%,
            rgba(255, 255, 255, 0.28) 100%
          );
          background-size: 250% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: githubDiagonalReflect 2.6s linear infinite;
          display: inline-block;
          transition: color 0.2s ease, letter-spacing 0.2s ease;
        }

        .github-icon {
          color: rgba(255, 255, 255, 0.72);
          flex-shrink: 0;
          filter: none;
          transition: transform 0.2s ease, color 0.2s ease;
        }

        .github-repo-link:hover {
          transform: translateY(-2px);
        }

        .github-repo-link:hover .github-icon {
          color: #ffffff;
          filter: none;
          transform: scale(1.08);
        }

        .github-repo-link:hover .github-link-text {
          animation: none;
          background: none;
          -webkit-background-clip: unset;
          background-clip: unset;
          -webkit-text-fill-color: #ffffff;
          color: #ffffff;
          filter: none;
        }

        @keyframes githubDiagonalReflect {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* See More Button Section (Positioned absolutely beneath the 3 phones to guarantee zero vertical offset) */
        .see-more-container {
          position: absolute;
          top: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
        }

        .see-more-btn {
          background: transparent;
          border: none;
          padding: 6px 14px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: rgba(255, 255, 255, 0.72);
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .see-more-text {
          font-family: 'Agrave Pro', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 14.5px;
          font-weight: 400;
          letter-spacing: 0.02em;
          color: inherit;
        }

        .see-more-icon {
          color: inherit;
          transition: transform 0.2s ease;
        }

        .see-more-btn:hover {
          color: #ffffff;
        }

        .see-more-btn:hover .see-more-icon {
          transform: translateY(2px);
        }

        /* -------------------------------------------------------------
           CENTER: Sleek Vertical Divider "|" Framing & Matching the 3 Phones
           ------------------------------------------------------------- */
        .center-divider-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: stretch;
          height: clamp(440px, min(50vh, 29vw), 490px);
          flex-shrink: 0;
        }

        .center-divider {
          width: 1.5px;
          height: 100%;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(255, 255, 255, 0.42) 2.5%,
            rgba(255, 255, 255, 0.42) 97.5%,
            transparent 100%
          );
          border-radius: 1px;
          flex-shrink: 0;
        }

        .see-more-projects-layer {
          position: absolute;
          bottom: clamp(-54px, -6.5vh, -44px);
          left: 50%;
          transform: translate3d(-50%, 115vh, 0);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 25;
          pointer-events: none;
          opacity: 0;
          white-space: nowrap;
        }

        .see-more-projects-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          outline: none;
          box-shadow: none;
          color: rgba(255, 255, 255, 0.72);
          font-family: 'Agrave Pro', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: clamp(14px, 1.2vw, 16.5px);
          font-weight: 400;
          letter-spacing: 0.02em;
          text-decoration: none;
          cursor: url('/cursor.png') 0 0, pointer !important;
          transition: color 0.2s ease, transform 0.2s ease;
          user-select: none;
          pointer-events: auto;
          padding: 6px 10px;
        }

        .see-more-projects-link:hover {
          background: transparent;
          border: none;
          box-shadow: none;
          color: #ffffff;
        }

        .see-more-projects-text {
          font-family: 'Agrave Pro', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: inherit;
        }

        .see-more-projects-arrow {
          width: 11px;
          height: 13px;
          fill: currentColor;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }

        .see-more-projects-link:hover .see-more-projects-arrow {
          transform: translateX(3px);
        }

        /* -------------------------------------------------------------
           RIGHT COLUMN: Project Title, Description & Language Distribution
           ------------------------------------------------------------- */
        .showcase-right-pane {
          flex: 0 0 auto;
          width: clamp(200px, 32vw, 500px);
          max-width: 650px;
          height: clamp(390px, min(50vh, 29vw), 490px);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          padding: 0;
          margin: 0;
          box-sizing: border-box;
          position: relative;
        }

        /* Dual-Layer Transition Wrapper for Left & Right Panes */
        .project-layer-pane {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          will-change: transform, opacity;
        }

        .showcase-right-pane .project-layer-pane {
          align-items: flex-start;
          justify-content: space-between;
        }

        .project-layer-pane.layer-absolute {
          position: absolute;
          inset: 0;
        }

        .project-layer-pane.layer-hidden {
          pointer-events: none;
        }

        .project-header-group {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: clamp(8px, 1.3vh, 14px);
          width: 100%;
        }

        /* Title: BioSync in high-contrast italic serif font */
        .project-title-italic {
          margin: 0;
          padding: 0;
          font-family: 'Playfair Display', 'Cormorant Garamond', 'Baskerville', 'Georgia', serif;
          font-style: italic;
          font-size: clamp(3rem, 4.4vw, 4.2rem);
          font-weight: 600;
          color: #ffffff;
          letter-spacing: -0.015em;
          line-height: 1.2;
          filter: drop-shadow(0 2px 14px rgba(0, 0, 0, 0.95));
          text-align: left;
          margin-top: -0.86em;
        }

        /* Dynamic neon shifting color effect for "Sync" */
        .neon-sync-text {
          background: linear-gradient(
            90deg,
            #3845f3 0%,
            #8a29c1 16%,
            #f824bb 33%,
            #fa7532 50%,
            #f824bb 67%,
            #8a29c1 84%,
            #3845f3 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: inline-block;
          padding-right: 0.05em;
          animation: neonSyncShift 6s linear infinite;
        }

        @keyframes neonSyncShift {
          0% {
            background-position: 0% center;
            filter: drop-shadow(0 0 14px rgba(56, 69, 243, 0.45));
          }
          33% {
            background-position: 66% center;
            filter: drop-shadow(0 0 16px rgba(248, 36, 187, 0.5));
          }
          66% {
            background-position: 133% center;
            filter: drop-shadow(0 0 16px rgba(250, 117, 50, 0.5));
          }
          100% {
            background-position: 200% center;
            filter: drop-shadow(0 0 14px rgba(56, 69, 243, 0.45));
          }
        }

        .project-desc-text {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
          font-size: clamp(15px, 0.92vw, 19px);
          line-height: 1.64;
          color: rgba(255, 255, 255, 0.74);
          max-width: 650px;
          letter-spacing: -0.005em;
          text-align: centre;
        }

        /* Feature List with custom 4-triangle cross bullets */
        .feature-list {
          list-style: none;
          margin-top: 20px;
          padding: 0 0 0 clamp(2px, 3.2vw, 10px);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.78);
        }

        .feature-bullet {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 12px;
          height: 20px;
          flex-shrink: 0;
        }

        .feature-bullet-svg {
          width: 11px;
          height: 11px;
          display: block;
          filter: none;
        }

        .feature-text {
          flex: 1;
        }

        /* Bottom Section: Circular Donut Stats & Language Distribution */
        .stats-showcase-box {
          display: flex;
          align-items: center;
          gap: clamp(14px, 1.8vw, 22px);
          width: 100%;
          max-width: 520px;
          padding: 0;
          margin: 0;
        }

        /* Donut Chart */
        .donut-chart-wrapper {
          position: relative;
          width: 104px;
          height: 104px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .donut-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .donut-path {
          transition: all 0.22s ease-out;
          cursor: pointer;
          stroke: transparent;
          stroke-width: 4px;
          paint-order: stroke fill;
        }

        .donut-path:hover,
        .donut-path.active-slice {
          opacity: 0.95;
        }

        .donut-center-info {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          text-align: center;
          padding: 0 4px;
        }

        .donut-center-val {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .donut-center-label {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 10px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.2;
          margin-top: 2px;
          max-width: 56px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Languages Section: GitHub-Style Progress Bar + Languages Row */
        .project-lang-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }

        .project-lang-progress-bar {
          display: flex;
          width: 100%;
          max-width: 320px;
          height: 7px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
        }

        .project-lang-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: clamp(14px, 2vw, 24px);
          width: 100%;
        }

        .project-lang-item {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
          white-space: nowrap;
        }

        .project-lang-item:hover,
        .project-lang-item.active-item {
          transform: translateX(3px);
        }

        .lang-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .lang-name-text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.85);
          white-space: nowrap;
          letter-spacing: -0.01em;
          transition: color 0.18s ease;
        }

        .lang-pct-text {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.45);
          margin-left: auto;
          padding-left: 8px;
          transition: color 0.18s ease;
        }

        .project-lang-item:hover .lang-name-text,
        .project-lang-item.active-item .lang-name-text {
          color: #ffffff;
        }

        .project-lang-item:hover .lang-pct-text,
        .project-lang-item.active-item .lang-pct-text {
          color: #ffffff;
          font-weight: 700;
        }
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .lang-name-text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.85);
          white-space: nowrap;
          letter-spacing: -0.01em;
        }

        .lang-pct-text {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.45);
          margin-left: auto;
          padding-left: 12px;
        }

        .lang-item-row:hover .lang-name-text,
        .lang-item-row.active-row .lang-name-text {
          color: #ffffff;
        }

        .lang-item-row:hover .lang-pct-text,
        .lang-item-row.active-row .lang-pct-text {
          color: #ffffff;
        }

        /* -------------------------------------------------------------
           RESPONSIVE BREAKPOINTS
           ------------------------------------------------------------- */
        @media (max-width: 1024px) {
          .sticky-stage {
            justify-content: center;
            padding-left: var(--page-frame-padding, 16px);
            padding-right: var(--page-frame-padding, 16px);
          }

          .stage-content-wrapper {
            flex-direction: column;
            gap: 24px;
            overflow-y: auto;
            max-height: 88vh;
            padding: 20px 0;
            width: 100%;
            justify-content: center;
          }

          .center-divider-wrapper {
            height: auto;
            width: 100%;
          }

          .center-divider {
            display: none;
          }

          .see-more-projects-layer {
            position: relative;
            bottom: auto;
            left: auto;
            transform: none !important;
            margin: 16px auto 0;
          }

          .showcase-left-pane {
            max-width: 100%;
            width: 100%;
          }

          .showcase-right-pane {
            max-width: 100%;
            width: 100%;
            height: auto;
            min-height: auto;
            gap: 28px;
            padding: 0 16px;
          }

          .project-title-italic {
            margin-top: 0;
          }
        }
      `}</style>
    </section>
  );
}
