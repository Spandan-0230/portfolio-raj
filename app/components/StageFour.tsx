"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { StageFiveLeftPane, StageFiveRightPane } from "./StageFive";

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

export default function StageFour() {
  const trackRef = useRef<HTMLDivElement>(null);

  // Elevator Scroll Animation Layer Refs
  const stage4LeftRef = useRef<HTMLDivElement>(null);
  const stage4RightRef = useRef<HTMLDivElement>(null);
  const stage5LeftRef = useRef<HTMLDivElement>(null);
  const stage5RightRef = useRef<HTMLDivElement>(null);
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

  // Lightbox Modal Zoom States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalIndex, setModalIndex] = useState<number>(0);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panPos, setPanPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Open modal for a specific image
  const openModal = (idx: number) => {
    setModalIndex(idx);
    setZoomScale(1);
    setPanPos({ x: 0, y: 0 });
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setZoomScale(1);
    setPanPos({ x: 0, y: 0 });
  }, []);

  const nextModalImage = useCallback(() => {
    setModalIndex((prev) => (prev + 1) % BIOSYNC_IMAGES.length);
    setZoomScale(1);
    setPanPos({ x: 0, y: 0 });
  }, []);

  const prevModalImage = useCallback(() => {
    setModalIndex((prev) => (prev - 1 + BIOSYNC_IMAGES.length) % BIOSYNC_IMAGES.length);
    setZoomScale(1);
    setPanPos({ x: 0, y: 0 });
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isModalOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "ArrowRight") {
        nextModalImage();
      } else if (e.key === "ArrowLeft") {
        prevModalImage();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, closeModal, nextModalImage, prevModalImage]);

  // Smooth Elevator Scroll Transition: Stage Four to Stage Five
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
        currentProgress.current += diff * 0.12;
      } else {
        currentProgress.current = targetProgress.current;
      }

      const p = currentProgress.current;
      // Zone partitioning:
      // 0.00 - 0.18: Stage 4 full resting view
      // 0.18 - 0.82: Dual upward elevator transition
      // 0.82 - 1.00: Stage 5 full resting view
      let norm = 0;
      if (p <= 0.18) {
        norm = 0;
      } else if (p >= 0.82) {
        norm = 1;
      } else {
        norm = (p - 0.18) / 0.64;
      }

      // Smooth cubic easeInOut curve
      const ease = norm < 0.5 ? 4 * norm * norm * norm : 1 - Math.pow(-2 * norm + 2, 3) / 2;

      // Stage 4 translates UPWARD: 0vh -> -115vh
      const s4Y = -115 * ease;
      const s4Opacity = Math.max(0, 1 - ease * 1.25);

      // Stage 5 translates UPWARD from below: +115vh -> 0vh
      const s5Y = 115 * (1 - ease);
      const s5Opacity = Math.min(1, Math.max(0, (ease - 0.08) * 1.25));

      const isStage4Active = p < 0.5;

      if (stage4LeftRef.current) {
        stage4LeftRef.current.style.transform = `translate3d(0, ${s4Y}vh, 0)`;
        stage4LeftRef.current.style.opacity = `${s4Opacity}`;
        stage4LeftRef.current.style.pointerEvents = isStage4Active ? "auto" : "none";
      }
      if (stage4RightRef.current) {
        stage4RightRef.current.style.transform = `translate3d(0, ${s4Y}vh, 0)`;
        stage4RightRef.current.style.opacity = `${s4Opacity}`;
        stage4RightRef.current.style.pointerEvents = isStage4Active ? "auto" : "none";
      }
      if (stage5LeftRef.current) {
        stage5LeftRef.current.style.transform = `translate3d(0, ${s5Y}vh, 0)`;
        stage5LeftRef.current.style.opacity = `${s5Opacity}`;
        stage5LeftRef.current.style.pointerEvents = isStage4Active ? "none" : "auto";
      }
      if (stage5RightRef.current) {
        stage5RightRef.current.style.transform = `translate3d(0, ${s5Y}vh, 0)`;
        stage5RightRef.current.style.opacity = `${s5Opacity}`;
        stage5RightRef.current.style.pointerEvents = isStage4Active ? "none" : "auto";
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

  // Modal Mouse Wheel Zoom
  const handleModalWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setZoomScale((prev) => {
      const next = Math.max(1, Math.min(3.5, prev + delta));
      if (next === 1) setPanPos({ x: 0, y: 0 });
      return next;
    });
  };

  // Toggle Zoom on click
  const handleImageClickToggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale((prev) => {
      if (prev < 1.6) return 2.0;
      if (prev < 2.6) return 3.0;
      setPanPos({ x: 0, y: 0 });
      return 1.0;
    });
  };

  // Drag to pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panPos.x, y: e.clientY - panPos.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomScale <= 1) return;
    setPanPos({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
        minHeight: "360vh",
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
                            const globalIdx = BIOSYNC_IMAGES.findIndex((b) => b.id === img.id);
                            return (
                              <div
                                key={img.id}
                                className="portrait-device-card"
                                onClick={() => openModal(globalIdx)}
                                title={`Click to zoom: ${img.title}`}
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

          {/* Stage Five Left Layer (Upcoming Project Placeholder) */}
          <div ref={stage5LeftRef} className="project-layer-pane layer-absolute layer-hidden">
            <StageFiveLeftPane />
          </div>
        </div>

        {/* -------------------------------------------------------------
              CENTER: Elegant Vertical Divider Line "|" (Stationary)
              ------------------------------------------------------------- */}
        <div className="center-divider" aria-hidden="true" />

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

                      {/* Circular Stats & Language Distribution Breakdown */ }
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

                        {/* Languages List: Kotlin 98.4%, HTML 1.6% (without dots, just icon + name + %) */}
                        <div className="lang-list-container">
                          {LANG_DATA.map((item, idx) => {
                            const isHovered = activeLang === idx;
                            return (
                      <div
                        key={item.id}
                        className={`lang-item-row ${isHovered ? "active-row" : ""}`}
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

              {/* Stage Five Right Layer (Upcoming Project Placeholder) */}
              <div ref={stage5RightRef} className="project-layer-pane layer-absolute layer-hidden">
                <StageFiveRightPane />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
          FULL-SCREEN INTERACTIVE LIGHTBOX ZOOM MODAL
          ========================================================================= */}
        {isModalOpen && (
          <div
            className="lightbox-overlay"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
          >
            {/* Top Control Bar */}
            <div
              className="lightbox-top-bar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="lightbox-title-text">
                <span className="brand-pill">BioSync</span>
                <span className="sep">/</span>
                <span className="curr-name">
                  {BIOSYNC_IMAGES[modalIndex].title} (0{modalIndex + 1} of 0{BIOSYNC_IMAGES.length})
                </span>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="lightbox-close-btn"
                aria-label="Close Lightbox"
              >
                ✕
              </button>
            </div>

            {/* Interactive Zoom Canvas Stage */}
            <div
              className="lightbox-stage"
              onWheel={handleModalWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onClick={closeModal}
            >
              <div
                className="lightbox-img-wrapper"
                onClick={handleImageClickToggleZoom}
                style={{
                  transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${zoomScale})`,
                  cursor: zoomScale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={BIOSYNC_IMAGES[modalIndex].src}
                  alt={BIOSYNC_IMAGES[modalIndex].title}
                  className="lightbox-image"
                  draggable={false}
                />
              </div>
            </div>

            {/* Bottom Floating Control Pill */}
            <div
              className="lightbox-bottom-dock"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={prevModalImage}
                className="dock-btn"
                title="Previous screen (←)"
              >
                ◀ Prev
              </button>
              <div className="dock-divider" />
              <button
                type="button"
                onClick={() => {
                  setZoomScale((prev) => Math.max(1, prev - 0.5));
                  if (zoomScale <= 1.5) setPanPos({ x: 0, y: 0 });
                }}
                className="dock-btn"
                title="Zoom Out"
              >
                −
              </button>
              <span className="dock-zoom-text">{Math.round(zoomScale * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(3.5, prev + 0.5))}
                className="dock-btn"
                title="Zoom In"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoomScale(1);
                  setPanPos({ x: 0, y: 0 });
                }}
                className="dock-btn-reset"
                title="Reset Zoom"
              >
                Reset
              </button>
              <div className="dock-divider" />
              <button
                type="button"
                onClick={nextModalImage}
                className="dock-btn"
                title="Next screen (→)"
              >
                Next ▶
              </button>
            </div>
          </div>
        )}

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
          cursor: pointer;
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
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13.5px;
          font-weight: 400;
          letter-spacing: 0.01em;
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
        .center-divider {
          width: 1.5px;
          height: clamp(390px, min(50vh, 29vw), 490px);
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

        /* Bottom Section: Circular Donut Stats & 2-Column Tech Stack */
        .stats-showcase-box {
          display: flex;
          align-items: center;
          gap: clamp(14px, 1.8vw, 20px);
          width: 100%;
          max-width: 390px;
          padding: 0;
          margin: 0;
        }

        /* Donut Chart */
        .donut-chart-wrapper {
          position: relative;
          width: 108px;
          height: 108px;
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

        /* Languages Breakdown List */
        .lang-list-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 165px;
        }

        .lang-item-row {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 4px 0;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
        }

        .lang-item-row:hover,
        .lang-item-row.active-row {
          background: transparent;
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
           LIGHTBOX MODAL & CONTROLS
           ------------------------------------------------------------- */
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(0, 0, 0, 0.94);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          user-select: none;
        }

        .lightbox-top-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(20px, 4vw, 40px);
          z-index: 105;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
        }

        .lightbox-title-text {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13px;
        }

        .brand-pill {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-weight: 600;
          font-size: 16px;
          color: #ffffff;
        }

        .sep {
          color: rgba(255, 255, 255, 0.3);
        }

        .curr-name {
          color: rgba(255, 255, 255, 0.7);
        }

        .lightbox-close-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #ffffff;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease, transform 0.2s ease;
        }

        .lightbox-close-btn:hover {
          background-color: #ffffff;
          color: #000000;
          transform: scale(1.08);
        }

        .lightbox-stage {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .lightbox-img-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 90vw;
          max-height: 82vh;
          transition: transform 0.08s ease-out;
          will-change: transform;
        }

        .lightbox-image {
          max-width: 90vw;
          max-height: 82vh;
          object-fit: contain;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
        }

        .lightbox-bottom-dock {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 18px;
          background: rgba(18, 18, 24, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 30px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(12px);
          z-index: 105;
        }

        .dock-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.85);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
          transition: color 0.15s ease, transform 0.15s ease;
        }

        .dock-btn:hover {
          color: #ffffff;
          transform: scale(1.06);
        }

        .dock-btn-reset {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 11px;
          font-weight: 500;
          padding: 3px 8px;
          border-radius: 4px;
          cursor: pointer;
        }

        .dock-divider {
          width: 1px;
          height: 18px;
          background: rgba(255, 255, 255, 0.2);
        }

        .dock-zoom-text {
          font-family: ui-monospace, monospace;
          font-size: 11.5px;
          color: rgba(255, 255, 255, 0.6);
          min-width: 40px;
          text-align: center;
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

          .center-divider {
            display: none;
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
