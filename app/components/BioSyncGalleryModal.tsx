"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PureImagePopup from "./PureImagePopup";

export interface GalleryProjectImage {
  id: number;
  filename: string;
  src: string;
  title: string;
  subtitle: string;
  aspect: "portrait" | "landscape";
  width: number;
  height: number;
}

interface BioSyncGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: GalleryProjectImage[];
}

export default function BioSyncGalleryModal({
  isOpen,
  onClose,
  images,
}: BioSyncGalleryModalProps) {
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
  // Row 1: 3 images (1.png, 2.png, 5.png - matching the top featured row)
  // Row 2: 3 images (3.png, 4.png, 7.png)
  // Row 3: 2 images (6.png, 8.png - centered at the last)
  const getImageByFilename = (fn: string) => images.find((img) => img.filename === fn);

  const row1 = [
    getImageByFilename("1.png"),
    getImageByFilename("2.png"),
    getImageByFilename("5.png"),
  ].filter(Boolean) as GalleryProjectImage[];

  const row2 = [
    getImageByFilename("3.png"),
    getImageByFilename("4.png"),
    getImageByFilename("7.png"),
  ].filter(Boolean) as GalleryProjectImage[];

  const row3 = [
    getImageByFilename("6.png"),
    getImageByFilename("8.png"),
  ].filter(Boolean) as GalleryProjectImage[];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="biosync-gallery-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      {/* Floating Minimal Close Button */}
      <button
        type="button"
        className="gallery-close-btn"
        onClick={onClose}
        aria-label="Close BioSync Gallery"
        title="Close (Esc)"
      >
        <span className="close-symbol">✕</span>
        <span className="close-label">Close</span>
      </button>

      {/* Main Scrollable Gallery Container */}
      <div className="gallery-scroll-container" onClick={handleBackdropClick}>
        <div className="gallery-rows-wrapper" onClick={handleBackdropClick}>
          {/* Row 1: 3 Portrait Phones */}
          <div className="gallery-row" onClick={handleBackdropClick}>
            {row1.map((img) => (
              <div
                key={img.id}
                className="gallery-phone-card"
                onClick={() => setFocusedImg({ src: img.src, alt: img.title })}
                title={`Click to zoom: ${img.title}`}
              >
                <div className="gallery-screen-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.title}
                    className="gallery-device-img"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: 3 Portrait Phones */}
          <div className="gallery-row" onClick={handleBackdropClick}>
            {row2.map((img) => (
              <div
                key={img.id}
                className="gallery-phone-card"
                onClick={() => setFocusedImg({ src: img.src, alt: img.title })}
                title={`Click to zoom: ${img.title}`}
              >
                <div className="gallery-screen-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.title}
                    className="gallery-device-img"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Row 3: 2 Landscape Cards Centered at the End (Images 6 & 8) */}
          <div className="gallery-row-centered" onClick={handleBackdropClick}>
            {row3.map((img) => (
              <div
                key={img.id}
                className="gallery-landscape-card"
                onClick={() => setFocusedImg({ src: img.src, alt: img.title })}
                title={`Click to zoom: ${img.title}`}
              >
                <div className="gallery-landscape-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.title}
                    className="gallery-landscape-img"
                  />
                </div>
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
        .biosync-gallery-backdrop {
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

        .biosync-gallery-backdrop::-webkit-scrollbar {
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
          cursor: pointer;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: background-color 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
        }

        .gallery-close-btn:hover {
          background-color: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.45);
          transform: scale(1.05);
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
          gap: clamp(32px, 4.5vh, 48px);
          width: 100%;
          max-width: 1200px;
        }

        /* Rows 1 & 2: 3 Portrait Phones */
        .gallery-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: clamp(14px, 1.8vw, 24px);
          width: 100%;
          flex-wrap: wrap;
        }

        .gallery-phone-card {
          position: relative;
          height: clamp(370px, min(48vh, 27vw), 470px);
          aspect-ratio: 540 / 1155;
          background: #000000;
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          border-radius: 24px;
          overflow: hidden;
          cursor: zoom-in;
          box-shadow: 0 18px 48px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
        }

        .gallery-phone-card:hover {
          border-color: rgba(255, 255, 255, 0.75);
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 24px 56px rgba(0, 0, 0, 0.95), 0 0 22px rgba(255, 255, 255, 0.2);
        }

        .gallery-screen-inner {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #000000;
          border-radius: 24px;
        }

        .gallery-device-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
        }

        /* Row 3: 2 Landscape Cards Centered at the End */
        .gallery-row-centered {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: clamp(16px, 2.4vw, 32px);
          width: 100%;
          flex-wrap: wrap;
        }

        .gallery-landscape-card {
          position: relative;
          width: clamp(340px, min(42vw, 440px), 500px);
          aspect-ratio: 1080 / 750;
          background: #000000;
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          border-radius: 18px;
          overflow: hidden;
          cursor: zoom-in;
          box-shadow: 0 18px 48px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
        }

        .gallery-landscape-card:hover {
          border-color: rgba(255, 255, 255, 0.75);
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 24px 56px rgba(0, 0, 0, 0.95), 0 0 22px rgba(255, 255, 255, 0.2);
        }

        .gallery-landscape-inner {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #000000;
          border-radius: 18px;
        }

        .gallery-landscape-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
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
