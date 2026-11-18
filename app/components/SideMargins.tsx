"use client";

import React from "react";

export default function SideMargins() {
  return (
    <>
      {/* =========================================================================
          LEFT MARGIN PILLAR
          Structure: [Outer Black Gutter] [Outer Line] [Hatched Strip + V-Shadow] [Inner Line] [Inner Black Gutter]
          ========================================================================= */}
      <aside aria-hidden="true" className="side-margin-container side-margin-left">
        {/* Outer Black Gutter (towards screen edge) */}
        <div className="margin-black-gutter margin-outer-gutter" />

        {/* Textured Central Channel bounded by dual lines */}
        <div className="margin-channel">
          {/* Diagonal Hatched Pattern Layer */}
          <div className="margin-pattern-fill" />

          {/* Top & Bottom Black Shadow / Vignette Fade Layer */}
          <div className="margin-vignette-overlay" />
        </div>

        {/* Inner Black Gutter (towards page content) */}
        <div className="margin-black-gutter margin-inner-gutter" />
      </aside>

      {/* =========================================================================
          RIGHT MARGIN PILLAR (Mirrored)
          Structure: [Inner Black Gutter] [Inner Line] [Hatched Strip + V-Shadow] [Outer Line] [Outer Black Gutter]
          ========================================================================= */}
      <aside aria-hidden="true" className="side-margin-container side-margin-right">
        {/* Inner Black Gutter (towards page content) */}
        <div className="margin-black-gutter margin-inner-gutter" />

        {/* Textured Central Channel bounded by dual lines */}
        <div className="margin-channel">
          {/* Diagonal Hatched Pattern Layer */}
          <div className="margin-pattern-fill" />

          {/* Top & Bottom Black Shadow / Vignette Fade Layer */}
          <div className="margin-vignette-overlay" />
        </div>

        {/* Outer Black Gutter (towards screen edge) */}
        <div className="margin-black-gutter margin-outer-gutter" />
      </aside>

      <style jsx global>{`
        .side-margin-container {
          position: fixed;
          top: 0;
          bottom: 0;
          display: flex;
          flex-direction: row;
          height: 100vh;
          z-index: 45;
          pointer-events: none;
          user-select: none;
          box-sizing: border-box;
          background-color: #000000;
        }

        .side-margin-left {
          left: 0;
          box-shadow: 8px 0 28px rgba(0, 0, 0, 0.85);
        }

        .side-margin-right {
          right: 0;
          box-shadow: -8px 0 28px rgba(0, 0, 0, 0.85);
        }

        /* Outer solid black gutter facing the screen bezel */
        .margin-outer-gutter {
          width: clamp(10px, 1.3vw, 20px);
          background-color: #000000;
          flex-shrink: 0;
        }

        /* Inner solid black gutter facing the page content */
        .margin-inner-gutter {
          width: clamp(6px, 0.8vw, 14px);
          background-color: #000000;
          flex-shrink: 0;
        }

        /* The framed central channel holding the diagonal pattern */
        .margin-channel {
          position: relative;
          width: clamp(32px, 4.4vw, 68px);
          height: 100%;
          background-color: #000000;
          overflow: hidden;
          flex-shrink: 0;
        }

        /* Left margin channel borders: outer line on left, inner line on right */
        .side-margin-left .margin-channel {
          border-left: 1px solid rgba(255, 255, 255, 0.08);
          border-right: 1px solid rgba(255, 255, 255, 0.14);
        }

        /* Right margin channel borders: inner line on left, outer line on right */
        .side-margin-right .margin-channel {
          border-left: 1px solid rgba(255, 255, 255, 0.14);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
        }

        /* Diagonal 45-degree tactical hatched pattern matching reference */
        .margin-pattern-fill {
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.065) 0px,
            rgba(255, 255, 255, 0.065) 1.2px,
            transparent 1.2px,
            transparent 4.5px
          );
        }

        /* Smooth Top and Bottom Black Vignette Shadows */
        .margin-vignette-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            #000000 0%,
            rgba(0, 0, 0, 0.85) 6%,
            rgba(0, 0, 0, 0.35) 14%,
            rgba(0, 0, 0, 0) 22%,
            rgba(0, 0, 0, 0) 78%,
            rgba(0, 0, 0, 0.35) 86%,
            rgba(0, 0, 0, 0.85) 94%,
            #000000 100%
          );
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .margin-outer-gutter {
            width: 4px;
          }
          .margin-inner-gutter {
            width: 2px;
          }
          .margin-channel {
            width: clamp(14px, 3.5vw, 24px);
          }
        }
      `}</style>
    </>
  );
}
