"use client";

import React from "react";
import dynamic from "next/dynamic";

const RobotViewer = dynamic(() => import("./RobotViewer"), {
  ssr: false,
});

// ============================================================================
// DUAL BLOCK GLASS SECTION SETTINGS (Adjust with single numbers below)
// ============================================================================
export const GLASS_CONFIG = {
  // 1. Transparency / Background Darkness:
  //    0.0 = completely transparent (100% see-through), 1.0 = solid black
  bgOpacity: 0.3,

  // 2. Glassmorphism Blur Effect:
  //    0 = razor sharp / no blur, 4-20 = frosted blur
  blurPx: 2,

  // 3. Section Border Opacity (white border line brightness):
  borderOpacity: 0.09, // 9% border brightness

  // 4. Center Gap Between Left and Right Blocks (in pixels):
  //    (Center seam is permanently anchored at dead center 50%)
  gapPx: 2, // 2px gap between blocks

  // 5. Corner Radii:
  //    outerRadiusPx: radius for the outer corners (in px)
  //    innerRadiusPx: radius for the middle seam corners (0 = SHARP square corners)
  outerRadiusPx: 20,
  innerRadiusPx: 0, // 0 = sharp corners in the middle seam!

  // 6. Section 4-Side Position / Size Insets (Adjust directly with single numbers in px):
  //    Adjusting leftPx or rightPx resizes left-to-middle and right-to-middle without moving the center seam!
  topPx: 75,     // Distance from screen top
  bottomPx: 65,  // Distance from screen bottom
  leftPx: 155,    // Left block outer edge distance from left margin
  rightPx: 100,   // Right block outer edge distance from right margin
};

export default function HeadTrackingSection() {
  return (
    <section
      id="character"
      className="head-tracking-section"
      aria-label="Interactive Showcase Section"
    >
      <div className="head-tracking-viewport">
        {/* Dual Symmetrical Glass Blocks (Left & Right with Center Gap anchored at 50%) */}
        <div
          className="glass-sections-container"
          aria-hidden="true"
          style={
            {
              "--glass-bg-opacity": GLASS_CONFIG.bgOpacity,
              "--glass-blur": `${GLASS_CONFIG.blurPx}px`,
              "--glass-border-opacity": GLASS_CONFIG.borderOpacity,
              "--glass-gap": `${GLASS_CONFIG.gapPx}px`,
              "--glass-outer-radius": `${GLASS_CONFIG.outerRadiusPx}px`,
              "--glass-inner-radius": `${GLASS_CONFIG.innerRadiusPx}px`,
              "--glass-top": `${GLASS_CONFIG.topPx}px`,
              "--glass-bottom": `${GLASS_CONFIG.bottomPx}px`,
              "--glass-left": `${GLASS_CONFIG.leftPx}px`,
              "--glass-right": `${GLASS_CONFIG.rightPx}px`,
            } as React.CSSProperties
          }
        >
          {/* Left Block of Section (resizes from leftPx to dead center) */}
          <div className="glass-block glass-block-left">
            <RobotViewer />
          </div>

          {/* Right Block of Section (resizes from rightPx to dead center) */}
          <div className="glass-block glass-block-right" />
        </div>
      </div>

      <style jsx>{`
        .head-tracking-section {
          position: relative;
          width: 100%;
          height: 100vh;
          background-color: #000000;
          overflow: hidden;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-left: var(--margin-pillar-width, clamp(48px, 6.5vw, 102px));
          padding-right: var(--margin-pillar-width, clamp(48px, 6.5vw, 102px));
          box-sizing: border-box;
        }

        .head-tracking-viewport {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #000000;
        }

        /* Dual Symmetrical Glass Blocks Container (Spans full viewport, middle seam locked at 50%) */
        .glass-sections-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          user-select: none;
          z-index: 10;
        }

        /* Shared Glass Block Styling (No white interior, only clean border) */
        .glass-block {
          position: absolute;
          top: var(--glass-top, 75px);
          bottom: var(--glass-bottom, 35px);
          background-color: rgba(0, 0, 0, var(--glass-bg-opacity, 0));
          backdrop-filter: blur(var(--glass-blur, 0px));
          -webkit-backdrop-filter: blur(var(--glass-blur, 0px));
          border: 1px solid rgba(255, 255, 255, var(--glass-border-opacity, 0.09));
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
          pointer-events: none;
          user-select: none;
          overflow: hidden;
        }

        /* Left Block: left edge set by --glass-left; right edge locked at (50% - gap/2) */
        .glass-block-left {
          left: var(--glass-left, 20px);
          right: calc(50% + var(--glass-gap, 2px) / 2);
          border-top-left-radius: var(--glass-outer-radius, 20px);
          border-bottom-left-radius: var(--glass-outer-radius, 20px);
          border-top-right-radius: var(--glass-inner-radius, 0px);
          border-bottom-right-radius: var(--glass-inner-radius, 0px);
        }

        /* Right Block: left edge locked at (50% + gap/2); right edge set by --glass-right */
        .glass-block-right {
          left: calc(50% + var(--glass-gap, 2px) / 2);
          right: var(--glass-right, 20px);
          border-top-left-radius: var(--glass-inner-radius, 0px);
          border-bottom-left-radius: var(--glass-inner-radius, 0px);
          border-top-right-radius: var(--glass-outer-radius, 20px);
          border-bottom-right-radius: var(--glass-outer-radius, 20px);
        }
      `}</style>
    </section>
  );
}
