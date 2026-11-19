"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

export interface FloatViewImage {
  id: number;
  filename: string;
  src: string;
  title: string;
  subtitle: string;
  width: number;
  height: number;
  aspect: number;
}

export const FLOATVIEW_IMAGES: FloatViewImage[] = [
  {
    id: 1,
    filename: "1.png",
    src: "/projects/floatview/1.png",
    title: "Live Picture-in-Picture Mirroring",
    subtitle: "Always-on-top hardware-composited DWM window preview",
    width: 460,
    height: 275,
    aspect: 460 / 275, // ~1.67
  },
  {
    id: 2,
    filename: "2.png",
    src: "/projects/floatview/2.png",
    title: "Precision Region Crop & Picker",
    subtitle: "Interactive selection handles with live size readouts",
    width: 439,
    height: 325,
    aspect: 439 / 325, // ~1.35
  },
  {
    id: 3,
    filename: "3.png",
    src: "/projects/floatview/3.png",
    title: "Floating Toolbar & Window Switcher",
    subtitle: "Quick source selection, lock controls & restore cards",
    width: 916,
    height: 717,
    aspect: 916 / 717, // ~1.28
  },
  {
    id: 4,
    filename: "4.png",
    src: "/projects/floatview/4.png",
    title: "Media Controls & Desktop PIP Overlay",
    subtitle: "Integrated Windows media session play/pause & seek",
    width: 1272,
    height: 618,
    aspect: 1272 / 618, // ~2.06
  },
];

// Language / Tech Stack distribution data for FloatView (From GitHub stats)
export interface FloatViewLanguageItem {
  id: string;
  name: string;
  shortName: string;
  pct: number;
  color: string;
  icon: React.ReactNode;
}

export const FLOATVIEW_LANG_DATA: FloatViewLanguageItem[] = [
  {
    id: "csharp",
    name: "C#",
    shortName: "C#",
    pct: 96.8,
    color: "#8e67e8",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="#8e67e8">
        <path d="M12 0l10.392 6v12L12 24 1.608 18V6L12 0zm0 2.309L3.608 7.155v9.69L12 21.691l8.392-4.846v-9.69L12 2.309zM10.95 7.5h2.1v2.1h-2.1V7.5zm0 6.9h2.1v2.1h-2.1v-2.1zm-4.2-3.45c0-2.3 1.8-3.75 4.05-3.75 1.5 0 2.7.6 3.45 1.5l-1.5 1.35c-.45-.6-1.05-.9-1.95-.9-1.35 0-2.25.9-2.25 2.1 0 1.2.9 2.1 2.25 2.1.9 0 1.5-.3 1.95-.9l1.5 1.35c-.75.9-1.95 1.5-3.45 1.5-2.25 0-4.05-1.45-4.05-3.75z" />
      </svg>
    ),
  },
  {
    id: "powershell",
    name: "PowerShell",
    shortName: "PowerShell",
    pct: 3.2,
    color: "#1b3a60",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="#2563EB">
        <path d="M21.573 2.427a1.5 1.5 0 0 0-1.5-.927H3.927a1.5 1.5 0 0 0-1.5 1.5v18a1.5 1.5 0 0 0 1.5 1.5h16.146a1.5 1.5 0 0 0 1.5-1.5v-18a1.5 1.5 0 0 0-.001-.073zM5.5 6.25l5.25 4.5-5.25 4.5v-2.15l2.75-2.35-2.75-2.35V6.25zm13 11.5H11v-1.75h7.5v1.75z" />
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

// Stage Five Left Pane: Dynamic Landscape Showcase with Auto-adjusting Frame & Hover Switcher
export function StageFiveLeftPane() {
  const [activeIdx, setActiveIdx] = useState<number>(0);

  // Lightbox Zoom Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panPos, setPanPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeImage = FLOATVIEW_IMAGES[activeIdx];

  const openModal = (idx: number) => {
    setActiveIdx(idx);
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
    setActiveIdx((prev) => (prev + 1) % FLOATVIEW_IMAGES.length);
    setZoomScale(1);
    setPanPos({ x: 0, y: 0 });
  }, []);

  const prevModalImage = useCallback(() => {
    setActiveIdx((prev) => (prev - 1 + FLOATVIEW_IMAGES.length) % FLOATVIEW_IMAGES.length);
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

  const handleImageClickToggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale((prev) => {
      if (prev < 1.6) return 2.0;
      if (prev < 2.6) return 3.0;
      setPanPos({ x: 0, y: 0 });
      return 1.0;
    });
  };

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

  return (
    <div className="landscape-showcase-container">
      {/* GitHub Repo Button (Positioned cleanly above the main landscape screen) */}
      <div className="github-link-container">
        <a
          href="https://github.com/Spandan-0230/FloatView"
          target="_blank"
          rel="noopener noreferrer"
          className="github-repo-link"
          title="Open GitHub/Spandan-0230/FloatView"
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
          <span className="github-link-text">GitHub/FloatView</span>
        </a>
      </div>

      {/* Main Big Landscape Screen Frame (Auto-adjusts tightly to the active image size) */}
      <div className="main-screen-wrapper">
        <div
          className="main-screen-card"
          onClick={() => openModal(activeIdx)}
          title={`Click to zoom: ${activeImage.title}`}
          style={{
            aspectRatio: `${activeImage.width} / ${activeImage.height}`,
          }}
        >
          <div className="main-screen-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={activeImage.id}
              src={activeImage.src}
              alt={activeImage.title}
              className="main-screen-img"
            />
          </div>
        </div>
      </div>

      {/* 4 Landscape Thumbnail Cards in a Single Horizontal Line with True Aspect Ratio (Hover to switch main screen) */}
      <div className="thumbnails-single-line">
        {FLOATVIEW_IMAGES.map((img, idx) => {
          const isActive = activeIdx === idx;
          return (
            <div
              key={img.id}
              className={`thumb-card ${isActive ? "active-thumb" : ""}`}
              onMouseEnter={() => setActiveIdx(idx)}
              onClick={() => setActiveIdx(idx)}
              style={{ aspectRatio: `${img.width} / ${img.height}` }}
              title={`${img.title} (Hover to preview)`}
            >
              <div className="thumb-screen-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.title} className="thumb-img" />
              </div>
            </div>
          );
        })}
      </div>

        {/* Lightbox Zoom Modal for FloatView Screenshots */}
        {isModalOpen && (
          <div
            className="lightbox-overlay"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
          >
            <div className="lightbox-top-bar" onClick={(e) => e.stopPropagation()}>
              <div className="lightbox-title-text">
                <span className="brand-pill">FloatView</span>
                <span className="sep">/</span>
                <span className="curr-name">
                  {FLOATVIEW_IMAGES[activeIdx].title} (0{activeIdx + 1} of 0{FLOATVIEW_IMAGES.length})
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
                  src={FLOATVIEW_IMAGES[activeIdx].src}
                  alt={FLOATVIEW_IMAGES[activeIdx].title}
                  className="lightbox-image"
                  draggable={false}
                />
              </div>
            </div>

            <div className="lightbox-bottom-dock" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={prevModalImage}
                className="dock-btn"
                title="Previous screen (←)"
              >
                ◀ Prev
              </button>
              <div className="dock-divider" />
              <span className="dock-info">Zoom: {Math.round(zoomScale * 100)}%</span>
              <div className="dock-divider" />
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

        <style jsx>{`
        .landscape-showcase-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: clamp(520px, 42vw, 650px);
        }

        /* GitHub Repo Link (Positioned cleanly above the main landscape screen) */
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

        /* Main Big Landscape Screen Frame (Prominent & expanded) */
        .main-screen-wrapper {
          position: relative;
          width: 100%;
          height: clamp(300px, min(42vh, 26vw), 415px);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: clamp(14px, 1.8vh, 20px);
        }

        .main-screen-card {
          position: relative;
          height: 100%;
          max-width: 100%;
          background: #000000;
          border: 1.5px solid rgba(255, 255, 255, 0.28);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 22px 56px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: aspect-ratio 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.25s ease,
                      transform 0.25s ease,
                      box-shadow 0.25s ease;
        }

        .main-screen-card:hover {
          border-color: rgba(255, 255, 255, 0.75);
          transform: translateY(-3px) scale(1.015);
          box-shadow: 0 24px 56px rgba(0, 0, 0, 0.95), 0 0 22px rgba(255, 255, 255, 0.18);
        }

        .main-screen-inner {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000000;
          overflow: hidden;
        }

        .main-screen-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
          transition: opacity 0.22s ease-in-out;
        }

        /* 4 Thumbnails: Single Horizontal Line with True Aspect Ratio (No Cropping) */
        .thumbnails-single-line {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(8px, 1.1vw, 14px);
          width: 100%;
          max-width: clamp(520px, 44vw, 680px);
          height: clamp(65px, 8.5vh, 90px);
        }

        .thumb-card {
          position: relative;
          height: 100%;
          max-width: 100%;
          background: #000000;
          border: 1.5px solid rgba(255, 255, 255, 0.22);
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          opacity: 0.7;
          transition: border-color 0.22s ease,
                      transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.22s ease,
                      opacity 0.22s ease;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .thumb-card:hover {
          opacity: 0.95;
          border-color: rgba(255, 255, 255, 0.65);
          transform: translateY(-2px) scale(1.03);
        }

        .thumb-card.active-thumb {
          opacity: 1;
          border-color: rgba(255, 255, 255, 0.95);
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.95), 0 0 16px rgba(255, 255, 255, 0.28);
          z-index: 2;
        }

        .thumb-screen-inner {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000000;
          overflow: hidden;
          border-radius: 10px;
        }

        .thumb-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
        }

        /* Fullscreen Lightbox Overlay */
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.94);
          backdrop-filter: blur(14px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 24px 32px;
          box-sizing: border-box;
          animation: lightboxFadeIn 0.2s ease-out;
        }

        @keyframes lightboxFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .lightbox-top-bar {
          width: 100%;
          max-width: 1200px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 10001;
        }

        .lightbox-title-text {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.75);
        }

        .brand-pill {
          padding: 3px 9px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 999px;
          color: #ffffff;
          font-weight: 600;
          font-size: 13px;
        }

        .sep {
          color: rgba(255, 255, 255, 0.3);
        }

        .curr-name {
          color: #ffffff;
          font-weight: 500;
        }

        .lightbox-close-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .lightbox-close-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: scale(1.08);
        }

        .lightbox-stage {
          position: relative;
          flex: 1;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          cursor: zoom-out;
        }

        .lightbox-img-wrapper {
          position: relative;
          max-width: 90vw;
          max-height: 75vh;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.08s ease-out;
          user-select: none;
        }

        .lightbox-image {
          max-width: 88vw;
          max-height: 72vh;
          object-fit: contain;
          border-radius: 12px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.12);
        }

        .lightbox-bottom-dock {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(20, 20, 24, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 999px;
          padding: 8px 18px;
          backdrop-filter: blur(12px);
          z-index: 10001;
        }

        .dock-btn,
        .dock-btn-reset {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.18s ease;
        }

        .dock-btn:hover,
        .dock-btn-reset:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.12);
        }

        .dock-divider {
          width: 1px;
          height: 14px;
          background: rgba(255, 255, 255, 0.2);
        }

        .dock-info {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.55);
        }
      `}</style>
      </div>
      );
}

      // Stage Five Right Pane: FloatView Title, Description, Bullet Points & C# / PowerShell Stats
      export function StageFiveRightPane() {
  const [activeLang, setActiveLang] = useState<number | null>(null);

  const donutSlices = useMemo(() => {
        let currentAngle = 0;
      const gap = 1.4;
    return FLOATVIEW_LANG_DATA.map((item) => {
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

      return (
      <>
        <div className="project-header-group">
          <h1 className="project-title-italic">
            Float<span className="neon-sync-text">View</span>
          </h1>
          <div className="project-desc-text">
            <br />
            A polished, always-on-top picture-in-picture utility for Windows. Mirror any window region with a live preview, lock the aspect ratio, add multiple pip window. Built from scratch in C# / WPF.

            <ul className="feature-list" style={{ marginTop: "18px" }}>
              <li className="feature-item">
                <FeatureBulletIcon />
                <span className="feature-text">🪟 Live DWM Window &amp; Region Mirroring</span>
              </li>
              <li className="feature-item">
                <FeatureBulletIcon />
                <span className="feature-text">📌 Always-On-Top Picture-in-Picture with Aspect-Ratio Lock</span>
              </li>
              <li className="feature-item">
                <FeatureBulletIcon />
                <span className="feature-text">⏯️ Windows Media Session Playback &amp; Quick Seek Controls</span>
              </li>
              <li className="feature-item">
                <FeatureBulletIcon />
                <span className="feature-text">🎛️ Floating Hover Toolbar &amp; Smart Restoral</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Circular Stats & Language Distribution Breakdown (C# 96.8%, PowerShell 3.2%) */}
        <div className="stats-showcase-box">
          {/* Circular Donut Chart */}
          <div className="donut-chart-wrapper">
            <svg width="108" height="108" viewBox="0 0 100 100" className="donut-svg">
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
                  <span className="donut-center-val" style={{ color: FLOATVIEW_LANG_DATA[activeLang].color }}>
                    {FLOATVIEW_LANG_DATA[activeLang].pct}%
                  </span>
                  <span className="donut-center-label">{FLOATVIEW_LANG_DATA[activeLang].shortName}</span>
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
              {FLOATVIEW_LANG_DATA.map((item) => (
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

            {/* Languages Row: C# 96.8%, PowerShell 3.2% */}
            <div className="project-lang-row">
              {FLOATVIEW_LANG_DATA.map((item, idx) => {
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

        <style jsx>{`
        .project-header-group {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: clamp(8px, 1.3vh, 14px);
          width: 100%;
        }

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

        /* Dynamic neon shifting color effect for "View" */
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
        }

        .feature-list {
          list-style: none;
          margin-top: 18px;
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
      `}</style>
      </>
      );
}
