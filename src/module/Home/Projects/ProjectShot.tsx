"use client";

import { useRef } from "react";
import styles from "./Projects.module.css";

type Props = {
  href: string;
  src: string;
  alt: string;
  address: string;
  width: number;
  height: number;
  tabIndex?: number;
};

// Screenshot in a browser frame that leans towards the cursor.
export default function ProjectShot({ href, src, alt, address, width, height, tabIndex }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);

  const onPointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    const frame = frameRef.current;
    if (!frame || event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    frame.style.setProperty("--ry", `${((x - 0.5) * 10).toFixed(2)}deg`);
    frame.style.setProperty("--rx", `${((0.5 - y) * 8).toFixed(2)}deg`);
    frame.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
    frame.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
  };

  const onPointerLeave = () => {
    const frame = frameRef.current;
    if (!frame) return;
    frame.style.setProperty("--ry", "0deg");
    frame.style.setProperty("--rx", "0deg");
  };

  return (
    <a
      className={styles.shot}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      tabIndex={tabIndex}
      aria-label={`Open the live demo: ${address}`}
    >
      <div className={styles.frame} ref={frameRef}>
        <div className={styles.bar} aria-hidden="true">
          <span className={styles.dots}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.address}>{address}</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, images are pre-optimized WebP */}
        <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
        <span className={styles.glare} aria-hidden="true" />
      </div>
    </a>
  );
}
