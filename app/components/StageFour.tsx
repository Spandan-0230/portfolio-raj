"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

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

export default function StageFour() {
  const trackRef = useRef<HTMLDivElement>(null);



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

  // The 3 prominent featured portrait screenshots for the top row
  const featuredImages = [BIOSYNC_IMAGES[0], BIOSYNC_IMAGES[1], BIOSYNC_IMAGES[2]];

  // The full set of 8 images for the bottom floating thumbnails
  const thumbnailImages = BIOSYNC_IMAGES;

  return (
    <section
      ref={trackRef}
      id="stage4"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "220vh",
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
          padding: "0 clamp(44px, 7vw, 104px)",
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
              LEFT: Photo Showcase with Symmetric Alignment (Portrait Wireframe)
              ------------------------------------------------------------- */}
          <div className="showcase-left-pane">
            <div className="portrait-showcase-container">
              {/* Top Row: 3 Tall Portrait Smartphone Blocks (Prominent height & width, matching reference) */}
              <div className="portrait-top-row">
                {featuredImages.map((img, idx) => (
                  <div
                    key={img.id}
                    className="portrait-device-card"
                    onClick={() => openModal(idx)}
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
                ))}
              </div>

              {/* Bottom Row: 8 Floating Screenshots (Zero cards, natural size, floating aesthetic) */}
              <div className="floating-thumbs-grid">
                {thumbnailImages.map((img, idx) => (
                  <div
                    key={img.id}
                    onClick={() => openModal(idx)}
                    className="floating-thumb-item"
                    title={`Click to zoom: ${img.title}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={img.title}
                      className="floating-thumb-img"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              CENTER: Elegant Vertical Divider Line "|"
              ------------------------------------------------------------- */}
          <div className="center-divider" aria-hidden="true" />

          {/* -------------------------------------------------------------
              RIGHT: Project Title ("BioSync" only, in white italic serif)
              ------------------------------------------------------------- */}
          <div className="showcase-right-pane">
            <h1 className="project-title-italic">BioSync</h1>
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
        .stage-content-wrapper {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 1360px;
          gap: clamp(24px, 3.5vw, 48px);
          box-sizing: border-box;
        }

        /* -------------------------------------------------------------
           LEFT COLUMN: Photo Showcase
           ------------------------------------------------------------- */
        .showcase-left-pane {
          flex: 1.35;
          max-width: 760px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        /* Portrait View Layout */
        .portrait-showcase-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(16px, 2.4vh, 26px);
          width: 100%;
        }

        /* Top Row: 3 Tall Portrait Smartphone Blocks (Significantly increased height & width) */
        .portrait-top-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: clamp(14px, 1.8vw, 24px);
          width: 100%;
        }

        .portrait-device-card {
          position: relative;
          height: clamp(380px, 49vh, 480px);
          aspect-ratio: 540 / 1155;
          background: #000000;
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          border-radius: 26px;
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

        /* Bottom Row: 8 Floating Screenshots (Zero cards, natural size, floating aesthetic) */
        .floating-thumbs-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(10px, 1.4vh, 16px) clamp(12px, 1.8vw, 22px);
          width: 100%;
          max-width: 720px;
          justify-items: center;
          align-items: center;
        }

        .floating-thumb-item {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: transparent;
          border: none;
          padding: 0;
          transition: transform 0.25s ease;
        }

        .floating-thumb-item:hover {
          transform: translateY(-4px) scale(1.06);
        }

        .floating-thumb-img {
          height: clamp(65px, 8.5vh, 85px);
          width: auto;
          max-width: 100%;
          object-fit: contain;
          display: block;
          border-radius: 9px;
          border: 1.2px solid rgba(255, 255, 255, 0.22);
          background: #000000;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08);
          transition: box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
        }

        .floating-thumb-item:hover .floating-thumb-img {
          border-color: rgba(255, 255, 255, 0.7);
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.95), 0 0 14px rgba(255, 255, 255, 0.25);
        }

        /* -------------------------------------------------------------
           CENTER: Sleek Vertical Divider "|"
           ------------------------------------------------------------- */
        .center-divider {
          width: 1.5px;
          height: clamp(420px, 56vh, 540px);
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 15%,
            rgba(255, 255, 255, 0.3) 85%,
            transparent 100%
          );
          border-radius: 1px;
          flex-shrink: 0;
        }

        /* -------------------------------------------------------------
           RIGHT COLUMN: Project Title ("BioSync" only)
           ------------------------------------------------------------- */
        .showcase-right-pane {
          flex: 0.9;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding-left: clamp(20px, 3vw, 50px);
        }

        /* Title: BioSync in high-contrast italic serif font matching reference image */
        .project-title-italic {
          margin: 0;
          font-family: 'Playfair Display', 'Cormorant Garamond', 'Baskerville', 'Georgia', serif;
          font-style: italic;
          font-size: clamp(3.8rem, 6.2vw, 6rem);
          font-weight: 600;
          color: #ffffff;
          letter-spacing: -0.015em;
          line-height: 1.05;
          filter: drop-shadow(0 2px 14px rgba(0, 0, 0, 0.95));
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
          .stage-content-wrapper {
            flex-direction: column;
            gap: 24px;
            overflow-y: auto;
            max-height: 88vh;
            padding: 20px 0;
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
          }
        }
      `}</style>
    </section>
  );
}
