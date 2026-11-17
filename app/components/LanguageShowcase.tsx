"use client";

import React, { useEffect, useState } from "react";

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
function CoreLanguageSvg({ name }: { name: string }) {
  const norm = name.trim().toLowerCase();

  if (norm === "kotlin") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
      <svg width="24" height="24" viewBox="0 0 128 128">
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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#F7DF1E" />
        <path
          d="M6.2 17.5l2-.7c.4.7.7 1.2 1.4 1.2.7 0 1.2-.3 1.2-1.3v-6.9h2.5v7c0 2.2-1.3 3.2-3.4 3.2-1.7 0-2.8-.9-3.7-2.5zm8.4-.2l2-.7c.5.8 1.2 1.4 2.2 1.4 1 0 1.6-.5 1.6-1.2 0-.8-.7-1.1-1.9-1.6-1.7-.7-2.9-1.5-2.9-3.3 0-1.7 1.3-3 3.3-3 1.4 0 2.4.5 3.1 1.8l-1.9 1.2c-.4-.7-.8-1-1.3-1s-.9.4-.9.9c0 .6.4.9 1.4 1.3 2 .8 3.4 1.6 3.4 3.6 0 2.1-1.6 3.3-3.8 3.3-2.1 0-3.6-1.1-4.3-2.7z"
          fill="#000000"
        />
      </svg>
    );
  }

  if (norm === "html" || norm === "html5") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 2l1.6 18.2L12 22.4l7.4-2.2L21 2H3zm14.8 5.4h-9l.2 2.6h8.6l-.6 6.7-4.9 1.4-5-1.4-.3-3.6h2.4l.2 1.8 2.7.7 2.7-.7.3-3.1H6.6l-.7-7.8h12.2l-.3 3.4z"
          fill="#E34F26"
        />
      </svg>
    );
  }

  if (norm === "css" || norm === "css3") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 2l1.6 18.2L12 22.4l7.4-2.2L21 2H3zm14.9 5.5H8.8l.2 2.6h8.7l-.6 6.6-5 1.4-5.1-1.4-.3-3.6h2.4l.2 1.8 2.8.7 2.7-.7.3-3.1H6.6l-.7-7.8h12.3l-.3 3.5z"
          fill="#1572B6"
        />
      </svg>
    );
  }

  if (norm === "powershell") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#0A192F" stroke="#38BDF8" strokeWidth="1" />
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

function LanguageIcon({ name }: { name: string }) {
  const [imgError, setImgError] = useState(false);
  const coreSvg = CoreLanguageSvg({ name });

  if (coreSvg) {
    return coreSvg;
  }

  const slug = getDeviconSlug(name);
  const deviconUrl = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`;

  if (imgError) {
    return (
      <div
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "4px",
          backgroundColor: "rgba(56, 189, 248, 0.12)",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          fontFamily: "ui-monospace, monospace",
          color: "#38bdf8",
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
      width={24}
      height={24}
      onError={() => setImgError(true)}
      style={{ display: "block", objectFit: "contain" }}
    />
  );
}

export default function LanguageShowcase() {
  const [languages, setLanguages] = useState<string[]>(INITIAL_LANGUAGES);

  useEffect(() => {
    fetch("/api/languages")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.languages) && data.languages.length > 0) {
          setLanguages(data.languages);
        }
      })
      .catch(() => {
        // Keeps fallback languages safely on failure
      });
  }, []);

  return (
    <section
      id="languages"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "75vh",
        backgroundColor: "#000000",
        color: "#ffffff",
        zIndex: 20,
        boxSizing: "border-box",
        padding: "110px 24px 140px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Subtle Ambient Radial Backlight */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px",
          height: "400px",
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(56, 189, 248, 0.08) 0%, rgba(0, 0, 0, 0) 70%)",
          pointerEvents: "none",
          borderRadius: "50%",
        }}
      />

      {/* Header Container */}
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
          zIndex: 1,
          marginBottom: "52px",
        }}
      >
        {/* Cinematic Section Title */}
        <h2
          style={{
            margin: 0,
            fontFamily: "'HeroAlphabet', 'HeroOrbitron', sans-serif",
            fontSize: "clamp(2rem, 4.5vw, 5rem)",
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
          }}
        >
          Languages used Across Repositories
        </h2>


      </div>

      {/* Horizontal Languages Showcase - Pure Icon & Text */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "14px",
          maxWidth: "1080px",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {languages.map((lang) => (
          <div
            key={lang}
            className="lang-card"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 24px",
              borderRadius: "14px",
              backgroundColor: "rgba(255, 255, 255, 0.025)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(16px)",
              transition:
                "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.28s ease, box-shadow 0.28s ease, background-color 0.28s ease",
              cursor: "default",
              userSelect: "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                flexShrink: 0,
              }}
            >
              <LanguageIcon name={lang} />
            </div>

            <span
              style={{
                fontFamily: "'HeroAlphabet', 'HeroOrbitron', sans-serif",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#f8fafc",
              }}
            >
              {lang}
            </span>
          </div>
        ))}
      </div>

      {/* Interactive Micro-interaction Styles */}
      <style jsx>{`
        .lang-card:hover {
          transform: translateY(-4px);
          border-color: rgba(56, 189, 248, 0.45) !important;
          background-color: rgba(255, 255, 255, 0.05) !important;
          box-shadow: 0 10px 25px -5px rgba(56, 189, 248, 0.2),
            0 0 12px rgba(56, 189, 248, 0.15) !important;
        }
      `}</style>
    </section>
  );
}
