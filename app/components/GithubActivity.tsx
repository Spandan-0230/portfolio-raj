"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface UserProfile {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  publicRepos: number;
  followers: number;
  following: number;
  joinedDate?: string;
  email?: string;
}

export interface YearContributionData {
  year: number;
  total: number;
  contributions: ContributionDay[];
}

const DEFAULT_PROFILE: UserProfile = {
  username: "Spandan-0230",
  name: "Spandan Bole",
  avatarUrl: "https://avatars.githubusercontent.com/u/347005203?v=4",
  bio: "Student · Software Developer\nAI Engineer",
  publicRepos: 7,
  followers: 3,
  following: 2,
  joinedDate: "Joined last month",
  email: "spandanbole777@gmail.com",
};

export default function GithubActivity() {
  const currentCalendarYear = new Date().getFullYear();

  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [totalCount, setTotalCount] = useState<number>(84);

  // Year-wise dynamic states
  const [years, setYears] = useState<number[]>([currentCalendarYear]);
  const [selectedYear, setSelectedYear] = useState<number>(currentCalendarYear);
  const [yearData, setYearData] = useState<Record<number, YearContributionData>>({});

  const [hoveredDay, setHoveredDay] = useState<{
    day: ContributionDay;
    x: number;
    y: number;
  } | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const ambientGlowRef = useRef<HTMLDivElement>(null);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);

  // 1. Active Real-Time Fetching Engine: background polling + immediate sync on focus/visibility
  useEffect(() => {
    let isMounted = true;

    const fetchLiveContributions = async () => {
      try {
        const res = await fetch(`/api/contributions?_t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;

        if (data?.profile) {
          setProfile((prev) => ({
            ...prev,
            ...data.profile,
          }));
        }

        if (Array.isArray(data?.years) && data.years.length > 0) {
          setYears(data.years);
          setSelectedYear((prev) =>
            data.years.includes(prev) ? prev : data.years[data.years.length - 1]
          );
        }

        if (data?.yearData && typeof data.yearData === "object") {
          setYearData(data.yearData);
        }

        if (Array.isArray(data?.contributions) && data.contributions.length > 0) {
          setContributions(data.contributions);
          setTotalCount(data.total ?? 84);
        }
      } catch {
        // Keep current state on transient network blip
      }
    };

    // Initial immediate live fetch
    fetchLiveContributions();

    // Active background sync polling (every 30 seconds)
    const intervalId = setInterval(fetchLiveContributions, 30000);

    // Instant sync whenever user returns to tab / focuses window
    const handleSync = () => {
      if (document.visibilityState === "visible") {
        fetchLiveContributions();
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

  // 2. Cinematic Scroll Animation Engine: Smooth RAF Lerp & Scroll-Driven Choreography
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

      // Scrub progress 0..1 across the pinned scroll track
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

      // 1. Header Choreography (emerges smoothly from 0.02 to 0.32)
      if (headerRef.current) {
        let hOp = 0, hTr = 35, hBl = 8;
        if (p <= 0.02) {
          hOp = 0;
          hTr = 35;
          hBl = 8;
        } else if (p < 0.32) {
          const t = (p - 0.02) / 0.30;
          hOp = t;
          hTr = (1 - t) * 35;
          hBl = (1 - t) * 8;
        } else {
          hOp = 1;
          hTr = 0;
          hBl = 0;
        }
        headerRef.current.style.opacity = hOp.toFixed(3);
        headerRef.current.style.transform = `translateY(${hTr.toFixed(1)}px)`;
        headerRef.current.style.filter = `blur(${hBl.toFixed(1)}px)`;
      }

      // 2. Ambient Backlight Glow (0.01 to 0.35)
      if (ambientGlowRef.current) {
        const glowOp = Math.min(1, Math.max(0, (p - 0.01) / 0.35));
        ambientGlowRef.current.style.opacity = glowOp.toFixed(3);
      }

      // 3. Unified Card Choreography (0.12 to 0.58)
      if (cardRef.current) {
        let cOp = 0, cTr = 55, cScale = 0.88, cBl = 10;
        if (p <= 0.12) {
          cOp = 0;
          cTr = 55;
          cScale = 0.88;
          cBl = 10;
        } else if (p < 0.58) {
          const raw = (p - 0.12) / 0.46;
          const eased = 1 - Math.pow(1 - raw, 3);
          cOp = raw;
          cTr = (1 - eased) * 55;
          cScale = 0.88 + eased * 0.12;
          cBl = (1 - raw) * 10;
        } else {
          cOp = 1;
          cTr = 0;
          cScale = 1;
          cBl = 0;
        }

        const floatingInertia = diffVelocity * 28;
        const finalTr = cTr + floatingInertia;

        cardRef.current.style.opacity = cOp.toFixed(3);
        cardRef.current.style.transform = `translateY(${finalTr.toFixed(1)}px) scale(${cScale.toFixed(3)})`;
        cardRef.current.style.filter = `blur(${cBl.toFixed(1)}px)`;
      }

      // 4. Sub-footer Choreography (0.35 to 0.75)
      if (footerRef.current) {
        let fOp = 0, fTr = 20;
        if (p <= 0.35) {
          fOp = 0;
          fTr = 20;
        } else if (p < 0.75) {
          const t = (p - 0.35) / 0.40;
          fOp = t;
          fTr = (1 - t) * 20;
        } else {
          fOp = 1;
          fTr = 0;
        }
        footerRef.current.style.opacity = fOp.toFixed(3);
        footerRef.current.style.transform = `translateY(${fTr.toFixed(1)}px)`;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Compute active year's data
  const activeYearData = yearData[selectedYear];
  const activeTotal =
    typeof activeYearData?.total === "number" ? activeYearData.total : totalCount;
  const activeContributions =
    activeYearData?.contributions && activeYearData.contributions.length > 0
      ? activeYearData.contributions
      : contributions;

  // SVG grid metrics for 100% fluid vector scaling with ZERO horizontal scroll
  const SQUARE_SIZE = 11;
  const GAP = 3;
  const PITCH = SQUARE_SIZE + GAP; // 14px
  const LABEL_WIDTH = 30;
  const ROW_START = 20;

  // Group active contributions into 53 weeks (7 rows each: Sun=0 to Sat=6)
  const { weeks, monthLabels } = useMemo(() => {
    if (!activeContributions.length) {
      return { weeks: [], monthLabels: [] };
    }

    const weeksArr: (ContributionDay | null)[][] = [];
    let currentWeek: (ContributionDay | null)[] = [];

    // Pad leading days of the first week
    const firstDate = new Date(activeContributions[0].date);
    const startDayOfWeek = firstDate.getUTCDay(); // 0 = Sunday
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null);
    }

    activeContributions.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeksArr.push(currentWeek);
    }

    // Determine month labels with pixel-perfect column positions
    const months: { label: string; x: number }[] = [];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    let lastMonth = -1;
    weeksArr.forEach((week, wIdx) => {
      const validDay = week.find((d) => d !== null);
      if (validDay) {
        const dObj = new Date(validDay.date);
        const m = dObj.getUTCMonth();
        if (m !== lastMonth) {
          months.push({
            label: monthNames[m],
            x: LABEL_WIDTH + wIdx * PITCH,
          });
          lastMonth = m;
        }
      }
    });

    return { weeks: weeksArr, monthLabels: months };
  }, [activeContributions, PITCH, LABEL_WIDTH]);

  // Color mapper for GitHub activity levels
  const getLevelColor = (level: number, count: number) => {
    if (count === 0 || level === 0) return "#161720"; // Subtle dark obsidian
    if (level === 1) return "#0e4429"; // Deep emerald
    if (level === 2) return "#006d32"; // Medium emerald
    if (level === 3) return "#26a641"; // Bright emerald
    return "#39d353"; // Level 4 - vivid neon green
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const SVG_WIDTH = LABEL_WIDTH + weeks.length * PITCH + 6;
  const SVG_HEIGHT = ROW_START + 7 * PITCH + 2;

  return (
    <section
      ref={trackRef}
      id="activity"
      style={{
        position: "relative",
        width: "100%",
        height: "200vh", // Scrubbing distance matching LanguageShowcase
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
          padding: "0 24px",
          boxSizing: "border-box",
        }}
      >
        {/* Subtle Ambient Radial Backlight */}
        <div
          ref={ambientGlowRef}
          className="ambient-glow"
          style={{
            position: "absolute",
            top: "28%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "900px",
            height: "450px",
            background:
              "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(57, 211, 83, 0.08) 0%, rgba(255, 255, 255, 0.04) 40%, rgba(0, 0, 0, 0) 70%)",
            pointerEvents: "none",
            borderRadius: "50%",
            opacity: 0,
          }}
        />

        <div
          className="activity-wrapper"
          style={{
            maxWidth: "1160px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "28px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* =========================================================================
              1. SECTION HEADER (Fully Centered with Hero Typography)
              ========================================================================= */}
          <div ref={headerRef} className="section-header">
            <h2 className="main-title">Activity Graph</h2>
            <p className="subtitle-text">The Developer's Journey</p>
          </div>

          {/* =========================================================================
              2. UNIFIED OBSIDIAN ACTIVITY CARD
              ========================================================================= */}
          <div ref={cardRef} className="unified-card">
            {/* Subtle perimeter border beam on card hover */}
            <div className="card-border-beam" />

            <div className="card-inner">
              {/* -------------------------------------------------------------
                  LEFT COLUMN: Profile & Bio & Actions
                  ------------------------------------------------------------- */}
              <div className="card-left-column">
                {/* Centered Profile Hero: Picture, Username & Handle ONLY */}
                <div className="profile-hero-center">
                  <div className="avatar-container">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      width={68}
                      height={68}
                      className="avatar-image"
                    />
                  </div>

                  <div className="identity-text">
                    <h3 className="user-name">{profile.name}</h3>
                    <a
                      href={`https://github.com/${profile.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="user-handle"
                    >
                      @{profile.username}
                    </a>
                  </div>
                </div>

                {/* Live Synced Contact & Joined Metadata (Kept as it is) */}
                <div className="profile-meta-list">
                  <a
                    href={`mailto:${profile.email || "spandanbole777@gmail.com"}`}
                    className="meta-row meta-link"
                    title="Send Email"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="meta-icon"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <span className="meta-text">{profile.email || "spandanbole777@gmail.com"}</span>
                  </a>

                  <div className="meta-row">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="meta-icon"
                    >
                      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                    </svg>
                    <span className="meta-text">{profile.joinedDate || "Joined last month"}</span>
                  </div>
                </div>

                {/* 3 Quick Stat Columns (Kept as it is) */}
                <div className="stats-row">
                  <div className="stat-col">
                    <span className="stat-num">{totalCount}</span>
                    <span className="stat-label">Commits</span>
                  </div>
                  <div className="stat-col">
                    <span className="stat-num">{profile.publicRepos}</span>
                    <span className="stat-label">Repos</span>
                  </div>
                  <div className="stat-col">
                    <span className="stat-num">{profile.followers}</span>
                    <span className="stat-label">Followers</span>
                  </div>
                </div>

                {/* High-Contrast Luminous GitHub Profile Button (Kept as it is) */}
                <a
                  href={`https://github.com/${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-btn"
                >
                  <span>GitHub profile</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </a>
              </div>

              {/* -------------------------------------------------------------
                  RIGHT COLUMN: Overview + Big Counter + Fluid Heatmap
                  ------------------------------------------------------------- */}
              <div className="card-right-column">
                {/* Header inside Right Column */}
                <div className="right-top-bar">
                  <div className="overview-tag">
                    <span className="overview-title">Contribution overview</span>
                    <span className="live-status">
                      <span className="status-dot-mini" />
                      <span>Live GitHub synced</span>
                    </span>
                  </div>

                  {/* Horizontal Year Tabs in Increasing Order Left-to-Right (up to last 5 years) */}
                  <div className="year-tabs-container">
                    {years.map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setSelectedYear(yr)}
                        className={`year-tab ${selectedYear === yr ? "active" : ""}`}
                        title={`View ${yr} contributions`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Big Metric Display for Active Year */}
                <div className="metric-display-row">
                  <span className="giant-metric">{activeTotal}</span>
                  <div className="metric-caption">
                    <span className="caption-bold">total contributions</span>
                    <span className="caption-sub">
                      {selectedYear === currentCalendarYear
                        ? "in the trailing 52 weeks"
                        : `in ${selectedYear}`}
                    </span>
                  </div>
                </div>

                {/* Subtle Horizontal Divider */}
                <div className="inner-divider" />

                {/* Fluid Vector SVG Heatmap (Zero Scrollbar, Fully Responsive) */}
                <div className="calendar-svg-wrap">
                  <svg
                    viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                    className="activity-svg"
                    preserveAspectRatio="xMinYMid meet"
                  >
                    {/* Month Labels */}
                    {monthLabels.map((m, idx) => (
                      <text
                        key={idx}
                        x={m.x}
                        y={12}
                        className="svg-month-label"
                      >
                        {m.label}
                      </text>
                    ))}

                    {/* Weekday Labels (Mon, Wed, Fri) */}
                    <text
                      x={LABEL_WIDTH - 8}
                      y={ROW_START + 1 * PITCH + 9}
                      textAnchor="end"
                      className="svg-weekday-label"
                    >
                      Mon
                    </text>
                    <text
                      x={LABEL_WIDTH - 8}
                      y={ROW_START + 3 * PITCH + 9}
                      textAnchor="end"
                      className="svg-weekday-label"
                    >
                      Wed
                    </text>
                    <text
                      x={LABEL_WIDTH - 8}
                      y={ROW_START + 5 * PITCH + 9}
                      textAnchor="end"
                      className="svg-weekday-label"
                    >
                      Fri
                    </text>

                    {/* 53 Columns of Activity Blocks */}
                    {weeks.map((week, wIdx) => {
                      const colX = LABEL_WIDTH + wIdx * PITCH;
                      return (
                        <g key={wIdx}>
                          {week.map((day, dIdx) => {
                            if (!day) return null;

                            const rowY = ROW_START + dIdx * PITCH;
                            const fill = getLevelColor(day.level, day.count);
                            const isHigh = day.level === 4;

                            return (
                              <rect
                                key={day.date}
                                x={colX}
                                y={rowY}
                                width={SQUARE_SIZE}
                                height={SQUARE_SIZE}
                                rx={2.2}
                                ry={2.2}
                                fill={fill}
                                stroke={isHigh ? "#39d353" : "rgba(255, 255, 255, 0.06)"}
                                strokeWidth={isHigh ? "1.2" : "1"}
                                className="svg-day-rect"
                                onMouseEnter={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setHoveredDay({
                                    day,
                                    x: rect.left + rect.width / 2,
                                    y: rect.top,
                                  });
                                }}
                                onMouseLeave={() => setHoveredDay(null)}
                              />
                            );
                          })}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Bottom Legend Bar inside Right Column */}
                <div className="right-bottom-bar">
                  <div className="bottom-left-stat">
                    <span className="dot-indicator" />
                    <span>
                      {activeTotal} total contributions in{" "}
                      {selectedYear === currentCalendarYear
                        ? "the trailing 52 weeks"
                        : selectedYear}
                    </span>
                  </div>

                  <div className="legend-group">
                    <span className="legend-tag">Less</span>
                    <div className="legend-square" style={{ backgroundColor: "#161720" }} />
                    <div className="legend-square" style={{ backgroundColor: "#0e4429" }} />
                    <div className="legend-square" style={{ backgroundColor: "#006d32" }} />
                    <div className="legend-square" style={{ backgroundColor: "#26a641" }} />
                    <div
                      className="legend-square"
                      style={{
                        backgroundColor: "#39d353",
                        boxShadow: "0 0 6px rgba(57, 211, 83, 0.5)",
                      }}
                    />
                    <span className="legend-tag">More</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              3. SUB-FOOTER (Below the Card)
              ========================================================================= */}
          <div ref={footerRef} className="section-footer">
            <span className="footer-quote">A little progress, every day.</span>
            <span className="footer-caption">Contribution history · {selectedYear}</span>
          </div>
        </div>
      </div>

      {/* Interactive Floating Tooltip */}
      {hoveredDay && (
        <div
          className="day-tooltip"
          style={{
            position: "fixed",
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y - 12}px`,
            transform: "translate(-50%, -100%)",
            pointerEvents: "none",
            zIndex: 100,
          }}
        >
          <div className="tooltip-inner">
            <div className="tooltip-count">
              {hoveredDay.day.count > 0
                ? `${hoveredDay.day.count} contribution${hoveredDay.day.count > 1 ? "s" : ""}`
                : "No contributions"}
            </div>
            <div className="tooltip-date">{formatDate(hoveredDay.day.date)}</div>
          </div>
        </div>
      )}

      {/* Styled JSX matching user design */}
      <style jsx>{`
        /* -----------------------------------------------------------------
           SECTION HEADER (Centered)
           ----------------------------------------------------------------- */
        .section-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 8px;
          width: 100%;
          opacity: 0;
          transform: translateY(35px);
          filter: blur(8px);
          will-change: transform, opacity, filter;
        }

        .main-title {
          margin: 0;
          font-family: 'HeroAlphabet', 'HeroOrbitron', sans-serif;
          font-size: clamp(2rem, 3.8vw, 3.5rem);
          font-weight: 800;
          letter-spacing: 0.08em;
          line-height: 1.12;
          text-transform: uppercase;
          text-align: center;
          background-image: linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 40%, #E2E8F0 75%, #94A3B8 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          filter: drop-shadow(0 2px 14px rgba(0, 0, 0, 0.9));
        }

        .subtitle-text {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 14.5px;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.02em;
          text-align: center;
        }

        /* -----------------------------------------------------------------
           UNIFIED CARD CONTAINER
           ----------------------------------------------------------------- */
        .unified-card {
          position: relative;
          border-radius: 24px;
          padding: 1.5px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.85);
          transition: box-shadow 0.3s ease;
          width: 100%;
          box-sizing: border-box;
          opacity: 0;
          transform: translateY(55px) scale(0.88);
          filter: blur(10px);
          will-change: transform, opacity, filter;
        }
        .unified-card:hover {
          box-shadow: 0 26px 60px -8px rgba(0, 0, 0, 0.95),
            0 0 0 1px rgba(255, 255, 255, 0.18);
        }

        .card-border-beam {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 80deg,
            rgba(255, 255, 255, 0.18) 90deg,
            #ffffff 100deg,
            rgba(255, 255, 255, 0.18) 110deg,
            transparent 120deg,
            transparent 360deg
          );
          animation: spin-beam 3.6s linear infinite;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 0;
        }
        .unified-card:hover .card-border-beam {
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

        .card-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          border-radius: 22.5px;
          background-color: #07080b;
          padding: 34px 38px;
          box-sizing: border-box;
          display: flex;
          align-items: stretch;
          gap: 36px;
        }

        /* -----------------------------------------------------------------
           LEFT COLUMN: Profile & Bio & Actions
           ----------------------------------------------------------------- */
        .card-left-column {
          width: 248px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding-right: 28px;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          gap: 20px;
        }

        /* Centered Hero Profile Section */
        .profile-hero-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          width: 100%;
        }

        .avatar-container {
          position: relative;
          width: 68px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-image {
          width: 68px;
          height: 68px;
          border-radius: 20px;
          object-fit: cover;
          display: block;
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.85);
          background-color: #121318;
          transition: transform 0.25s ease, border-color 0.25s ease;
        }
        .avatar-image:hover {
          transform: scale(1.05);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .identity-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 3px;
          width: 100%;
        }

        .user-name {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.01em;
          text-align: center;
        }

        .user-handle {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.45);
          text-decoration: none;
          transition: color 0.2s ease;
          text-align: center;
        }
        .user-handle:hover {
          color: #38bdf8;
        }

        /* Live Synced Contact & Joined Metadata List */
        .profile-meta-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          padding: 2px 4px;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.72);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .meta-link:hover {
          color: #ffffff;
        }

        .meta-link:hover .meta-icon {
          color: #38bdf8;
        }

        .meta-icon {
          flex-shrink: 0;
          color: rgba(255, 255, 255, 0.45);
          transition: color 0.2s ease;
        }

        .meta-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.01em;
        }

        .stats-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 8px 0;
        }

        .stat-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .stat-num {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
        }

        .stat-label {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.45);
        }

        /* Refined Luminous GitHub Profile Button */
        .profile-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 44px;
          border-radius: 12px;
          background-color: #ffffff;
          color: #000000;
          text-decoration: none;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
          transition: background-color 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.25s ease;
          position: relative;
        }
        .profile-btn:hover {
          background-color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.3),
            0 0 22px rgba(255, 255, 255, 0.12),
            0 6px 18px rgba(0, 0, 0, 0.45);
        }
        .profile-btn svg {
          transition: transform 0.2s ease;
        }
        .profile-btn:hover svg {
          transform: translate(2px, -2px);
        }

        /* -----------------------------------------------------------------
           RIGHT COLUMN: Overview + Big Counter + Fluid Heatmap
           ----------------------------------------------------------------- */
        .card-right-column {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 16px;
        }

        .right-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 12px;
        }

        .overview-tag {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .overview-title {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
        }

        .live-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.65);
        }

        /* Glowing Live GitHub Status Dot with Radiant Pulse */
        .status-dot-mini {
          position: relative;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #39d353;
          box-shadow: 0 0 8px #39d353, 0 0 16px rgba(57, 211, 83, 0.75);
          animation: pulse-live-dot 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          flex-shrink: 0;
        }

        @keyframes pulse-live-dot {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 0 8px #39d353, 0 0 18px rgba(57, 211, 83, 0.85);
          }
          50% {
            opacity: 0.65;
            transform: scale(0.92);
            box-shadow: 0 0 4px #39d353, 0 0 10px rgba(57, 211, 83, 0.45);
          }
        }

        /* Horizontal Year Tabs Container in Increasing Order */
        .year-tabs-container {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: #0e1015;
          padding: 3px 4px;
          border-radius: 11px;
          border: 1px solid rgba(255, 255, 255, 0.09);
        }

        .year-tab {
          padding: 6px 14px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid transparent;
          color: rgba(255, 255, 255, 0.55);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
          line-height: 1;
        }

        .year-tab:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }

        .year-tab.active {
          background-color: #ffffff;
          color: #000000;
          font-weight: 700;
          box-shadow: 0 2px 10px rgba(255, 255, 255, 0.25);
        }

        .metric-display-row {
          display: flex;
          align-items: baseline;
          gap: 14px;
          margin-top: -4px;
        }

        .giant-metric {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 52px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1;
          letter-spacing: -0.03em;
        }

        .metric-caption {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .caption-bold {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 14.5px;
          font-weight: 700;
          color: #ffffff;
        }

        .caption-sub {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.45);
        }

        .inner-divider {
          width: 100%;
          height: 1px;
          background-color: rgba(255, 255, 255, 0.08);
          margin: 4px 0 8px;
        }

        /* SVG Calendar Container */
        .calendar-svg-wrap {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .activity-svg {
          width: 100%;
          height: auto;
          display: block;
          overflow: visible;
        }

        .svg-month-label {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 10px;
          fill: #71717a;
          user-select: none;
        }

        .svg-weekday-label {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 9px;
          fill: #71717a;
          user-select: none;
        }

        .svg-day-rect {
          cursor: pointer;
          transition: transform 0.12s ease-out, stroke 0.12s ease;
          transform-origin: center;
          transform-box: fill-box;
        }
        .svg-day-rect:hover {
          transform: scale(1.35);
          stroke: #ffffff !important;
          stroke-width: 1.5 !important;
        }

        .right-bottom-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding-top: 6px;
        }

        .bottom-left-stat {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.45);
        }

        .dot-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.45);
        }

        .legend-group {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .legend-tag {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
          margin: 0 4px;
        }

        .legend-square {
          width: 10px;
          height: 10px;
          border-radius: 2px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-sizing: border-box;
        }

        /* -----------------------------------------------------------------
           3. SUB-FOOTER
           ----------------------------------------------------------------- */
        .section-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0 4px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.45);
          opacity: 0;
          transform: translateY(20px);
          will-change: transform, opacity;
        }

        /* -----------------------------------------------------------------
           RESPONSIVE STACK (Mobile & Tablet)
           ----------------------------------------------------------------- */
        @media (max-width: 880px) {
          .card-inner {
            flex-direction: column !important;
            padding: 26px 20px !important;
            gap: 28px !important;
          }

          .card-left-column {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
            padding-right: 0 !important;
            padding-bottom: 24px !important;
          }

          .right-top-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }

          .section-footer {
            flex-direction: column !important;
            align-items: center !important;
            gap: 6px !important;
            text-align: center;
          }
        }

        /* Tooltip */
        .day-tooltip {
          animation: tooltip-in 0.15s ease-out forwards;
        }

        @keyframes tooltip-in {
          0% {
            opacity: 0;
            transform: translate(-50%, -90%) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -100%) scale(1);
          }
        }

        .tooltip-inner {
          background-color: #0d0e12;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 7px 11px;
          box-shadow: 0 10px 24px -4px rgba(0, 0, 0, 0.9);
          white-space: nowrap;
          text-align: center;
        }

        .tooltip-count {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 11.5px;
          font-weight: 700;
          color: #ffffff;
        }

        .tooltip-date {
          font-family: ui-monospace, monospace;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.55);
          margin-top: 2px;
        }
      `}</style>
    </section>
  );
}
