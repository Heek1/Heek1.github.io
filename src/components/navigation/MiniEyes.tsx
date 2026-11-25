"use client";

import { useEffect, useRef } from "react";
import styles from "./SiteHeader.module.css";

// A tiny version of the About eyes that keeps watching the cursor from the header.
export default function MiniEyes() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | null = null;
    let blinkTimer: number | null = null;

    const onMove = (event: PointerEvent) => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const rect = svg.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, dist / 240);
        svg.style.setProperty("--px", `${((dx / dist) * reach * 2.6).toFixed(2)}px`);
        svg.style.setProperty("--py", `${((dy / dist) * reach * 1.8).toFixed(2)}px`);
      });
    };

    const scheduleBlink = () => {
      blinkTimer = window.setTimeout(() => {
        if (!reduced.matches) {
          svg.dataset.blink = "true";
          window.setTimeout(() => delete svg.dataset.blink, 160);
        }
        scheduleBlink();
      }, 2500 + Math.random() * 4000);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    scheduleBlink();
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame !== null) cancelAnimationFrame(frame);
      if (blinkTimer !== null) window.clearTimeout(blinkTimer);
    };
  }, []);

  return (
    <svg ref={svgRef} className={styles.miniEyes} viewBox="0 0 30 16" width="30" height="16" aria-hidden="true">
      <g className={styles.miniLids}>
        <ellipse cx="8" cy="8" rx="6.5" ry="5.5" />
        <ellipse cx="22" cy="8" rx="6.5" ry="5.5" />
      </g>
      <g className={styles.miniPupils}>
        <circle cx="8" cy="8" r="2.6" />
        <circle cx="22" cy="8" r="2.6" />
      </g>
    </svg>
  );
}
