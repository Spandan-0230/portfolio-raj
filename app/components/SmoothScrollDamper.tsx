"use client";

import { useEffect, useRef } from "react";

interface Checkpoint {
  id: string;
  name: string;
  top: number;
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

    // Helper: calculate exact page boundaries (start & end of each page)
    const getPageCheckpoints = (): Checkpoint[] => {
      const winH = window.innerHeight;
      const checkpoints: Checkpoint[] = [];

      // Page 1: Hero (top = 0)
      checkpoints.push({ id: "hero-start", name: "Hero Start", top: 0 });

      const heroEl = document.getElementById("hero");
      if (heroEl) {
        const heroEnd = Math.max(0, heroEl.offsetHeight - winH);
        checkpoints.push({ id: "hero-end", name: "Hero End", top: heroEnd });
      }

      // Page 2: Languages
      const langEl = document.getElementById("languages");
      if (langEl) {
        const langStart = langEl.offsetTop;
        const langEnd = langStart + Math.max(0, langEl.offsetHeight - winH);
        checkpoints.push({ id: "languages-start", name: "Languages Start", top: langStart });
        checkpoints.push({ id: "languages-end", name: "Languages End", top: langEnd });
      }

      // Page 3: Activity
      const actEl = document.getElementById("activity");
      if (actEl) {
        const actStart = actEl.offsetTop;
        const actEnd = actStart + Math.max(0, actEl.offsetHeight - winH);
        checkpoints.push({ id: "activity-start", name: "Activity Start", top: actStart });
        checkpoints.push({ id: "activity-end", name: "Activity End", top: actEnd });
      }

      return checkpoints;
    };

    // Silent haptic feedback pulse (Web Vibration API - strictly soundless)
    const triggerHaptic = () => {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(12);
        } catch {
          // Ignore if unsupported or restricted by browser permissions
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastWheelTime.current);
      lastWheelTime.current = now;

      const deltaY = e.deltaY;
      const velocity = Math.abs(deltaY) / dt;
      const scrollY = window.scrollY;
      const winH = window.innerHeight;

      // Detection of fast acceleration: fast wheel flick or rapid momentum spin
      const isFastAcceleration = Math.abs(deltaY) > 55 || velocity > 0.85;

      // -----------------------------------------------------------------------
      // SMART KINETIC BRIDGE: Page 1 End -> Page 2 Transition Acceleration
      // If user is scrolling SLOWLY at the end of Page 1 into Page 2,
      // dynamically adjust the scroll speed so they never get stuck in black space.
      // -----------------------------------------------------------------------
      const heroEl = document.getElementById("hero");
      const langEl = document.getElementById("languages");
      if (heroEl && langEl) {
        const heroEnd = Math.max(0, heroEl.offsetHeight - winH);
        const langStart = langEl.offsetTop;

        // Transition zone at the end of Page 1 entering Page 2
        const transZoneStart = heroEnd - 320;
        const inTransitionZone = scrollY >= transZoneStart && scrollY < langStart + 15;

        if (inTransitionZone && deltaY > 0) {
          // If slow scroll detected in transition zone:
          if (!isFastAcceleration) {
            e.preventDefault();
            // If already within close approach (180px), smoothly glide straight into Page 2
            if (scrollY >= heroEnd - 180) {
              window.scrollTo({ top: langStart, behavior: "smooth" });
              triggerHaptic();
            } else {
              // Otherwise, boost the slow scroll step by 2.8x so user moves responsively
              const boosted = Math.max(Math.abs(deltaY) * 2.8, 85);
              window.scrollBy({ top: boosted, behavior: "auto" });
            }
            return;
          }
        }
      }

      // If user is scrolling gently elsewhere, let native or normal scrubbing proceed with 100% fine control
      if (!isFastAcceleration) {
        return;
      }

      const checkpoints = getPageCheckpoints();
      const ZONE_THRESHOLD = 110; // Trigger approach distance in pixels

      for (const cp of checkpoints) {
        const dist = cp.top - scrollY;

        // Check if accelerating towards this page boundary
        const isApproaching =
          (deltaY > 0 && dist > -35 && dist < ZONE_THRESHOLD) || // Scrolling down towards checkpoint
          (deltaY < 0 && dist < 35 && dist > -ZONE_THRESHOLD);   // Scrolling up towards checkpoint

        if (isApproaching) {
          // If already latched at this boundary: count extra scroll ticks
          if (latchState.current.checkpointId === cp.id) {
            latchState.current.ticks++;
            const elapsed = now - latchState.current.startTime;

            // Absorb 1-3 extra fast scroll ticks or hold for ~380ms so user absorbs page content
            if (latchState.current.ticks <= 3 && elapsed < 380) {
              e.preventDefault();
              window.scrollTo({ top: cp.top, behavior: "smooth" });
              return;
            } else {
              // Latch released! Allow fast acceleration to resume smoothly
              latchState.current.passedCheckpointId = cp.id;
              return;
            }
          } else if (latchState.current.passedCheckpointId !== cp.id) {
            // New page boundary encountered: ENGAGE SMOOTH DAMPING LATCH!
            e.preventDefault();
            latchState.current = {
              checkpointId: cp.id,
              passedCheckpointId: null,
              ticks: 1,
              startTime: now,
            };

            // Trigger silent tactile feedback
            triggerHaptic();

            // Smoothly dock and settle onto the page boundary
            window.scrollTo({ top: cp.top, behavior: "smooth" });
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
      }, 420);
    };

    // Attach wheel listener with passive: false to allow selective damping
    window.addEventListener("wheel", onWheel, { passive: false });

    // Touch momentum boundary observer for mobile tactile support
    let touchStartY = 0;
    let touchStartTime = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
        touchStartTime = performance.now();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 0) return;
      const touchEndY = e.changedTouches[0].clientY;
      const touchDuration = Math.max(1, performance.now() - touchStartTime);
      const touchDelta = touchStartY - touchEndY;
      const touchVelocity = Math.abs(touchDelta) / touchDuration;
      const scrollY = window.scrollY;

      // Check if user is scrolling near Page 1 end into Page 2
      const heroEl = document.getElementById("hero");
      const langEl = document.getElementById("languages");
      if (heroEl && langEl) {
        const heroEnd = Math.max(0, heroEl.offsetHeight - window.innerHeight);
        const langStart = langEl.offsetTop;

        // Assist slow touch drag downwards at the end of Page 1 into Page 2
        if (scrollY >= heroEnd - 260 && scrollY < langStart && touchDelta > 30) {
          window.scrollTo({ top: langStart, behavior: "smooth" });
          triggerHaptic();
          return;
        }
      }

      // High-velocity mobile flick
      if (touchVelocity > 0.8 && Math.abs(touchDelta) > 120) {
        const checkpoints = getPageCheckpoints();
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
