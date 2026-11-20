"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PureImagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
}

export default function PureImagePopup({ isOpen, onClose, src, alt }: PureImagePopupProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !src) return null;

  return createPortal(
    <div
      className="pure-image-popup-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="pure-image-popup-element"
        onClick={onClose}
      />

      <style jsx>{`
        .pure-image-popup-backdrop {
          position: fixed;
          inset: 0;
          z-index: 999999;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: zoom-out;
          animation: purePopupFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          user-select: none;
          padding: 20px;
          box-sizing: border-box;
        }

        .pure-image-popup-element {
          max-width: 90vw;
          max-height: 88vh;
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.95);
          cursor: zoom-out;
          animation: purePopupZoomIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }

        @keyframes purePopupFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes purePopupZoomIn {
          from {
            opacity: 0;
            transform: scale(0.94);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
