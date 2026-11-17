"use client";

import { useEffect, useRef } from "react";

export default function ScrollPrompt() {
  const welcomeRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcomeEl = welcomeRef.current;
    const promptEl = promptRef.current;
    if (!welcomeEl && !promptEl) return;

    // Direct, zero-rerender scroll detection for maximum 120fps efficiency
    const updateVisibility = () => {
      const isScrolled = window.scrollY > 8;
      if (isScrolled) {
        if (welcomeEl && !welcomeEl.classList.contains("hidden")) {
          welcomeEl.classList.add("hidden");
        }
        if (promptEl && !promptEl.classList.contains("hidden")) {
          promptEl.classList.add("hidden");
        }
      } else {
        if (welcomeEl && welcomeEl.classList.contains("hidden")) {
          welcomeEl.classList.remove("hidden");
        }
        if (promptEl && promptEl.classList.contains("hidden")) {
          promptEl.classList.remove("hidden");
        }
      }
    };

    // Wheel event to remove instantly on the very first flick
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        if (welcomeEl && !welcomeEl.classList.contains("hidden")) {
          welcomeEl.classList.add("hidden");
        }
        if (promptEl && !promptEl.classList.contains("hidden")) {
          promptEl.classList.add("hidden");
        }
      } else if (window.scrollY <= 8) {
        updateVisibility();
      }
    };

    // Touchmove listener for mobile users
    const onTouchMove = () => {
      updateVisibility();
    };

    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // Initial check on mount (e.g. if page reloaded partway down)
    updateVisibility();

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  const handleClick = () => {
    // Smoothly initiate scroll to kick off the hero sequence
    window.scrollTo({
      top: window.innerHeight * 0.75,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* =========================================================================
          CENTER "WELCOME" TEXT WITH DIAGONAL CHROME REFLECTION
          ========================================================================= */}
      <div
        ref={welcomeRef}
        onClick={handleClick}
        className="welcome-container"
        role="button"
        tabIndex={0}
        aria-label="Welcome - click or scroll to explore"
      >
        <h1 className="welcome-text">Welcome</h1>
      </div>

      {/* =========================================================================
          BOTTOM "SCROLL TO EXPLORE" WITH MATCHING DIAGONAL REFLECTION & GLOWING LINE
          ========================================================================= */}
      <div
        ref={promptRef}
        onClick={handleClick}
        className="scroll-explore-prompt"
        role="button"
        tabIndex={0}
        aria-label="Scroll to explore"
      >
        <span className="scroll-explore-text">SCROLL TO EXPLORE</span>
        <div className="scroll-explore-track">
          <span className="scroll-explore-runner" />
        </div>
      </div>

      <style jsx>{`
        /* -----------------------------------------------------------------
           CENTER "WELCOME" CONTAINER & TEXT
           ----------------------------------------------------------------- */
        .welcome-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          z-index: 35;
          cursor: url('/cursor.png') 0 0, pointer;
          user-select: none;
          opacity: 1;
          visibility: visible;
          filter: blur(0px);
          transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
            filter 0.45s cubic-bezier(0.16, 1, 0.3, 1),
            visibility 0.45s;
          will-change: opacity, transform, filter;
          pointer-events: auto;
        }

        .welcome-container.hidden {
          opacity: 0;
          transform: translate(-50%, calc(-50% - 16px));
          filter: blur(8px);
          visibility: hidden;
          pointer-events: none;
        }

        .welcome-text {
          margin: 0;
          font-family: 'HeroAlphabet', 'HeroOrbitron', sans-serif;
          font-size: clamp(3.2rem, 7.6vw, 6.2rem);
          font-weight: 800;
          letter-spacing: 0.14em;
          line-height: 1.08;
          text-align: center;
          text-transform: uppercase;

          /* High-Contrast Diagonal Chrome Reflective Sheen Sweep (Continuous Infinite Loop) */
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
          animation: diagonalReflect 2.6s linear infinite;

          transition: transform 0.25s ease, letter-spacing 0.25s ease;
        }

        .welcome-container:hover .welcome-text {
          transform: scale(1.02);
          letter-spacing: 0.16em;
        }

        /* -----------------------------------------------------------------
           BOTTOM "SCROLL TO EXPLORE" PROMPT
           ----------------------------------------------------------------- */
        .scroll-explore-prompt {
          position: absolute;
          bottom: 38px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          z-index: 35;
          cursor: url('/cursor.png') 0 0, pointer;
          user-select: none;
          opacity: 1;
          visibility: visible;
          filter: blur(0px);
          transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
            filter 0.4s cubic-bezier(0.16, 1, 0.3, 1),
            visibility 0.4s;
          will-change: opacity, transform, filter;
          pointer-events: auto;
        }

        .scroll-explore-prompt.hidden {
          opacity: 0;
          transform: translate(-50%, 14px);
          filter: blur(6px);
          visibility: hidden;
          pointer-events: none;
        }

        .scroll-explore-text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          white-space: nowrap;

          /* Matching Diagonal Reflective Sheen Sweep (Continuous Infinite Loop) */
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
          animation: diagonalReflect 2.6s linear infinite;

          transition: letter-spacing 0.25s ease;
          display: inline-block;
        }

        .scroll-explore-prompt:hover .scroll-explore-text {
          letter-spacing: 0.31em;
        }

        .scroll-explore-track {
          width: 1.5px;
          height: 32px;
          background: rgba(255, 255, 255, 0.18);
          border-radius: 2px;
          position: relative;
          overflow: hidden;
          transition: background 0.25s ease;
        }

        .scroll-explore-prompt:hover .scroll-explore-track {
          background: rgba(255, 255, 255, 0.35);
        }

        .scroll-explore-runner {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 14px;
          background: linear-gradient(
            180deg,
            #ffffff 0%,
            rgba(255, 255, 255, 0.2) 100%
          );
          box-shadow: none;
          border-radius: 2px;
          animation: scrollBeamDown 1.9s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }

        /* -----------------------------------------------------------------
           KEYFRAME ANIMATIONS
           ----------------------------------------------------------------- */
        /* Continuous, non-stopping diagonal reflection loop */
        @keyframes diagonalReflect {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Vertical indicator runner */
        @keyframes scrollBeamDown {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          75% {
            opacity: 1;
          }
          100% {
            transform: translateY(240%);
            opacity: 0;
          }
        }

        @media (max-width: 768px) {
          .welcome-text {
            font-size: clamp(2.2rem, 8vw, 3.4rem);
            letter-spacing: 0.12em;
          }
          .scroll-explore-prompt {
            bottom: 28px;
            gap: 10px;
          }
          .scroll-explore-text {
            font-size: 10px;
            letter-spacing: 0.24em;
          }
          .scroll-explore-track {
            height: 26px;
          }
        }
      `}</style>
    </>
  );
}
