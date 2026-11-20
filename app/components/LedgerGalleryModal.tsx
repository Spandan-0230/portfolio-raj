"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PureImagePopup from "./PureImagePopup";
import { LedgerImage } from "./StageSix";

interface LedgerGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: LedgerImage[];
}

export default function LedgerGalleryModal({
  isOpen,
  onClose,
  images,
}: LedgerGalleryModalProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [focusedImg, setFocusedImg] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (focusedImg !== null) {
          setFocusedImg(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose, focusedImg]);

  if (!mounted || !isOpen) return null;

  // Split images according to specification:
  // Row 1: 3 images (1.png, 2.png, 3.png)
  // Row 2: 3 images (4.png, 5.png, 6.png)
  // Row 3: 2 images (7.png, 8.png - centered at the last)
  const getImageByFilename = (fn: string) => images.find((img) => img.filename === fn);

  const row1 = [
    getImageByFilename("1.png"),
    getImageByFilename("2.png"),
    getImageByFilename("3.png"),
  ].filter(Boolean) as LedgerImage[];

  const row2 = [
    getImageByFilename("4.png"),
    getImageByFilename("5.png"),
    getImageByFilename("6.png"),
  ].filter(Boolean) as LedgerImage[];

  const row3 = [
    getImageByFilename("7.png"),
    getImageByFilename("8.png"),
  ].filter(Boolean) as LedgerImage[];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="ledger-gallery-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      {/* Floating Minimal Close Button */}
      <button
        type="button"
        className="gallery-close-btn"
        onClick={onClose}
        aria-label="Close Ledger Gallery"
        title="Close (Esc)"
      >
        <span className="close-symbol">✕</span>
        <span className="close-label">Close</span>
      </button>

      {/* Main Scrollable Gallery Container */}
      <div className="gallery-scroll-container" onClick={handleBackdropClick}>
        <div className="gallery-rows-wrapper" onClick={handleBackdropClick}>
          {/* Row 1: 3 Images (1, 2, 3) */}
          <div className="gallery-row" onClick={handleBackdropClick}>
            {row1.map((img) => (
              <div
                key={img.id}
                className="gallery-pure-img-wrapper"
                onClick={() => setFocusedImg({ src: img.src, alt: img.title })}
                title={`Click to zoom: ${img.title}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.title}
                  className="gallery-pure-img"
                />
              </div>
            ))}
          </div>

          {/* Row 2: 3 Images (4, 5, 6) */}
          <div className="gallery-row" onClick={handleBackdropClick}>
            {row2.map((img) => (
              <div
                key={img.id}
                className="gallery-pure-img-wrapper"
                onClick={() => setFocusedImg({ src: img.src, alt: img.title })}
                title={`Click to zoom: ${img.title}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.title}
                  className="gallery-pure-img"
                />
              </div>
            ))}
          </div>

          {/* Row 3: 2 Images Centered at the End (7 & 8) */}
          <div className="gallery-row-centered" onClick={handleBackdropClick}>
            {row3.map((img) => (
              <div
                key={img.id}
                className="gallery-pure-img-wrapper"
                onClick={() => setFocusedImg({ src: img.src, alt: img.title })}
                title={`Click to zoom: ${img.title}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.title}
                  className="gallery-pure-img"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual Focused Image Pop-up (Reusing exact PureImagePopup logic) */}
      <PureImagePopup
        isOpen={focusedImg !== null}
        onClose={() => setFocusedImg(null)}
        src={focusedImg?.src || ""}
        alt={focusedImg?.alt || ""}
      />

      <style jsx>{`
        .ledger-gallery-backdrop {
          position: fixed;
          inset: 0;
          z-index: 99998;
          background: rgba(0, 0, 0, 0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          overflow-y: auto;
          overflow-x: hidden;
          animation: galleryFadeIn 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          user-select: none;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }

        .ledger-gallery-backdrop::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
          width: 0;
          height: 0;
        }

        .gallery-close-btn {
          position: fixed;
          top: clamp(16px, 3vh, 28px);
          right: clamp(16px, 3vw, 32px);
          z-index: 999995;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 999px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.02em;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: url('/cursor.png') 0 0, pointer !important;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
          user-select: none;
        }

        .gallery-close-btn:hover {
          background-color: #ffffff;
          color: #000000;
          border-color: #ffffff;
          transform: none;
          box-shadow: none;
        }

        .gallery-close-btn:active {
          transform: none;
          box-shadow: none;
        }

        .close-symbol {
          font-size: 11px;
        }

        .close-label {
          font-size: 13px;
        }

        .gallery-scroll-container {
          width: 100%;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: clamp(60px, 8vh, 90px) 20px clamp(70px, 10vh, 100px);
          box-sizing: border-box;
        }

        .gallery-rows-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(28px, 4vh, 44px);
          width: 100%;
          max-width: 1240px;
        }

        /* Rows 1 & 2: 3 Images each */
        .gallery-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: clamp(14px, 1.8vw, 24px);
          width: 100%;
          flex-wrap: wrap;
        }

        /* Row 3: 2 Images Centered */
        .gallery-row-centered {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: clamp(18px, 2.4vw, 32px);
          width: 100%;
          flex-wrap: wrap;
        }

        .gallery-pure-img-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: zoom-in;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.75);
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease;
          background: transparent;
        }

        .gallery-pure-img-wrapper:hover {
          transform: translateY(-4px) scale(1.025);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.95);
        }

        .gallery-pure-img {
          height: clamp(140px, min(22vh, 20vw), 215px);
          width: auto;
          max-width: 90vw;
          object-fit: contain;
          border-radius: 8px;
          display: block;
        }

        @keyframes galleryFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
