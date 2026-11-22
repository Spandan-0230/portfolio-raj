"use client";

import React, { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ContactForm from "./ContactForm";
import SmokeBurst from "./SmokeBurst";

const RobotViewer = dynamic(() => import("./RobotViewer"), {
  ssr: false,
});

// ============================================================================
// BACKGROUND IMAGE CONFIGURATION (Adjust with single numbers/settings below)
// ============================================================================
export const BACKGROUND_CONFIG = {
  // 1. Image path (served from /public folder)
  imageSrc: "/7.jpg",

  // 2. Object Fit Mode:
  //    "cover"   = fills the entire area between the side margins (cinematic background)
  //    "contain" = fits the full 16:9 frame without cropping
  objectFit: "cover" as "cover" | "contain",

  // 3. Object Position alignment:
  objectPosition: "center", // "center", "center top", "center bottom", etc.

  // 4. Background Opacity (0.0 = invisible / black, 1.0 = full brightness):
  opacity: 1.0,

  // 5. Dark Overlay Darkness (0.0 = pure image, 0.10 = 10% dark tint for contrast):
  darkOverlay: 0.10,

  // 6. Blur Effect on Background (0 = crisp sharp, 4-10 = soft ambient blur):
  blurPx: 0,
};

// ============================================================================
// FREESTANDING 3D ROBOT PLACEMENT CONFIGURATION
// Position and size the 3D robot cleanly with single numbers (in % and px)
// Anchored at the marked bottom-right area of the Contact Card
// ============================================================================
export const ROBOT_PLACEMENT_CONFIG = {
  // 1. Horizontal Position:
  //    Offset from the card's right border (in px)
  //    Negative values shift outwards / rightward into the marked area:
  rightOffsetPx: -125,

  // 2. Vertical Position:
  //    Offset from the card's bottom edge (in px)
  //    Negative values shift downwards to floor level:
  bottomOffsetPx: -15,

  // 3. Stage Size (Width and Height framing the 3D robot, in px):
  widthPx: 220,
  heightPx: 240,
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
  gapPx: 9, // 2px gap from middle

  // 5. Corner Radii:
  //    outerRadiusPx: radius for the outer corners (in px)
  //    innerRadiusPx: radius for the middle seam corners (0 = SHARP square corners)
  outerRadiusPx: 20,
  innerRadiusPx: 0, // 0 = sharp corners in the middle seam!

  // 6. Section 4-Side Position / Size Insets (Adjust directly with single numbers in px):
  topPx: 75,     // Distance from screen top
  bottomPx: 20,  // Distance from screen bottom
  rightPx: 50,   // Right block outer edge distance from right margin
};

export default function HeadTrackingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);

  // State to track when the user has actually landed on this section
  const [hasLanded, setHasLanded] = useState(false);

  // 3D Robot launch states: hidden by default until 3s after landing, then smoke burst & emergence
  const [isRobotVisible, setIsRobotVisible] = useState(false);
  const [isSmokeActive, setIsSmokeActive] = useState(false);

  // Typing animation state for Line 1 ("Let’s start a") and Line 2 ("Worthwhile \n Build")
  const [text1, setText1] = useState("");
  const [text2A, setText2A] = useState("");
  const [text2B, setText2B] = useState("");
  const [cursorPos, setCursorPos] = useState<"1" | "2A" | "2B">("1");

  // 1. Detect when user lands on this last page (enters viewport)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof window === "undefined") return;

    // IntersectionObserver to accurately track when section is in view
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          setHasLanded(true);
        } else {
          setHasLanded(false);
        }
      },
      {
        threshold: [0, 0.25, 0.5],
      }
    );
    observer.observe(el);

    // Scroll fallback check for immediate position calculation
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const winH = window.innerHeight;
      const inView = rect.top < winH * 0.75 && rect.bottom > winH * 0.25;
      setHasLanded((prev) => (prev !== inView ? inView : prev));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // 2. Smoke burst & 3D Robot launch sequence:
  // Starts 3 seconds after landing on the section.
  // Smoke bursts at 3000ms, and the 3D model emerges smoothly from inside the smoke at 3350ms.
  useEffect(() => {
    if (!hasLanded) {
      setIsRobotVisible(false);
      setIsSmokeActive(false);
      return;
    }

    let smokeTimer: NodeJS.Timeout | null = null;
    let robotTimer: NodeJS.Timeout | null = null;

    smokeTimer = setTimeout(() => {
      setIsSmokeActive(true);
      robotTimer = setTimeout(() => {
        setIsRobotVisible(true);
      }, 350);
    }, 3000);

    return () => {
      if (smokeTimer) clearTimeout(smokeTimer);
      if (robotTimer) clearTimeout(robotTimer);
    };
  }, [hasLanded]);

  // 3. Smooth typing & ordered erasing loop:
  // Starts ONLY after user lands on the last page with a 1.5s delay
  // 1. "Let’s start a" types out smoothly
  // 2. Cursor shifts to Line 2, "Worthwhile" types out
  // 3. Enter key: cursor drops to Line 2b, "Build" types out
  // 4. Pause with both sentences fully visible
  // 5. Line 2b ("Build") is erased first, then Line 2a ("Worthwhile")
  // 6. Cursor shifts back up to Line 1, "Let’s start a" is erased
  // 7. Pause, then repeat
  useEffect(() => {
    if (!hasLanded) {
      setText1("");
      setText2A("");
      setText2B("");
      setCursorPos("1");
      return;
    }

    const full1 = "Let’s start a";
    const full2A = "Worthwhile Build";
    const full2B = "Together.";
    let timer: NodeJS.Timeout | null = null;
    let isCancelled = false;

    let step = 0;
    let index1 = 0;
    let index2A = 0;
    let index2B = 0;

    const tick = () => {
      if (isCancelled) return;

      if (step === 0) {
        // Typing Sentence 1: "Let’s start a"
        setCursorPos("1");
        if (index1 < full1.length) {
          index1++;
          setText1(full1.slice(0, index1));
          timer = setTimeout(tick, 75);
        } else {
          step = 1;
          timer = setTimeout(tick, 450); // Pause briefly before switching to Sentence 2
        }
      } else if (step === 1) {
        // Move cursor to Sentence 2, Line A ("Worthwhile")
        step = 2;
        setCursorPos("2A");
        timer = setTimeout(tick, 100);
      } else if (step === 2) {
        // Typing Sentence 2, Line A: "Worthwhile"
        setCursorPos("2A");
        if (index2A < full2A.length) {
          index2A++;
          setText2A(full2A.slice(0, index2A));
          timer = setTimeout(tick, 75);
        } else {
          step = 3;
          timer = setTimeout(tick, 280); // Pause to simulate "Enter" keypress!
        }
      } else if (step === 3) {
        // Press Enter: Move cursor down to Line B
        step = 4;
        setCursorPos("2B");
        timer = setTimeout(tick, 100);
      } else if (step === 4) {
        // Typing Sentence 2, Line B: "Build"
        setCursorPos("2B");
        if (index2B < full2B.length) {
          index2B++;
          setText2B(full2B.slice(0, index2B));
          timer = setTimeout(tick, 75);
        } else {
          step = 5;
          timer = setTimeout(tick, 3000); // Hold both sentences fully visible for reading
        }
      } else if (step === 5) {
        // Begin erasing: 2nd sentence is cleared out first (starting with Line B)
        step = 6;
        timer = setTimeout(tick, 40);
      } else if (step === 6) {
        // Erasing Line B ("Build")
        setCursorPos("2B");
        if (index2B > 0) {
          index2B--;
          setText2B(full2B.slice(0, index2B));
          timer = setTimeout(tick, 35);
        } else {
          step = 7;
          timer = setTimeout(tick, 180); // Pause as newline is deleted
        }
      } else if (step === 7) {
        // Move cursor back up to Line A ("Worthwhile")
        step = 8;
        setCursorPos("2A");
        timer = setTimeout(tick, 80);
      } else if (step === 8) {
        // Erasing Line A ("Worthwhile")
        setCursorPos("2A");
        if (index2A > 0) {
          index2A--;
          setText2A(full2A.slice(0, index2A));
          timer = setTimeout(tick, 35);
        } else {
          step = 9;
          timer = setTimeout(tick, 250); // Pause after Sentence 2 is cleared
        }
      } else if (step === 9) {
        // Switch cursor back to Sentence 1
        step = 10;
        setCursorPos("1");
        timer = setTimeout(tick, 100);
      } else if (step === 10) {
        // Erasing Sentence 1 ("Let’s start a")
        setCursorPos("1");
        if (index1 > 0) {
          index1--;
          setText1(full1.slice(0, index1));
          timer = setTimeout(tick, 35);
        } else {
          step = 11;
          timer = setTimeout(tick, 650); // Pause on empty state before restarting loop
        }
      } else if (step === 11) {
        // Restart loop
        step = 0;
        index1 = 0;
        index2A = 0;
        index2B = 0;
        setCursorPos("1");
        timer = setTimeout(tick, 250);
      }
    };

    // User requirement: Start typing animation after 1 to 2 sec (1.5s) after landing
    timer = setTimeout(tick, 1500);

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [hasLanded]);

  // Spotlight hover animation on "SPANDAN B"
  useEffect(() => {
    const nameEl = nameRef.current;
    if (!nameEl) return;

    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;
    let rafId: number;

    const onPointerMove = (e: MouseEvent | PointerEvent) => {
      const rect = nameEl.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      // If cursor is far outside viewport vertically, hide spotlight
      if (e.clientY < rect.top - 600 || e.clientY > rect.bottom + 600) {
        targetX = -1000;
        targetY = -1000;
      }
    };

    const onPointerLeave = () => {
      targetX = -1000;
      targetY = -1000;
    };

    const updateLoop = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      nameEl.style.setProperty("--mouse-x", `${currentX.toFixed(1)}px`);
      nameEl.style.setProperty("--mouse-y", `${currentY.toFixed(1)}px`);
      rafId = requestAnimationFrame(updateLoop);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("mousemove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);
    rafId = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("mousemove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="character"
      className="head-tracking-section"
      aria-label="Interactive Showcase Section"
    >
      <div className="head-tracking-viewport">
        {/* Background Image fitted cleanly within the margin pillars */}
        <div className="section-bg-media-wrapper" aria-hidden="true">
          <img
            src={BACKGROUND_CONFIG.imageSrc}
            alt="Futuristic environment backdrop"
            className="section-bg-media"
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

        {/* Typing Line 1: "Let's start a" (Above Name, aligned close to left margin, behind right glass) */}
        <div className="typing-text-wrapper typing-text-top" aria-hidden="true">
          <span className="typing-text-white">{text1}</span>
          {cursorPos === "1" && <span className="typing-cursor">|</span>}
        </div>

        {/* Pure Center Name Text (Confined strictly to text glyphs only, no background blocks or halos) */}
        <h1 ref={nameRef} className="spotlight-name" aria-label="Spandan B">
          SPANDAN B
        </h1>

        {/* Typing Line 2: "My" + Enter + "Architecture" (Below Name, aligned from left margin, behind right glass) */}
        <div className="typing-text-wrapper typing-text-bottom" aria-hidden="true">
          <div className="typing-multiline">
            <div className="typing-line">
              <span className="typing-text-compile">{text2A}</span>
              {cursorPos === "2A" && <span className="typing-cursor">|</span>}
            </div>
            {(text2B.length > 0 || cursorPos === "2B") && (
              <div className="typing-line">
                <span className="typing-text-compile">{text2B}</span>
                {cursorPos === "2B" && <span className="typing-cursor">|</span>}
              </div>
            )}
          </div>
        </div>

        {/* Right Glass Block hosting the Contact Form (anchored at 50% center seam) */}
        <div
          className="glass-sections-container"
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
          {/* Right Block of Section hosting the Contact Form */}
          <div className="glass-block glass-block-right">
            <ContactForm />

            {/* Freestanding 3D Robot Character anchored precisely at the user-marked area */}
            <div
              className={`robot-card-stage ${
                isRobotVisible ? "robot-stage-revealed" : "robot-stage-hidden"
              }`}
              style={
                {
                  "--robot-right": `${ROBOT_PLACEMENT_CONFIG.rightOffsetPx}px`,
                  "--robot-bottom": `${ROBOT_PLACEMENT_CONFIG.bottomOffsetPx}px`,
                  "--robot-width": `${ROBOT_PLACEMENT_CONFIG.widthPx}px`,
                  "--robot-height": `${ROBOT_PLACEMENT_CONFIG.heightPx}px`,
                } as React.CSSProperties
              }
            >
              <div className="robot-canvas-wrapper">
                <RobotViewer />
              </div>
              <SmokeBurst isActive={isSmokeActive} />
            </div>
          </div>
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

        .section-bg-media,
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

        /* -----------------------------------------------------------------
           PURE CENTER NAME TEXT (Purely text only: Spotlight confined inside glyphs)
           Matches Figma lighting effect (https://www.youtube.com/shorts/BLds3R8OP1c):
           - No background boxes or sections
           - No mouse halo or moving glow on the backdrop
           - Text is dark by default, illuminated with gold gradient strictly inside letters
           ----------------------------------------------------------------- */
        .spotlight-name {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          margin: 0;
          padding: 0;
          font-family: 'HeroAlphabet', 'HeroOrbitron', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: clamp(3.2rem, 9.4vw, 10.5rem);
          font-weight: 800;
          letter-spacing: 0.14em;
          line-height: 1;
          text-transform: uppercase;
          white-space: nowrap;
          text-align: center;
          pointer-events: none;
          user-select: none;
          z-index: 4;

          /* Conical/radial gold lighting gradient clipped strictly to the text glyphs */
          background: radial-gradient(
            circle 300px at var(--mouse-x, -1000px) var(--mouse-y, -1000px),
            #ffffff 0%,
            #fff5b1 16%,
            #f9e785 32%,
            #d49b29 50%,
            #422e0a 68%,
            #080602 85%,
            #000000 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          filter: none;
          text-shadow: none;
          border: none;
          box-shadow: none;
        }

        /* -----------------------------------------------------------------
           TYPING TYPOGRAPHY: "LET'S START A" & "WORTHWHILE \n BUILD"
           - Positioned behind right glass block (z-index: 3 vs glass z-index: 10)
           - Aligned cleanly from left margin
           - Big, premium serif font 'Roboto Slab' shared identically across both sentences
           - Line 1 ("Let's start a"): Crisp pure solid white, enlarged commanding size
           - Line 2 ("Worthwhile \n Build"): Neutral chrome silver tone (#737373)
           ----------------------------------------------------------------- */
        .typing-text-wrapper {
          position: absolute;
          left: clamp(4px, 0.8vw, 12px);
          z-index: 3;
          font-family: 'Roboto Slab', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, serif;
          font-weight: 700;
          letter-spacing: -0.01em;
          line-height: 1.08;
          text-transform: none;
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
        }

        .typing-text-top {
          top: clamp(65px, 13.5vh, 130px);
          display: inline-flex;
          align-items: baseline;
          font-family: 'Roboto Slab', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, serif;
          font-size: clamp(2.9rem, 6.2vw, 6.6rem);
          font-weight: 700;
        }

        .typing-text-bottom {
          top: calc(50% + clamp(130px, 21vh, 215px));
          font-family: 'Roboto Slab', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, serif;
          font-size: clamp(2.3rem, 5.0vw, 5.4rem);
          font-weight: 700;
        }

        .typing-multiline {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: clamp(12px, 2.2vh, 24px);
        }

        .typing-line {
          display: inline-flex;
          align-items: baseline;
          line-height: 1.05;
        }

        /* Line 1: "Let's start a" - Normal solid crisp white color */
        .typing-text-white {
          display: inline-block;
          color: #ffffff;
          -webkit-text-fill-color: #ffffff;
          filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.85));
        }

        /* Line 2: "Worthwhile \n Build" - Matches "Let's compile it." font color (#737373 / neutral chrome silver) without reflection animation */
        .typing-text-compile {
          display: inline-block;
          color: #737373;
          -webkit-text-fill-color: #737373;
          filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.85));
        }

        /* Blinking Typing Cursor: Matches "Let's compile it." chrome silver color (#737373) */
        .typing-cursor {
          display: inline-block;
          margin-left: clamp(2px, 0.3vw, 6px);
          color: #737373;
          -webkit-text-fill-color: #737373;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-weight: 200;
          font-size: 0.95em;
          line-height: 1;
          vertical-align: baseline;
          animation: cursorBlink 0.85s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes cursorBlink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        /* 3D Robot Character Stage (Positioned precisely at user-marked bottom-right area) */
        .robot-card-stage {
          position: absolute;
          right: var(--robot-right, -35px);
          bottom: var(--robot-bottom, -15px);
          width: var(--robot-width, 220px);
          height: var(--robot-height, 240px);
          z-index: 25;
          pointer-events: none;
          user-select: none;
        }

        .robot-canvas-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.75s cubic-bezier(0.16, 1, 0.3, 1),
                      filter 0.65s ease-out;
          will-change: opacity, transform, filter;
        }

        .robot-stage-hidden .robot-canvas-wrapper {
          opacity: 0;
          visibility: hidden;
          transform: scale(0.65) translateY(28px);
          filter: blur(10px) brightness(1.5);
          pointer-events: none;
        }

        .robot-stage-revealed .robot-canvas-wrapper {
          opacity: 1;
          visibility: visible;
          transform: scale(1) translateY(0);
          filter: blur(0px) brightness(1);
          pointer-events: auto;
        }

        :global(.smoke-burst-canvas) {
          position: absolute;
          left: 50%;
          bottom: -25px;
          transform: translateX(-50%);
          width: 380px;
          height: 380px;
          pointer-events: none;
          z-index: 30;
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
          overflow: visible;
        }

        /* Right Block: left edge locked at (50% + gap/2); right edge set by --glass-right */
        .glass-block-right {
          left: calc(50% + var(--glass-gap, 2px) / 2);
          right: var(--glass-right, 20px);
          border-top-left-radius: var(--glass-inner-radius, 0px);
          border-bottom-left-radius: var(--glass-inner-radius, 0px);
          border-top-right-radius: var(--glass-outer-radius, 20px);
          border-bottom-right-radius: var(--glass-outer-radius, 20px);
          pointer-events: auto;
          user-select: auto;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </section>
  );
}
