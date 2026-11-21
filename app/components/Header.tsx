"use client";

import React, { useEffect, useState } from "react";

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "hero", label: "Home" },
  { id: "activity", label: "Activity" },
  { id: "works", label: "Work" },
];

export default function Header() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("hero");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onScroll = () => {
      const scrollY = window.scrollY;

      // Reveal header immediately after welcome screen fades out (> 25px scroll)
      const shouldShow = scrollY > 25;
      setIsVisible(shouldShow);

      // Detect active section for dynamic navigation highlighting
      const winH = window.innerHeight;
      const actEl = document.getElementById("activity");
      const worksEl = document.getElementById("works");
      const charEl = document.getElementById("character");

      if (charEl && scrollY >= charEl.offsetTop - winH * 0.4) {
        setActiveSection("contact");
      } else if (worksEl && scrollY >= worksEl.offsetTop - winH * 0.4) {
        setActiveSection("works");
      } else if (actEl && scrollY >= actEl.offsetTop - winH * 0.4) {
        setActiveSection("activity");
      } else {
        setActiveSection("hero");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    if (typeof window === "undefined") return;

    if (id === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (id === "contact") {
      handleContactClick();
      return;
    }

    const el = document.getElementById(id);
    if (el) {
      const totalScrollable = el.offsetHeight - window.innerHeight;
      // Scroll directly to the sweet spot where the section's animation is 100% complete, fully settled and razor sharp
      const targetY =
        totalScrollable > 0
          ? el.offsetTop + totalScrollable * 0.35
          : el.offsetTop;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  };

  const handleContactClick = () => {
    if (typeof window === "undefined") return;
    const charEl = document.getElementById("character");
    if (charEl) {
      window.scrollTo({ top: charEl.offsetTop, behavior: "smooth" });
    }
  };

  return (
    <header
      className={`site-header ${isVisible ? "header-visible" : "header-hidden"}`}
      role="banner"
      aria-label="Main Navigation"
    >
      <div className="header-inner">
        {/* =====================================================================
            1. LEFT BRANDING: "SB" In Spiky Gothic Medieval Font + Divider Line
            ===================================================================== */}
        <div className="header-left">
          <button
            type="button"
            onClick={() => scrollToSection("hero")}
            className="brand-btn"
            aria-label="Spandan Bole - Home"
          >
            <span className="brand-monogram">SB</span>
          </button>
          <div className="brand-divider" aria-hidden="true" />
        </div>

        {/* =====================================================================
            2. MIDDLE NAVIGATION: Dynamically Mapped Items Centered Efficiently
            ===================================================================== */}
        <nav className="header-center" aria-label="Sections">
          <ul className="nav-list">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id} className="nav-item">
                  <button
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className={`nav-link ${isActive ? "active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="nav-bullet" aria-hidden="true">
                      •
                    </span>
                    <span className="nav-label">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* =====================================================================
            3. RIGHT ACTION: Social Links + "Contact" Luminous Button
            ===================================================================== */}
        <div className="header-right">
          <div className="header-socials" aria-label="Social Profiles">
            <a
              href="https://github.com/Spandan-0230"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link"
              aria-label="GitHub Profile"
              title="GitHub / Spandan-0230"
            >
              <svg
                className="social-svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/spandan-bole-pr3020/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link"
              aria-label="LinkedIn Profile"
              title="LinkedIn / spandan-bole-pr3020"
            >
              <svg
                className="social-svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.2a1.66 1.66 0 0 0-1.66 1.66c0 .92.74 1.66 1.66 1.66.92 0 1.66-.74 1.66-1.66 0-.92-.74-1.66-1.66-1.66z" />
              </svg>
            </a>
          </div>
          <button
            type="button"
            onClick={handleContactClick}
            className="contact-btn"
            aria-label="contact me"
          >
            <span>Contact</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .site-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 68px;
          z-index: 50;
          display: flex;
          align-items: center;
          padding: 0 var(--page-frame-padding, clamp(64px, 8.3vw, 134px));
          background: transparent;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          border-bottom: none;
          box-sizing: border-box;
          pointer-events: none;
          transition: opacity 0.38s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.38s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .header-hidden {
          opacity: 0;
          transform: translateY(-14px);
        }

        .header-inner {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        /* -------------------------------------------------------------
           LEFT: Brand Monogram "SB" & Vertical Bar "|" (No glow/circle)
           ------------------------------------------------------------- */
        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
          pointer-events: auto;
        }

        .brand-btn {
          background: transparent;
          border: none;
          padding: 0;
          cursor: url('/cursor.png') 0 0, pointer !important;
          display: flex;
          align-items: center;
          user-select: none;
          pointer-events: auto;
          transition: opacity 0.2s ease;
        }

        .brand-btn:hover {
          opacity: 0.82;
          transform: none;
          filter: none;
        }

        .brand-monogram {
          font-family: 'BrandPirata', 'Pirata One', 'BrandCinzel', 'Cinzel Decorative', cursive, serif;
          font-size: clamp(28px, 2.4vw, 36px);
          font-weight: 700;
          line-height: 1;
          letter-spacing: 0.04em;
          background-image: linear-gradient(
            180deg,
            #ffffff 0%,
            #e4e4e7 35%,
            #71717a 58%,
            #d4d4d8 85%,
            #ffffff 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.85));
        }

        .brand-divider {
          width: 1.5px;
          height: 24px;
          background-color: rgba(255, 255, 255, 0.28);
          border-radius: 1px;
        }

        /* -------------------------------------------------------------
           MIDDLE: Navigation Links (Directly on screen, zero glow)
           ------------------------------------------------------------- */
        .header-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          pointer-events: auto;
        }

        .nav-list {
          display: flex;
          align-items: center;
          gap: clamp(14px, 2.2vw, 30px);
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-item {
          display: flex;
          align-items: center;
        }

        .nav-link {
          background: transparent;
          border: none;
          padding: 6px 4px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: clamp(12px, 1.05vw, 14px);
          font-weight: 500;
          letter-spacing: 0.06em;
          color: rgba(255, 255, 255, 0.45);
          cursor: url('/cursor.png') 0 0, pointer !important;
          transition: color 0.2s ease;
          user-select: none;
          line-height: 1;
          pointer-events: auto;
        }

        .nav-bullet {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.25);
          transition: color 0.2s ease;
        }

        .nav-link:hover {
          color: #ffffff;
          transform: none;
          text-shadow: none;
        }

        .nav-link:hover .nav-bullet {
          color: #ffffff;
          transform: none;
        }

        .nav-link.active {
          color: #ffffff;
          font-weight: 600;
          text-shadow: none;
        }

        .nav-link.active .nav-bullet {
          color: #ffffff;
        }

        /* -------------------------------------------------------------
           RIGHT: Social Links + "Contact" Luminous Button
           ------------------------------------------------------------- */
        .header-right {
          display: flex;
          align-items: center;
          gap: clamp(10px, 1.2vw, 16px);
          pointer-events: auto;
        }

        .header-socials {
          display: flex;
          align-items: center;
          gap: clamp(8px, 0.9vw, 12px);
        }

        .social-icon-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #8a8a8e;
          text-decoration: none;
          cursor: url('/cursor.png') 0 0, pointer !important;
          padding: 6px;
          border-radius: 6px;
          transition: color 0.22s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
          pointer-events: auto;
        }

        .social-svg {
          display: block;
          transition: color 0.22s ease;
        }

        .social-icon-link:hover {
          color: #ffffff;
          transform: translateY(-1.5px);
        }

        .social-icon-link:active {
          transform: translateY(0);
        }

        .contact-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          padding: 0 16px;
          border-radius: 10px;
          background-color: #ffffff;
          color: #000000;
          border: 1px solid #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: clamp(12px, 1.05vw, 13px);
          font-weight: 700;
          letter-spacing: 0.02em;
          text-decoration: none;
          cursor: url('/cursor.png') 0 0, pointer !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
          transition: background-color 0.25s ease,
            transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.25s ease;
          user-select: none;
          pointer-events: auto;
          position: relative;
        }

        .contact-btn:hover {
          background-color: #ffffff;
          color: #000000;
          transform: translateY(-2px);
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.35),
            0 0 22px rgba(255, 255, 255, 0.15),
            0 6px 18px rgba(0, 0, 0, 0.45);
        }

        .contact-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
        }

        /* -------------------------------------------------------------
           RESPONSIVE MOBILE BREAKPOINTS
           ------------------------------------------------------------- */
        @media (max-width: 768px) {
          .site-header {
            height: 60px;
            padding: 0 16px;
          }

          .brand-divider {
            display: none;
          }

          .header-center {
            position: static;
            transform: none;
          }

          .nav-list {
            gap: 12px;
          }

          .nav-bullet {
            display: none;
          }

          .contact-btn {
            height: 30px;
            padding: 0 12px;
            font-size: 12px;
          }

          .header-right {
            gap: 8px;
          }

          .header-socials {
            gap: 4px;
          }

          .social-icon-link {
            padding: 4px;
          }

          .social-svg {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </header>
  );
}
