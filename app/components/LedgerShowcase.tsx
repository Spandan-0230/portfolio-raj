"use client";

import React, { useState, useMemo } from "react";
import PureImagePopup from "./PureImagePopup";
import LedgerGalleryModal from "./LedgerGalleryModal";

export interface LedgerImage {
  id: number;
  filename: string;
  src: string;
  title: string;
  subtitle: string;
  width: number;
  height: number;
  aspect: number;
}

export const LEDGER_IMAGES: LedgerImage[] = [
  {
    id: 1,
    filename: "1.png",
    src: "/projects/ledger/1.png",
    title: "Store Overview & Digital Ledger",
    subtitle: "Real-time daily bookkeeping, store metrics & balance overview",
    width: 981,
    height: 649,
    aspect: 981 / 649, // ~1.51
  },
  {
    id: 2,
    filename: "2.png",
    src: "/projects/ledger/2.png",
    title: "Transaction Journal & Bookkeeping",
    subtitle: "Granular income/expense logging & daily cash register reconciliation",
    width: 1365,
    height: 636,
    aspect: 1365 / 636, // ~2.15
  },
  {
    id: 3,
    filename: "3.png",
    src: "/projects/ledger/3.png",
    title: "Inventory & Stock Management",
    subtitle: "SKU tracking, reorder thresholds & low-stock alerts",
    width: 1365,
    height: 645,
    aspect: 1365 / 645, // ~2.12
  },
  {
    id: 4,
    filename: "4.png",
    src: "/projects/ledger/4.png",
    title: "Profit Margins & Sales Analytics",
    subtitle: "Interactive financial trends, margin breakdown & revenue forecasts",
    width: 1365,
    height: 577,
    aspect: 1365 / 577, // ~2.37
  },
  {
    id: 5,
    filename: "5.png",
    src: "/projects/ledger/5.png",
    title: "Customer Khata & Credit Records",
    subtitle: "Borrowing limits, payment schedules & customer balance sheets",
    width: 1365,
    height: 658,
    aspect: 1365 / 658, // ~2.07
  },
  {
    id: 6,
    filename: "6.png",
    src: "/projects/ledger/6.png",
    title: "Product Catalog & Pricing Tiers",
    subtitle: "Unit costs, wholesale vs retail margins & barcode lookups",
    width: 1365,
    height: 653,
    aspect: 1365 / 653, // ~2.09
  },
  {
    id: 7,
    filename: "7.png",
    src: "/projects/ledger/7.png",
    title: "Cash Flow & Audit Statements",
    subtitle: "Audited monthly balances, tax summaries & exportable receipts",
    width: 848,
    height: 460,
    aspect: 848 / 460, // ~1.84
  },
  {
    id: 8,
    filename: "8.png",
    src: "/projects/ledger/8.png",
    title: "Mobile POS & Digital Invoicing",
    subtitle: "Responsive counter view, mobile receipts & quick billing",
    width: 452,
    height: 700,
    aspect: 452 / 700, // ~0.65
  },
];

// Language / Tech Stack distribution data for Ledger Website (From GitHub stats)
export interface LedgerLanguageItem {
  id: string;
  name: string;
  shortName: string;
  pct: number;
  color: string;
  icon: React.ReactNode;
}

export const LEDGER_LANG_DATA: LedgerLanguageItem[] = [
  {
    id: "typescript",
    name: "TypeScript",
    shortName: "TS",
    pct: 78.5,
    color: "#3178C6",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="#3178C6">
        <path d="M1.5 0h21l-1.9 21.4L12 24l-8.6-2.6L1.5 0zm10.7 15.6l-.3-3.6h4.5l.3-3.4H7.5l.8 10.4 3.9 1.1 3.9-1.1.4-4.8h-4.3z" />
      </svg>
    ),
  },
  {
    id: "javascript",
    name: "JavaScript",
    shortName: "JS",
    pct: 19.1,
    color: "#F7DF1E",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="#F7DF1E">
        <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.017-.892-1.794-2.203-2.308l-.59-.232c-.752-.294-1.118-.584-1.118-1.026 0-.46.38-.797.983-.797.632 0 1.05.281 1.25.797l1.782-1.037c-.473-1.07-1.464-1.688-2.983-1.688-1.875 0-3.087 1.096-3.087 2.673 0 1.455.908 2.223 2.457 2.825l.59.232c.866.338 1.23.633 1.23 1.144 0 .548-.48.908-1.23.908-.946 0-1.442-.48-1.74-1.164l-1.85 1.06c.552 1.272 1.704 2.012 3.518 2.012 2.213 0 3.391-1.154 3.391-2.899zm-8.214-4.298h-2.15v5.823c0 1.258-.696 1.83-1.737 1.83-.808 0-1.348-.363-1.662-.93l-1.768 1.096c.642 1.258 1.875 1.758 3.38 1.758 2.375 0 3.937-1.282 3.937-3.644v-5.933z" />
      </svg>
    ),
  },
  {
    id: "css",
    name: "CSS",
    shortName: "CSS",
    pct: 1.3,
    color: "#663399",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="#663399">
        <path d="M1.5 0h21l-1.9 21.4L12 24l-8.6-2.6L1.5 0zm16.5 5.5H6l.3 3.5h11.4l-.4 4.5-5.3 1.5-5.3-1.5-.2-2.5H4.3l.4 4.6 7.3 2 7.3-2 .7-8.1.3-3.5z" />
      </svg>
    ),
  },
  {
    id: "html",
    name: "HTML",
    shortName: "HTML",
    pct: 1.1,
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

// Stage Six Left Pane: Landscape Showcase with 4 True-Sized Thumbnails + See More Action
export function StageSixLeftPane() {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [popupImg, setPopupImg] = useState<{ src: string; alt: string } | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);

  const activeImage = LEDGER_IMAGES[activeIdx];

  // The 4 prominent featured screenshots in the single line
  const featuredThumbnails = LEDGER_IMAGES.slice(0, 4);

  return (
    <div className="landscape-showcase-container">
      {/* GitHub Repo Button (Positioned cleanly above the main landscape screen) */}
      <div className="github-link-container">
        <a
          href="https://github.com/Spandan-0230/Ledger-Website"
          target="_blank"
          rel="noopener noreferrer"
          className="github-repo-link"
          title="Open GitHub/Spandan-0230/Ledger-Website"
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
          <span className="github-link-text">GitHub/Ledger-Website</span>
        </a>
      </div>

      {/* Main Big Landscape Screen Frame (Auto-adjusts tightly to the active image size) */}
      <div className="main-screen-wrapper">
        <div
          className="main-screen-card"
          onClick={() => setPopupImg({ src: activeImage.src, alt: activeImage.title })}
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

      {/* 4 Landscape Thumbnail Cards in a Single Horizontal Line with True Aspect Ratio */}
      <div className="thumbnails-single-line">
        {featuredThumbnails.map((img, idx) => {
          const isActive = activeIdx === idx;
          return (
            <div
              key={img.id}
              className={`thumb-card ${isActive ? "active-thumb" : ""}`}
              onMouseEnter={() => setActiveIdx(idx)}
              onClick={() => {
                setActiveIdx(idx);
                setPopupImg({ src: img.src, alt: img.title });
              }}
              style={{ aspectRatio: `${img.width} / ${img.height}` }}
              title={`${img.title} (Click to view)`}
            >
              <div className="thumb-screen-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.title} className="thumb-img" />
              </div>
            </div>
          );
        })}
      </div>

      {/* See More Action (Matching BioSync: text + down chevron) */}
      <div className="see-more-container">
        <button
          type="button"
          className="see-more-btn"
          title="See more Ledger screenshots"
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

      {/* Pure Image Pop-up (No UI elements, no background block) */}
      <PureImagePopup
        isOpen={popupImg !== null}
        onClose={() => setPopupImg(null)}
        src={popupImg?.src || ""}
        alt={popupImg?.alt || ""}
      />

      {/* Ledger Scrollable Gallery Modal (See more: 3 images per row, last 2 centered: 7 & 8) */}
      <LedgerGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={LEDGER_IMAGES}
      />

      <style jsx>{`
        .landscape-showcase-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: clamp(520px, 44vw, 680px);
          margin-top: clamp(24px, 3.2vh, 36px);
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
          height: clamp(280px, min(38vh, 24vw), 390px);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: clamp(12px, 1.5vh, 18px);
        }

        .main-screen-card {
          position: relative;
          height: 100%;
          max-width: 100%;
          background: #000000;
          border: 1.5px solid rgba(255, 255, 255, 0.28);
          border-radius: 16px;
          overflow: hidden;
          cursor: zoom-in;
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

        /* See More Button Section (Matching BioSync) */
        .see-more-container {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: clamp(8px, 1.2vh, 14px);
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
      `}</style>
    </div>
  );
}

// Stage Six Right Pane: Ledger Website Title, Description, Bullet Points & Languages Breakdown
export function StageSixRightPane() {
  const [activeLang, setActiveLang] = useState<number | null>(null);

  const donutSlices = useMemo(() => {
    let currentAngle = 0;
    const gap = 1.4;
    return LEDGER_LANG_DATA.map((item) => {
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
          Ledger <span className="neon-sync-text">Website</span>
        </h1>
        <div className="project-desc-text">
          <br />
          Manage your general store with ultimate precision. Our digital ledger simplifies your daily bookkeeping, tracks real-time inventory, and monitors profit margins in one secure platform.

          <ul className="feature-list" style={{ marginTop: "18px" }}>
            <li className="feature-item">
              <FeatureBulletIcon />
              <span className="feature-text">📦 Real-Time Inventory Tracking &amp; Automated Stock Alerts</span>
            </li>
            <li className="feature-item">
              <FeatureBulletIcon />
              <span className="feature-text">🧾 Daily Digital Bookkeeping &amp; General Store Ledgering</span>
            </li>
            <li className="feature-item">
              <FeatureBulletIcon />
              <span className="feature-text">📈 Live Profit Margin Analytics &amp; Cash Flow Reporting</span>
            </li>
            <li className="feature-item">
              <FeatureBulletIcon />
              <span className="feature-text">💳 Customer Khata Credit Records &amp; Split Payment Logs</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Circular Stats & Language Distribution Breakdown (TS 78.5%, JS 19.1%, CSS 1.3%, HTML 1.1%) */}
      <div className="ledger-stats-box">
        {/* Circular Donut Chart */}
        <div className="ledger-donut-wrapper">
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
                <span className="donut-center-val" style={{ color: LEDGER_LANG_DATA[activeLang].color }}>
                  {LEDGER_LANG_DATA[activeLang].pct}%
                </span>
                <span className="donut-center-label">{LEDGER_LANG_DATA[activeLang].shortName}</span>
              </>
            ) : (
              <span className="donut-center-val">100%</span>
            )}
          </div>
        </div>

        {/* Languages Section: GitHub-Style Progress Bar + Explicit 2x2 Matrix */}
        <div className="ledger-lang-section">
          {/* GitHub-style multi-color progress bar */}
          <div className="ledger-lang-progress-bar">
            {LEDGER_LANG_DATA.map((item) => (
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

          {/* 2x2 Matrix: Explicitly Structured into 2 Rows with 2 Columns Each */}
          <div className="ledger-lang-matrix">
            {/* Row 1: TypeScript (78.5%) & JavaScript (19.1%) */}
            <div className="ledger-lang-matrix-row">
              <div
                className={`ledger-lang-matrix-item ${activeLang === 0 ? "active-item" : ""}`}
                onMouseEnter={() => setActiveLang(0)}
                onMouseLeave={() => setActiveLang(null)}
              >
                <span className="lang-icon-wrapper">{LEDGER_LANG_DATA[0].icon}</span>
                <span className="lang-name-text">{LEDGER_LANG_DATA[0].name}</span>
                <span className="lang-pct-text">{LEDGER_LANG_DATA[0].pct}%</span>
              </div>

              <div
                className={`ledger-lang-matrix-item ${activeLang === 1 ? "active-item" : ""}`}
                onMouseEnter={() => setActiveLang(1)}
                onMouseLeave={() => setActiveLang(null)}
              >
                <span className="lang-icon-wrapper">{LEDGER_LANG_DATA[1].icon}</span>
                <span className="lang-name-text">{LEDGER_LANG_DATA[1].name}</span>
                <span className="lang-pct-text">{LEDGER_LANG_DATA[1].pct}%</span>
              </div>
            </div>

            {/* Row 2: CSS (1.3%) & HTML (1.1%) */}
            <div className="ledger-lang-matrix-row">
              <div
                className={`ledger-lang-matrix-item ${activeLang === 2 ? "active-item" : ""}`}
                onMouseEnter={() => setActiveLang(2)}
                onMouseLeave={() => setActiveLang(null)}
              >
                <span className="lang-icon-wrapper">{LEDGER_LANG_DATA[2].icon}</span>
                <span className="lang-name-text">{LEDGER_LANG_DATA[2].name}</span>
                <span className="lang-pct-text">{LEDGER_LANG_DATA[2].pct}%</span>
              </div>

              <div
                className={`ledger-lang-matrix-item ${activeLang === 3 ? "active-item" : ""}`}
                onMouseEnter={() => setActiveLang(3)}
                onMouseLeave={() => setActiveLang(null)}
              >
                <span className="lang-icon-wrapper">{LEDGER_LANG_DATA[3].icon}</span>
                <span className="lang-name-text">{LEDGER_LANG_DATA[3].name}</span>
                <span className="lang-pct-text">{LEDGER_LANG_DATA[3].pct}%</span>
              </div>
            </div>
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

        /* Dynamic neon shifting color effect for "Website" */
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

        /* Circular Stats & Language Distribution Breakdown */
        .ledger-stats-box {
          display: flex;
          align-items: center;
          gap: clamp(14px, 1.8vw, 22px);
          width: 100%;
          max-width: 520px;
          padding: 0;
          margin: 0;
        }

        .ledger-donut-wrapper {
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

        /* Languages Section: GitHub-Style Progress Bar + 2x2 Matrix */
        .ledger-lang-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }

        .ledger-lang-progress-bar {
          display: flex;
          width: 100%;
          max-width: 320px;
          height: 7px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
        }

        .ledger-lang-matrix {
          display: flex;
          flex-direction: column;
          gap: 7px;
          width: 100%;
          max-width: 340px;
        }

        .ledger-lang-matrix-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: clamp(14px, 2vw, 24px);
          width: 100%;
        }

        .ledger-lang-matrix-item {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
          white-space: nowrap;
          min-width: 125px;
        }

        .ledger-lang-matrix-item:hover,
        .ledger-lang-matrix-item.active-item {
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

        .ledger-lang-matrix-item:hover .lang-name-text,
        .ledger-lang-matrix-item.active-item .lang-name-text {
          color: #ffffff;
        }

        .ledger-lang-matrix-item:hover .lang-pct-text,
        .ledger-lang-matrix-item.active-item .lang-pct-text {
          color: #ffffff;
          font-weight: 700;
        }
        }

        .lang-item-row:hover .lang-pct-text,
        .lang-item-row.active-row .lang-pct-text {
          color: #ffffff;
        }
      `}</style>
    </>
  );
}
