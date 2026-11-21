"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const RobotViewer = dynamic(() => import("./RobotViewer"), {
  ssr: false,
});

// ============================================================================
// BACKGROUND VIDEO / MEDIA CONFIGURATION (Adjust with single numbers/settings below)
// ============================================================================
export const BACKGROUND_CONFIG = {
  // 1. Video source path (served from /public folder)
  videoSrc: "/Rain_falling_on_window_1080p.mp4",

  // 2. Object Fit Mode:
  //    "cover"   = fills the entire area between the side margins (cinematic background)
  //    "contain" = fits the full 16:9 frame without cropping
  objectFit: "cover" as "cover" | "contain",

  // 3. Object Position alignment:
  objectPosition: "center", // "center", "center top", "center bottom", etc.

  // 4. Background Opacity (0.0 = invisible / black, 1.0 = full brightness):
  opacity: 1.0,

  // 5. Dark Overlay Darkness (0.0 = pure video, 0.15 = 15% dark tint for contrast):
  darkOverlay: 0.10,

  // 6. Blur Effect on Background (0 = crisp sharp, 4-10 = soft ambient blur):
  blurPx: 0,

  // 7. Video Playback Speed (1.0 = normal, 0.75 = slower rain, 1.25 = faster):
  playbackRate: 1.0,
};

// ============================================================================
// FREESTANDING 3D ROBOT PLACEMENT CONFIGURATION
// Position and size the 3D robot cleanly with single numbers (in % and px)
// ============================================================================
export const ROBOT_PLACEMENT_CONFIG = {
  // 1. Horizontal Position:
  //    Percentage from left margin pillar (0% places it directly inside the circled zone)
  leftPercent: 0,
  //    Fine-tune offset in pixels (+ shifts right, - shifts left):
  leftOffsetPx: 0,

  // 2. Vertical Position from Floor:
  //    Percentage from bottom edge of viewport:
  bottomPercent: 0,
  //    Fine-tune offset in pixels (+ shifts up, - shifts down):
  bottomOffsetPx: 10,

  // 3. Stage Size (Width and Height framing the 3D robot, in px):
  widthPx: 320,
  heightPx: 400,
};

// ============================================================================
// RIGHT GLASS BLOCK SECTION SETTINGS (Adjust with single numbers below)
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

  // 4. Center Gap from the 50% seam line (in pixels):
  gapPx: 2, // 2px gap from middle

  // 5. Corner Radii:
  //    outerRadiusPx: radius for the outer corners (in px)
  //    innerRadiusPx: radius for the middle seam corners (0 = SHARP square corners)
  outerRadiusPx: 20,
  innerRadiusPx: 0, // 0 = sharp corners in the middle seam!

  // 6. Section 4-Side Position / Size Insets (Adjust directly with single numbers in px):
  topPx: 75,     // Distance from screen top
  bottomPx: 65,  // Distance from screen bottom
  rightPx: 100,   // Right block outer edge distance from right margin
};

export default function HeadTrackingSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = BACKGROUND_CONFIG.playbackRate;
      videoRef.current.play().catch(() => {
        // Autoplay may wait for user interaction in certain browser states
      });
    }
  }, []);

  return (
    <section
      id="character"
      className="head-tracking-section"
      aria-label="Interactive Showcase Section"
    >
      <div className="head-tracking-viewport">
        {/* Background Video fitted cleanly within the margin pillars */}
        <div className="section-bg-media-wrapper" aria-hidden="true">
          <video
            ref={videoRef}
            src={BACKGROUND_CONFIG.videoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="section-bg-video"
            style={{
              objectFit: BACKGROUND_CONFIG.objectFit,
              objectPosition: BACKGROUND_CONFIG.objectPosition,
              opacity: BACKGROUND_CONFIG.opacity,
              filter:
                BACKGROUND_CONFIG.blurPx > 0
                  ? `blur(${BACKGROUND_CONFIG.blurPx}px)`
                  : "none",
            }}
          />
          {BACKGROUND_CONFIG.darkOverlay > 0 && (
            <div
              className="section-bg-overlay"
              style={{
                backgroundColor: `rgba(0, 0, 0, ${BACKGROUND_CONFIG.darkOverlay})`,
              }}
            />
          )}
        </div>

        {/* Freestanding 3D Robot Character (Framed inside the circled floor area, without any background) */}
        <div
          className="robot-freestanding-stage"
          style={
            {
              "--robot-left": `${ROBOT_PLACEMENT_CONFIG.leftPercent}%`,
              "--robot-left-offset": `${ROBOT_PLACEMENT_CONFIG.leftOffsetPx}px`,
              "--robot-bottom": `${ROBOT_PLACEMENT_CONFIG.bottomPercent}%`,
              "--robot-bottom-offset": `${ROBOT_PLACEMENT_CONFIG.bottomOffsetPx}px`,
              "--robot-width": `${ROBOT_PLACEMENT_CONFIG.widthPx}px`,
              "--robot-height": `${ROBOT_PLACEMENT_CONFIG.heightPx}px`,
            } as React.CSSProperties
          }
        >
          <RobotViewer />
        </div>

        {/* Right Glass Block (Kept exactly as it is, anchored at 50% center seam) */}
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
              "--glass-right": `${GLASS_CONFIG.rightPx}px`,
            } as React.CSSProperties
          }
        >
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

        /* Background Video Wrapper (bounded precisely by margin pillars) */
        .section-bg-media-wrapper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }

        .section-bg-video {
          width: 100%;
          height: 100%;
          display: block;
          user-select: none;
          pointer-events: none;
          transform: scale(1);
        }

        .section-bg-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        /* Freestanding 3D Robot Stage (Positioned on the floor in the bottom-left zone) */
        .robot-freestanding-stage {
          position: absolute;
          left: calc(var(--robot-left, 0%) + var(--robot-left-offset, 0px));
          bottom: calc(var(--robot-bottom, 0%) + var(--robot-bottom-offset, 10px));
          width: var(--robot-width, 320px);
          height: var(--robot-height, 400px);
          max-width: 42vw;
          max-height: 65vh;
          z-index: 15;
          pointer-events: none;
          user-select: none;
        }

        /* Ambient soft floor shadow puddle beneath the 3D stage */
        .robot-freestanding-stage::after {
          content: "";
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          width: 260px;
          height: 36px;
          background: radial-gradient(
            ellipse at center,
            rgba(0, 0, 0, 0.65) 0%,
            rgba(0, 0, 0, 0.40) 35%,
            rgba(0, 0, 0, 0.15) 65%,
            transparent 80%
          );
          border-radius: 50%;
          filter: blur(8px);
          pointer-events: none;
          z-index: -1;
        }

        /* Glass Blocks Container (Right block middle seam locked at 50%) */
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
