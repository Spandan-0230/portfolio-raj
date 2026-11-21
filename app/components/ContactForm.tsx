"use client";

import React, { useState, useEffect } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (status === "success" || status === "error") {
      const timer = setTimeout(() => {
        setStatus("idle");
        setStatusMessage("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus("error");
      setStatusMessage("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStatus("error");
      setStatusMessage("Please enter a valid email address.");
      return;
    }

    if (!message.trim()) {
      setStatus("error");
      setStatusMessage("Please write a message before sending.");
      return;
    }

    if (message.length > 1000) {
      setStatus("error");
      setStatusMessage("Message exceeds the 1000 character limit.");
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      if (res.ok) {
        setStatus("success");
        setStatusMessage("Successfully Noted");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        const data = await res.json().catch(() => null);
        setStatus("error");
        setStatusMessage(data?.error || "Failed to send message. Please try again.");
      }
    } catch {
      setStatus("error");
      setStatusMessage("Network error. Please try again later.");
    }
  };

  return (
    <div className="contact-form-container">
      {/* =====================================================================
          1. HEADER: "Got an Idea?" + "Let’s compile it."
             Exact match to reference image ("Let's create something real."):
             Line 1: Crisp pure white #ffffff, modern bold sans-serif
             Line 2: Neutral gray #737373, modern bold sans-serif, larger size
          ===================================================================== */}
      <div className="contact-header">
        <h2 className="title-lead">Got an Idea?</h2>
        <h3 className="title-sub">Let’s compile it.</h3>
      </div>

      {/* =====================================================================
          2. FORM: Name (Optional), Email (Required), Message (Max 1000)
             UI styled to match the dark matte cards in attachment 3
          ===================================================================== */}
      <form onSubmit={handleSubmit} className="contact-fields-form" noValidate>
        {/* Name Field (Optional) */}
        <div className="form-group">
          <label htmlFor="contact-name" className="form-label">
            Name <span className="label-tag-optional">(optional)</span>
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="form-input"
            autoComplete="name"
          />
        </div>

        {/* Email Field (Mandatory) */}
        <div className="form-group">
          <label htmlFor="contact-email" className="form-label">
            Email <span className="label-tag-required">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="form-input"
            autoComplete="email"
          />
        </div>

        {/* Message Field (Mandatory with 1000 character limit) */}
        <div className="form-group">
          <div className="label-row">
            <label htmlFor="contact-message" className="form-label">
              Message <span className="label-tag-required">*</span>
            </label>
            <span
              className={`char-counter ${
                message.length >= 900 ? "char-counter-warn" : ""
              }`}
            >
              {message.length}/1000
            </span>
          </div>
          <textarea
            id="contact-message"
            required
            maxLength={1000}
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What would you like to discuss?"
            className="form-textarea"
          />
        </div>

        {/* Feedback Status Alert */}
        {status === "error" && (
          <div className="form-alert alert-error" role="alert">
            <span>{statusMessage}</span>
          </div>
        )}

        {status === "success" && (
          <div className="form-alert alert-success" role="status">
            <span>{statusMessage}</span>
          </div>
        )}

        {/* ===================================================================
            3. SEND BUTTON: Identical to GitHub Profile Button (Solid White Glow,
               Black Text, translateY(-2px), custom paper plane icon from attachment 1)
            =================================================================== */}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="send-btn"
          aria-label="Send Message"
        >
          <span>{status === "submitting" ? "Compiling..." : "Send"}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="send-plane-icon"
            aria-hidden="true"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>

      <style jsx>{`
        .contact-form-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(20px, 3.2vh, 40px) clamp(24px, 3.2vw, 48px);
          box-sizing: border-box;
          overflow-y: auto;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
          pointer-events: auto;
          user-select: auto;
        }

        .contact-form-container::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
          width: 0px;
          height: 0px;
        }

        /* -------------------------------------------------------------
           1. TITLE GROUP: Lead Text ("Got an Idea?") & Subtitle ("Let's compile it.")
           Exact match to reference image ("Let's create something real."):
           Line 1: Crisp pure white #ffffff, modern bold sans-serif
           Line 2: Neutral gray #737373, modern bold sans-serif, larger size
           ------------------------------------------------------------- */
        .contact-header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0px;
          margin-bottom: clamp(16px, 2.4vh, 26px);
        }

        /* Line 1: "Got an Idea?" (White #ffffff, bold modern sans-serif, without glow) */
        .title-lead {
          margin: 0;
          font-family: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: clamp(2.3rem, 3.6vw, 4.2rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.05;
          color: #ffffff;
          text-transform: none;
          text-shadow: none;
          filter: none;
        }

        /* Line 2: "Let’s compile it." with High-Contrast Chrome Reflection Sheen Sweep (without glow) */
        .title-sub {
          margin: 0;
          font-family: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: clamp(2.5rem, 4.0vw, 4.7rem);
          font-weight: 700;
          letter-spacing: -0.045em;
          line-height: 1.02;
          text-transform: none;

          /* High-Contrast Diagonal Chrome Reflective Sheen Sweep (Matching GitHub Link / Project Page) */
          background: linear-gradient(
            115deg,
            rgba(255, 255, 255, 0.45) 0%,
            rgba(255, 255, 255, 0.45) 38%,
            rgba(255, 255, 255, 0.9) 48%,
            #ffffff 50%,
            rgba(255, 255, 255, 0.9) 52%,
            rgba(255, 255, 255, 0.45) 62%,
            rgba(255, 255, 255, 0.45) 100%
          );
          background-size: 250% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: titleDiagonalReflect 2.6s linear infinite;
          display: inline-block;
          filter: none;
          text-shadow: none;
        }

        @keyframes titleDiagonalReflect {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* -------------------------------------------------------------
           2. FORM FIELDS & LABELS (Dark Matte UI from Attachment 3)
           ------------------------------------------------------------- */
        .contact-fields-form {
          display: flex;
          flex-direction: column;
          gap: clamp(12px, 1.8vh, 18px);
          width: 100%;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }

        .label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .form-label {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #ededed;
          letter-spacing: -0.01em;
        }

        .label-tag-optional {
          font-size: 12px;
          color: #71717a;
          font-weight: 400;
          margin-left: 3px;
        }

        .label-tag-required {
          color: #ef4444;
          font-weight: 700;
          margin-left: 2px;
        }

        .char-counter {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 12px;
          color: #71717a;
          font-weight: 400;
          transition: color 0.2s ease;
        }

        .char-counter-warn {
          color: #fbbf24;
        }

        /* Input & Textarea Elements (Exact Matte Dark #0d0d0e, Border #262628) */
        .form-input,
        .form-textarea {
          width: 100%;
          background: #0d0d0e;
          border: 1px solid #262628;
          border-radius: 12px;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13.5px;
          padding: 12px 16px;
          box-sizing: border-box;
          outline: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
          transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: #52525b;
          font-weight: 400;
        }

        .form-input:focus,
        .form-textarea:focus {
          background: #111113;
          border-color: #52525b;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.15),
            0 4px 14px rgba(0, 0, 0, 0.6);
        }

        .form-textarea {
          resize: vertical;
          min-height: clamp(75px, 11vh, 110px);
          line-height: 1.5;
        }

        /* Feedback Alerts */
        .form-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 13px;
          border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 12px;
          line-height: 1.35;
          animation: alertFadeIn 0.25s ease-out;
        }

        .alert-error {
          background: linear-gradient(180deg, #ff3b3b 0%, #e61919 48%, #cc0000 100%);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.65), 0 4px 14px rgba(230, 25, 25, 0.3);
          color: #000000;
          font-weight: 700;
          justify-content: center;
          text-align: center;
          letter-spacing: -0.01em;
        }

        .alert-success {
          background: linear-gradient(180deg, #00e368 0%, #01d211 48%, #0ec103 100%);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.65), 0 4px 14px rgba(1, 210, 17, 0.25);
          color: #000000;
          font-weight: 700;
          justify-content: center;
          text-align: center;
          letter-spacing: -0.01em;
        }

        @keyframes alertFadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* -------------------------------------------------------------
           3. SEND BUTTON: Exact Concept of GitHub Profile Button
           (Solid White, Black Text, translateY(-2px), Glowing Box Shadow)
           ------------------------------------------------------------- */
        .send-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 44px;
          border-radius: 12px;
          background-color: #ffffff;
          color: #000000;
          border: none;
          text-decoration: none;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.01em;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
          transition: background-color 0.25s ease,
            transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.25s ease;
          position: relative;
          cursor: pointer;
          margin-top: 4px;
        }

        .send-btn:hover:not(:disabled) {
          background-color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 0 14px rgba(255, 255, 255, 0.35),
            0 0 24px rgba(255, 255, 255, 0.15),
            0 6px 18px rgba(0, 0, 0, 0.45);
        }

        .send-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .send-plane-icon {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          display: inline-block;
          vertical-align: middle;
          position: relative;
          top: 0px;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .send-btn:hover:not(:disabled) .send-plane-icon {
          transform: translateX(3px);
        }

        .send-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
        }
      `}</style>
    </div>
  );
}
