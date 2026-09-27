"use client";

import { useEffect, useRef } from "react";

const STYLE_ID = "tsh-home-motion-safe";

export function HomeMotion() {
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    document.getElementById(STYLE_ID)?.remove();

    const style = document.createElement("style");
    style.id = STYLE_ID;

    style.textContent = `
      /*
       * TechSkillHub motion layer
       *
       * IMPORTANT:
       * This layer never controls opacity or visibility of
       * page content. React components remain fully visible.
       */

      .tsh-motion-ready [data-tsh-lift] {
        transition:
          transform 450ms cubic-bezier(.22,1,.36,1),
          box-shadow 450ms cubic-bezier(.22,1,.36,1),
          border-color 450ms cubic-bezier(.22,1,.36,1);
        will-change: transform;
      }

      @media (hover: hover) and (pointer: fine) {
        .tsh-motion-ready [data-tsh-lift]:hover {
          transform: translate3d(0, -5px, 0);
        }
      }

      .tsh-pointer-glow {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background:
          radial-gradient(
            520px circle at
            var(--tsh-pointer-x)
            var(--tsh-pointer-y),
            rgba(37, 99, 235, .055),
            transparent 62%
          );
        opacity: .9;
      }

      .tsh-scroll-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        transform-origin: left center;
        transform: scaleX(0);
        background: linear-gradient(
          90deg,
          #2563eb,
          #4f46e5
        );
        z-index: 9999;
        pointer-events: none;
      }

      /*
       * Safe floating effect.
       * Only elements explicitly marked data-tsh-float
       * can receive this animation.
       */
      @media (prefers-reduced-motion: no-preference) {
        .tsh-motion-ready [data-tsh-float] {
          animation: tshFloat 6s ease-in-out infinite;
          will-change: transform;
        }

        @keyframes tshFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(0, -7px, 0);
          }
        }
      }

      /*
       * Never hide content because of the motion system.
       */
      .tsh-motion-ready .tsh-motion-section {
        opacity: 1;
        visibility: visible;
        transform: none;
      }

      @media (prefers-reduced-motion: reduce) {
        .tsh-pointer-glow,
        .tsh-scroll-progress {
          display: none !important;
        }

        .tsh-motion-ready [data-tsh-lift],
        .tsh-motion-ready [data-tsh-float] {
          animation: none !important;
          transform: none !important;
          transition: none !important;
        }
      }
    `;

    document.head.appendChild(style);
    body.classList.add("tsh-motion-ready");

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const progress = document.createElement("div");
    progress.className = "tsh-scroll-progress";
    progress.setAttribute("aria-hidden", "true");

    const glow = document.createElement("div");
    glow.className = "tsh-pointer-glow";
    glow.setAttribute("aria-hidden", "true");

    if (!reduced) {
      body.appendChild(progress);
      body.appendChild(glow);
    }

    const updateProgress = () => {
      if (reduced) return;

      if (frame.current !== null) return;

      frame.current = window.requestAnimationFrame(() => {
        const documentHeight =
          document.documentElement.scrollHeight;

        const viewportHeight = window.innerHeight;

        const maximumScroll = Math.max(
          1,
          documentHeight - viewportHeight
        );

        const percentage = Math.min(
          1,
          Math.max(0, window.scrollY / maximumScroll)
        );

        progress.style.transform =
          `scaleX(${percentage})`;

        frame.current = null;
      });
    };

    const updatePointer = (event: PointerEvent) => {
      if (reduced || window.innerWidth < 900) return;

      root.style.setProperty(
        "--tsh-pointer-x",
        `${event.clientX}px`
      );

      root.style.setProperty(
        "--tsh-pointer-y",
        `${event.clientY}px`
      );
    };

    window.addEventListener(
      "scroll",
      updateProgress,
      { passive: true }
    );

    window.addEventListener(
      "pointermove",
      updatePointer,
      { passive: true }
    );

    updateProgress();

    return () => {
      window.removeEventListener(
        "scroll",
        updateProgress
      );

      window.removeEventListener(
        "pointermove",
        updatePointer
      );

      if (frame.current !== null) {
        window.cancelAnimationFrame(frame.current);
        frame.current = null;
      }

      progress.remove();
      glow.remove();
      style.remove();

      body.classList.remove("tsh-motion-ready");

      root.style.removeProperty("--tsh-pointer-x");
      root.style.removeProperty("--tsh-pointer-y");
    };
  }, []);

  return null;
}
