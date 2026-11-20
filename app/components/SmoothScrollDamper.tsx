"use client";

import { useEffect, useRef } from "react";
import { isBodyScrollLocked } from "../utils/scrollLock";

interface Checkpoint {
  id: string;
  name: string;
  top: number;
  pageIdx: number;
  type: "start" | "end";
}

interface PageInfo {
  id: string;
  name: string;
  start: number;
  end: number;
}

export default function SmoothScrollDamper() {
  const lastWheelTime = useRef<number>(0);
  const resetTimeout = useRef<NodeJS.Timeout | null>(null);

  const latchState = useRef<{
    checkpointId: string | null;
    passedCheckpointId: string | null;
    ticks: number;
    startTime: number;
  }>({
    checkpointId: null,
    passedCheckpointId: null,
    ticks: 0,
    startTime: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Helper: Discover exact real-time page boundaries for all 3 pages
    const getPages = (): PageInfo[] => {
      const winH = window.innerHeight;
      const pages: PageInfo[] = [];

      // Page 1: Hero
      const heroEl = document.getElementById("hero");
      if (heroEl) {
        const start = 0;
        const end = Math.max(0, heroEl.offsetHeight - winH);
        pages.push({ id: "hero", name: "Hero", start, end });
      }

      // Page 2: GitHub Activity
      const actEl = document.getElementById("activity");
      if (actEl) {
        const start = actEl.offsetTop;
        const end = start + Math.max(0, actEl.offsetHeight - winH);
        pages.push({ id: "activity", name: "Activity", start, end });
      }

      // Page 3: Works Showcase
      const worksEl = document.getElementById("works");
      if (worksEl) {
        const start = worksEl.offsetTop;
        const end = start + Math.max(0, worksEl.offsetHeight - winH);
        pages.push({ id: "works", name: "Works", start, end });
      }

      // Page 4: Stage Four Showcase
      const stage4El = document.getElementById("stage4");
      if (stage4El) {
        const start = stage4El.offsetTop;
        const end = start + Math.max(0, stage4El.offsetHeight - winH);
        pages.push({ id: "stage4", name: "Stage 4", start, end });
      }

      // Page 5: Languages Showcase
      const langEl = document.getElementById("languages");
      if (langEl) {
        const start = langEl.offsetTop;
        const end = start + Math.max(0, langEl.offsetHeight - winH);
        pages.push({ id: "languages", name: "Languages", start, end });
      }

      // Page 6: Interactive Character Head Tracking Showcase
      const charEl = document.getElementById("character");
      if (charEl) {
        const start = charEl.offsetTop;
        const end = start + Math.max(0, charEl.offsetHeight - winH);
        pages.push({ id: "character", name: "Character", start, end });
      }

      return pages;
    };

    // Helper: Compute sequential checkpoints for both start & end of each page
    const getPageCheckpoints = (pages: PageInfo[]): Checkpoint[] => {
      const checkpoints: Checkpoint[] = [];
      pages.forEach((p, pIdx) => {
        checkpoints.push({
          id: `${p.id}-start`,
          name: `${p.name} Start`,
          top: p.start,
          pageIdx: pIdx,
          type: "start",
        });
        checkpoints.push({
          id: `${p.id}-end`,
          name: `${p.name} End`,
          top: p.end,
          pageIdx: pIdx,
          type: "end",
        });
      });
      return checkpoints;
    };

    // Silent tactile haptic pulse (Web Vibration API - strictly soundless)
    const triggerHaptic = () => {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(12);
        } catch {
          // Ignore if unsupported or restricted by permissions
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      // CRITICAL: Do not intercept wheel events when body scroll is locked or if scrolling inside a modal/gallery
      if (isBodyScrollLocked() || document.body.style.overflow === "hidden") {
        return;
      }

      const target = e.target as HTMLElement | null;
      if (target?.closest?.('.biosync-gallery-backdrop, .ledger-gallery-backdrop, .pure-image-popup-backdrop, [role="dialog"]')) {
        return;
      }

      const now = performance.now();
      const dt = Math.max(1, now - lastWheelTime.current);
      lastWheelTime.current = now;

      const deltaY = e.deltaY;
      const velocity = Math.abs(deltaY) / dt;
      const scrollY = window.scrollY;

      // Detection of fast acceleration: rapid wheel flick or high-velocity spin
      const isFastAcceleration = Math.abs(deltaY) > 65 || velocity > 1.0;

      // CRITICAL: Normal/gentle scrolling is 100% untouched native scrolling.
      // NEVER call preventDefault or interfere with normal reading/browsing.
      // This eliminates all stickiness, sluggishness, and artificial lag.
      if (!isFastAcceleration) {
        if (latchState.current.checkpointId) {
          latchState.current.checkpointId = null;
        }
        return;
      }

      const pages = getPages();
      if (pages.length === 0) return;
      const checkpoints = getPageCheckpoints(pages);

      // =======================================================================
      // FAST-ACCELERATION BOUNDARY LATCH (START & END OF EACH PAGE)
      // Only engages on fast acceleration to catch the user so they do not skip
      // entire pages on aggressive flick/spin. Absorbs 1-2 extra rapid ticks
      // (~180ms) with tactile haptic feedback, then releases immediately.
      // =======================================================================
      const ZONE_THRESHOLD = 110;

      for (const cp of checkpoints) {
        const dist = cp.top - scrollY;

        // Direction-aware approach test
        const isApproaching =
          (deltaY > 0 && dist > -25 && dist < ZONE_THRESHOLD) || // Scrolling down towards boundary
          (deltaY < 0 && dist < 25 && dist > -ZONE_THRESHOLD);   // Scrolling up towards boundary

        if (isApproaching) {
          // Already latched at this boundary: count ticks and hold for 1-2 rapid ticks
          if (latchState.current.checkpointId === cp.id) {
            latchState.current.ticks++;
            const elapsed = now - latchState.current.startTime;
            const maxTicks = 2; // "cost 1-3 extra scrolls"
            const maxDuration = 180; // "stop for a milli or a sec" (~180ms)

            if (latchState.current.ticks <= maxTicks && elapsed < maxDuration) {
              e.preventDefault();
              window.scrollTo({ top: cp.top, behavior: "instant" as ScrollBehavior });
              return;
            } else {
              // Latch satisfied & released! Smooth scroll resumes immediately into page
              latchState.current.passedCheckpointId = cp.id;
              latchState.current.checkpointId = null;
              return;
            }
          } else if (latchState.current.passedCheckpointId !== cp.id) {
            // New page boundary encountered on fast acceleration: ENGAGE LANDING LATCH!
            e.preventDefault();
            latchState.current = {
              checkpointId: cp.id,
              passedCheckpointId: null,
              ticks: 1,
              startTime: now,
            };

            triggerHaptic();
            window.scrollTo({ top: cp.top, behavior: "instant" as ScrollBehavior });
            return;
          }
        }
      }

      // Auto-reset latch state after scroll settles
      if (resetTimeout.current) {
        clearTimeout(resetTimeout.current);
      }
      resetTimeout.current = setTimeout(() => {
        latchState.current = {
          checkpointId: null,
          passedCheckpointId: null,
          ticks: 0,
          startTime: 0,
        };
      }, 180);
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    // Touch momentum boundary observer for mobile tactile support
    let touchStartY = 0;
    let touchStartTime = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (isBodyScrollLocked() || document.body.style.overflow === "hidden") return;
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
        touchStartTime = performance.now();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (isBodyScrollLocked() || document.body.style.overflow === "hidden") return;
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('.biosync-gallery-backdrop, .ledger-gallery-backdrop, .pure-image-popup-backdrop, [role="dialog"]')) {
        return;
      }
      if (e.changedTouches.length === 0) return;
      const touchEndY = e.changedTouches[0].clientY;
      const touchDuration = Math.max(1, performance.now() - touchStartTime);
      const touchDelta = touchStartY - touchEndY;
      const touchVelocity = Math.abs(touchDelta) / touchDuration;
      const scrollY = window.scrollY;

      const pages = getPages();
      if (pages.length === 0) return;

      // Touch drag assistance across inter-page gaps
      for (let i = 0; i < pages.length - 1; i++) {
        const currPage = pages[i];
        const nextPage = pages[i + 1];

        // Dragging down near end of page into next page
        if (touchDelta > 30 && scrollY >= currPage.end - 160 && scrollY < nextPage.start) {
          window.scrollTo({ top: nextPage.start, behavior: "smooth" });
          triggerHaptic();
          return;
        }

        // Dragging up near start of page into previous page
        if (touchDelta < -30 && scrollY <= nextPage.start + 160 && scrollY > currPage.end) {
          window.scrollTo({ top: currPage.end, behavior: "smooth" });
          triggerHaptic();
          return;
        }
      }

      // High-velocity mobile flick haptics at checkpoints
      if (touchVelocity > 0.8 && Math.abs(touchDelta) > 120) {
        const checkpoints = getPageCheckpoints(pages);
        for (const cp of checkpoints) {
          if (Math.abs(cp.top - scrollY) < 140) {
            triggerHaptic();
            break;
          }
        }
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      if (resetTimeout.current) {
        clearTimeout(resetTimeout.current);
      }
    };
  }, []);

  return null; // Logic-only controller, zero visual footprint
}
