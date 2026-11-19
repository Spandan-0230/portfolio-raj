"use client";

import React, { useEffect, useRef, useState } from "react";

const INITIAL_LANGUAGES = [
  "Kotlin",
  "TypeScript",
  "C#",
  "Python",
  "JavaScript",
  "HTML",
  "CSS",
  "PowerShell",
];

// High-fidelity custom inline SVGs for zero-latency core languages
function CoreLanguageSvg({ name, size = 44 }: { name: string; size?: number }) {
  const norm = name.trim().toLowerCase();

  if (norm === "kotlin") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M24 24H0V0h24L12 12Z" fill="url(#kt-grad)" />
        <defs>
          <linearGradient id="kt-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7F52FF" />
            <stop offset="50%" stopColor="#C711E1" />
            <stop offset="100%" stopColor="#E4485D" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm === "typescript") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#3178C6" />
        <path
          d="M11.5 8.5H5v2.3h2.3v7.2h2.5v-7.2h2.3V8.5zM13.8 14.7c.6.5 1.5.8 2.3.8 1 0 1.5-.4 1.5-1 0-.6-.5-.9-1.7-1.4-1.8-.7-2.9-1.6-2.9-3.2 0-1.8 1.4-3.1 3.7-3.1 1.4 0 2.5.4 3.2.9l-.7 2.1c-.6-.4-1.4-.7-2.3-.7-.9 0-1.4.4-1.4.9 0 .6.6.9 1.8 1.4 1.9.7 2.8 1.7 2.8 3.3 0 1.9-1.5 3.3-4 3.3-1.6 0-3-.5-3.8-1.1l.7-2.2z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  if (norm === "c#" || norm === "csharp") {
    return (
      <svg width={size} height={size} viewBox="0 0 128 128">
        <path
          fill="#9B4F96"
          d="M115.4 30.7L67.1 2.9c-1.9-1.1-4.3-1.1-6.2 0L12.6 30.7c-1.9 1.1-3.1 3.2-3.1 5.4v55.8c0 2.2 1.2 4.3 3.1 5.4l48.3 27.9c1 0.5 2.1 0.8 3.1 0.8s2.2-0.3 3.1-0.8l48.3-27.9c1.9-1.1 3.1-3.2 3.1-5.4V36.1c0-2.2-1.2-4.3-3.1-5.4z"
        />
        <path
          fill="#ffffff"
          d="M66.5 78.4c-2.4 2.8-5.7 4.9-9.5 6.1-4 1.2-8.3 1.4-12.7 0.5-4.4-1-8.3-3.1-11.4-6.3-3.2-3.2-5.4-7.2-6.5-11.7-1.1-4.5-0.9-9.1 0.5-13.4 1.4-4.2 3.9-7.8 7.3-10.4 3.4-2.6 7.4-4.2 11.7-4.6 4.3-0.4 8.7 0.3 12.6 2.1 3.4 1.6 6.3 4 8.5 7l-7.3 6.1c-1.6-1.9-3.5-3.3-5.8-4.2-2.3-0.9-4.8-1.1-7.2-0.6-2.5 0.5-4.7 1.7-6.5 3.5-1.9 1.8-3.1 4.1-3.7 6.6-0.6 2.5-0.5 5.1 0.3 7.6 0.8 2.4 2.2 4.6 4.1 6.2 2 1.6 4.3 2.5 6.8 2.8 2.5 0.3 5.1-0.2 7.4-1.3 1.9-0.9 3.5-2.2 4.8-3.9l8.6 5.6zM88.7 60.1l1.5-6.6h-5.2l1.5-6.6h-4.9l-1.5 6.6h-5.4l1.5-6.6h-4.9l-1.5 6.6h-4.7v4.6h4.1l-1.3 5.9h-4.5v4.6h3.9l-1.5 6.6h4.9l1.5-6.6h5.4l-1.5 6.6h4.9l1.5-6.6h4.7v-4.6h-4.1l1.3-5.9h4.5v-4.6h-4.1zm-8.8 5.9h-5.4l1.3-5.9h5.4l-1.3 5.9z"
        />
      </svg>
    );
  }

  if (norm === "python") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M11.87 2c-5.43 0-5.09 2.35-5.09 2.35l.01 2.43h5.18v.73H4.82S2 7.18 2 12.63c0 5.45 2.46 5.27 2.46 5.27h1.47v-2.06s-.08-2.46 2.41-2.46h5.13s2.33.04 2.33-2.3V5.44S16.14 2 11.87 2zm-2.73 1.54a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6z"
          fill="#3776AB"
        />
        <path
          d="M12.13 22c5.43 0 5.09-2.35 5.09-2.35l-.01-2.43h-5.18v-.73h7.15S22 16.82 22 11.37c0-5.45-2.46-5.27-2.46-5.27h-1.47v2.06s.08 2.46-2.41 2.46h-5.13s-2.33-.04-2.33 2.3v5.64S7.86 22 12.13 22zm2.73-1.54a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6z"
          fill="#FFD438"
        />
      </svg>
    );
  }

  if (norm === "javascript") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width={size} height={size} rx="4" fill="#F7DF1E" />
        <path
          d="M6.2 17.5l2-.7c.4.7.7 1.2 1.4 1.2.7 0 1.2-.3 1.2-1.3v-6.9h2.5v7c0 2.2-1.3 3.2-3.4 3.2-1.7 0-2.8-.9-3.7-2.5zm8.4-.2l2-.7c.5.8 1.2 1.4 2.2 1.4 1 0 1.6-.5 1.6-1.2 0-.8-.7-1.1-1.9-1.6-1.7-.7-2.9-1.5-2.9-3.3 0-1.7 1.3-3 3.3-3 1.4 0 2.4.5 3.1 1.8l-1.9 1.2c-.4-.7-.8-1-1.3-1s-.9.4-.9.9c0 .6.4.9 1.4 1.3 2 .8 3.4 1.6 3.4 3.6 0 2.1-1.6 3.3-3.8 3.3-2.1 0-3.6-1.1-4.3-2.7z"
          fill="#000000"
        />
      </svg>
    );
  }

  if (norm === "html" || norm === "html5") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M3 2l1.6 18.2L12 22.4l7.4-2.2L21 2H3zm14.8 5.4h-9l.2 2.6h8.6l-.6 6.7-4.9 1.4-5-1.4-.3-3.6h2.4l.2 1.8 2.7.7 2.7-.7.3-3.1H6.6l-.7-7.8h12.2l-.3 3.4z"
          fill="#E34F26"
        />
      </svg>
    );
  }

  if (norm === "css" || norm === "css3") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M3 2l1.6 18.2L12 22.4l7.4-2.2L21 2H3zm14.9 5.5H8.8l.2 2.6h8.7l-.6 6.6-5 1.4-5.1-1.4-.3-3.6h2.4l.2 1.8 2.8.7 2.7-.7.3-3.1H6.6l-.7-7.8h12.3l-.3 3.5z"
          fill="#1572B6"
        />
      </svg>
    );
  }

  if (norm === "powershell") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width={size} height={size} rx="4" fill="#0A192F" stroke="#38BDF8" strokeWidth="1" />
        <path
          d="M6 8l4.5 4L6 16m6 1h6"
          stroke="#38BDF8"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return null;
}

// Universal Devicon Resolver for any current or future programming language
function getDeviconSlug(name: string): string {
  const customSlugs: Record<string, string> = {
    "c#": "csharp",
    "c++": "cplusplus",
    c: "c",
    html: "html5",
    css: "css3",
    powershell: "powershell",
    shell: "bash",
    bash: "bash",
    javascript: "javascript",
    typescript: "typescript",
    python: "python",
    kotlin: "kotlin",
    java: "java",
    go: "go",
    rust: "rust",
    swift: "swift",
    dart: "dart",
    php: "php",
    ruby: "ruby",
    sql: "mysql",
    vue: "vuejs",
    react: "react",
    jupyter: "jupyter",
    lua: "lua",
    r: "r",
    scala: "scala",
  };

  const key = name.trim().toLowerCase();
  return customSlugs[key] || key.replace(/[^a-z0-9]/g, "");
}

function LanguageIcon({ name, size = 44 }: { name: string; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const coreSvg = CoreLanguageSvg({ name, size });

  if (coreSvg) {
    return coreSvg;
  }

  const slug = getDeviconSlug(name);
  const deviconUrl = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`;

  if (imgError) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "8px",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: `${Math.round(size * 0.35)}px`,
          fontFamily: "ui-monospace, monospace",
          color: "#ffffff",
          fontWeight: 700,
        }}
      >
        &lt;/&gt;
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={deviconUrl}
      alt={name}
      width={size}
      height={size}
      onError={() => setImgError(true)}
      style={{ display: "block", width: `${size}px`, height: `${size}px`, objectFit: "contain" }}
    />
  );
}

export default function LanguageShowcase() {
  const [languages, setLanguages] = useState<string[]>(INITIAL_LANGUAGES);

  const trackRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ambientGlowRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);

  // Active Real-Time Fetching Engine: background polling + immediate sync on focus/visibility
  useEffect(() => {
    let isMounted = true;

    const fetchLiveLanguages = async () => {
      try {
        const res = await fetch(`/api/languages?_t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;

        if (Array.isArray(data?.languages) && data.languages.length > 0) {
          setLanguages(data.languages);
        }
      } catch {
        // Keeps fallback languages safely on transient failure
      }
    };

    // 1. Initial immediate live fetch
    fetchLiveLanguages();

    // 2. Active background sync polling (every 45 seconds)
    const intervalId = setInterval(fetchLiveLanguages, 45000);

    // 3. Instant sync whenever user returns to tab / focuses window
    const handleSync = () => {
      if (document.visibilityState === "visible") {
        fetchLiveLanguages();
      }
    };

    window.addEventListener("focus", handleSync);
    document.addEventListener("visibilitychange", handleSync);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener("focus", handleSync);
      document.removeEventListener("visibilitychange", handleSync);
    };
  }, []);

  // Scroll Animation Engine: Smooth RAF Lerp & Scroll-Driven Choreography
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onScroll = () => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const totalScrollable = track.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) {
        targetProgress.current = 1;
        return;
      }

      // rect.top is the distance from viewport top to top of the languages track
      // When track reaches viewport top (rect.top <= 0), it pins and scrubs progress 0..1
      const scrolledInTrack = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolledInTrack / totalScrollable));
      targetProgress.current = progress;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    let rafId: number;
    const LERP_FACTOR = 0.09;

    const loop = () => {
      if (prefersReducedMotion.matches) {
        currentProgress.current = 1;
      } else {
        const diff = targetProgress.current - currentProgress.current;
        if (Math.abs(diff) > 0.0004) {
          currentProgress.current += diff * LERP_FACTOR;
        } else {
          currentProgress.current = targetProgress.current;
        }
      }

      const p = currentProgress.current;
      const diffVelocity = targetProgress.current - currentProgress.current;

      // 1. Title Choreography (emerges immediately on landing)
      if (titleRef.current) {
        let tOp = 1, tTr = 0, tBl = 0;
        if (p < 0.05) {
          const t = Math.max(0, p / 0.05);
          tOp = 0.4 + t * 0.6;
          tTr = (1 - t) * 12;
          tBl = (1 - t) * 3;
        } else {
          tOp = 1;
          tTr = 0;
          tBl = 0;
        }
        titleRef.current.style.opacity = tOp.toFixed(3);
        titleRef.current.style.transform = `translateY(${tTr.toFixed(1)}px)`;
        titleRef.current.style.filter = `blur(${tBl.toFixed(1)}px)`;
      }

      // 2. Ambient Backlight Glow
      if (ambientGlowRef.current) {
        const glowOp = Math.min(1, Math.max(0.2, p / 0.15));
        ambientGlowRef.current.style.opacity = glowOp.toFixed(3);
      }

      // 3. Staggered Cascading 3D Floating Cards Choreography (Smoothly visible on landing)
      const numCards = languages.length;
      cardRefs.current.forEach((cardEl, idx) => {
        if (!cardEl) return;

        // Individual staggered timing slice for each card starting immediately
        const cardStart = 0.02 + (idx / numCards) * 0.20;
        const cardDuration = 0.22;
        const cardEnd = cardStart + cardDuration;

        let cOp = 0, cTr = 65, cScale = 0.84, cBl = 10;

        if (p <= cardStart) {
          cOp = 0;
          cTr = 65;
          cScale = 0.84;
          cBl = 10;
        } else if (p < cardEnd) {
          const raw = (p - cardStart) / cardDuration;
          // Smooth cubic-out easing
          const eased = 1 - Math.pow(1 - raw, 3);
          cOp = raw;
          cTr = (1 - eased) * 65;
          cScale = 0.84 + eased * 0.16;
          cBl = (1 - raw) * 10;
        } else {
          cOp = 1;
          cTr = 0;
          cScale = 1;
          cBl = 0;
        }

        // Add delicate zero-gravity floating inertia during active scroll
        const floatingInertia = diffVelocity * (idx % 2 === 0 ? 30 : -20);
        const finalTr = cTr + floatingInertia;

        cardEl.style.opacity = cOp.toFixed(3);
        cardEl.style.transform = `translateY(${finalTr.toFixed(1)}px) scale(${cScale.toFixed(3)})`;
        cardEl.style.filter = `blur(${cBl.toFixed(1)}px)`;
      });

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [languages]);

  return (
    <section
      ref={trackRef}
      id="languages"
      style={{
        position: "relative",
        width: "100%",
        height: "200vh", // Scroll track providing smooth scrubbing distance
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
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: "calc(var(--margin-pillar-width, clamp(48px, 6.5vw, 102px)) + 24px)",
          paddingRight: "calc(var(--margin-pillar-width, clamp(48px, 6.5vw, 102px)) + 24px)",
          paddingTop: "0",
          paddingBottom: "0",
          backgroundColor: "#000000",
          boxSizing: "border-box",
        }}
      >
        {/* =========================================================================
            CINEMATIC LIGHTING & TEXTURE LAYERS (Matching Page 3 & Stage 4)
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

        {/* Subtle Ambient Radial Backlight */}
        <div
          ref={ambientGlowRef}
          className="ambient-glow"
          style={{
            position: "absolute",
            top: "25%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "800px",
            height: "400px",
            background:
              "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0) 70%)",
            pointerEvents: "none",
            borderRadius: "50%",
            opacity: 0,
            zIndex: 3,
          }}
        />

        {/* Section Header */}
        <div
          style={{
            maxWidth: "880px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "14px",
            position: "relative",
            zIndex: 10,
            marginBottom: "46px",
          }}
        >
          {/* Cinematic Title with Scroll-Driven Entrance */}
          <h2
            ref={titleRef}
            style={{
              margin: 0,
              fontFamily: "'HeroAlphabet', 'HeroOrbitron', sans-serif",
              fontSize: "clamp(1.9rem, 4.2vw, 4.5rem)",
              fontWeight: 800,
              letterSpacing: "0.1em",
              lineHeight: 1.12,
              textTransform: "uppercase",
              backgroundImage:
                "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 40%, #E2E8F0 75%, #94A3B8 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
              filter: "drop-shadow(0 2px 14px rgba(0, 0, 0, 0.9))",
              opacity: 0,
              transform: "translateY(35px)",
            }}
          >
            Languages used Across Repositories
          </h2>
        </div>

        {/* Perfectly Symmetrical Grid of Floating Squares */}
        <div className="languages-grid">
          {languages.map((lang, idx) => (
            <div
              key={lang}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              className="lang-square-card"
            >
              {/* White loading border beam - active ONLY on hover */}
              <div className="border-beam" />

              {/* Inner Card Face */}
              <div className="card-face">
                {/* Large Centered Icon */}
                <div className="icon-wrap">
                  <LanguageIcon name={lang} size={44} />
                </div>

                {/* Text Label Below */}
                <span className="lang-label">{lang}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Symmetrical Layout, Hover Border Beam & Floating Physics Styles */}
      <style jsx>{`
        /* Auto-Symmetrical Adaptive Layout */
        .languages-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 16px;
          max-width: 1100px;
          width: 100%;
          position: relative;
          z-index: 10;
          margin: 0 auto;
        }

        @media (max-width: 619px) {
          .languages-grid {
            gap: 12px;
            max-width: 320px;
          }
        }

        /* Floating Square Card */
        .lang-square-card {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 18px;
          overflow: hidden;
          padding: 1.5px; /* Creates the crisp border channel */
          background: rgba(255, 255, 255, 0.08);
          box-sizing: border-box;
          cursor: url('/cursor.png') 0 0, pointer;
          user-select: none;
          flex-shrink: 0;
          box-shadow: 0 12px 28px -4px rgba(0, 0, 0, 0.75);

          /* Initial un-scrolled hidden state (driven directly by scroll RAF loop) */
          opacity: 0;
          transform: translateY(65px) scale(0.84);
          filter: blur(10px);
          will-change: transform, opacity, filter;

          /* Hover lift transition */
          transition: box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1),
            background 0.3s ease;
        }

        @media (max-width: 619px) {
          .lang-square-card {
            width: 110px;
            height: 110px;
            border-radius: 16px;
          }
        }

        /* Hover: Elevated floating lift with crisp white border accent (Zero cloudy glow) */
        .lang-square-card:hover {
          transform: translateY(-8px) scale(1.04) !important;
          box-shadow: 0 20px 40px -4px rgba(0, 0, 0, 0.95),
            0 0 0 1px rgba(255, 255, 255, 0.22) !important;
          background: rgba(255, 255, 255, 0.2) !important;
        }

        /* Loading Beam across border: only visible and animated on hover */
        .border-beam {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 65deg,
            rgba(255, 255, 255, 0.25) 85deg,
            #ffffff 100deg,
            rgba(255, 255, 255, 0.25) 115deg,
            transparent 135deg,
            transparent 360deg
          );
          animation: spin-beam 2.2s linear infinite;
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
          z-index: 0;
        }

        .lang-square-card:hover .border-beam {
          opacity: 1;
        }

        @keyframes spin-beam {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Inner Card Face */
        .card-face {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          border-radius: 16.5px;
          background-color: #08080a;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 8px;
          box-sizing: border-box;
          transition: background-color 0.3s ease;
        }

        .lang-square-card:hover .card-face {
          background-color: #0e0e12;
        }

        /* Large Centered Icon Wrapper */
        .icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .lang-square-card:hover .icon-wrap {
          transform: scale(1.08);
        }

        /* Clean Chamfered Text Label Below */
        .lang-label {
          font-family: "HeroAlphabet", "HeroOrbitron", sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #e2e8f0;
          text-align: center;
          line-height: 1.2;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 0.3s ease;
        }

        .lang-square-card:hover .lang-label {
          color: #ffffff;
        }
      `}</style>
    </section>
  );
}
